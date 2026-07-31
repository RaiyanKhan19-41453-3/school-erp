<?php

use App\Models\AcademicYear;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Staff;
use App\Models\User;
use Spatie\Permission\Models\Role;

function createAssignmentEnvironment(): array
{
    $school = School::create(['name' => 'Test School']);
    $academicYear = AcademicYear::create([
        'school_id' => $school->id,
        'name' => '2025-2026',
        'start_date' => '2025-09-01',
        'end_date' => '2026-06-30',
        'is_current' => true,
    ]);
    $class = SchoolClass::create([
        'school_id' => $school->id,
        'academic_year_id' => $academicYear->id,
        'name' => 'Grade 1',
    ]);
    $section = Section::create(['class_id' => $class->id, 'name' => 'Section A', 'capacity' => 30]);

    $teacherUser = User::factory()->create(['school_id' => $school->id])->assignRole('teacher');
    $staff = Staff::create([
        'user_id' => $teacherUser->id,
        'school_id' => $school->id,
        'employee_id' => 'EMP-100',
        'designation' => 'Teacher',
        'joining_date' => '2025-09-01',
    ]);

    return ['school' => $school, 'academicYear' => $academicYear, 'class' => $class, 'section' => $section, 'staff' => $staff];
}

beforeEach(function () {
    Role::create(['name' => 'super-admin', 'guard_name' => 'web']);
    Role::create(['name' => 'admin', 'guard_name' => 'web']);
    Role::create(['name' => 'teacher', 'guard_name' => 'web']);
});

test('admin can view the teacher assignments index', function () {
    ['school' => $school] = createAssignmentEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('teacher-assignments.index'))
        ->assertOk();
});

test('teacher cannot view the teacher assignments index', function () {
    ['school' => $school, 'staff' => $staff] = createAssignmentEnvironment();

    $this->actingAs($staff->user)
        ->get(route('teacher-assignments.index'))
        ->assertForbidden();
});

test('admin can assign a teacher to a section', function () {
    ['school' => $school, 'academicYear' => $academicYear, 'section' => $section, 'staff' => $staff] = createAssignmentEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('teacher-assignments.store'), [
            'section_id' => $section->id,
            'staff_id' => $staff->id,
            'is_class_teacher' => true,
        ])
        ->assertRedirect();

    $pivot = $section->teachers()->first();

    expect($section->teachers()->count())->toBe(1)
        ->and($pivot->pivot->academic_year_id)->toBe($academicYear->id)
        ->and((bool) $pivot->pivot->is_class_teacher)->toBeTrue();
});

test('teacher cannot assign a teacher to a section', function () {
    ['school' => $school, 'section' => $section, 'staff' => $staff] = createAssignmentEnvironment();

    $this->actingAs($staff->user)
        ->post(route('teacher-assignments.store'), [
            'section_id' => $section->id,
            'staff_id' => $staff->id,
        ])
        ->assertForbidden();

    expect($section->teachers()->count())->toBe(0);
});

test('assigning a new class teacher demotes the previous one', function () {
    ['school' => $school, 'academicYear' => $academicYear, 'section' => $section] = createAssignmentEnvironment();

    $firstUser = User::factory()->create(['school_id' => $school->id])->assignRole('teacher');
    $firstStaff = Staff::create([
        'user_id' => $firstUser->id,
        'school_id' => $school->id,
        'employee_id' => 'EMP-101',
        'designation' => 'Teacher',
        'joining_date' => '2025-09-01',
    ]);

    $secondUser = User::factory()->create(['school_id' => $school->id])->assignRole('teacher');
    $secondStaff = Staff::create([
        'user_id' => $secondUser->id,
        'school_id' => $school->id,
        'employee_id' => 'EMP-102',
        'designation' => 'Teacher',
        'joining_date' => '2025-09-01',
    ]);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('teacher-assignments.store'), [
            'section_id' => $section->id,
            'staff_id' => $firstStaff->id,
            'is_class_teacher' => true,
        ]);

    $this->actingAs($admin)
        ->post(route('teacher-assignments.store'), [
            'section_id' => $section->id,
            'staff_id' => $secondStaff->id,
            'is_class_teacher' => true,
        ]);

    $firstPivot = $section->teachers()->where('staff.id', $firstStaff->id)->first()->pivot;
    $secondPivot = $section->teachers()->where('staff.id', $secondStaff->id)->first()->pivot;

    expect((bool) $firstPivot->is_class_teacher)->toBeFalse()
        ->and((bool) $secondPivot->is_class_teacher)->toBeTrue();
});

test('admin can promote an assigned teacher to class teacher', function () {
    ['school' => $school, 'academicYear' => $academicYear, 'section' => $section] = createAssignmentEnvironment();

    $firstUser = User::factory()->create(['school_id' => $school->id])->assignRole('teacher');
    $firstStaff = Staff::create([
        'user_id' => $firstUser->id,
        'school_id' => $school->id,
        'employee_id' => 'EMP-103',
        'designation' => 'Teacher',
        'joining_date' => '2025-09-01',
    ]);

    $secondUser = User::factory()->create(['school_id' => $school->id])->assignRole('teacher');
    $secondStaff = Staff::create([
        'user_id' => $secondUser->id,
        'school_id' => $school->id,
        'employee_id' => 'EMP-104',
        'designation' => 'Teacher',
        'joining_date' => '2025-09-01',
    ]);

    $section->teachers()->attach($firstStaff->id, ['academic_year_id' => $academicYear->id, 'is_class_teacher' => true]);
    $section->teachers()->attach($secondStaff->id, ['academic_year_id' => $academicYear->id, 'is_class_teacher' => false]);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->put(route('teacher-assignments.set-class-teacher', [$section, $secondStaff]))
        ->assertRedirect();

    expect((bool) $section->teachers()->where('staff.id', $firstStaff->id)->first()->pivot->is_class_teacher)->toBeFalse()
        ->and((bool) $section->teachers()->where('staff.id', $secondStaff->id)->first()->pivot->is_class_teacher)->toBeTrue();
});

test('teacher cannot promote a class teacher', function () {
    ['school' => $school, 'academicYear' => $academicYear, 'section' => $section, 'staff' => $staff] = createAssignmentEnvironment();

    $otherUser = User::factory()->create(['school_id' => $school->id])->assignRole('teacher');
    $otherStaff = Staff::create([
        'user_id' => $otherUser->id,
        'school_id' => $school->id,
        'employee_id' => 'EMP-105',
        'designation' => 'Teacher',
        'joining_date' => '2025-09-01',
    ]);

    $section->teachers()->attach($otherStaff->id, ['academic_year_id' => $academicYear->id, 'is_class_teacher' => true]);

    $this->actingAs($staff->user)
        ->put(route('teacher-assignments.set-class-teacher', [$section, $otherStaff]))
        ->assertForbidden();
});

test('admin can remove a teacher from a section', function () {
    ['school' => $school, 'academicYear' => $academicYear, 'section' => $section, 'staff' => $staff] = createAssignmentEnvironment();

    $section->teachers()->attach($staff->id, ['academic_year_id' => $academicYear->id, 'is_class_teacher' => false]);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->delete(route('teacher-assignments.destroy', [$section, $staff]))
        ->assertRedirect();

    expect($section->teachers()->count())->toBe(0);
});

test('admin can filter sections by teacher on the index', function () {
    ['school' => $school, 'academicYear' => $academicYear, 'class' => $class, 'section' => $section, 'staff' => $staff] = createAssignmentEnvironment();

    $otherSection = Section::create(['class_id' => $class->id, 'name' => 'Section B', 'capacity' => 30]);

    $otherUser = User::factory()->create(['school_id' => $school->id])->assignRole('teacher');
    $otherStaff = Staff::create([
        'user_id' => $otherUser->id,
        'school_id' => $school->id,
        'employee_id' => 'EMP-101',
        'designation' => 'Teacher',
        'joining_date' => '2025-09-01',
    ]);

    $section->teachers()->attach($staff->id, ['academic_year_id' => $academicYear->id, 'is_class_teacher' => true]);
    $otherSection->teachers()->attach($otherStaff->id, ['academic_year_id' => $academicYear->id, 'is_class_teacher' => true]);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('teacher-assignments.index', ['teacher_id' => $staff->id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('filters.teacher_id', $staff->id)
            ->where('sections.data', fn ($data) => count($data) === 1 && $data[0]['id'] === $section->id)
            ->where('classes', fn ($classes) => collect($classes)->pluck('id')->contains($class->id)));
});
