<?php

use App\Models\AcademicYear;
use App\Models\Exam;
use App\Models\ExamSubject;
use App\Models\GradeBand;
use App\Models\GradingScale;
use App\Models\Guardian;
use App\Models\Mark;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Staff;
use App\Models\Student;
use App\Models\Subject;
use App\Models\User;
use App\Services\GradeCalculator;
use Spatie\Permission\Models\Role;

function createExamEnvironment(): array
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

    $math = Subject::create(['school_id' => $school->id, 'name' => 'Mathematics', 'code' => 'MATH']);
    $english = Subject::create(['school_id' => $school->id, 'name' => 'English', 'code' => 'ENG']);
    $class->subjects()->attach([$math->id, $english->id]);

    $scale = GradingScale::create(['school_id' => $school->id, 'name' => 'Standard']);
    GradeBand::create(['grading_scale_id' => $scale->id, 'label' => 'A', 'min_percentage' => 90, 'max_percentage' => 100, 'grade_point' => 4.0]);
    GradeBand::create(['grading_scale_id' => $scale->id, 'label' => 'B', 'min_percentage' => 75, 'max_percentage' => 89.99, 'grade_point' => 3.0]);
    GradeBand::create(['grading_scale_id' => $scale->id, 'label' => 'C', 'min_percentage' => 60, 'max_percentage' => 74.99, 'grade_point' => 2.0]);
    GradeBand::create(['grading_scale_id' => $scale->id, 'label' => 'F', 'min_percentage' => 0, 'max_percentage' => 59.99, 'grade_point' => 0.0]);

    $exam = Exam::create([
        'school_id' => $school->id,
        'academic_year_id' => $academicYear->id,
        'class_id' => $class->id,
        'name' => 'Term 1 Mid-Terms',
        'grading_scale_id' => $scale->id,
        'start_date' => '2025-11-01',
        'end_date' => '2025-11-05',
    ]);

    $examSubject = ExamSubject::create([
        'exam_id' => $exam->id,
        'subject_id' => $math->id,
        'full_marks' => 100,
        'pass_marks' => 40,
        'exam_date' => '2025-11-01',
    ]);

    $student = Student::create([
        'school_id' => $school->id,
        'section_id' => $section->id,
        'name' => 'Jane Smith',
        'admission_number' => 'ADM-2026-100',
        'date_of_birth' => '2015-06-15',
        'gender' => 'female',
        'admission_date' => '2026-04-01',
        'status' => 'active',
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

    return [
        'school' => $school,
        'academicYear' => $academicYear,
        'class' => $class,
        'section' => $section,
        'math' => $math,
        'english' => $english,
        'scale' => $scale,
        'exam' => $exam,
        'examSubject' => $examSubject,
        'student' => $student,
        'staff' => $staff,
        'teacherUser' => $teacherUser,
    ];
}

beforeEach(function () {
    Role::create(['name' => 'super-admin', 'guard_name' => 'web']);
    Role::create(['name' => 'admin', 'guard_name' => 'web']);
    Role::create(['name' => 'teacher', 'guard_name' => 'web']);
    Role::create(['name' => 'student', 'guard_name' => 'web']);
    Role::create(['name' => 'parent', 'guard_name' => 'web']);
});

test('admin can create a subject and assign it to a class', function () {
    ['school' => $school, 'class' => $class] = createExamEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('subjects.store'), ['name' => 'Science', 'code' => 'SCI'])
        ->assertRedirect();

    $science = Subject::where('name', 'Science')->first();

    expect($science)->not->toBeNull()
        ->and($science->school_id)->toBe($school->id);

    $this->actingAs($admin)
        ->put(route('classes.subjects.sync', $class->id), [
            'subject_ids' => [$science->id, $class->subjects()->value('subjects.id')],
        ])
        ->assertRedirect();

    expect($class->subjects()->pluck('subjects.id'))->toContain($science->id);
});

test('teacher cannot create subjects', function () {
    ['school' => $school, 'teacherUser' => $teacherUser] = createExamEnvironment();

    $this->actingAs($teacherUser)
        ->post(route('subjects.store'), ['name' => 'Science'])
        ->assertForbidden();
});

test('admin can create a grading scale with bands', function () {
    ['school' => $school] = createExamEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('grading-scales.store'), ['name' => 'Letter Grades'])
        ->assertRedirect();

    $scale = GradingScale::where('name', 'Letter Grades')->first();

    $this->actingAs($admin)
        ->post(route('grading-scales.bands.store', $scale->id), [
            'bands' => [
                ['label' => 'A', 'min_percentage' => 90, 'max_percentage' => 100, 'grade_point' => 4.0],
                ['label' => 'F', 'min_percentage' => 0, 'max_percentage' => 89.99, 'grade_point' => 0.0],
            ],
        ])
        ->assertRedirect();

    expect($scale->gradeBands()->count())->toBe(2);
});

test('overlapping grade bands are rejected', function () {
    ['school' => $school, 'scale' => $scale] = createExamEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('grading-scales.bands.store', $scale->id), [
            'bands' => [
                ['label' => 'A', 'min_percentage' => 80, 'max_percentage' => 100],
                ['label' => 'B', 'min_percentage' => 90, 'max_percentage' => 100],
            ],
        ])
        ->assertSessionHasErrors('bands');

    expect($scale->gradeBands()->count())->toBe(4);
});

test('min percentage greater than max is rejected', function () {
    ['school' => $school, 'scale' => $scale] = createExamEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('grading-scales.bands.store', $scale->id), [
            'bands' => [
                ['label' => 'A', 'min_percentage' => 100, 'max_percentage' => 80],
            ],
        ])
        ->assertSessionHasErrors('bands.0.max_percentage');
});

test('admin can create an exam with subjects', function () {
    ['school' => $school, 'class' => $class, 'scale' => $scale, 'math' => $math, 'english' => $english] = createExamEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('exams.store'), [
            'academic_year_id' => $class->academic_year_id,
            'class_id' => $class->id,
            'name' => 'Term 1 Finals',
            'grading_scale_id' => $scale->id,
            'start_date' => '2025-12-01',
            'end_date' => '2025-12-10',
        ])
        ->assertRedirect();

    $exam = Exam::where('name', 'Term 1 Finals')->first();

    expect($exam)->not->toBeNull();

    $this->actingAs($admin)
        ->post(route('exams.subjects.store', $exam->id), [
            'subjects' => [
                ['subject_id' => $math->id, 'full_marks' => 100, 'pass_marks' => 40],
                ['subject_id' => $english->id, 'full_marks' => 50, 'pass_marks' => 20],
            ],
        ])
        ->assertRedirect();

    expect($exam->examSubjects()->count())->toBe(2);
});

test('exam subjects can be removed by submitting an empty subjects list', function () {
    ['school' => $school, 'exam' => $exam] = createExamEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('exams.subjects.store', $exam->id), [
            'subjects' => [],
        ])
        ->assertRedirect();

    expect($exam->examSubjects()->count())->toBe(0);
});

test('saving exam subjects preserves marks for kept subjects and removes them for unchecked ones', function () {
    ['school' => $school, 'exam' => $exam, 'math' => $math, 'english' => $english, 'student' => $student, 'staff' => $staff] = createExamEnvironment();

    $englishSubject = ExamSubject::create([
        'exam_id' => $exam->id,
        'subject_id' => $english->id,
        'full_marks' => 50,
        'pass_marks' => 20,
    ]);

    Mark::create([
        'exam_subject_id' => $englishSubject->id,
        'student_id' => $student->id,
        'marks_obtained' => 42,
        'entered_by' => $staff->user_id,
    ]);

    $mathExamSubject = $exam->examSubjects()->where('subject_id', $math->id)->first();
    $mathExamSubjectId = $mathExamSubject->id;

    Mark::create([
        'exam_subject_id' => $mathExamSubjectId,
        'student_id' => $student->id,
        'marks_obtained' => 88,
        'entered_by' => $staff->user_id,
    ]);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('exams.subjects.store', $exam->id), [
            'subjects' => [
                ['subject_id' => $english->id, 'full_marks' => 50, 'pass_marks' => 20],
            ],
        ])
        ->assertRedirect();

    expect($exam->examSubjects()->count())->toBe(1)
        ->and($exam->examSubjects()->where('subject_id', $math->id)->exists())->toBeFalse()
        ->and(Mark::where('exam_subject_id', $englishSubject->id)->count())->toBe(1)
        ->and(Mark::where('exam_subject_id', $mathExamSubjectId)->count())->toBe(0);
});

test('exam subject not assigned to the class is rejected', function () {
    ['school' => $school, 'exam' => $exam, 'class' => $class] = createExamEnvironment();

    $unassigned = Subject::create(['school_id' => $school->id, 'name' => 'Physics', 'code' => 'PHY']);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('exams.subjects.store', $exam->id), [
            'subjects' => [
                ['subject_id' => $unassigned->id, 'full_marks' => 100, 'pass_marks' => 40],
            ],
        ])
        ->assertSessionHasErrors('subjects.0.subject_id');
});

test('teacher can enter marks for an assigned section', function () {
    ['school' => $school, 'staff' => $staff, 'exam' => $exam, 'examSubject' => $examSubject, 'section' => $section, 'student' => $student] = createExamEnvironment();

    $this->actingAs($staff->user)
        ->post(route('mark-entry.store'), [
            'section_id' => $section->id,
            'exam_subject_id' => $examSubject->id,
            'records' => [
                ['student_id' => $student->id, 'marks_obtained' => 85, 'remarks' => 'Good work'],
            ],
        ])
        ->assertRedirect();

    $mark = Mark::where('exam_subject_id', $examSubject->id)->where('student_id', $student->id)->first();

    expect($mark)->not->toBeNull()
        ->and($mark->marks_obtained)->toBe('85.00')
        ->and($mark->entered_by)->toBe($staff->user->id);
});

test('teacher cannot enter marks for an unassigned section', function () {
    ['school' => $school, 'examSubject' => $examSubject, 'student' => $student] = createExamEnvironment();

    $otherClass = SchoolClass::create([
        'school_id' => $school->id,
        'academic_year_id' => $examSubject->exam->academic_year_id,
        'name' => 'Grade 2',
    ]);
    $otherSection = Section::create(['class_id' => $otherClass->id, 'name' => 'Section A', 'capacity' => 30]);
    $otherStudent = Student::create([
        'school_id' => $school->id,
        'section_id' => $otherSection->id,
        'name' => 'John Doe',
        'admission_number' => 'ADM-2026-101',
        'date_of_birth' => '2015-06-15',
        'gender' => 'male',
        'admission_date' => '2026-04-01',
        'status' => 'active',
    ]);

    $teacherUser = User::factory()->create(['school_id' => $school->id])->assignRole('teacher');
    $staff = Staff::create([
        'user_id' => $teacherUser->id,
        'school_id' => $school->id,
        'employee_id' => 'EMP-200',
        'designation' => 'Teacher',
        'joining_date' => '2025-09-01',
    ]);

    $this->actingAs($teacherUser)
        ->post(route('mark-entry.store'), [
            'section_id' => $otherSection->id,
            'exam_subject_id' => $examSubject->id,
            'records' => [
                ['student_id' => $otherStudent->id, 'marks_obtained' => 85],
            ],
        ])
        ->assertForbidden();
});

test('mark entry index only lists sections the teacher is assigned to', function () {
    ['school' => $school, 'staff' => $staff, 'section' => $section, 'class' => $class] = createExamEnvironment();

    $otherClass = SchoolClass::create([
        'school_id' => $school->id,
        'academic_year_id' => $class->academic_year_id,
        'name' => 'Grade 2',
    ]);
    Section::create(['class_id' => $otherClass->id, 'name' => 'Section A', 'capacity' => 30]);

    $this->actingAs($staff->user)
        ->get(route('mark-entry.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('sections', fn ($sections) => count($sections) === 1)
            ->where('sections', fn ($sections) => collect($sections)->pluck('id')->contains($section->id)));
});

test('report card shows computed grades for a student', function () {
    ['school' => $school, 'exam' => $exam, 'examSubject' => $examSubject, 'student' => $student] = createExamEnvironment();

    Mark::create([
        'exam_subject_id' => $examSubject->id,
        'student_id' => $student->id,
        'marks_obtained' => 85,
        'entered_by' => auth()->id() ?? User::factory()->create(['school_id' => $school->id])->assignRole('admin')->id,
    ]);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('report-cards.show', ['exam' => $exam->id, 'student' => $student->id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('subjects', fn ($subjects) => count($subjects) === 1)
            ->where('subjects.0.percentage', 85)
            ->where('subjects.0.grade_label', 'B')
            ->where('subjects.0.passed', true)
            ->where('totals.percentage', 85)
            ->where('totals.grade_label', 'B'));
});

test('report card index scopes students for a parent', function () {
    ['school' => $school, 'exam' => $exam, 'examSubject' => $examSubject, 'student' => $student] = createExamEnvironment();

    Mark::create([
        'exam_subject_id' => $examSubject->id,
        'student_id' => $student->id,
        'marks_obtained' => 85,
        'entered_by' => User::factory()->create(['school_id' => $school->id])->assignRole('admin')->id,
    ]);

    $parentUser = User::factory()->create(['school_id' => $school->id])->assignRole('parent');
    Guardian::create(['user_id' => $parentUser->id, 'school_id' => $school->id, 'name' => 'Parent']);
    $parentUser->guardian()->first()->students()->attach($student->id, ['relationship' => 'parent', 'is_primary' => true]);

    $this->actingAs($parentUser)
        ->get(route('report-cards.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('exams', fn ($exams) => count($exams) === 1)
            ->where('exams.0.id', $exam->id));
});

test('staff must select a student before report card exams are listed', function () {
    ['school' => $school, 'exam' => $exam, 'examSubject' => $examSubject, 'student' => $student, 'class' => $class, 'section' => $section] = createExamEnvironment();

    Mark::create([
        'exam_subject_id' => $examSubject->id,
        'student_id' => $student->id,
        'marks_obtained' => 85,
        'entered_by' => User::factory()->create(['school_id' => $school->id])->assignRole('admin')->id,
    ]);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('report-cards.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('exams', fn ($exams) => count($exams) === 0)
            ->where('selectedStudentId', null));

    $this->get(route('report-cards.index', ['class_id' => $class->id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('classes', fn ($classes) => count($classes) === 1)
            ->where('classes.0.id', $class->id)
            ->where('sections', fn ($sections) => count($sections) === 1)
            ->where('sections.0.id', $section->id)
            ->where('exams', fn ($exams) => count($exams) === 0));

    $this->get(route('report-cards.index', ['class_id' => $class->id, 'section_id' => $section->id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('students', fn ($students) => count($students) === 1)
            ->where('students.0.id', $student->id)
            ->where('exams', fn ($exams) => count($exams) === 0));

    $this->get(route('report-cards.index', ['class_id' => $class->id, 'section_id' => $section->id, 'student_id' => $student->id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('selectedStudentId', $student->id)
            ->where('exams', fn ($exams) => count($exams) === 1)
            ->where('exams.0.id', $exam->id));
});

test('report card pdf downloads for a staff member', function () {
    ['school' => $school, 'exam' => $exam, 'examSubject' => $examSubject, 'student' => $student] = createExamEnvironment();

    Mark::create([
        'exam_subject_id' => $examSubject->id,
        'student_id' => $student->id,
        'marks_obtained' => 85,
        'entered_by' => User::factory()->create(['school_id' => $school->id])->assignRole('admin')->id,
    ]);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('report-cards.pdf', ['exam' => $exam->id, 'student' => $student->id]))
        ->assertOk()
        ->assertHeader('Content-Type', 'application/pdf');
});

test('grade calculator resolves the correct band', function () {
    ['scale' => $scale] = createExamEnvironment();

    $calculator = new GradeCalculator;

    expect($calculator->gradeForPercentage($scale, 92.0)?->label)->toBe('A')
        ->and($calculator->gradeForPercentage($scale, 80.0)?->label)->toBe('B')
        ->and($calculator->gradeForPercentage($scale, 65.0)?->label)->toBe('C')
        ->and($calculator->gradeForPercentage($scale, 20.0)?->label)->toBe('F')
        ->and($calculator->percentage(85, 100))->toBe(85.0);
});

test('exam index exposes the class subjects for the manage subjects dialog', function () {
    ['school' => $school, 'exam' => $exam, 'class' => $class] = createExamEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('exams.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('exams.data.0.class_subjects', fn ($subjects) => count($subjects) === 2)
            ->where('exams.data.0.class_subjects', fn ($subjects) => collect($subjects)->pluck('name')->sort()->values()->all() === ['English', 'Mathematics']));
});
