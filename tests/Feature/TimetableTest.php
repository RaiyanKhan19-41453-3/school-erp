<?php

use App\Models\AcademicYear;
use App\Models\Guardian;
use App\Models\Period;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Staff;
use App\Models\Student;
use App\Models\Subject;
use App\Models\TimetableSlot;
use App\Models\User;
use App\Services\TimetableConflictService;
use Illuminate\Database\QueryException;
use Spatie\Permission\Models\Role;

function createTimetableEnvironment(): array
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
    $sectionA = Section::create(['class_id' => $class->id, 'name' => 'A', 'capacity' => 30]);
    $sectionB = Section::create(['class_id' => $class->id, 'name' => 'B', 'capacity' => 30]);

    $math = Subject::create(['school_id' => $school->id, 'name' => 'Mathematics', 'code' => 'MATH']);
    $class->subjects()->attach($math->id);

    $first = Period::create([
        'school_id' => $school->id,
        'name' => 'Period 1',
        'start_time' => '08:00',
        'end_time' => '09:00',
        'sort_order' => 1,
        'is_break' => false,
    ]);
    $second = Period::create([
        'school_id' => $school->id,
        'name' => 'Period 2',
        'start_time' => '09:00',
        'end_time' => '10:00',
        'sort_order' => 2,
        'is_break' => false,
    ]);
    $break = Period::create([
        'school_id' => $school->id,
        'name' => 'Break',
        'start_time' => '10:00',
        'end_time' => '10:15',
        'sort_order' => 3,
        'is_break' => true,
    ]);

    $teacherUser = User::factory()->create(['school_id' => $school->id])->assignRole('teacher');
    $staff = Staff::create([
        'user_id' => $teacherUser->id,
        'school_id' => $school->id,
        'employee_id' => 'EMP-200',
        'designation' => 'Teacher',
        'joining_date' => '2025-09-01',
    ]);
    $staff->sections()->attach($sectionA->id, ['academic_year_id' => $academicYear->id, 'is_class_teacher' => true]);

    $student = Student::create([
        'school_id' => $school->id,
        'section_id' => $sectionA->id,
        'name' => 'Jane Smith',
        'admission_number' => 'ADM-TT-100',
        'date_of_birth' => '2015-06-15',
        'gender' => 'female',
        'admission_date' => '2026-04-01',
        'status' => 'active',
    ]);
    $studentUser = User::factory()->create(['school_id' => $school->id])->assignRole('student');
    $student->update(['user_id' => $studentUser->id]);

    $parentUser = User::factory()->create(['school_id' => $school->id])->assignRole('parent');
    $guardian = Guardian::create([
        'user_id' => $parentUser->id,
        'name' => 'Parent One',
        'phone' => '1234567890',
        'email' => 'parent@example.com',
        'occupation' => 'Engineer',
    ]);
    $guardian->students()->attach($student->id, ['relationship' => 'parent', 'is_primary' => true]);

    return [
        'school' => $school,
        'academicYear' => $academicYear,
        'class' => $class,
        'sectionA' => $sectionA,
        'sectionB' => $sectionB,
        'math' => $math,
        'first' => $first,
        'second' => $second,
        'break' => $break,
        'staff' => $staff,
        'teacherUser' => $teacherUser,
        'student' => $student,
        'studentUser' => $studentUser,
        'parentUser' => $parentUser,
        'guardian' => $guardian,
    ];
}

function createSlot(array $data): TimetableSlot
{
    return TimetableSlot::create(array_merge([
        'academic_year_id' => null,
        'subject_id' => null,
        'staff_id' => null,
        'room' => null,
    ], $data));
}

beforeEach(function () {
    Role::create(['name' => 'super-admin', 'guard_name' => 'web']);
    Role::create(['name' => 'admin', 'guard_name' => 'web']);
    Role::create(['name' => 'teacher', 'guard_name' => 'web']);
    Role::create(['name' => 'student', 'guard_name' => 'web']);
    Role::create(['name' => 'parent', 'guard_name' => 'web']);
});

test('periods are ordered by sort_order', function () {
    $env = createTimetableEnvironment();

    $periods = Period::where('school_id', $env['school']->id)->orderBy('sort_order')->get();

    expect($periods->pluck('sort_order')->all())->toBe([1, 2, 3])
        ->and($periods->pluck('is_break')->all())->toBe([false, false, true]);
});

test('a timetable slot belongs to its section, period, subject and staff', function () {
    $env = createTimetableEnvironment();

    $slot = createSlot([
        'section_id' => $env['sectionA']->id,
        'academic_year_id' => $env['academicYear']->id,
        'subject_id' => $env['math']->id,
        'staff_id' => $env['staff']->id,
        'period_id' => $env['first']->id,
        'day_of_week' => 'monday',
        'room' => 'Room 101',
    ]);

    expect($slot->section->id)->toBe($env['sectionA']->id)
        ->and($slot->period->id)->toBe($env['first']->id)
        ->and($slot->subject->id)->toBe($env['math']->id)
        ->and($slot->staff->id)->toBe($env['staff']->id)
        ->and($slot->room)->toBe('Room 101');
});

test('the same section cannot have two slots in the same period on the same day', function () {
    $env = createTimetableEnvironment();

    createSlot([
        'section_id' => $env['sectionA']->id,
        'academic_year_id' => $env['academicYear']->id,
        'subject_id' => $env['math']->id,
        'staff_id' => $env['staff']->id,
        'period_id' => $env['first']->id,
        'day_of_week' => 'monday',
    ]);

    expect(fn () => createSlot([
        'section_id' => $env['sectionA']->id,
        'academic_year_id' => $env['academicYear']->id,
        'subject_id' => $env['math']->id,
        'staff_id' => $env['staff']->id,
        'period_id' => $env['first']->id,
        'day_of_week' => 'monday',
    ]))->toThrow(QueryException::class);
});

test('conflict service reports a teacher double booked on the same day and period', function () {
    $env = createTimetableEnvironment();

    createSlot([
        'section_id' => $env['sectionA']->id,
        'academic_year_id' => $env['academicYear']->id,
        'subject_id' => $env['math']->id,
        'staff_id' => $env['staff']->id,
        'period_id' => $env['first']->id,
        'day_of_week' => 'monday',
    ]);

    $service = new TimetableConflictService;

    expect($service->hasConflict(
        $env['staff']->id,
        'monday',
        $env['first']->id,
        $env['academicYear']->id,
    ))->toBeTrue()
        ->and($service->hasConflict(
            $env['staff']->id,
            'tuesday',
            $env['first']->id,
            $env['academicYear']->id,
        ))->toBeFalse();
});

test('conflict service ignores the slot being edited', function () {
    $env = createTimetableEnvironment();

    $slot = createSlot([
        'section_id' => $env['sectionA']->id,
        'academic_year_id' => $env['academicYear']->id,
        'subject_id' => $env['math']->id,
        'staff_id' => $env['staff']->id,
        'period_id' => $env['first']->id,
        'day_of_week' => 'monday',
    ]);

    $service = new TimetableConflictService;

    expect($service->hasConflict(
        $env['staff']->id,
        'monday',
        $env['first']->id,
        $env['academicYear']->id,
        $slot->id,
    ))->toBeFalse();
});

test('break slots hold no subject or staff', function () {
    $env = createTimetableEnvironment();

    $slot = createSlot([
        'section_id' => $env['sectionA']->id,
        'academic_year_id' => $env['academicYear']->id,
        'period_id' => $env['break']->id,
        'day_of_week' => 'monday',
    ]);

    expect($slot->subject_id)->toBeNull()
        ->and($slot->staff_id)->toBeNull();
});

test('admin can create a period', function () {
    $env = createTimetableEnvironment();

    $admin = User::factory()->create(['school_id' => $env['school']->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('periods.store'), [
            'name' => 'Assembly',
            'start_time' => '07:45',
            'end_time' => '08:00',
            'sort_order' => 0,
            'is_break' => false,
        ])
        ->assertRedirect();

    $period = Period::where('name', 'Assembly')->first();

    expect($period)->not->toBeNull()
        ->and($period->school_id)->toBe($env['school']->id)
        ->and($period->sort_order)->toBe(0)
        ->and($period->is_break)->toBeFalse();
});

test('admin can update a period', function () {
    $env = createTimetableEnvironment();

    $admin = User::factory()->create(['school_id' => $env['school']->id])->assignRole('admin');

    $this->actingAs($admin)
        ->put(route('periods.update', $env['first']->id), [
            'name' => 'Period 1 (Maths)',
            'start_time' => '08:15',
            'end_time' => '09:15',
            'sort_order' => 1,
            'is_break' => false,
        ])
        ->assertRedirect();

    $env['first']->refresh();

    expect($env['first']->name)->toBe('Period 1 (Maths)')
        ->and($env['first']->start_time)->toBe('08:15')
        ->and($env['first']->end_time)->toBe('09:15');
});

test('a period cannot end before it starts', function () {
    $env = createTimetableEnvironment();

    $admin = User::factory()->create(['school_id' => $env['school']->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('periods.store'), [
            'name' => 'Invalid',
            'start_time' => '10:00',
            'end_time' => '09:00',
            'sort_order' => 1,
            'is_break' => false,
        ])
        ->assertSessionHasErrors('end_time');

    expect(Period::where('name', 'Invalid')->exists())->toBeFalse();
});

test('admin can delete a period', function () {
    $env = createTimetableEnvironment();

    $admin = User::factory()->create(['school_id' => $env['school']->id])->assignRole('admin');

    $this->actingAs($admin)
        ->delete(route('periods.destroy', $env['second']->id))
        ->assertRedirect();

    expect(Period::find($env['second']->id))->toBeNull();
});

test('teachers cannot manage periods', function () {
    $env = createTimetableEnvironment();

    $this->actingAs($env['teacherUser'])
        ->get(route('periods.index'))
        ->assertForbidden();

    $this->actingAs($env['teacherUser'])
        ->post(route('periods.store'), [
            'name' => 'Nope',
            'start_time' => '08:00',
            'end_time' => '09:00',
            'sort_order' => 1,
            'is_break' => false,
        ])
        ->assertForbidden();

    expect(Period::where('name', 'Nope')->exists())->toBeFalse();
});

test('admin can create a timetable slot', function () {
    $env = createTimetableEnvironment();

    $admin = User::factory()->create(['school_id' => $env['school']->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('timetable.slots.store'), [
            'section_id' => $env['sectionA']->id,
            'academic_year_id' => $env['academicYear']->id,
            'period_id' => $env['first']->id,
            'day_of_week' => 'monday',
            'subject_id' => $env['math']->id,
            'staff_id' => $env['staff']->id,
            'room' => 'Room 101',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $slot = TimetableSlot::where('section_id', $env['sectionA']->id)->first();

    expect($slot)->not->toBeNull()
        ->and($slot->day_of_week)->toBe('monday')
        ->and($slot->subject_id)->toBe($env['math']->id)
        ->and($slot->staff_id)->toBe($env['staff']->id)
        ->and($slot->room)->toBe('Room 101');
});

test('duplicate slot for the same section period and day is rejected', function () {
    $env = createTimetableEnvironment();

    $admin = User::factory()->create(['school_id' => $env['school']->id])->assignRole('admin');

    createSlot([
        'section_id' => $env['sectionA']->id,
        'academic_year_id' => $env['academicYear']->id,
        'subject_id' => $env['math']->id,
        'staff_id' => $env['staff']->id,
        'period_id' => $env['first']->id,
        'day_of_week' => 'monday',
    ]);

    $this->actingAs($admin)
        ->post(route('timetable.slots.store'), [
            'section_id' => $env['sectionA']->id,
            'academic_year_id' => $env['academicYear']->id,
            'period_id' => $env['first']->id,
            'day_of_week' => 'monday',
            'subject_id' => $env['math']->id,
            'staff_id' => $env['staff']->id,
        ])
        ->assertSessionHasErrors('period_id');

    expect(TimetableSlot::count())->toBe(1);
});

test('teacher double booking triggers a conflict warning and does not save', function () {
    $env = createTimetableEnvironment();

    $admin = User::factory()->create(['school_id' => $env['school']->id])->assignRole('admin');

    createSlot([
        'section_id' => $env['sectionA']->id,
        'academic_year_id' => $env['academicYear']->id,
        'subject_id' => $env['math']->id,
        'staff_id' => $env['staff']->id,
        'period_id' => $env['first']->id,
        'day_of_week' => 'monday',
    ]);

    $response = $this->actingAs($admin)
        ->post(route('timetable.slots.store'), [
            'section_id' => $env['sectionB']->id,
            'academic_year_id' => $env['academicYear']->id,
            'period_id' => $env['first']->id,
            'day_of_week' => 'monday',
            'subject_id' => $env['math']->id,
            'staff_id' => $env['staff']->id,
        ])
        ->assertRedirect()
        ->assertSessionHas('timetable_conflict');

    $conflicts = $response->getSession()->get('timetable_conflict');

    expect($conflicts)->toHaveCount(1)
        ->and($conflicts[0]['section_name'])->toBe('A')
        ->and($conflicts[0]['day'])->toBe('monday')
        ->and(TimetableSlot::count())->toBe(1);
});

test('force flag saves the slot despite a teacher conflict', function () {
    $env = createTimetableEnvironment();

    $admin = User::factory()->create(['school_id' => $env['school']->id])->assignRole('admin');

    createSlot([
        'section_id' => $env['sectionA']->id,
        'academic_year_id' => $env['academicYear']->id,
        'subject_id' => $env['math']->id,
        'staff_id' => $env['staff']->id,
        'period_id' => $env['first']->id,
        'day_of_week' => 'monday',
    ]);

    $this->actingAs($admin)
        ->post(route('timetable.slots.store'), [
            'section_id' => $env['sectionB']->id,
            'academic_year_id' => $env['academicYear']->id,
            'period_id' => $env['first']->id,
            'day_of_week' => 'monday',
            'subject_id' => $env['math']->id,
            'staff_id' => $env['staff']->id,
            'force' => true,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(TimetableSlot::count())->toBe(2);
});

test('break slots ignore subject staff and room', function () {
    $env = createTimetableEnvironment();

    $admin = User::factory()->create(['school_id' => $env['school']->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('timetable.slots.store'), [
            'section_id' => $env['sectionA']->id,
            'academic_year_id' => $env['academicYear']->id,
            'period_id' => $env['break']->id,
            'day_of_week' => 'tuesday',
            'subject_id' => $env['math']->id,
            'staff_id' => $env['staff']->id,
            'room' => 'Room 1',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $slot = TimetableSlot::where('section_id', $env['sectionA']->id)->first();

    expect($slot->subject_id)->toBeNull()
        ->and($slot->staff_id)->toBeNull()
        ->and($slot->room)->toBeNull();
});

test('admin can update a timetable slot', function () {
    $env = createTimetableEnvironment();

    $admin = User::factory()->create(['school_id' => $env['school']->id])->assignRole('admin');

    $slot = createSlot([
        'section_id' => $env['sectionA']->id,
        'academic_year_id' => $env['academicYear']->id,
        'subject_id' => $env['math']->id,
        'staff_id' => $env['staff']->id,
        'period_id' => $env['first']->id,
        'day_of_week' => 'monday',
        'room' => 'Room 101',
    ]);

    $this->actingAs($admin)
        ->put(route('timetable.slots.update', $slot->id), [
            'period_id' => $env['second']->id,
            'day_of_week' => 'tuesday',
            'subject_id' => $env['math']->id,
            'staff_id' => $env['staff']->id,
            'room' => 'Room 202',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $slot->refresh();

    expect($slot->period_id)->toBe($env['second']->id)
        ->and($slot->day_of_week)->toBe('tuesday')
        ->and($slot->room)->toBe('Room 202');
});

test('updating a slot to the same period and day does not count as a duplicate', function () {
    $env = createTimetableEnvironment();

    $admin = User::factory()->create(['school_id' => $env['school']->id])->assignRole('admin');

    $slot = createSlot([
        'section_id' => $env['sectionA']->id,
        'academic_year_id' => $env['academicYear']->id,
        'subject_id' => $env['math']->id,
        'staff_id' => $env['staff']->id,
        'period_id' => $env['first']->id,
        'day_of_week' => 'monday',
    ]);

    $this->actingAs($admin)
        ->put(route('timetable.slots.update', $slot->id), [
            'period_id' => $env['first']->id,
            'day_of_week' => 'monday',
            'subject_id' => $env['math']->id,
            'staff_id' => $env['staff']->id,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(TimetableSlot::count())->toBe(1);
});

test('admin can delete a timetable slot', function () {
    $env = createTimetableEnvironment();

    $admin = User::factory()->create(['school_id' => $env['school']->id])->assignRole('admin');

    $slot = createSlot([
        'section_id' => $env['sectionA']->id,
        'academic_year_id' => $env['academicYear']->id,
        'subject_id' => $env['math']->id,
        'staff_id' => $env['staff']->id,
        'period_id' => $env['first']->id,
        'day_of_week' => 'monday',
    ]);

    $this->actingAs($admin)
        ->delete(route('timetable.slots.destroy', $slot->id))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(TimetableSlot::find($slot->id))->toBeNull();
});

test('teachers cannot access the timetable builder', function () {
    $env = createTimetableEnvironment();

    $this->actingAs($env['teacherUser'])
        ->get(route('timetable.index'))
        ->assertForbidden();

    $this->actingAs($env['teacherUser'])
        ->post(route('timetable.slots.store'), [
            'section_id' => $env['sectionA']->id,
            'academic_year_id' => $env['academicYear']->id,
            'period_id' => $env['first']->id,
            'day_of_week' => 'monday',
            'subject_id' => $env['math']->id,
            'staff_id' => $env['staff']->id,
        ])
        ->assertForbidden();

    expect(TimetableSlot::count())->toBe(0);
});

test('admin can view any section timetable', function () {
    $env = createTimetableEnvironment();

    $admin = User::factory()->create(['school_id' => $env['school']->id])->assignRole('admin');

    createSlot([
        'section_id' => $env['sectionB']->id,
        'academic_year_id' => $env['academicYear']->id,
        'subject_id' => $env['math']->id,
        'staff_id' => $env['staff']->id,
        'period_id' => $env['first']->id,
        'day_of_week' => 'monday',
    ]);

    $this->actingAs($admin)
        ->get(route('timetable.section', ['section_id' => $env['sectionB']->id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('selectedSectionId', $env['sectionB']->id)
            ->has('slots', 1));
});

test('teacher sees only their assigned sections in the section timetable', function () {
    $env = createTimetableEnvironment();

    $this->actingAs($env['teacherUser'])
        ->get(route('timetable.section'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('sections', 1)
            ->where('sections.0.id', $env['sectionA']->id));
});

test('teacher cannot view an unassigned section timetable', function () {
    $env = createTimetableEnvironment();

    $this->actingAs($env['teacherUser'])
        ->get(route('timetable.section', ['section_id' => $env['sectionB']->id]))
        ->assertForbidden();
});

test('student sees their own section timetable', function () {
    $env = createTimetableEnvironment();

    $this->actingAs($env['studentUser'])
        ->get(route('timetable.section'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('sections.0.id', $env['sectionA']->id));
});

test('student cannot view another section timetable', function () {
    $env = createTimetableEnvironment();

    $this->actingAs($env['studentUser'])
        ->get(route('timetable.section', ['section_id' => $env['sectionB']->id]))
        ->assertForbidden();
});

test('parent sees the timetable for their child section', function () {
    $env = createTimetableEnvironment();

    $this->actingAs($env['parentUser'])
        ->get(route('timetable.section'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('sections.0.id', $env['sectionA']->id));
});

test('teacher sees their personal timetable across all sections', function () {
    $env = createTimetableEnvironment();

    createSlot([
        'section_id' => $env['sectionA']->id,
        'academic_year_id' => $env['academicYear']->id,
        'subject_id' => $env['math']->id,
        'staff_id' => $env['staff']->id,
        'period_id' => $env['first']->id,
        'day_of_week' => 'monday',
    ]);

    $this->actingAs($env['teacherUser'])
        ->get(route('timetable.my'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('slots', 1)
            ->where('slots.0.section_id', $env['sectionA']->id));
});

test('students cannot access the personal timetable', function () {
    $env = createTimetableEnvironment();

    $this->actingAs($env['studentUser'])
        ->get(route('timetable.my'))
        ->assertForbidden();
});
