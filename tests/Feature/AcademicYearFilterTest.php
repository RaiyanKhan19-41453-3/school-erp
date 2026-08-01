<?php

use App\Models\AcademicYear;
use App\Models\FeeCategory;
use App\Models\FeeStructure;
use App\Models\Invoice;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Staff;
use App\Models\Student;
use App\Models\User;
use Spatie\Permission\Models\Role;

function createYearFilterEnvironment(): array
{
    $school = School::create(['name' => 'Test School']);
    $current = AcademicYear::create([
        'school_id' => $school->id,
        'name' => '2025-2026',
        'start_date' => '2025-09-01',
        'end_date' => '2026-06-30',
        'is_current' => true,
    ]);
    $past = AcademicYear::create([
        'school_id' => $school->id,
        'name' => '2024-2025',
        'start_date' => '2024-09-01',
        'end_date' => '2025-06-30',
        'is_current' => false,
    ]);

    $currentClass = SchoolClass::create([
        'school_id' => $school->id,
        'academic_year_id' => $current->id,
        'name' => 'Grade 1',
    ]);
    $pastClass = SchoolClass::create([
        'school_id' => $school->id,
        'academic_year_id' => $past->id,
        'name' => 'Grade 1',
    ]);

    $currentSection = Section::create(['class_id' => $currentClass->id, 'name' => 'Section A', 'capacity' => 30]);
    $pastSection = Section::create(['class_id' => $pastClass->id, 'name' => 'Section A', 'capacity' => 30]);

    return compact('school', 'current', 'past', 'currentClass', 'pastClass', 'currentSection', 'pastSection');
}

beforeEach(function () {
    Role::create(['name' => 'super-admin', 'guard_name' => 'web']);
    Role::create(['name' => 'admin', 'guard_name' => 'web']);
    Role::create(['name' => 'teacher', 'guard_name' => 'web']);
});

test('classes index defaults to the current academic year', function () {
    ['school' => $school, 'current' => $current, 'currentClass' => $currentClass, 'pastClass' => $pastClass] = createYearFilterEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('classes.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('filters.year_id', $current->id)
            ->where('classes.data', fn ($data) => collect($data)->pluck('id')->doesntContain($pastClass->id)));
});

test('classes index filters by the requested academic year', function () {
    ['school' => $school, 'past' => $past, 'currentClass' => $currentClass, 'pastClass' => $pastClass] = createYearFilterEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('classes.index', ['year_id' => $past->id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('filters.year_id', $past->id)
            ->where('classes.data', fn ($data) => collect($data)->pluck('id')->contains($pastClass->id))
            ->where('classes.data', fn ($data) => collect($data)->pluck('id')->doesntContain($currentClass->id))
            ->where('academicYears', fn ($years) => count($years) === 2));
});

test('classes index ignores a year id from another school', function () {
    ['school' => $school, 'current' => $current] = createYearFilterEnvironment();

    $otherSchool = School::create(['name' => 'Other School']);
    $otherYear = AcademicYear::create([
        'school_id' => $otherSchool->id,
        'name' => '2030-2031',
        'start_date' => '2030-09-01',
        'end_date' => '2031-06-30',
        'is_current' => true,
    ]);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('classes.index', ['year_id' => $otherYear->id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('filters.year_id', $current->id));
});

test('students index filters by academic year', function () {
    ['school' => $school, 'current' => $current, 'past' => $past, 'currentSection' => $currentSection, 'pastSection' => $pastSection] = createYearFilterEnvironment();

    Student::create(['school_id' => $school->id, 'section_id' => $currentSection->id, 'name' => 'Current Student', 'admission_number' => 'S-001', 'status' => 'active', 'date_of_birth' => '2015-01-01', 'admission_date' => '2025-09-01', 'gender' => 'male']);
    Student::create(['school_id' => $school->id, 'section_id' => $pastSection->id, 'name' => 'Past Student', 'admission_number' => 'S-002', 'status' => 'active', 'date_of_birth' => '2015-01-01', 'admission_date' => '2025-09-01', 'gender' => 'male']);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('students.index'))
        ->assertInertia(fn ($page) => $page
            ->where('students.data', fn ($data) => count($data) === 1 && $data[0]['name'] === 'Current Student'));

    $this->actingAs($admin)
        ->get(route('students.index', ['year_id' => $past->id]))
        ->assertInertia(fn ($page) => $page
            ->where('students.data', fn ($data) => count($data) === 1 && $data[0]['name'] === 'Past Student'));
});

test('fee structures index filters by academic year', function () {
    ['school' => $school, 'current' => $current, 'past' => $past, 'currentClass' => $currentClass, 'pastClass' => $pastClass] = createYearFilterEnvironment();

    $category = FeeCategory::create(['school_id' => $school->id, 'name' => 'Tuition']);

    FeeStructure::create([
        'school_id' => $school->id,
        'academic_year_id' => $current->id,
        'class_id' => $currentClass->id,
        'fee_category_id' => $category->id,
        'amount' => 2500,
        'frequency' => FeeStructure::FREQUENCY_MONTHLY,
    ]);
    FeeStructure::create([
        'school_id' => $school->id,
        'academic_year_id' => $past->id,
        'class_id' => $pastClass->id,
        'fee_category_id' => $category->id,
        'amount' => 2000,
        'frequency' => FeeStructure::FREQUENCY_MONTHLY,
    ]);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('fee-structures.index'))
        ->assertInertia(fn ($page) => $page
            ->where('feeStructures.data', fn ($data) => count($data) === 1)
            ->where('feeStructures.data.0.amount', '2500.00')
            ->where('classes', fn ($classes) => collect($classes)->pluck('id')->contains($currentClass->id)));

    $this->actingAs($admin)
        ->get(route('fee-structures.index', ['year_id' => $past->id]))
        ->assertInertia(fn ($page) => $page
            ->where('feeStructures.data', fn ($data) => count($data) === 1)
            ->where('feeStructures.data.0.amount', '2000.00')
            ->where('classes', fn ($classes) => collect($classes)->pluck('id')->contains($pastClass->id)));
});

test('invoices index filters by academic year', function () {
    ['school' => $school, 'current' => $current, 'past' => $past, 'currentSection' => $currentSection] = createYearFilterEnvironment();

    $student = Student::create(['school_id' => $school->id, 'section_id' => $currentSection->id, 'name' => 'Current Student', 'admission_number' => 'S-001', 'status' => 'active', 'date_of_birth' => '2015-01-01', 'admission_date' => '2025-09-01', 'gender' => 'male']);

    $currentInvoice = Invoice::create([
        'student_id' => $student->id,
        'academic_year_id' => $current->id,
        'invoice_number' => 'INV-2026-00001',
        'period' => $current->name,
        'due_date' => '2026-08-10',
        'total_amount' => 1000,
        'status' => Invoice::STATUS_UNPAID,
    ]);
    $pastInvoice = Invoice::create([
        'student_id' => $student->id,
        'academic_year_id' => $past->id,
        'invoice_number' => 'INV-2025-00001',
        'period' => $past->name,
        'due_date' => '2025-08-10',
        'total_amount' => 900,
        'status' => Invoice::STATUS_UNPAID,
    ]);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('invoices.index'))
        ->assertInertia(fn ($page) => $page
            ->where('invoices.data', fn ($data) => count($data) === 1 && $data[0]['invoice_number'] === $currentInvoice->invoice_number));

    $this->actingAs($admin)
        ->get(route('invoices.index', ['year_id' => $past->id]))
        ->assertInertia(fn ($page) => $page
            ->where('invoices.data', fn ($data) => count($data) === 1 && $data[0]['invoice_number'] === $pastInvoice->invoice_number));
});

test('attendance index lists sections for the selected year', function () {
    ['school' => $school, 'current' => $current, 'past' => $past, 'currentSection' => $currentSection, 'pastSection' => $pastSection] = createYearFilterEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('attendance.index'))
        ->assertInertia(fn ($page) => $page
            ->where('selectedYearId', $current->id)
            ->where('sections', fn ($sections) => count($sections) === 1 && $sections[0]['id'] === $currentSection->id));

    $this->actingAs($admin)
        ->get(route('attendance.index', ['year_id' => $past->id]))
        ->assertInertia(fn ($page) => $page
            ->where('selectedYearId', $past->id)
            ->where('sections', fn ($sections) => count($sections) === 1 && $sections[0]['id'] === $pastSection->id));
});

test('teacher assignments index filters by academic year', function () {
    ['school' => $school, 'current' => $current, 'past' => $past, 'currentSection' => $currentSection, 'pastSection' => $pastSection] = createYearFilterEnvironment();

    $teacherUser = User::factory()->create(['school_id' => $school->id])->assignRole('teacher');
    $staff = Staff::create([
        'user_id' => $teacherUser->id,
        'school_id' => $school->id,
        'employee_id' => 'EMP-001',
        'designation' => 'Teacher',
        'joining_date' => '2024-09-01',
    ]);

    $currentSection->teachers()->attach($staff->id, ['academic_year_id' => $current->id, 'is_class_teacher' => true]);
    $pastSection->teachers()->attach($staff->id, ['academic_year_id' => $past->id, 'is_class_teacher' => true]);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('teacher-assignments.index'))
        ->assertInertia(fn ($page) => $page
            ->where('sections.data', fn ($data) => count($data) === 1 && $data[0]['id'] === $currentSection->id)
            ->where('selectedYearIsCurrent', true));

    $this->actingAs($admin)
        ->get(route('teacher-assignments.index', ['year_id' => $past->id]))
        ->assertInertia(fn ($page) => $page
            ->where('sections.data', fn ($data) => count($data) === 1 && $data[0]['id'] === $pastSection->id)
            ->where('selectedYearIsCurrent', false));
});

test('generate invoices page lists classes for the selected year', function () {
    ['school' => $school, 'current' => $current, 'past' => $past, 'currentClass' => $currentClass, 'pastClass' => $pastClass, 'currentSection' => $currentSection] = createYearFilterEnvironment();

    Student::create(['school_id' => $school->id, 'section_id' => $currentSection->id, 'name' => 'Current Student', 'admission_number' => 'S-001', 'status' => 'active', 'date_of_birth' => '2015-01-01', 'admission_date' => '2025-09-01', 'gender' => 'male']);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('invoices.generate'))
        ->assertInertia(fn ($page) => $page
            ->where('selectedYearId', $current->id)
            ->where('classes', fn ($classes) => count($classes) === 1 && $classes[0]['id'] === $currentClass->id));

    $this->actingAs($admin)
        ->get(route('invoices.generate', ['year_id' => $past->id]))
        ->assertInertia(fn ($page) => $page
            ->where('selectedYearId', $past->id)
            ->where('classes', fn ($classes) => count($classes) === 1 && $classes[0]['id'] === $pastClass->id));
});
