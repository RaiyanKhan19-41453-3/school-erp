<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Attendance;
use App\Models\FeeCategory;
use App\Models\FeeStructure;
use App\Models\Guardian;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Payment;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Staff;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $school = School::create([
            'name' => 'Demo International School',
            'address' => '123 Education Lane, Learning City',
            'phone' => '+1-555-0100',
            'email' => 'info@demo-school.test',
        ]);

        $academicYear = AcademicYear::create([
            'school_id' => $school->id,
            'name' => '2025-2026',
            'start_date' => '2025-09-01',
            'end_date' => '2026-06-30',
            'is_current' => true,
        ]);

        $classes = [];
        for ($i = 1; $i <= 5; $i++) {
            $classes[] = SchoolClass::create([
                'school_id' => $school->id,
                'academic_year_id' => $academicYear->id,
                'name' => "Grade {$i}",
            ]);
        }

        $sections = [];
        foreach ($classes as $class) {
            $sections[] = Section::create(['class_id' => $class->id, 'name' => 'Section A', 'capacity' => 30]);
            $sections[] = Section::create(['class_id' => $class->id, 'name' => 'Section B', 'capacity' => 30]);
        }

        $this->call(RoleSeeder::class);

        $admin = User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'admin@school-erp.test',
            'password' => bcrypt('password'),
            'school_id' => $school->id,
        ]);
        $admin->assignRole('super-admin');

        $teacherDefinitions = [
            ['name' => 'Test Teacher', 'email' => 'teacher@school-erp.test'],
            ['name' => 'Sarah Johnson', 'email' => 'sarah@school-erp.test'],
            ['name' => 'Aarav Mehta', 'email' => 'aarav@school-erp.test'],
            ['name' => 'Diya Iyer', 'email' => 'diya@school-erp.test'],
            ['name' => 'Kabir Nair', 'email' => 'kabir@school-erp.test'],
            ['name' => 'Ananya Rao', 'email' => 'ananya@school-erp.test'],
            ['name' => 'Vihaan Gupta', 'email' => 'vihaan@school-erp.test'],
            ['name' => 'Ishita Kulkarni', 'email' => 'ishita@school-erp.test'],
        ];

        $teachers = [];
        foreach ($teacherDefinitions as $index => $definition) {
            $user = User::factory()->create([
                'name' => $definition['name'],
                'email' => $definition['email'],
                'password' => bcrypt('password'),
                'school_id' => $school->id,
            ]);
            $user->assignRole('teacher');

            $teachers[] = Staff::create([
                'user_id' => $user->id,
                'school_id' => $school->id,
                'employee_id' => 'EMP-'.str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT),
                'designation' => 'Teacher',
                'joining_date' => Carbon::create(2025, rand(6, 9), rand(1, 28))->format('Y-m-d'),
            ]);
        }

        $sectionTeachers = [];
        foreach ($sections as $index => $section) {
            $primaryTeacher = $teachers[$index % count($teachers)];
            $secondaryTeacher = $teachers[($index + 3) % count($teachers)];

            $primaryTeacher->sections()->attach($section->id, [
                'academic_year_id' => $academicYear->id,
                'is_class_teacher' => $index % 2 === 0,
            ]);
            $secondaryTeacher->sections()->attach($section->id, [
                'academic_year_id' => $academicYear->id,
                'is_class_teacher' => false,
            ]);

            $sectionTeachers[$section->id] = [
                $primaryTeacher->user_id,
                $secondaryTeacher->user_id,
            ];
        }

        $guardianPool = [];
        $occupations = ['Business Owner', 'Engineer', 'Doctor', 'Teacher', 'Lawyer', 'Civil Servant', 'Homemaker', 'Farmer', 'Software Developer', 'Accountant'];

        for ($i = 0; $i < 30; $i++) {
            $guardianPool[] = Guardian::create([
                'name' => fake()->name(),
                'phone' => fake()->unique()->numerify('+91-####-###-###'),
                'email' => fake()->unique()->safeEmail(),
                'occupation' => $occupations[$i % count($occupations)],
            ]);
        }

        $demoGuardian = Guardian::create([
            'name' => 'Demo Guardian',
            'phone' => '+1-555-0199',
            'email' => 'guardian@example.test',
            'occupation' => 'Business Owner',
        ]);

        $parentUser = User::factory()->create([
            'name' => 'Demo Guardian',
            'email' => 'parent@school-erp.test',
            'password' => bcrypt('password'),
            'school_id' => $school->id,
        ]);
        $parentUser->assignRole('parent');
        $demoGuardian->update(['user_id' => $parentUser->id]);

        $maleNames = ['Arjun Sharma', 'Rahul Verma', 'Rohan Gupta', 'Ayaan Khan', 'Advait Joshi', 'Shaurya Singh', 'Kabir Malhotra', 'Ved Patel', 'Ishaan Reddy', 'Manav Iyer', 'Yash Desai', 'Neil Kapoor'];
        $femaleNames = ['Priya Patel', 'Ananya Singh', 'Diya Sharma', 'Saanvi Gupta', 'Aarohi Nair', 'Meera Reddy', 'Ishita Verma', 'Navya Iyer', 'Aditi Joshi', 'Riya Kapoor', 'Tanvi Desai', 'Kiara Malhotra'];

        $students = [];
        for ($i = 0; $i < 48; $i++) {
            $gradeIndex = intdiv($i, 10) % 5;
            $section = $sections[($i % count($sections)) % 10];
            $gender = $i % 2 === 0 ? 'male' : 'female';
            $name = $i % 2 === 0 ? $maleNames[$i % count($maleNames)] : $femaleNames[$i % count($femaleNames)];

            $dobYear = 2020 - $gradeIndex;
            $students[] = Student::create([
                'school_id' => $school->id,
                'section_id' => $section->id,
                'name' => $name,
                'admission_number' => 'ADM-2026-'.str_pad((string) ($i + 1), 3, '0', STR_PAD_LEFT),
                'date_of_birth' => Carbon::create($dobYear, rand(1, 12), rand(1, 28))->format('Y-m-d'),
                'gender' => $gender,
                'admission_date' => Carbon::create(2026, rand(1, 7), rand(1, 28))->format('Y-m-d'),
                'status' => random_int(1, 100) <= 90 ? 'active' : 'inactive',
            ]);
        }

        foreach ($students as $index => $student) {
            if ($index === 0) {
                continue;
            }

            $primaryGuardian = $guardianPool[$student->id % count($guardianPool)];
            $student->guardians()->attach($primaryGuardian->id, [
                'relationship' => fake()->randomElement(['father', 'mother', 'guardian']),
                'is_primary' => true,
            ]);

            if ($student->id % 3 === 0) {
                $secondaryGuardian = $guardianPool[($student->id + 7) % count($guardianPool)];
                $student->guardians()->attach($secondaryGuardian->id, [
                    'relationship' => fake()->randomElement(['father', 'mother', 'guardian']),
                    'is_primary' => false,
                ]);
            }
        }

        $students[0]->guardians()->attach($demoGuardian->id, [
            'relationship' => 'father',
            'is_primary' => true,
        ]);

        $studentUser = User::factory()->create([
            'name' => 'Arjun Sharma',
            'email' => 'student@school-erp.test',
            'password' => bcrypt('password'),
            'school_id' => $school->id,
        ]);
        $studentUser->assignRole('student');
        $students[0]->update(['user_id' => $studentUser->id]);

        $dates = [];
        $dateCursor = Carbon::today();
        while (count($dates) < 12) {
            if (! $dateCursor->isWeekend()) {
                $dates[] = $dateCursor->copy();
            }
            $dateCursor->subDay();
        }

        foreach ($dates as $attendanceDate) {
            foreach ($students as $student) {
                $roll = random_int(1, 100);
                $status = match (true) {
                    $roll <= 72 => Attendance::STATUS_PRESENT,
                    $roll <= 84 => Attendance::STATUS_ABSENT,
                    $roll <= 93 => Attendance::STATUS_LATE,
                    default => Attendance::STATUS_LEAVE,
                };

                Attendance::create([
                    'student_id' => $student->id,
                    'section_id' => $student->section_id,
                    'date' => $attendanceDate->format('Y-m-d'),
                    'status' => $status,
                    'marked_by' => $sectionTeachers[$student->section_id][array_rand($sectionTeachers[$student->section_id])],
                    'remarks' => random_int(1, 100) <= 15 ? fake()->sentence(4) : null,
                ]);
            }
        }

        $this->seedFees($school, $academicYear, $classes, $students);
    }

    private function seedFees(School $school, AcademicYear $academicYear, array $classes, array $students): void
    {
        $categories = collect([
            ['name' => 'Tuition', 'amount' => 2500.00, 'frequency' => FeeStructure::FREQUENCY_MONTHLY],
            ['name' => 'Transport', 'amount' => 800.00, 'frequency' => FeeStructure::FREQUENCY_MONTHLY],
            ['name' => 'Library', 'amount' => 300.00, 'frequency' => FeeStructure::FREQUENCY_ANNUAL],
            ['name' => 'Admission', 'amount' => 5000.00, 'frequency' => FeeStructure::FREQUENCY_ONE_TIME],
        ])->map(function (array $definition) use ($school) {
            return FeeCategory::create([
                'school_id' => $school->id,
                'name' => $definition['name'],
            ]);
        });

        foreach ($classes as $class) {
            foreach ($categories as $index => $category) {
                FeeStructure::create([
                    'school_id' => $school->id,
                    'academic_year_id' => $academicYear->id,
                    'class_id' => $class->id,
                    'fee_category_id' => $category->id,
                    'amount' => match ($index) {
                        0 => 2500.00,
                        1 => 800.00,
                        2 => 300.00,
                        default => 5000.00,
                    },
                    'frequency' => $category->name === 'Admission' ? FeeStructure::FREQUENCY_ONE_TIME : ($category->name === 'Library' ? FeeStructure::FREQUENCY_ANNUAL : FeeStructure::FREQUENCY_MONTHLY),
                    'due_day' => 10,
                ]);
            }
        }

        $admin = User::where('email', 'admin@school-erp.test')->first();

        foreach ($students as $student) {
            if ($student->status !== 'active') {
                continue;
            }

            $feeStructures = FeeStructure::where('school_id', $school->id)
                ->where('academic_year_id', $academicYear->id)
                ->where('class_id', $student->section->class_id)
                ->get();

            if ($feeStructures->isEmpty()) {
                continue;
            }

            $total = $feeStructures->sum(fn (FeeStructure $structure) => (float) $structure->amount);

            $invoice = Invoice::create([
                'student_id' => $student->id,
                'academic_year_id' => $academicYear->id,
                'invoice_number' => 'INV-2026-'.str_pad((string) (count(Invoice::all()) + 1), 5, '0', STR_PAD_LEFT),
                'period' => $academicYear->name,
                'due_date' => '2026-05-10',
                'total_amount' => $total,
                'status' => Invoice::STATUS_UNPAID,
            ]);

            foreach ($feeStructures as $structure) {
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'fee_structure_id' => $structure->id,
                    'description' => $structure->feeCategory->name,
                    'amount' => $structure->amount,
                ]);
            }

            if ($student->id % 4 === 0) {
                Payment::create([
                    'invoice_id' => $invoice->id,
                    'amount' => 2500.00,
                    'payment_method' => Payment::METHOD_CASH,
                    'status' => Payment::STATUS_COMPLETED,
                    'paid_at' => now(),
                    'recorded_by' => $admin?->id,
                ]);
                $invoice->recalculateStatus();
            }
        }
    }
}
