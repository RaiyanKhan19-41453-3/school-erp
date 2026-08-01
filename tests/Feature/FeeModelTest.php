<?php

use App\Models\AcademicYear;
use App\Models\FeeCategory;
use App\Models\FeeStructure;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Payment;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;

function createFeeEnvironment(): array
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
    $category = FeeCategory::create(['school_id' => $school->id, 'name' => 'Tuition']);
    $structure = FeeStructure::create([
        'school_id' => $school->id,
        'academic_year_id' => $academicYear->id,
        'class_id' => $class->id,
        'fee_category_id' => $category->id,
        'amount' => 1000.00,
        'frequency' => FeeStructure::FREQUENCY_MONTHLY,
        'due_day' => 10,
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

    return [
        'school' => $school,
        'academicYear' => $academicYear,
        'class' => $class,
        'section' => $section,
        'category' => $category,
        'structure' => $structure,
        'student' => $student,
    ];
}

function createInvoice(Student $student, int $academicYearId, float $total, string $dueDate = '2026-05-10', string $period = '2026-05'): Invoice
{
    return Invoice::create([
        'student_id' => $student->id,
        'academic_year_id' => $academicYearId,
        'invoice_number' => 'INV-'.Str::random(6),
        'period' => $period,
        'due_date' => $dueDate,
        'total_amount' => $total,
        'status' => Invoice::STATUS_UNPAID,
    ]);
}

test('fee structure belongs to class and fee category', function () {
    ['class' => $class, 'category' => $category, 'structure' => $structure] = createFeeEnvironment();

    expect($structure->class->is($class))->toBeTrue()
        ->and($structure->feeCategory->is($category))->toBeTrue();
});

test('student has many invoices', function () {
    ['student' => $student, 'academicYear' => $academicYear] = createFeeEnvironment();

    createInvoice($student, $academicYear->id, 1000.00);
    createInvoice($student, $academicYear->id, 500.00, '2026-06-10', '2026-06');

    expect($student->invoices()->count())->toBe(2);
});

test('invoice amount paid sums only completed payments', function () {
    ['student' => $student, 'academicYear' => $academicYear] = createFeeEnvironment();

    $invoice = createInvoice($student, $academicYear->id, 1000.00);
    $user = User::factory()->create(['school_id' => $student->school_id]);

    Payment::create(['invoice_id' => $invoice->id, 'amount' => 400.00, 'payment_method' => Payment::METHOD_CASH, 'status' => Payment::STATUS_COMPLETED, 'recorded_by' => $user->id]);
    Payment::create(['invoice_id' => $invoice->id, 'amount' => 100.00, 'payment_method' => Payment::METHOD_CASH, 'status' => Payment::STATUS_PENDING, 'recorded_by' => $user->id]);
    Payment::create(['invoice_id' => $invoice->id, 'amount' => 50.00, 'payment_method' => Payment::METHOD_BANK_TRANSFER, 'status' => Payment::STATUS_FAILED, 'recorded_by' => $user->id]);

    expect((float) $invoice->amountPaid())->toBe(400.00)
        ->and((float) $invoice->balanceDue())->toBe(600.00);
});

test('invoice balance due is zero when fully paid', function () {
    ['student' => $student, 'academicYear' => $academicYear] = createFeeEnvironment();

    $invoice = createInvoice($student, $academicYear->id, 500.00);
    $user = User::factory()->create(['school_id' => $student->school_id]);

    Payment::create(['invoice_id' => $invoice->id, 'amount' => 500.00, 'payment_method' => Payment::METHOD_CASH, 'status' => Payment::STATUS_COMPLETED, 'recorded_by' => $user->id]);

    expect((float) $invoice->balanceDue())->toBe(0.00);
});

test('recalculate status marks invoice paid when fully paid', function () {
    ['student' => $student, 'academicYear' => $academicYear] = createFeeEnvironment();

    $invoice = createInvoice($student, $academicYear->id, 500.00);
    $user = User::factory()->create(['school_id' => $student->school_id]);

    Payment::create(['invoice_id' => $invoice->id, 'amount' => 500.00, 'payment_method' => Payment::METHOD_CASH, 'status' => Payment::STATUS_COMPLETED, 'recorded_by' => $user->id]);

    $invoice->recalculateStatus();

    expect($invoice->fresh()->status)->toBe(Invoice::STATUS_PAID);
});

test('recalculate status marks invoice partial when partially paid', function () {
    ['student' => $student, 'academicYear' => $academicYear] = createFeeEnvironment();

    $invoice = createInvoice($student, $academicYear->id, 1000.00);
    $user = User::factory()->create(['school_id' => $student->school_id]);

    Payment::create(['invoice_id' => $invoice->id, 'amount' => 300.00, 'payment_method' => Payment::METHOD_CASH, 'status' => Payment::STATUS_COMPLETED, 'recorded_by' => $user->id]);

    $invoice->recalculateStatus();

    expect($invoice->fresh()->status)->toBe(Invoice::STATUS_PARTIAL);
});

test('recalculate status marks invoice overdue when nothing paid and due date passed', function () {
    ['student' => $student, 'academicYear' => $academicYear] = createFeeEnvironment();

    $invoice = createInvoice($student, $academicYear->id, 1000.00, now()->subDay()->toDateString());

    $invoice->recalculateStatus();

    expect($invoice->fresh()->status)->toBe(Invoice::STATUS_OVERDUE);
});

test('recalculate status keeps invoice unpaid when nothing paid and due date in future', function () {
    ['student' => $student, 'academicYear' => $academicYear] = createFeeEnvironment();

    $invoice = createInvoice($student, $academicYear->id, 1000.00, now()->addDay()->toDateString());

    $invoice->recalculateStatus();

    expect($invoice->fresh()->status)->toBe(Invoice::STATUS_UNPAID);
});

test('recalculate status downgrades paid invoice to unpaid after refund', function () {
    ['student' => $student, 'academicYear' => $academicYear] = createFeeEnvironment();

    $invoice = createInvoice($student, $academicYear->id, 1000.00, now()->addDay()->toDateString());
    $user = User::factory()->create(['school_id' => $student->school_id]);

    Payment::create(['invoice_id' => $invoice->id, 'amount' => 1000.00, 'payment_method' => Payment::METHOD_CASH, 'status' => Payment::STATUS_COMPLETED, 'recorded_by' => $user->id]);

    $invoice->recalculateStatus();
    expect($invoice->fresh()->status)->toBe(Invoice::STATUS_PAID);

    $invoice->payments()->first()->update(['status' => Payment::STATUS_REFUNDED]);

    $invoice->recalculateStatus();

    expect($invoice->fresh()->status)->toBe(Invoice::STATUS_UNPAID);
});

test('invoice items belong to an invoice and can be ad-hoc', function () {
    ['student' => $student, 'academicYear' => $academicYear, 'structure' => $structure] = createFeeEnvironment();

    $invoice = createInvoice($student, $academicYear->id, 1100.00);

    InvoiceItem::create(['invoice_id' => $invoice->id, 'fee_structure_id' => $structure->id, 'description' => 'Tuition', 'amount' => 1000.00]);
    InvoiceItem::create(['invoice_id' => $invoice->id, 'fee_structure_id' => null, 'description' => 'Late fee fine', 'amount' => 100.00]);

    expect($invoice->items()->count())->toBe(2)
        ->and($invoice->items()->whereNull('fee_structure_id')->first()->description)->toBe('Late fee fine');
});
