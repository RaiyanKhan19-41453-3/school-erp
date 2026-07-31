<?php

use App\Models\AcademicYear;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\User;
use Spatie\Permission\Models\Role;

function createClassEnvironment(): array
{
    $school = School::create(['name' => 'Test School']);
    $academicYear = AcademicYear::create([
        'school_id' => $school->id,
        'name' => '2025-2026',
        'start_date' => '2025-09-01',
        'end_date' => '2026-06-30',
    ]);
    $class = SchoolClass::create([
        'school_id' => $school->id,
        'academic_year_id' => $academicYear->id,
        'name' => 'Grade 1',
    ]);

    return ['school' => $school, 'class' => $class];
}

beforeEach(function () {
    Role::create(['name' => 'super-admin', 'guard_name' => 'web']);
    Role::create(['name' => 'admin', 'guard_name' => 'web']);
    Role::create(['name' => 'teacher', 'guard_name' => 'web']);
});

test('admin can add a section to a class', function () {
    ['school' => $school, 'class' => $class] = createClassEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('classes.sections.store', $class), [
            'name' => 'Section C',
            'capacity' => 25,
        ])
        ->assertRedirect();

    expect($class->sections()->where('name', 'Section C')->exists())->toBeTrue();
});

test('section name and capacity are required', function () {
    ['school' => $school, 'class' => $class] = createClassEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('classes.sections.store', $class), [])
        ->assertSessionHasErrors(['name', 'capacity']);

    expect($class->sections()->count())->toBe(0);
});

test('teacher cannot add a section', function () {
    ['school' => $school, 'class' => $class] = createClassEnvironment();

    $teacher = User::factory()->create(['school_id' => $school->id])->assignRole('teacher');

    $this->actingAs($teacher)
        ->post(route('classes.sections.store', $class), [
            'name' => 'Section C',
            'capacity' => 25,
        ])
        ->assertForbidden();

    expect($class->sections()->count())->toBe(0);
});

test('admin can remove a section', function () {
    ['school' => $school, 'class' => $class] = createClassEnvironment();

    $section = Section::create(['class_id' => $class->id, 'name' => 'Section A', 'capacity' => 30]);
    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->delete(route('sections.destroy', $section))
        ->assertRedirect();

    expect(Section::find($section->id))->toBeNull();
});

test('teacher cannot remove a section', function () {
    ['school' => $school, 'class' => $class] = createClassEnvironment();

    $section = Section::create(['class_id' => $class->id, 'name' => 'Section A', 'capacity' => 30]);
    $teacher = User::factory()->create(['school_id' => $school->id])->assignRole('teacher');

    $this->actingAs($teacher)
        ->delete(route('sections.destroy', $section))
        ->assertForbidden();

    expect(Section::find($section->id))->not->toBeNull();
});
