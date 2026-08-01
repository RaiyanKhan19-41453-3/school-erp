<?php

use App\Models\AcademicYear;
use App\Models\FeeCategory;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Payment;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use Spatie\Permission\Models\Role;

function createInvoicePaymentEnvironment(): array
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

    $invoice = Invoice::create([
        'student_id' => $student->id,
        'academic_year_id' => $academicYear->id,
        'invoice_number' => 'INV-2026-00001',
        'period' => '2025-2026',
        'due_date' => '2026-05-10',
        'total_amount' => 1000.00,
        'status' => Invoice::STATUS_UNPAID,
    ]);

    InvoiceItem::create(['invoice_id' => $invoice->id, 'fee_structure_id' => null, 'description' => 'Tuition', 'amount' => 1000.00]);

    return ['school' => $school, 'academicYear' => $academicYear, 'class' => $class, 'section' => $section, 'student' => $student, 'invoice' => $invoice, 'category' => $category];
}

beforeEach(function () {
    Role::create(['name' => 'super-admin', 'guard_name' => 'web']);
    Role::create(['name' => 'admin', 'guard_name' => 'web']);
    Role::create(['name' => 'teacher', 'guard_name' => 'web']);
    Role::create(['name' => 'student', 'guard_name' => 'web']);
    Role::create(['name' => 'parent', 'guard_name' => 'web']);
});

test('admin can view the invoices index', function () {
    ['school' => $school, 'invoice' => $invoice] = createInvoicePaymentEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('invoices.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('invoices.data', fn ($data) => count($data) === 1 && $data[0]['invoice_number'] === 'INV-2026-00001'));
});

test('admin can filter invoices by class and status', function () {
    ['school' => $school, 'class' => $class, 'invoice' => $invoice] = createInvoicePaymentEnvironment();

    $otherClass = SchoolClass::create([
        'school_id' => $school->id,
        'academic_year_id' => $class->academic_year_id,
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
    $otherInvoice = Invoice::create([
        'student_id' => $otherStudent->id,
        'academic_year_id' => $class->academic_year_id,
        'invoice_number' => 'INV-2026-00002',
        'period' => '2025-2026',
        'due_date' => '2026-05-10',
        'total_amount' => 500.00,
        'status' => Invoice::STATUS_PAID,
    ]);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('invoices.index', ['class_id' => $class->id, 'status' => 'unpaid']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('filters.class_id', $class->id)
            ->where('filters.status', 'unpaid')
            ->where('invoices.data', fn ($data) => count($data) === 1 && $data[0]['id'] === $invoice->id)
            ->where('invoices.data', fn ($data) => collect($data)->pluck('id')->doesntContain($otherInvoice->id)));
});

test('admin can search invoices by student name', function () {
    ['school' => $school, 'invoice' => $invoice] = createInvoicePaymentEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('invoices.index', ['search' => 'Jane']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('invoices.data', fn ($data) => count($data) === 1 && $data[0]['id'] === $invoice->id));
});

test('teacher cannot view the invoices index', function () {
    ['school' => $school] = createInvoicePaymentEnvironment();

    $teacher = User::factory()->create(['school_id' => $school->id])->assignRole('teacher');

    $this->actingAs($teacher)
        ->get(route('invoices.index'))
        ->assertForbidden();
});

test('admin can view an invoice detail page', function () {
    ['school' => $school, 'invoice' => $invoice] = createInvoicePaymentEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('invoices.show', $invoice))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('invoice.id', $invoice->id)
            ->where('balanceDue', '1000.00')
            ->where('amountPaid', '0.00'));
});

test('admin can record a payment and status becomes partial', function () {
    ['school' => $school, 'invoice' => $invoice] = createInvoicePaymentEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('invoices.payments.store', $invoice), [
            'amount' => 400.00,
            'payment_method' => Payment::METHOD_CASH,
            'remarks' => 'First instalment',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $payment = $invoice->payments()->first();

    expect($payment)->not->toBeNull()
        ->and((float) $payment->amount)->toBe(400.00)
        ->and($payment->payment_method)->toBe(Payment::METHOD_CASH)
        ->and($payment->status)->toBe(Payment::STATUS_COMPLETED)
        ->and($payment->recorded_by)->toBe($admin->id)
        ->and($invoice->fresh()->status)->toBe(Invoice::STATUS_PARTIAL);
});

test('admin can fully pay an invoice and status becomes paid', function () {
    ['school' => $school, 'invoice' => $invoice] = createInvoicePaymentEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('invoices.payments.store', $invoice), [
            'amount' => 1000.00,
            'payment_method' => Payment::METHOD_BANK_TRANSFER,
        ])
        ->assertSessionHasNoErrors();

    expect($invoice->fresh()->status)->toBe(Invoice::STATUS_PAID);
});

test('payment amount cannot exceed the balance due', function () {
    ['school' => $school, 'invoice' => $invoice] = createInvoicePaymentEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('invoices.payments.store', $invoice), [
            'amount' => 1500.00,
            'payment_method' => Payment::METHOD_CASH,
        ])
        ->assertSessionHasErrors('amount');

    expect($invoice->payments()->count())->toBe(0);
});

test('payment amount must be greater than zero', function () {
    ['school' => $school, 'invoice' => $invoice] = createInvoicePaymentEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('invoices.payments.store', $invoice), [
            'amount' => 0,
            'payment_method' => Payment::METHOD_CASH,
        ])
        ->assertSessionHasErrors('amount');
});

test('payment requires a valid method', function () {
    ['school' => $school, 'invoice' => $invoice] = createInvoicePaymentEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('invoices.payments.store', $invoice), [
            'amount' => 100.00,
            'payment_method' => 'credit_card',
        ])
        ->assertSessionHasErrors('payment_method');
});

test('teacher cannot record a payment', function () {
    ['school' => $school, 'invoice' => $invoice] = createInvoicePaymentEnvironment();

    $teacher = User::factory()->create(['school_id' => $school->id])->assignRole('teacher');

    $this->actingAs($teacher)
        ->post(route('invoices.payments.store', $invoice), [
            'amount' => 100.00,
            'payment_method' => Payment::METHOD_CASH,
        ])
        ->assertForbidden();
});

test('recorded payment respects provided paid_at date', function () {
    ['school' => $school, 'invoice' => $invoice] = createInvoicePaymentEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('invoices.payments.store', $invoice), [
            'amount' => 100.00,
            'payment_method' => Payment::METHOD_CHEQUE,
            'paid_at' => '2026-05-01',
        ])
        ->assertSessionHasNoErrors();

    expect($invoice->payments()->first()->paid_at->toDateString())->toBe('2026-05-01');
});
