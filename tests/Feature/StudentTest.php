<?php

use App\Models\AcademicYear;
use App\Models\Guardian;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Staff;
use App\Models\Student;
use App\Models\User;
use Spatie\Permission\Models\Role;

function createStudentEnvironment(): array
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

    return ['school' => $school, 'academicYear' => $academicYear, 'class' => $class, 'section' => $section];
}

function validStudentData(Section $section, array $overrides = []): array
{
    return array_merge([
        'name' => 'Jane Smith',
        'admission_number' => 'ADM-2026-100',
        'date_of_birth' => '2015-06-15',
        'gender' => 'female',
        'admission_date' => '2026-04-01',
        'section_id' => $section->id,
        'guardians' => [
            [
                'guardian_id' => null,
                'name' => 'John Smith',
                'phone' => '+1-555-0100',
                'email' => 'john@example.com',
                'occupation' => 'Engineer',
                'relationship' => 'father',
                'is_primary' => true,
            ],
        ],
    ], $overrides);
}

beforeEach(function () {
    Role::create(['name' => 'super-admin', 'guard_name' => 'web']);
    Role::create(['name' => 'admin', 'guard_name' => 'web']);
    Role::create(['name' => 'teacher', 'guard_name' => 'web']);
    Role::create(['name' => 'student', 'guard_name' => 'web']);
    Role::create(['name' => 'parent', 'guard_name' => 'web']);
});

test('admin can view the students index', function () {
    ['school' => $school, 'section' => $section] = createStudentEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('students.index'))
        ->assertOk();
});

test('teacher can view the students index', function () {
    ['school' => $school] = createStudentEnvironment();

    $teacher = User::factory()->create(['school_id' => $school->id])->assignRole('teacher');

    $this->actingAs($teacher)
        ->get(route('students.index'))
        ->assertOk();
});

test('admin can create a student with a new guardian', function () {
    ['school' => $school, 'section' => $section] = createStudentEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('students.store'), validStudentData($section))
        ->assertRedirect(route('students.index'));

    $student = Student::where('admission_number', 'ADM-2026-100')->first();

    expect($student)->not->toBeNull()
        ->and($student->school_id)->toBe($school->id)
        ->and($student->guardians()->count())->toBe(1)
        ->and((bool) $student->guardians()->first()->pivot->is_primary)->toBeTrue();
});

test('admin can create a student with an existing guardian', function () {
    ['school' => $school, 'section' => $section] = createStudentEnvironment();

    $guardian = Guardian::create(['name' => 'Existing Guardian', 'phone' => '+1-555-0200']);
    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $data = validStudentData($section, [
        'guardians' => [
            [
                'guardian_id' => $guardian->id,
                'relationship' => 'mother',
                'is_primary' => true,
            ],
        ],
    ]);

    $this->actingAs($admin)
        ->post(route('students.store'), $data)
        ->assertRedirect(route('students.index'));

    $student = Student::where('admission_number', 'ADM-2026-100')->first();

    expect($student->guardians()->count())->toBe(1)
        ->and($student->guardians()->first()->id)->toBe($guardian->id)
        ->and(Guardian::count())->toBe(1);
});

test('student name and admission number are required', function () {
    ['school' => $school, 'section' => $section] = createStudentEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('students.store'), [
            'section_id' => $section->id,
            'guardians' => [['relationship' => 'father', 'guardian_id' => null]],
        ])
        ->assertSessionHasErrors(['name', 'admission_number', 'date_of_birth', 'gender', 'admission_date']);
});

test('admission number must be unique within a school', function () {
    ['school' => $school, 'section' => $section] = createStudentEnvironment();

    Student::create([
        'school_id' => $school->id,
        'section_id' => $section->id,
        'name' => 'Existing Student',
        'admission_number' => 'ADM-2026-100',
        'date_of_birth' => '2015-01-01',
        'gender' => 'male',
        'admission_date' => '2026-04-01',
    ]);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('students.store'), validStudentData($section))
        ->assertSessionHasErrors('admission_number');
});

test('teacher cannot create a student', function () {
    ['school' => $school, 'section' => $section] = createStudentEnvironment();

    $teacher = User::factory()->create(['school_id' => $school->id])->assignRole('teacher');

    $this->actingAs($teacher)
        ->post(route('students.store'), validStudentData($section))
        ->assertForbidden();
});

test('admin can update a student', function () {
    ['school' => $school, 'section' => $section] = createStudentEnvironment();

    $student = Student::create([
        'school_id' => $school->id,
        'section_id' => $section->id,
        'name' => 'Jane Smith',
        'admission_number' => 'ADM-2026-100',
        'date_of_birth' => '2015-06-15',
        'gender' => 'female',
        'admission_date' => '2026-04-01',
    ]);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->put(route('students.update', $student), validStudentData($section, [
            'name' => 'Jane Updated',
            'admission_number' => 'ADM-2026-100',
        ]))
        ->assertRedirect(route('students.index'));

    expect($student->fresh()->name)->toBe('Jane Updated');
});

test('teacher cannot view a student outside their assigned sections', function () {
    ['school' => $school, 'academicYear' => $academicYear, 'section' => $section] = createStudentEnvironment();

    $student = Student::create([
        'school_id' => $school->id,
        'section_id' => $section->id,
        'name' => 'Jane Smith',
        'admission_number' => 'ADM-2026-100',
        'date_of_birth' => '2015-06-15',
        'gender' => 'female',
        'admission_date' => '2026-04-01',
    ]);

    $teacherUser = User::factory()->create(['school_id' => $school->id])->assignRole('teacher');
    $staff = Staff::create([
        'user_id' => $teacherUser->id,
        'school_id' => $school->id,
        'employee_id' => 'EMP-100',
        'designation' => 'Teacher',
        'joining_date' => '2025-09-01',
    ]);

    $this->actingAs($teacherUser)
        ->get(route('students.show', $student))
        ->assertForbidden();
});

test('teacher can view a student in their assigned section', function () {
    ['school' => $school, 'academicYear' => $academicYear, 'section' => $section] = createStudentEnvironment();

    $student = Student::create([
        'school_id' => $school->id,
        'section_id' => $section->id,
        'name' => 'Jane Smith',
        'admission_number' => 'ADM-2026-100',
        'date_of_birth' => '2015-06-15',
        'gender' => 'female',
        'admission_date' => '2026-04-01',
    ]);

    $teacherUser = User::factory()->create(['school_id' => $school->id])->assignRole('teacher');
    $staff = Staff::create([
        'user_id' => $teacherUser->id,
        'school_id' => $school->id,
        'employee_id' => 'EMP-100',
        'designation' => 'Teacher',
        'joining_date' => '2025-09-01',
    ]);
    $staff->sections()->attach($section->id, ['academic_year_id' => $academicYear->id, 'is_class_teacher' => true]);

    $this->actingAs($teacherUser)
        ->get(route('students.show', $student))
        ->assertOk();
});

test('teacher only sees students in their assigned sections on the index', function () {
    ['school' => $school, 'academicYear' => $academicYear, 'class' => $class, 'section' => $section] = createStudentEnvironment();

    $otherSection = Section::create(['class_id' => $class->id, 'name' => 'Section B', 'capacity' => 30]);
    $otherClass = SchoolClass::create([
        'school_id' => $school->id,
        'academic_year_id' => $academicYear->id,
        'name' => 'Grade 2',
    ]);
    $otherClassSection = Section::create(['class_id' => $otherClass->id, 'name' => 'Section A', 'capacity' => 30]);

    $assignedStudent = Student::create([
        'school_id' => $school->id,
        'section_id' => $section->id,
        'name' => 'Jane Smith',
        'admission_number' => 'ADM-2026-100',
        'date_of_birth' => '2015-06-15',
        'gender' => 'female',
        'admission_date' => '2026-04-01',
    ]);
    $otherStudent = Student::create([
        'school_id' => $school->id,
        'section_id' => $otherSection->id,
        'name' => 'John Doe',
        'admission_number' => 'ADM-2026-101',
        'date_of_birth' => '2015-06-15',
        'gender' => 'male',
        'admission_date' => '2026-04-01',
    ]);
    Student::create([
        'school_id' => $school->id,
        'section_id' => $otherClassSection->id,
        'name' => 'Sam Wilson',
        'admission_number' => 'ADM-2026-102',
        'date_of_birth' => '2015-06-15',
        'gender' => 'male',
        'admission_date' => '2026-04-01',
    ]);

    $teacherUser = User::factory()->create(['school_id' => $school->id])->assignRole('teacher');
    $staff = Staff::create([
        'user_id' => $teacherUser->id,
        'school_id' => $school->id,
        'employee_id' => 'EMP-100',
        'designation' => 'Teacher',
        'joining_date' => '2025-09-01',
    ]);
    $staff->sections()->attach($section->id, ['academic_year_id' => $academicYear->id, 'is_class_teacher' => true]);

    $this->actingAs($teacherUser)
        ->get(route('students.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('students.data', fn ($data) => collect($data)->pluck('id')->contains($assignedStudent->id))
            ->where('students.data', fn ($data) => collect($data)->pluck('id')->doesntContain($otherStudent->id))
            ->where('students.data', fn ($data) => collect($data)->pluck('id')->doesntContain(
                Student::where('admission_number', 'ADM-2026-102')->value('id')
            ))
            ->where('classes', fn ($classes) => collect($classes)->pluck('id')->contains($class->id))
            ->where('classes', fn ($classes) => collect($classes)->pluck('id')->doesntContain($otherClass->id))
            ->where('classes', fn ($classes) => collect($classes)->flatMap(fn ($c) => $c['sections'] ?? [])->pluck('id')->doesntContain($otherSection->id)));
});

test('teacher only sees classes containing their assigned sections on the classes index', function () {
    ['school' => $school, 'academicYear' => $academicYear, 'class' => $class, 'section' => $section] = createStudentEnvironment();

    $otherSection = Section::create(['class_id' => $class->id, 'name' => 'Section B', 'capacity' => 30]);
    $otherClass = SchoolClass::create([
        'school_id' => $school->id,
        'academic_year_id' => $academicYear->id,
        'name' => 'Grade 2',
    ]);
    Section::create(['class_id' => $otherClass->id, 'name' => 'Section A', 'capacity' => 30]);

    $teacherUser = User::factory()->create(['school_id' => $school->id])->assignRole('teacher');
    $staff = Staff::create([
        'user_id' => $teacherUser->id,
        'school_id' => $school->id,
        'employee_id' => 'EMP-100',
        'designation' => 'Teacher',
        'joining_date' => '2025-09-01',
    ]);
    $staff->sections()->attach($section->id, ['academic_year_id' => $academicYear->id, 'is_class_teacher' => true]);

    $this->actingAs($teacherUser)
        ->get(route('classes.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('classes.data', fn ($data) => count($data) === 1)
            ->where('classes.data', fn ($data) => collect($data)->pluck('id')->contains($class->id))
            ->where('classes.data', fn ($data) => collect($data)->pluck('id')->doesntContain($otherClass->id))
            ->where('classes.data', fn ($data) => collect($data)->flatMap(fn ($c) => $c['sections'] ?? [])->pluck('id')->doesntContain($otherSection->id)));
});

test('admin sees all students on the index', function () {
    ['school' => $school, 'academicYear' => $academicYear, 'class' => $class, 'section' => $section] = createStudentEnvironment();

    $otherClass = SchoolClass::create([
        'school_id' => $school->id,
        'academic_year_id' => $academicYear->id,
        'name' => 'Grade 2',
    ]);
    $otherClassSection = Section::create(['class_id' => $otherClass->id, 'name' => 'Section A', 'capacity' => 30]);

    Student::create([
        'school_id' => $school->id,
        'section_id' => $section->id,
        'name' => 'Jane Smith',
        'admission_number' => 'ADM-2026-100',
        'date_of_birth' => '2015-06-15',
        'gender' => 'female',
        'admission_date' => '2026-04-01',
    ]);
    Student::create([
        'school_id' => $school->id,
        'section_id' => $otherClassSection->id,
        'name' => 'John Doe',
        'admission_number' => 'ADM-2026-101',
        'date_of_birth' => '2015-06-15',
        'gender' => 'male',
        'admission_date' => '2026-04-01',
    ]);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('students.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('students.data', fn ($data) => count($data) === 2)
            ->where('classes', fn ($classes) => collect($classes)->pluck('id')->contains($class->id))
            ->where('classes', fn ($classes) => collect($classes)->pluck('id')->contains($otherClass->id)));
});

test('admin can filter students by gender on the index', function () {
    ['school' => $school, 'section' => $section] = createStudentEnvironment();

    Student::create([
        'school_id' => $school->id,
        'section_id' => $section->id,
        'name' => 'Jane Smith',
        'admission_number' => 'ADM-2026-300',
        'date_of_birth' => '2015-06-15',
        'gender' => 'female',
        'admission_date' => '2026-04-01',
    ]);
    Student::create([
        'school_id' => $school->id,
        'section_id' => $section->id,
        'name' => 'John Doe',
        'admission_number' => 'ADM-2026-301',
        'date_of_birth' => '2015-06-15',
        'gender' => 'male',
        'admission_date' => '2026-04-01',
    ]);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('students.index', ['gender' => 'female']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('filters.gender', 'female')
            ->where('students.data', fn ($data) => count($data) === 1 && $data[0]['gender'] === 'female'));
});

test('admin can filter students by admission date range on the index', function () {
    ['school' => $school, 'section' => $section] = createStudentEnvironment();

    Student::create([
        'school_id' => $school->id,
        'section_id' => $section->id,
        'name' => 'Jane Smith',
        'admission_number' => 'ADM-2026-400',
        'date_of_birth' => '2015-06-15',
        'gender' => 'female',
        'admission_date' => '2026-01-15',
    ]);
    Student::create([
        'school_id' => $school->id,
        'section_id' => $section->id,
        'name' => 'John Doe',
        'admission_number' => 'ADM-2026-401',
        'date_of_birth' => '2015-06-15',
        'gender' => 'male',
        'admission_date' => '2026-04-10',
    ]);
    Student::create([
        'school_id' => $school->id,
        'section_id' => $section->id,
        'name' => 'Alex Kim',
        'admission_number' => 'ADM-2026-402',
        'date_of_birth' => '2015-06-15',
        'gender' => 'male',
        'admission_date' => '2026-06-20',
    ]);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('students.index', ['admission_from' => '2026-02-01', 'admission_to' => '2026-05-31']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('filters.admission_from', '2026-02-01')
            ->where('filters.admission_to', '2026-05-31')
            ->where('students.data', fn ($data) => count($data) === 1 && $data[0]['admission_number'] === 'ADM-2026-401'));
});

test('student role can view their own record', function () {
    ['school' => $school, 'section' => $section] = createStudentEnvironment();

    $studentUser = User::factory()->create(['school_id' => $school->id])->assignRole('student');

    $student = Student::create([
        'user_id' => $studentUser->id,
        'school_id' => $school->id,
        'section_id' => $section->id,
        'name' => 'Jane Smith',
        'admission_number' => 'ADM-2026-100',
        'date_of_birth' => '2015-06-15',
        'gender' => 'female',
        'admission_date' => '2026-04-01',
    ]);

    $this->actingAs($studentUser)
        ->get(route('students.show', $student))
        ->assertOk();

    $otherUser = User::factory()->create(['school_id' => $school->id])->assignRole('student');
    $other = Student::create([
        'user_id' => $otherUser->id,
        'school_id' => $school->id,
        'section_id' => $section->id,
        'name' => 'Other Student',
        'admission_number' => 'ADM-2026-101',
        'date_of_birth' => '2015-01-01',
        'gender' => 'male',
        'admission_date' => '2026-04-01',
    ]);

    $this->actingAs($studentUser)
        ->get(route('students.show', $other))
        ->assertForbidden();
});

test('parent role can view records linked to their guardian account', function () {
    ['school' => $school, 'section' => $section] = createStudentEnvironment();

    $parentUser = User::factory()->create(['school_id' => $school->id])->assignRole('parent');
    $guardian = Guardian::create(['name' => 'Parent Guardian', 'user_id' => $parentUser->id]);

    $student = Student::create([
        'school_id' => $school->id,
        'section_id' => $section->id,
        'name' => 'Jane Smith',
        'admission_number' => 'ADM-2026-100',
        'date_of_birth' => '2015-06-15',
        'gender' => 'female',
        'admission_date' => '2026-04-01',
    ]);
    $student->guardians()->attach($guardian->id, ['relationship' => 'father', 'is_primary' => true]);

    $this->actingAs($parentUser)
        ->get(route('students.show', $student))
        ->assertOk();

    $unlinked = Student::create([
        'school_id' => $school->id,
        'section_id' => $section->id,
        'name' => 'Unlinked Student',
        'admission_number' => 'ADM-2026-101',
        'date_of_birth' => '2015-01-01',
        'gender' => 'male',
        'admission_date' => '2026-04-01',
    ]);

    $this->actingAs($parentUser)
        ->get(route('students.show', $unlinked))
        ->assertForbidden();
});
