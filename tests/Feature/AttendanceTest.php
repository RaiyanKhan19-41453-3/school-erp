<?php

use App\Models\AcademicYear;
use App\Models\Attendance;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Staff;
use App\Models\Student;
use App\Models\User;
use Spatie\Permission\Models\Role;

function createAttendanceEnvironment(): array
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
    $otherSection = Section::create(['class_id' => $class->id, 'name' => 'Section B', 'capacity' => 30]);

    $teacherUser = User::factory()->create(['school_id' => $school->id])->assignRole('teacher');
    $staff = Staff::create([
        'user_id' => $teacherUser->id,
        'school_id' => $school->id,
        'employee_id' => 'EMP-200',
        'designation' => 'Teacher',
        'joining_date' => '2025-09-01',
    ]);
    $staff->sections()->attach($section->id, ['academic_year_id' => $academicYear->id, 'is_class_teacher' => true]);

    $student = Student::create([
        'school_id' => $school->id,
        'section_id' => $section->id,
        'name' => 'Test Student',
        'admission_number' => 'ADM-2026-200',
        'date_of_birth' => '2015-06-15',
        'gender' => 'female',
        'admission_date' => '2026-04-01',
        'status' => 'active',
    ]);

    return [
        'school' => $school,
        'academicYear' => $academicYear,
        'class' => $class,
        'section' => $section,
        'otherSection' => $otherSection,
        'staff' => $staff,
        'student' => $student,
    ];
}

beforeEach(function () {
    Role::create(['name' => 'super-admin', 'guard_name' => 'web']);
    Role::create(['name' => 'admin', 'guard_name' => 'web']);
    Role::create(['name' => 'teacher', 'guard_name' => 'web']);
    Role::create(['name' => 'student', 'guard_name' => 'web']);
    Role::create(['name' => 'parent', 'guard_name' => 'web']);
});

test('admin can view the attendance index', function () {
    ['school' => $school] = createAttendanceEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('attendance.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('isAdmin', true));
});

test('teacher can view the attendance index', function () {
    ['school' => $school, 'staff' => $staff] = createAttendanceEnvironment();

    $this->actingAs($staff->user)
        ->get(route('attendance.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('isAdmin', false));
});

test('teacher only sees assigned sections on the attendance index', function () {
    ['school' => $school, 'section' => $section, 'otherSection' => $otherSection, 'staff' => $staff] = createAttendanceEnvironment();

    $this->actingAs($staff->user)
        ->get(route('attendance.index'))
        ->assertInertia(fn ($page) => $page->has('sections', 1)
            ->where('sections.0.id', $section->id)
            ->where('selectedSectionId', $section->id));
});

test('teacher can mark attendance for today', function () {
    ['school' => $school, 'section' => $section, 'staff' => $staff, 'student' => $student] = createAttendanceEnvironment();

    $this->actingAs($staff->user)
        ->post(route('attendance.store'), [
            'section_id' => $section->id,
            'date' => now()->toDateString(),
            'records' => [
                ['student_id' => $student->id, 'status' => 'present'],
            ],
        ])
        ->assertRedirect();

    $attendance = Attendance::where('student_id', $student->id)->whereDate('date', now()->toDateString())->first();

    expect($attendance)->not->toBeNull()
        ->and($attendance->status)->toBe('present')
        ->and($attendance->section_id)->toBe($section->id)
        ->and($attendance->marked_by)->toBe($staff->user->id);
});

test('teacher cannot mark attendance for a past date', function () {
    ['school' => $school, 'section' => $section, 'staff' => $staff, 'student' => $student] = createAttendanceEnvironment();

    $this->actingAs($staff->user)
        ->post(route('attendance.store'), [
            'section_id' => $section->id,
            'date' => now()->subDay()->toDateString(),
            'records' => [
                ['student_id' => $student->id, 'status' => 'present'],
            ],
        ])
        ->assertForbidden();

    expect(Attendance::count())->toBe(0);
});

test('teacher cannot mark attendance for an unassigned section', function () {
    ['school' => $school, 'otherSection' => $otherSection, 'staff' => $staff, 'student' => $student] = createAttendanceEnvironment();

    $this->actingAs($staff->user)
        ->post(route('attendance.store'), [
            'section_id' => $otherSection->id,
            'date' => now()->toDateString(),
            'records' => [
                ['student_id' => $student->id, 'status' => 'present'],
            ],
        ])
        ->assertRedirect();

    expect(Attendance::count())->toBe(0);
});

test('admin can mark attendance for any date', function () {
    ['school' => $school, 'section' => $section, 'student' => $student] = createAttendanceEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('attendance.store'), [
            'section_id' => $section->id,
            'date' => now()->subDay()->toDateString(),
            'records' => [
                ['student_id' => $student->id, 'status' => 'absent'],
            ],
        ])
        ->assertRedirect();

    expect(Attendance::where('student_id', $student->id)->count())->toBe(1);
});

test('resaving attendance updates the existing record', function () {
    ['school' => $school, 'section' => $section, 'staff' => $staff, 'student' => $student] = createAttendanceEnvironment();

    $payload = [
        'section_id' => $section->id,
        'date' => now()->toDateString(),
        'records' => [['student_id' => $student->id, 'status' => 'present']],
    ];

    $this->actingAs($staff->user)->post(route('attendance.store'), $payload);

    $this->actingAs($staff->user)->post(route('attendance.store'), array_merge($payload, [
        'records' => [['student_id' => $student->id, 'status' => 'late']],
    ]));

    $attendance = Attendance::where('student_id', $student->id)->whereDate('date', now()->toDateString())->first();

    expect(Attendance::count())->toBe(1)
        ->and($attendance->status)->toBe('late');
});
