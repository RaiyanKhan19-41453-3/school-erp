<?php

use App\Models\AcademicYear;
use App\Models\Attendance;
use App\Models\Guardian;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Staff;
use App\Models\Student;
use App\Models\User;
use Spatie\Permission\Models\Role;

function createDashboardEnvironment(): array
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
        'name' => 'Class 1',
    ]);
    $section = Section::create(['class_id' => $class->id, 'name' => 'Section A', 'capacity' => 30]);

    $teacherUser = User::factory()->create(['school_id' => $school->id])->assignRole('teacher');
    $staff = Staff::create([
        'user_id' => $teacherUser->id,
        'school_id' => $school->id,
        'employee_id' => 'EMP-200',
        'designation' => 'Teacher',
        'joining_date' => '2025-09-01',
    ]);
    $staff->sections()->attach($section->id, ['academic_year_id' => $academicYear->id, 'is_class_teacher' => true]);

    $student = Student::create([
        'school_id' => $school->id,
        'section_id' => $section->id,
        'name' => 'Test Student',
        'admission_number' => 'ADM-2026-200',
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
        'staff' => $staff,
        'student' => $student,
    ];
}

beforeEach(function () {
    foreach (['super-admin', 'admin', 'teacher', 'student', 'parent'] as $role) {
        Role::create(['name' => $role, 'guard_name' => 'web']);
    }
});

test('guests are redirected to the login page', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

test('authenticated users can visit the dashboard', function () {
    $this->actingAs($user = User::factory()->create());

    $this->get('/dashboard')->assertOk();
});

test('admin sees school statistics on the dashboard', function () {
    ['school' => $school, 'class' => $class, 'section' => $section, 'student' => $student] = createDashboardEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('stats', 4)
            ->where('stats.0.label', 'Students')
            ->where('stats.0.value', 1)
            ->where('stats.1.label', 'Teachers')
            ->where('stats.1.value', 1)
            ->has('studentsPerClass')
            ->has('attendanceTrend')
            ->has('feeSummary')
            ->has('recentPayments')
            ->has('recentAttendance'));
});

test('teacher sees their sections and attendance on the dashboard', function () {
    ['school' => $school, 'section' => $section, 'staff' => $staff, 'student' => $student] = createDashboardEnvironment();

    Attendance::create([
        'student_id' => $student->id,
        'section_id' => $section->id,
        'date' => now()->toDateString(),
        'status' => Attendance::STATUS_PRESENT,
        'marked_by' => $staff->user_id,
    ]);

    $this->actingAs($staff->user)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('stats', 3)
            ->where('stats.0.label', 'My Sections')
            ->where('stats.0.value', 1)
            ->has('sections', 1)
            ->where('sections.0.id', $section->id)
            ->where('attendancePie.present', 1)
            ->has('markDistribution'));
});

test('teacher without staff record gets empty dashboard data', function () {
    ['school' => $school] = createDashboardEnvironment();

    $teacher = User::factory()->create(['school_id' => $school->id])->assignRole('teacher');

    $this->actingAs($teacher)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('stats', [])
            ->where('attendancePie', [])
            ->where('markDistribution', []));
});

test('student sees their attendance breakdown and outstanding balance', function () {
    ['school' => $school, 'section' => $section, 'student' => $student, 'academicYear' => $academicYear, 'staff' => $staff] = createDashboardEnvironment();

    Attendance::create([
        'student_id' => $student->id,
        'section_id' => $section->id,
        'date' => now()->toDateString(),
        'status' => Attendance::STATUS_PRESENT,
        'marked_by' => $staff->user_id,
    ]);
    Attendance::create([
        'student_id' => $student->id,
        'section_id' => $section->id,
        'date' => now()->subDay()->toDateString(),
        'status' => Attendance::STATUS_ABSENT,
        'marked_by' => $staff->user_id,
    ]);

    $invoice = Invoice::create([
        'student_id' => $student->id,
        'academic_year_id' => $academicYear->id,
        'invoice_number' => 'INV-TEST-1',
        'period' => $academicYear->name,
        'due_date' => '2026-05-10',
        'total_amount' => 5000.00,
        'status' => Invoice::STATUS_UNPAID,
    ]);
    InvoiceItem::create([
        'invoice_id' => $invoice->id,
        'description' => 'Tuition',
        'amount' => 5000.00,
    ]);

    $studentUser = User::factory()->create(['school_id' => $school->id])->assignRole('student');
    $student->update(['user_id' => $studentUser->id]);

    $this->actingAs($studentUser)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('stats', 3)
            ->where('attendancePie.present', 1)
            ->where('attendancePie.absent', 1)
            ->where('stats.2.label', 'Outstanding Balance'));
});

test('parent sees their child attendance on the dashboard', function () {
    ['school' => $school, 'section' => $section, 'student' => $student, 'staff' => $staff] = createDashboardEnvironment();

    Attendance::create([
        'student_id' => $student->id,
        'section_id' => $section->id,
        'date' => now()->toDateString(),
        'status' => Attendance::STATUS_LATE,
        'marked_by' => $staff->user_id,
    ]);

    $guardian = Guardian::create([
        'name' => 'Test Guardian',
        'phone' => '12345',
        'email' => 'guardian@example.test',
        'occupation' => 'Business',
    ]);
    $student->guardians()->attach($guardian->id, ['relationship' => 'father', 'is_primary' => true]);

    $parentUser = User::factory()->create(['school_id' => $school->id])->assignRole('parent');
    $guardian->update(['user_id' => $parentUser->id]);

    $this->actingAs($parentUser)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('stats', 3)
            ->where('attendancePie.late', 1));
});
