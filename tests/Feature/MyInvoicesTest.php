<?php

use App\Models\AcademicYear;
use App\Models\Guardian;
use App\Models\Invoice;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use Spatie\Permission\Models\Role;

function createMyInvoicesEnvironment(): array
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

    $otherStudent = Student::create([
        'school_id' => $school->id,
        'section_id' => $section->id,
        'name' => 'John Doe',
        'admission_number' => 'ADM-2026-101',
        'date_of_birth' => '2015-06-15',
        'gender' => 'male',
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

    $otherInvoice = Invoice::create([
        'student_id' => $otherStudent->id,
        'academic_year_id' => $academicYear->id,
        'invoice_number' => 'INV-2026-00002',
        'period' => '2025-2026',
        'due_date' => '2026-05-10',
        'total_amount' => 800.00,
        'status' => Invoice::STATUS_PAID,
    ]);

    return [
        'school' => $school,
        'academicYear' => $academicYear,
        'class' => $class,
        'section' => $section,
        'student' => $student,
        'otherStudent' => $otherStudent,
        'invoice' => $invoice,
        'otherInvoice' => $otherInvoice,
    ];
}

beforeEach(function () {
    Role::create(['name' => 'super-admin', 'guard_name' => 'web']);
    Role::create(['name' => 'admin', 'guard_name' => 'web']);
    Role::create(['name' => 'teacher', 'guard_name' => 'web']);
    Role::create(['name' => 'student', 'guard_name' => 'web']);
    Role::create(['name' => 'parent', 'guard_name' => 'web']);
});

test('student sees only their own invoices on my invoices page', function () {
    ['school' => $school, 'student' => $student, 'invoice' => $invoice] = createMyInvoicesEnvironment();

    $studentUser = User::factory()->create(['school_id' => $school->id])->assignRole('student');
    $student->update(['user_id' => $studentUser->id]);

    $this->actingAs($studentUser)
        ->get(route('invoices.my'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('invoices', fn ($data) => count($data) === 1 && $data[0]['id'] === $invoice->id));
});

test('student can view their own invoice detail but cannot record payments', function () {
    ['school' => $school, 'student' => $student, 'invoice' => $invoice] = createMyInvoicesEnvironment();

    $studentUser = User::factory()->create(['school_id' => $school->id])->assignRole('student');
    $student->update(['user_id' => $studentUser->id]);

    $this->actingAs($studentUser)
        ->get(route('invoices.show', $invoice))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('invoice.id', $invoice->id)
            ->where('canRecordPayment', false));

    $this->actingAs($studentUser)
        ->post(route('invoices.payments.store', $invoice), [
            'amount' => 100.00,
            'payment_method' => 'cash',
        ])
        ->assertForbidden();
});

test('student cannot view another students invoice', function () {
    ['school' => $school, 'student' => $student, 'otherInvoice' => $otherInvoice] = createMyInvoicesEnvironment();

    $studentUser = User::factory()->create(['school_id' => $school->id])->assignRole('student');
    $student->update(['user_id' => $studentUser->id]);

    $this->actingAs($studentUser)
        ->get(route('invoices.show', $otherInvoice))
        ->assertForbidden();
});

test('parent sees invoices for all their children', function () {
    ['school' => $school, 'student' => $student, 'otherStudent' => $otherStudent, 'invoice' => $invoice, 'otherInvoice' => $otherInvoice] = createMyInvoicesEnvironment();

    $parentUser = User::factory()->create(['school_id' => $school->id])->assignRole('parent');
    $guardian = Guardian::create([
        'user_id' => $parentUser->id,
        'name' => 'Mr Smith',
        'phone' => '1234567890',
    ]);
    $guardian->students()->attach($student->id, ['relationship' => 'father', 'is_primary' => true]);
    $guardian->students()->attach($otherStudent->id, ['relationship' => 'mother', 'is_primary' => false]);

    $this->actingAs($parentUser)
        ->get(route('invoices.my'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('invoices', fn ($data) => count($data) === 2
                && collect($data)->pluck('id')->contains($invoice->id)
                && collect($data)->pluck('id')->contains($otherInvoice->id)));
});

test('parent can view their childs invoice detail but cannot record payments', function () {
    ['school' => $school, 'student' => $student, 'invoice' => $invoice] = createMyInvoicesEnvironment();

    $parentUser = User::factory()->create(['school_id' => $school->id])->assignRole('parent');
    $guardian = Guardian::create([
        'user_id' => $parentUser->id,
        'name' => 'Mr Smith',
        'phone' => '1234567890',
    ]);
    $guardian->students()->attach($student->id, ['relationship' => 'father', 'is_primary' => true]);

    $this->actingAs($parentUser)
        ->get(route('invoices.show', $invoice))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('invoice.id', $invoice->id)
            ->where('canRecordPayment', false));
});

test('parent cannot view an unrelated students invoice', function () {
    ['school' => $school, 'student' => $student, 'otherInvoice' => $otherInvoice] = createMyInvoicesEnvironment();

    $parentUser = User::factory()->create(['school_id' => $school->id])->assignRole('parent');
    $guardian = Guardian::create([
        'user_id' => $parentUser->id,
        'name' => 'Mr Smith',
        'phone' => '1234567890',
    ]);
    $guardian->students()->attach($student->id, ['relationship' => 'father', 'is_primary' => true]);

    $this->actingAs($parentUser)
        ->get(route('invoices.show', $otherInvoice))
        ->assertForbidden();
});

test('admin still has canRecordPayment enabled on invoice detail', function () {
    ['school' => $school, 'invoice' => $invoice] = createMyInvoicesEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('invoices.show', $invoice))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('invoice.id', $invoice->id)
            ->where('canRecordPayment', true));
});

test('teacher cannot access my invoices page', function () {
    ['school' => $school] = createMyInvoicesEnvironment();

    $teacher = User::factory()->create(['school_id' => $school->id])->assignRole('teacher');

    $this->actingAs($teacher)
        ->get(route('invoices.my'))
        ->assertForbidden();
});
