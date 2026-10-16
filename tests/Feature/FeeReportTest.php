<?php

use App\Models\AcademicYear;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Carbon;
use Spatie\Permission\Models\Role;

/**
 * @return array<string, mixed>
 */
function createFeeReportEnvironment(): array
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

    $paidStudent = Student::create([
        'school_id' => $school->id,
        'section_id' => $section->id,
        'name' => 'Paid Polly',
        'admission_number' => 'ADM-2026-100',
        'date_of_birth' => '2015-06-15',
        'gender' => 'female',
        'admission_date' => '2026-04-01',
        'status' => 'active',
    ]);

    $dueStudent = Student::create([
        'school_id' => $school->id,
        'section_id' => $section->id,
        'name' => 'Due Danny',
        'admission_number' => 'ADM-2026-101',
        'date_of_birth' => '2015-07-20',
        'gender' => 'male',
        'admission_date' => '2026-04-01',
        'status' => 'active',
    ]);

    $paidInvoice = Invoice::create([
        'student_id' => $paidStudent->id,
        'academic_year_id' => $academicYear->id,
        'invoice_number' => 'INV-2026-00001',
        'period' => '2025-2026',
        'due_date' => '2026-05-10',
        'total_amount' => 1000.00,
        'status' => Invoice::STATUS_PAID,
    ]);

    Payment::create([
        'invoice_id' => $paidInvoice->id,
        'amount' => 1000.00,
        'payment_method' => Payment::METHOD_CASH,
        'status' => Payment::STATUS_COMPLETED,
        'paid_at' => Carbon::parse('2026-10-05 10:00:00'),
    ]);

    $dueInvoice = Invoice::create([
        'student_id' => $dueStudent->id,
        'academic_year_id' => $academicYear->id,
        'invoice_number' => 'INV-2026-00002',
        'period' => '2025-2026',
        'due_date' => '2026-05-10',
        'total_amount' => 800.00,
        'status' => Invoice::STATUS_PARTIAL,
    ]);

    Payment::create([
        'invoice_id' => $dueInvoice->id,
        'amount' => 300.00,
        'payment_method' => Payment::METHOD_BANK_TRANSFER,
        'status' => Payment::STATUS_COMPLETED,
        'paid_at' => Carbon::parse('2026-10-06 11:30:00'),
    ]);

    return [
        'school' => $school,
        'academicYear' => $academicYear,
        'class' => $class,
        'section' => $section,
        'paidStudent' => $paidStudent,
        'dueStudent' => $dueStudent,
        'paidInvoice' => $paidInvoice,
        'dueInvoice' => $dueInvoice,
    ];
}

/**
 * @param  array<string, mixed>  $environment
 */
function createFeeReportAdmin(array $environment): User
{
    return User::factory()->create(['school_id' => $environment['school']->id])->assignRole('admin');
}

beforeEach(function () {
    Role::create(['name' => 'super-admin', 'guard_name' => 'web']);
    Role::create(['name' => 'admin', 'guard_name' => 'web']);
    Role::create(['name' => 'teacher', 'guard_name' => 'web']);
    Role::create(['name' => 'student', 'guard_name' => 'web']);
    Role::create(['name' => 'parent', 'guard_name' => 'web']);
});

test('admin sees only students with outstanding balances in the dues report', function () {
    $environment = createFeeReportEnvironment();
    $admin = createFeeReportAdmin($environment);

    $this->actingAs($admin)
        ->get(route('reports.fee-dues'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('reports/fee-dues')
            ->has('dues.data', 1)
            ->where('dues.data.0.student_name', 'Due Danny')
            ->where('dues.data.0.balance', fn ($value) => (float) $value === 500.0)
            ->where('totals.students', 1)
            ->where('totals.billed', fn ($value) => (float) $value === 800.0)
            ->where('totals.paid', fn ($value) => (float) $value === 300.0)
            ->where('totals.balance', fn ($value) => (float) $value === 500.0));
});

test('dues report can be filtered by class and section', function () {
    $environment = createFeeReportEnvironment();
    $admin = createFeeReportAdmin($environment);

    $otherClass = SchoolClass::create([
        'school_id' => $environment['school']->id,
        'academic_year_id' => $environment['academicYear']->id,
        'name' => 'Grade 2',
    ]);

    $otherSection = Section::create(['class_id' => $otherClass->id, 'name' => 'Section B', 'capacity' => 25]);

    $otherStudent = Student::create([
        'school_id' => $environment['school']->id,
        'section_id' => $otherSection->id,
        'name' => 'Other Olivia',
        'admission_number' => 'ADM-2026-200',
        'date_of_birth' => '2015-08-10',
        'gender' => 'female',
        'admission_date' => '2026-04-01',
        'status' => 'active',
    ]);

    Invoice::create([
        'student_id' => $otherStudent->id,
        'academic_year_id' => $environment['academicYear']->id,
        'invoice_number' => 'INV-2026-00003',
        'period' => '2025-2026',
        'due_date' => '2026-05-10',
        'total_amount' => 500.00,
        'status' => Invoice::STATUS_UNPAID,
    ]);

    $this->actingAs($admin)
        ->get(route('reports.fee-dues', ['class_id' => $otherClass->id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('dues.data', 1)
            ->where('dues.data.0.student_name', 'Other Olivia'));

    $this->actingAs($admin)
        ->get(route('reports.fee-dues', ['class_id' => $otherClass->id, 'section_id' => $environment['section']->id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('dues.data', 0));
});

test('dues export streams a csv of outstanding students', function () {
    $environment = createFeeReportEnvironment();
    $admin = createFeeReportAdmin($environment);

    $response = $this->actingAs($admin)->get(route('reports.fee-dues.export'));

    $response->assertOk();
    $response->assertHeader('content-type', 'text/csv; charset=UTF-8');

    $csv = $response->streamedContent();

    expect($csv)
        ->toContain('Student')
        ->toContain('Due Danny')
        ->toContain('500.00')
        ->toContain('Total (1 students)')
        ->not->toContain('Paid Polly');
});

test('collection report totals payments by method within the selected range', function () {
    $environment = createFeeReportEnvironment();
    $admin = createFeeReportAdmin($environment);

    Payment::create([
        'invoice_id' => $environment['dueInvoice']->id,
        'amount' => 200.00,
        'payment_method' => Payment::METHOD_CASH,
        'status' => Payment::STATUS_COMPLETED,
        'paid_at' => Carbon::parse('2026-09-20 09:00:00'),
    ]);

    $this->actingAs($admin)
        ->get(route('reports.fee-collection', ['from_date' => '2026-10-01', 'to_date' => '2026-10-31']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('reports/fee-collection')
            ->has('payments.data', 2)
            ->where('summary.count', 2)
            ->where('summary.total', fn ($value) => (float) $value === 1300.0)
            ->where('summary.by_method', function ($methods) {
                $byMethod = collect($methods)->keyBy('method');

                return (float) $byMethod['cash']['total'] === 1000.0
                    && (float) $byMethod['bank_transfer']['total'] === 300.0;
            }));

    $this->actingAs($admin)
        ->get(route('reports.fee-collection', ['from_date' => '2026-09-01', 'to_date' => '2026-09-30']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('payments.data', 1)
            ->where('summary.total', fn ($value) => (float) $value === 200.0)
            ->where('summary.by_method', fn ($methods) => count($methods) === 1 && $methods[0]['method'] === 'cash'));
});

test('collection report can be filtered by payment method', function () {
    $environment = createFeeReportEnvironment();
    $admin = createFeeReportAdmin($environment);

    $this->actingAs($admin)
        ->get(route('reports.fee-collection', ['from_date' => '2026-10-01', 'to_date' => '2026-10-31', 'method' => 'bank_transfer']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('payments.data', 1)
            ->where('payments.data.0.payment_method', 'bank_transfer')
            ->where('summary.total', fn ($value) => (float) $value === 300.0));
});

test('collection export streams a csv of payments', function () {
    $environment = createFeeReportEnvironment();
    $admin = createFeeReportAdmin($environment);

    $response = $this->actingAs($admin)->get(route('reports.fee-collection.export', [
        'from_date' => '2026-10-01',
        'to_date' => '2026-10-31',
    ]));

    $response->assertOk();

    $csv = $response->streamedContent();

    expect($csv)
        ->toContain('Paid At')
        ->toContain('Paid Polly')
        ->toContain('Bank Transfer')
        ->toContain('300.00');
});

test('teachers and students cannot access fee reports', function () {
    $environment = createFeeReportEnvironment();

    $teacher = User::factory()->create(['school_id' => $environment['school']->id])->assignRole('teacher');
    $student = User::factory()->create(['school_id' => $environment['school']->id])->assignRole('student');

    $this->actingAs($teacher)->get(route('reports.fee-dues'))->assertForbidden();
    $this->actingAs($teacher)->get(route('reports.fee-collection'))->assertForbidden();
    $this->actingAs($teacher)->get(route('reports.fee-dues.export'))->assertForbidden();
    $this->actingAs($student)->get(route('reports.fee-collection'))->assertForbidden();
});

test('fee reports are scoped to the admin school', function () {
    $environment = createFeeReportEnvironment();
    $admin = createFeeReportAdmin($environment);

    $otherSchool = School::create(['name' => 'Other School']);

    $otherYear = AcademicYear::create([
        'school_id' => $otherSchool->id,
        'name' => '2025-2026',
        'start_date' => '2025-09-01',
        'end_date' => '2026-06-30',
        'is_current' => true,
    ]);

    $otherClass = SchoolClass::create([
        'school_id' => $otherSchool->id,
        'academic_year_id' => $otherYear->id,
        'name' => 'Grade 9',
    ]);

    $otherSection = Section::create(['class_id' => $otherClass->id, 'name' => 'Section A', 'capacity' => 20]);

    $otherStudent = Student::create([
        'school_id' => $otherSchool->id,
        'section_id' => $otherSection->id,
        'name' => 'Foreign Fiona',
        'admission_number' => 'ADM-OTHER-1',
        'date_of_birth' => '2015-01-01',
        'gender' => 'female',
        'admission_date' => '2026-04-01',
        'status' => 'active',
    ]);

    $otherInvoice = Invoice::create([
        'student_id' => $otherStudent->id,
        'academic_year_id' => $otherYear->id,
        'invoice_number' => 'INV-OTHER-00001',
        'period' => '2025-2026',
        'due_date' => '2026-05-10',
        'total_amount' => 700.00,
        'status' => Invoice::STATUS_UNPAID,
    ]);

    Payment::create([
        'invoice_id' => $otherInvoice->id,
        'amount' => 700.00,
        'payment_method' => Payment::METHOD_CASH,
        'status' => Payment::STATUS_COMPLETED,
        'paid_at' => Carbon::parse('2026-10-07 12:00:00'),
    ]);

    $this->actingAs($admin)
        ->get(route('reports.fee-dues'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('dues.data', 1)
            ->where('dues.data.0.student_name', 'Due Danny'));

    $this->actingAs($admin)
        ->get(route('reports.fee-collection', ['from_date' => '2026-10-01', 'to_date' => '2026-10-31']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('payments.data', 2)
            ->where('summary.total', fn ($value) => (float) $value === 1300.0));
});

test('fee reports survive malformed array query parameters', function () {
    $environment = createFeeReportEnvironment();
    $admin = createFeeReportAdmin($environment);

    $this->actingAs($admin)
        ->get(route('reports.fee-dues', ['search' => ['x'], 'year_id' => ['1'], 'sort' => ['x'], 'direction' => ['x'], 'class_id' => ['1']]))
        ->assertOk();

    $this->actingAs($admin)
        ->get(route('reports.fee-collection', ['from_date' => ['x'], 'to_date' => ['x'], 'method' => ['x'], 'search' => ['x']]))
        ->assertOk();

    $this->actingAs($admin)
        ->get(route('reports.fee-dues.export', ['class_id' => ['1']]))
        ->assertOk();

    $this->actingAs($admin)
        ->get(route('reports.fee-collection.export', ['from_date' => ['x']]))
        ->assertOk();
});
