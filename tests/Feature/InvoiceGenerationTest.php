<?php

use App\Jobs\GenerateInvoicesJob;
use App\Models\AcademicYear;
use App\Models\FeeCategory;
use App\Models\FeeStructure;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\Queue;
use Spatie\Permission\Models\Role;

function createInvoiceGenerationEnvironment(): array
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

    $tuition = FeeCategory::create(['school_id' => $school->id, 'name' => 'Tuition']);
    $library = FeeCategory::create(['school_id' => $school->id, 'name' => 'Library']);

    $tuitionStructure = FeeStructure::create([
        'school_id' => $school->id,
        'academic_year_id' => $academicYear->id,
        'class_id' => $class->id,
        'fee_category_id' => $tuition->id,
        'amount' => 2500.00,
        'frequency' => FeeStructure::FREQUENCY_MONTHLY,
    ]);
    $libraryStructure = FeeStructure::create([
        'school_id' => $school->id,
        'academic_year_id' => $academicYear->id,
        'class_id' => $class->id,
        'fee_category_id' => $library->id,
        'amount' => 300.00,
        'frequency' => FeeStructure::FREQUENCY_ANNUAL,
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
        'student' => $student,
        'tuitionStructure' => $tuitionStructure,
        'libraryStructure' => $libraryStructure,
    ];
}

beforeEach(function () {
    Role::create(['name' => 'super-admin', 'guard_name' => 'web']);
    Role::create(['name' => 'admin', 'guard_name' => 'web']);
    Role::create(['name' => 'teacher', 'guard_name' => 'web']);
    Role::create(['name' => 'student', 'guard_name' => 'web']);
    Role::create(['name' => 'parent', 'guard_name' => 'web']);
});

test('generate invoices job creates one invoice per active student summing fee structures', function () {
    ['school' => $school, 'academicYear' => $academicYear, 'class' => $class, 'section' => $section] = createInvoiceGenerationEnvironment();

    $student2 = Student::create([
        'school_id' => $school->id,
        'section_id' => $section->id,
        'name' => 'John Doe',
        'admission_number' => 'ADM-2026-101',
        'date_of_birth' => '2015-06-15',
        'gender' => 'male',
        'admission_date' => '2026-04-01',
        'status' => 'active',
    ]);

    (new GenerateInvoicesJob($school->id, $class->id, $academicYear->id))->handle();

    $invoices = Invoice::where('academic_year_id', $academicYear->id)->get();

    expect($invoices)->toHaveCount(2);

    $first = $invoices->firstWhere('student_id', Student::where('admission_number', 'ADM-2026-100')->value('id'));
    $second = $invoices->firstWhere('student_id', $student2->id);

    expect((float) $first->total_amount)->toBe(2800.00)
        ->and((float) $second->total_amount)->toBe(2800.00)
        ->and($first->items()->count())->toBe(2)
        ->and($first->items()->first()->description)->toBe('Tuition')
        ->and($first->status)->toBe(Invoice::STATUS_UNPAID)
        ->and($first->invoice_number)->not->toBeNull()
        ->and($first->invoice_number)->not->toBe($second->invoice_number);
});

test('generate invoices job skips students who already have an invoice for the period', function () {
    ['school' => $school, 'academicYear' => $academicYear, 'class' => $class, 'student' => $student] = createInvoiceGenerationEnvironment();

    (new GenerateInvoicesJob($school->id, $class->id, $academicYear->id))->handle();
    (new GenerateInvoicesJob($school->id, $class->id, $academicYear->id))->handle();

    expect(Invoice::where('academic_year_id', $academicYear->id)->count())->toBe(1)
        ->and($student->invoices()->count())->toBe(1);
});

test('generate invoices job skips inactive students', function () {
    ['school' => $school, 'academicYear' => $academicYear, 'class' => $class, 'section' => $section] = createInvoiceGenerationEnvironment();

    Student::create([
        'school_id' => $school->id,
        'section_id' => $section->id,
        'name' => 'Inactive Kid',
        'admission_number' => 'ADM-2026-101',
        'date_of_birth' => '2015-06-15',
        'gender' => 'male',
        'admission_date' => '2026-04-01',
        'status' => 'inactive',
    ]);

    (new GenerateInvoicesJob($school->id, $class->id, $academicYear->id))->handle();

    expect(Invoice::where('academic_year_id', $academicYear->id)->count())->toBe(1);
});

test('generate invoices job does nothing when class has no fee structures', function () {
    ['school' => $school, 'academicYear' => $academicYear, 'class' => $class] = createInvoiceGenerationEnvironment();

    $emptyClass = SchoolClass::create([
        'school_id' => $school->id,
        'academic_year_id' => $academicYear->id,
        'name' => 'Grade 9',
    ]);
    Section::create(['class_id' => $emptyClass->id, 'name' => 'Section A', 'capacity' => 30]);

    (new GenerateInvoicesJob($school->id, $emptyClass->id, $academicYear->id))->handle();

    expect(Invoice::count())->toBe(0);
});

test('generate invoices job creates items tied to fee structures plus no orphans', function () {
    ['school' => $school, 'academicYear' => $academicYear, 'class' => $class] = createInvoiceGenerationEnvironment();

    (new GenerateInvoicesJob($school->id, $class->id, $academicYear->id))->handle();

    $invoice = Invoice::where('academic_year_id', $academicYear->id)->first();

    expect($invoice->items()->whereNull('fee_structure_id')->count())->toBe(0)
        ->and($invoice->items()->whereNotNull('fee_structure_id')->count())->toBe(2)
        ->and((float) InvoiceItem::where('invoice_id', $invoice->id)->sum('amount'))->toBe((float) $invoice->total_amount);
});

test('admin can view the generate invoices page', function () {
    ['school' => $school, 'class' => $class] = createInvoiceGenerationEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('invoices.generate'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('classes', fn ($data) => collect($data)->contains(fn ($c) => $c['id'] === $class->id && $c['student_count'] === 1)));
});

test('teacher cannot access the generate invoices page', function () {
    ['school' => $school] = createInvoiceGenerationEnvironment();

    $teacher = User::factory()->create(['school_id' => $school->id])->assignRole('teacher');

    $this->actingAs($teacher)
        ->get(route('invoices.generate'))
        ->assertForbidden();
});

test('admin generating invoices dispatches the queued job', function () {
    ['school' => $school, 'academicYear' => $academicYear, 'class' => $class] = createInvoiceGenerationEnvironment();

    Queue::fake();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('invoices.generate.store'), ['class_id' => $class->id, 'year_id' => $academicYear->id])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    Queue::assertPushed(GenerateInvoicesJob::class);
});

test('generate invoices requires a valid class', function () {
    ['school' => $school, 'academicYear' => $academicYear] = createInvoiceGenerationEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('invoices.generate.store'), ['year_id' => $academicYear->id])
        ->assertSessionHasErrors('class_id');
});
