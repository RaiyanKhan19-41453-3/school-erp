<?php

use App\Jobs\GenerateInvoicesJob;
use App\Models\AcademicYear;
use App\Models\Attendance;
use App\Models\Exam;
use App\Models\ExamSubject;
use App\Models\FeeCategory;
use App\Models\FeeStructure;
use App\Models\Guardian;
use App\Models\Invoice;
use App\Models\Mark;
use App\Models\Payment;
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
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::create(['name' => 'super-admin', 'guard_name' => 'web']);
    Role::create(['name' => 'admin', 'guard_name' => 'web']);
    Role::create(['name' => 'teacher', 'guard_name' => 'web']);
    Role::create(['name' => 'student', 'guard_name' => 'web']);
    Role::create(['name' => 'parent', 'guard_name' => 'web']);
});

function bugFixSchool(): array
{
    $school = School::create(['name' => 'Bugfix School']);
    $year = AcademicYear::create([
        'school_id' => $school->id,
        'name' => '2025-2026',
        'start_date' => '2025-01-01',
        'end_date' => '2025-12-31',
        'is_current' => true,
    ]);
    $class = SchoolClass::create(['school_id' => $school->id, 'academic_year_id' => $year->id, 'name' => 'Class 1']);
    $section = Section::create(['class_id' => $class->id, 'name' => 'A', 'capacity' => 30]);

    return compact('school', 'year', 'class', 'section');
}

test('invoice list is scoped to the admin school', function () {
    ['school' => $school, 'year' => $year, 'section' => $section] = bugFixSchool();

    $other = School::create(['name' => 'Other School']);
    $otherYear = AcademicYear::create(['school_id' => $other->id, 'name' => '2025-2026', 'start_date' => '2025-01-01', 'end_date' => '2025-12-31', 'is_current' => true]);
    $otherClass = SchoolClass::create(['school_id' => $other->id, 'academic_year_id' => $otherYear->id, 'name' => 'Class 1']);
    $otherSection = Section::create(['class_id' => $otherClass->id, 'name' => 'A', 'capacity' => 30]);

    $student = Student::create(['school_id' => $school->id, 'section_id' => $section->id, 'name' => 'S1', 'admission_number' => 'A1', 'date_of_birth' => '2015-01-01', 'gender' => 'male', 'admission_date' => '2025-01-01', 'status' => 'active']);
    $otherStudent = Student::create(['school_id' => $other->id, 'section_id' => $otherSection->id, 'name' => 'S2', 'admission_number' => 'A2', 'date_of_birth' => '2015-01-01', 'gender' => 'male', 'admission_date' => '2025-01-01', 'status' => 'active']);

    Invoice::create(['student_id' => $student->id, 'academic_year_id' => $year->id, 'invoice_number' => 'INV-T1-00001', 'period' => '2025-2026', 'due_date' => '2025-06-10', 'total_amount' => 100, 'status' => 'unpaid']);
    Invoice::create(['student_id' => $otherStudent->id, 'academic_year_id' => $otherYear->id, 'invoice_number' => 'INV-T1-00002', 'period' => '2025-2026', 'due_date' => '2025-06-10', 'total_amount' => 100, 'status' => 'unpaid']);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('invoices.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('invoices.data', fn ($rows) => collect($rows)->pluck('invoice_number')->all() === ['INV-T1-00001']));
});

test('zero-total invoice is treated as paid and balance never goes negative', function () {
    ['school' => $school, 'year' => $year, 'section' => $section] = bugFixSchool();
    $student = Student::create(['school_id' => $school->id, 'section_id' => $section->id, 'name' => 'S1', 'admission_number' => 'A1', 'date_of_birth' => '2015-01-01', 'gender' => 'male', 'admission_date' => '2025-01-01', 'status' => 'active']);

    $invoice = Invoice::create(['student_id' => $student->id, 'academic_year_id' => $year->id, 'invoice_number' => 'INV-T1-00003', 'period' => '2025-2026', 'due_date' => '2025-06-10', 'total_amount' => 0, 'status' => 'unpaid']);
    $invoice->recalculateStatus();

    expect($invoice->fresh()->status)->toBe(Invoice::STATUS_PAID)
        ->and($invoice->balanceDue())->toBe('0.00');
});

test('recording payment on a fully paid invoice is rejected', function () {
    ['school' => $school, 'year' => $year, 'section' => $section] = bugFixSchool();
    $student = Student::create(['school_id' => $school->id, 'section_id' => $section->id, 'name' => 'S1', 'admission_number' => 'A1', 'date_of_birth' => '2015-01-01', 'gender' => 'male', 'admission_date' => '2025-01-01', 'status' => 'active']);
    $invoice = Invoice::create(['student_id' => $student->id, 'academic_year_id' => $year->id, 'invoice_number' => 'INV-T1-00004', 'period' => '2025-2026', 'due_date' => '2025-06-10', 'total_amount' => 100, 'status' => 'unpaid']);
    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    Payment::create(['invoice_id' => $invoice->id, 'amount' => 100, 'payment_method' => 'cash', 'status' => 'completed', 'paid_at' => now(), 'recorded_by' => $admin->id]);
    $invoice->recalculateStatus();

    $this->actingAs($admin)
        ->post(route('invoices.payments.store', $invoice->id), ['amount' => 10, 'payment_method' => 'cash'])
        ->assertSessionHasErrors('amount');

    expect(Payment::where('invoice_id', $invoice->id)->count())->toBe(1);
});

test('teacher assignment in a new year does not corrupt the prior year row', function () {
    ['school' => $school, 'year' => $year, 'section' => $section] = bugFixSchool();
    $nextYear = AcademicYear::create(['school_id' => $school->id, 'name' => '2026-2027', 'start_date' => '2026-01-01', 'end_date' => '2026-12-31', 'is_current' => false]);

    $teacherUser = User::factory()->create(['school_id' => $school->id])->assignRole('teacher');
    $staff = Staff::create(['user_id' => $teacherUser->id, 'school_id' => $school->id, 'employee_id' => 'EMP-1', 'designation' => 'Teacher', 'joining_date' => '2025-01-01']);
    $staff->sections()->attach($section->id, ['academic_year_id' => $year->id, 'is_class_teacher' => true]);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    // Simulate assignment in the next year becoming current.
    $year->update(['is_current' => false]);
    $nextYear->update(['is_current' => true]);

    $this->actingAs($admin)
        ->post(route('teacher-assignments.store'), ['section_id' => $section->id, 'staff_id' => $staff->id, 'is_class_teacher' => false])
        ->assertRedirect();

    $oldRow = DB::table('teacher_section')->where('staff_id', $staff->id)->where('section_id', $section->id)->where('academic_year_id', $year->id)->first();
    $newRow = DB::table('teacher_section')->where('staff_id', $staff->id)->where('section_id', $section->id)->where('academic_year_id', $nextYear->id)->first();

    expect($oldRow)->not->toBeNull()
        ->and((bool) $oldRow->is_class_teacher)->toBeTrue()
        ->and($newRow)->not->toBeNull()
        ->and((bool) $newRow->is_class_teacher)->toBeFalse();
});

test('timetable flags overlapping wall-clock periods for the same teacher', function () {
    ['school' => $school, 'year' => $year, 'section' => $section] = bugFixSchool();
    $section2 = Section::create(['class_id' => $section->class_id, 'name' => 'B', 'capacity' => 30]);

    $teacherUser = User::factory()->create(['school_id' => $school->id])->assignRole('teacher');
    $staff = Staff::create(['user_id' => $teacherUser->id, 'school_id' => $school->id, 'employee_id' => 'EMP-2', 'designation' => 'Teacher', 'joining_date' => '2025-01-01']);

    $morning = Period::create(['school_id' => $school->id, 'name' => 'P1', 'start_time' => '09:00', 'end_time' => '10:00', 'sort_order' => 1]);
    $overlap = Period::create(['school_id' => $school->id, 'name' => 'P2', 'start_time' => '09:30', 'end_time' => '10:30', 'sort_order' => 2]);

    TimetableSlot::create(['section_id' => $section->id, 'academic_year_id' => $year->id, 'staff_id' => $staff->id, 'period_id' => $morning->id, 'day_of_week' => 'monday']);

    $service = new TimetableConflictService;

    expect($service->hasConflict($staff->id, 'monday', $overlap->id, $year->id))->toBeTrue()
        ->and($service->hasConflict($staff->id, 'tuesday', $overlap->id, $year->id))->toBeFalse();
});

test('class update refuses to delete a section that still has students', function () {
    ['school' => $school, 'section' => $section, 'class' => $class] = bugFixSchool();
    Student::create(['school_id' => $school->id, 'section_id' => $section->id, 'name' => 'S1', 'admission_number' => 'A9', 'date_of_birth' => '2015-01-01', 'gender' => 'male', 'admission_date' => '2025-01-01', 'status' => 'active']);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->put(route('classes.update', $class->id), [
            'name' => $class->name,
            'sections' => [['name' => 'Brand New', 'capacity' => 20]],
        ])
        ->assertSessionHasErrors('sections');

    expect(Section::find($section->id))->not->toBeNull();
});

test('attendance rejects students from another section', function () {
    ['school' => $school, 'section' => $section, 'class' => $class] = bugFixSchool();
    $otherSection = Section::create(['class_id' => $class->id, 'name' => 'B', 'capacity' => 30]);
    $otherStudent = Student::create(['school_id' => $school->id, 'section_id' => $otherSection->id, 'name' => 'S2', 'admission_number' => 'AX2', 'date_of_birth' => '2015-01-01', 'gender' => 'female', 'admission_date' => '2025-01-01', 'status' => 'active']);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('attendance.store'), [
            'section_id' => $section->id,
            'date' => now()->toDateString(),
            'records' => [['student_id' => $otherStudent->id, 'status' => 'present']],
        ])
        ->assertSessionHasErrors('records');

    expect(Attendance::count())->toBe(0);
});

test('marks exceeding full marks are rejected', function () {
    ['school' => $school, 'year' => $year, 'class' => $class, 'section' => $section] = bugFixSchool();
    $subject = Subject::create(['school_id' => $school->id, 'name' => 'Math', 'code' => 'M']);
    $exam = Exam::create(['school_id' => $school->id, 'academic_year_id' => $year->id, 'class_id' => $class->id, 'name' => 'Final']);
    $examSubject = ExamSubject::create(['exam_id' => $exam->id, 'subject_id' => $subject->id, 'full_marks' => 100, 'pass_marks' => 40]);
    $student = Student::create(['school_id' => $school->id, 'section_id' => $section->id, 'name' => 'S1', 'admission_number' => 'AM1', 'date_of_birth' => '2015-01-01', 'gender' => 'male', 'admission_date' => '2025-01-01', 'status' => 'active']);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('mark-entry.store'), [
            'section_id' => $section->id,
            'exam_subject_id' => $examSubject->id,
            'records' => [['student_id' => $student->id, 'marks_obtained' => 150]],
        ])
        ->assertSessionHasErrors('records');

    expect(Mark::count())->toBe(0);
});

test('parent with two children can switch between them on the dashboard', function () {
    ['school' => $school, 'section' => $section] = bugFixSchool();

    $s1 = Student::create(['school_id' => $school->id, 'section_id' => $section->id, 'name' => 'Child One', 'admission_number' => 'C1', 'date_of_birth' => '2015-01-01', 'gender' => 'male', 'admission_date' => '2025-01-01', 'status' => 'active']);
    $s2 = Student::create(['school_id' => $school->id, 'section_id' => $section->id, 'name' => 'Child Two', 'admission_number' => 'C2', 'date_of_birth' => '2016-01-01', 'gender' => 'female', 'admission_date' => '2025-01-01', 'status' => 'active']);

    $parentUser = User::factory()->create(['school_id' => $school->id])->assignRole('parent');
    $guardian = Guardian::create(['user_id' => $parentUser->id, 'name' => 'Parent', 'phone' => '123']);
    $guardian->students()->attach([$s1->id => ['relationship' => 'father', 'is_primary' => true], $s2->id => ['relationship' => 'father', 'is_primary' => false]]);

    $this->actingAs($parentUser)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('isParent', true)
            ->has('children', 2)
            ->where('selectedChildId', $s1->id));

    // Switch to the second child.
    $this->actingAs($parentUser)
        ->get(route('dashboard', ['child_id' => $s2->id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('selectedChildId', $s2->id));
});

test('invoice generation adds missing items when a new fee structure appears', function () {
    ['school' => $school, 'year' => $year, 'class' => $class, 'section' => $section] = bugFixSchool();

    $cat1 = FeeCategory::create(['school_id' => $school->id, 'name' => 'Tuition']);
    $cat2 = FeeCategory::create(['school_id' => $school->id, 'name' => 'Library']);
    $fs1 = FeeStructure::create(['school_id' => $school->id, 'academic_year_id' => $year->id, 'class_id' => $class->id, 'fee_category_id' => $cat1->id, 'amount' => 5000, 'frequency' => 'monthly', 'due_day' => 10]);

    $student = Student::create(['school_id' => $school->id, 'section_id' => $section->id, 'name' => 'S1', 'admission_number' => 'INV1', 'date_of_birth' => '2015-01-01', 'gender' => 'male', 'admission_date' => '2025-01-01', 'status' => 'active']);

    (new GenerateInvoicesJob($school->id, $class->id, $year->id))->handle();

    $invoice = Invoice::where('student_id', $student->id)->first();
    expect($invoice)->not->toBeNull()
        ->and((float) $invoice->total_amount)->toBe(5000.0)
        ->and($invoice->items()->count())->toBe(1);

    // New fee structure appears later.
    $fs2 = FeeStructure::create(['school_id' => $school->id, 'academic_year_id' => $year->id, 'class_id' => $class->id, 'fee_category_id' => $cat2->id, 'amount' => 500, 'frequency' => 'annual', 'due_day' => 10]);

    (new GenerateInvoicesJob($school->id, $class->id, $year->id))->handle();

    $invoice->refresh();
    expect(Invoice::where('student_id', $student->id)->count())->toBe(1)
        ->and((float) $invoice->total_amount)->toBe(5500.0)
        ->and($invoice->items()->count())->toBe(2);
});

test('report card flags missing marks as incomplete', function () {
    ['school' => $school, 'year' => $year, 'class' => $class, 'section' => $section] = bugFixSchool();

    $math = Subject::create(['school_id' => $school->id, 'name' => 'Math', 'code' => 'M']);
    $eng = Subject::create(['school_id' => $school->id, 'name' => 'English', 'code' => 'E']);
    $exam = Exam::create(['school_id' => $school->id, 'academic_year_id' => $year->id, 'class_id' => $class->id, 'name' => 'Final']);
    $es1 = ExamSubject::create(['exam_id' => $exam->id, 'subject_id' => $math->id, 'full_marks' => 100, 'pass_marks' => 40]);
    ExamSubject::create(['exam_id' => $exam->id, 'subject_id' => $eng->id, 'full_marks' => 100, 'pass_marks' => 40]);

    $student = Student::create(['school_id' => $school->id, 'section_id' => $section->id, 'name' => 'S1', 'admission_number' => 'RC1', 'date_of_birth' => '2015-01-01', 'gender' => 'male', 'admission_date' => '2025-01-01', 'status' => 'active']);
    $teacher = User::factory()->create(['school_id' => $school->id])->assignRole('teacher');
    Mark::create(['exam_subject_id' => $es1->id, 'student_id' => $student->id, 'marks_obtained' => 80, 'entered_by' => $teacher->id]);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('report-cards.show', ['exam' => $exam->id, 'student' => $student->id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('subjects', fn ($subjects) => count($subjects) === 2)
            ->where('totals.total_subjects', 2)
            ->where('totals.marked_subjects', 1)
            ->where('totals.missing_subjects', 1)
            ->where('totals.is_complete', false));
});
