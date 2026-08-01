<?php

use App\Models\AcademicYear;
use App\Models\School;
use App\Models\User;
use Spatie\Permission\Models\Role;

function createAcademicYearEnvironment(): array
{
    $school = School::create(['name' => 'Test School']);
    $currentYear = AcademicYear::create([
        'school_id' => $school->id,
        'name' => '2025-2026',
        'start_date' => '2025-09-01',
        'end_date' => '2026-06-30',
        'is_current' => true,
    ]);

    return ['school' => $school, 'currentYear' => $currentYear];
}

beforeEach(function () {
    Role::create(['name' => 'super-admin', 'guard_name' => 'web']);
    Role::create(['name' => 'admin', 'guard_name' => 'web']);
    Role::create(['name' => 'teacher', 'guard_name' => 'web']);
    Role::create(['name' => 'student', 'guard_name' => 'web']);
    Role::create(['name' => 'parent', 'guard_name' => 'web']);
});

test('admin can view academic years list', function () {
    ['school' => $school, 'currentYear' => $currentYear] = createAcademicYearEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('academic-years.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('years.data', fn ($data) => count($data) === 1 && $data[0]['name'] === '2025-2026' && $data[0]['is_current'] === true));
});

test('teacher cannot view academic years list', function () {
    ['school' => $school] = createAcademicYearEnvironment();

    $teacher = User::factory()->create(['school_id' => $school->id])->assignRole('teacher');

    $this->actingAs($teacher)
        ->get(route('academic-years.index'))
        ->assertForbidden();
});

test('admin can create an inactive academic year', function () {
    ['school' => $school] = createAcademicYearEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('academic-years.store'), [
            'name' => '2026-2027',
            'start_date' => '2026-09-01',
            'end_date' => '2027-06-30',
        ])
        ->assertSessionHasNoErrors();

    $year = AcademicYear::where('name', '2026-2027')->first();

    expect($year)->not->toBeNull()
        ->and($year->school_id)->toBe($school->id)
        ->and($year->is_current)->toBeFalse();
});

test('academic year name must be unique within the school', function () {
    ['school' => $school] = createAcademicYearEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('academic-years.store'), [
            'name' => '2025-2026',
            'start_date' => '2026-09-01',
            'end_date' => '2027-06-30',
        ])
        ->assertSessionHasErrors('name');
});

test('academic year end date must be after start date', function () {
    ['school' => $school] = createAcademicYearEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('academic-years.store'), [
            'name' => '2026-2027',
            'start_date' => '2026-09-01',
            'end_date' => '2025-06-30',
        ])
        ->assertSessionHasErrors('end_date');
});

test('admin can activate a year and it becomes the only current year', function () {
    ['school' => $school, 'currentYear' => $currentYear] = createAcademicYearEnvironment();

    $newYear = AcademicYear::create([
        'school_id' => $school->id,
        'name' => '2026-2027',
        'start_date' => '2026-09-01',
        'end_date' => '2027-06-30',
        'is_current' => false,
    ]);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->put(route('academic-years.activate', $newYear))
        ->assertSessionHasNoErrors();

    expect($newYear->fresh()->is_current)->toBeTrue()
        ->and($currentYear->fresh()->is_current)->toBeFalse()
        ->and(AcademicYear::where('school_id', $school->id)->where('is_current', true)->count())->toBe(1);
});

test('teacher cannot activate a year', function () {
    ['school' => $school, 'currentYear' => $currentYear] = createAcademicYearEnvironment();

    $teacher = User::factory()->create(['school_id' => $school->id])->assignRole('teacher');

    $this->actingAs($teacher)
        ->put(route('academic-years.activate', $currentYear))
        ->assertForbidden();

    expect($currentYear->fresh()->is_current)->toBeTrue();
});

test('admin cannot activate a year from another school', function () {
    $school = School::create(['name' => 'School A']);
    $otherSchool = School::create(['name' => 'School B']);

    $otherYear = AcademicYear::create([
        'school_id' => $otherSchool->id,
        'name' => '2026-2027',
        'start_date' => '2026-09-01',
        'end_date' => '2027-06-30',
        'is_current' => false,
    ]);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->put(route('academic-years.activate', $otherYear))
        ->assertForbidden();

    expect($otherYear->fresh()->is_current)->toBeFalse();
});
