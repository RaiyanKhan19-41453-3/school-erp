<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Attendance;
use App\Models\Exam;
use App\Models\ExamSubject;
use App\Models\FeeCategory;
use App\Models\FeeStructure;
use App\Models\GradeBand;
use App\Models\GradingScale;
use App\Models\Guardian;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Mark;
use App\Models\Payment;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Staff;
use App\Models\Student;
use App\Models\Subject;
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

        $this->seedExamsAndGrading($school, $academicYear, $classes, $students);
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

    private function seedExamsAndGrading(School $school, AcademicYear $academicYear, array $classes, array $students): void
    {
        $subjectPool = collect([
            ['name' => 'Mathematics', 'code' => 'MATH'],
            ['name' => 'English', 'code' => 'ENG'],
            ['name' => 'Science', 'code' => 'SCI'],
            ['name' => 'Social Studies', 'code' => 'SOC'],
            ['name' => 'Hindi', 'code' => 'HIN'],
            ['name' => 'Computer Science', 'code' => 'CS'],
            ['name' => 'Art & Craft', 'code' => 'ART'],
            ['name' => 'Physical Education', 'code' => 'PE'],
            ['name' => 'Music', 'code' => 'MUS'],
            ['name' => 'Environmental Studies', 'code' => 'EVS'],
        ])->mapWithKeys(fn (array $subject) => [
            $subject['name'] => Subject::create([
                'school_id' => $school->id,
                'name' => $subject['name'],
                'code' => $subject['code'],
            ]),
        ]);

        $lowerPrimary = ['Mathematics', 'English', 'Environmental Studies', 'Art & Craft', 'Physical Education', 'Music'];
        $upperPrimary = ['Mathematics', 'English', 'Science', 'Social Studies', 'Hindi', 'Computer Science', 'Art & Craft', 'Physical Education'];

        foreach ($classes as $index => $class) {
            $isLower = $index < 2;
            $assignedNames = $isLower ? $lowerPrimary : $upperPrimary;

            $class->subjects()->attach(
                collect($assignedNames)->map(fn (string $name) => $subjectPool[$name]->id)->all(),
            );
        }

        $standardScale = GradingScale::create(['school_id' => $school->id, 'name' => 'Standard (A-F)']);
        $honorsScale = GradingScale::create(['school_id' => $school->id, 'name' => 'Honors (Percentage)']);

        $standardBands = [
            ['label' => 'A+', 'min' => 90, 'max' => 100, 'point' => 4.0, 'remarks' => 'Outstanding'],
            ['label' => 'A', 'min' => 80, 'max' => 89.99, 'point' => 3.7, 'remarks' => 'Excellent'],
            ['label' => 'B+', 'min' => 70, 'max' => 79.99, 'point' => 3.3, 'remarks' => 'Very Good'],
            ['label' => 'B', 'min' => 60, 'max' => 69.99, 'point' => 3.0, 'remarks' => 'Good'],
            ['label' => 'C', 'min' => 50, 'max' => 59.99, 'point' => 2.0, 'remarks' => 'Satisfactory'],
            ['label' => 'D', 'min' => 40, 'max' => 49.99, 'point' => 1.0, 'remarks' => 'Needs Improvement'],
            ['label' => 'F', 'min' => 0, 'max' => 39.99, 'point' => 0.0, 'remarks' => 'Fail'],
        ];
        foreach ($standardBands as $band) {
            GradeBand::create([
                'grading_scale_id' => $standardScale->id,
                'label' => $band['label'],
                'min_percentage' => $band['min'],
                'max_percentage' => $band['max'],
                'grade_point' => $band['point'],
                'remarks' => $band['remarks'],
            ]);
        }

        $honorsBands = [
            ['label' => 'Distinction', 'min' => 85, 'max' => 100, 'point' => 4.0, 'remarks' => 'Distinction'],
            ['label' => 'First Class', 'min' => 60, 'max' => 84.99, 'point' => 3.0, 'remarks' => 'First Class'],
            ['label' => 'Second Class', 'min' => 50, 'max' => 59.99, 'point' => 2.0, 'remarks' => 'Second Class'],
            ['label' => 'Pass', 'min' => 40, 'max' => 49.99, 'point' => 1.0, 'remarks' => 'Pass'],
            ['label' => 'Fail', 'min' => 0, 'max' => 39.99, 'point' => 0.0, 'remarks' => 'Fail'],
        ];
        foreach ($honorsBands as $band) {
            GradeBand::create([
                'grading_scale_id' => $honorsScale->id,
                'label' => $band['label'],
                'min_percentage' => $band['min'],
                'max_percentage' => $band['max'],
                'grade_point' => $band['point'],
                'remarks' => $band['remarks'],
            ]);
        }

        $examNames = [
            'Term 1 Mid-Terms',
            'Term 1 Finals',
            'Term 2 Mid-Terms',
        ];

        $scales = [$standardScale, $honorsScale, $standardScale];

        $examSubjectsByClass = [];
        foreach ($classes as $classIndex => $class) {
            $assignedSubjects = $class->subjects->values();
            $isLower = $classIndex < 2;

            foreach ($examNames as $examIndex => $examName) {
                $exam = Exam::create([
                    'school_id' => $school->id,
                    'academic_year_id' => $academicYear->id,
                    'class_id' => $class->id,
                    'name' => $examName.' ('.$class->name.')',
                    'grading_scale_id' => $scales[$examIndex]->id,
                    'start_date' => Carbon::create(2025, [10, 12, 2][$examIndex], rand(1, 28))->format('Y-m-d'),
                    'end_date' => Carbon::create(2025, [10, 12, 2][$examIndex], rand(3, 30))->format('Y-m-d'),
                ]);

                foreach ($assignedSubjects as $subjectIndex => $subject) {
                    $fullMarks = $isLower ? 50 : 100;
                    $examSubject = ExamSubject::create([
                        'exam_id' => $exam->id,
                        'subject_id' => $subject->id,
                        'full_marks' => $fullMarks,
                        'pass_marks' => $isLower ? 20 : 40,
                        'exam_date' => Carbon::create(2025, [10, 12, 2][$examIndex], rand(1, 28))->format('Y-m-d'),
                    ]);

                    $examSubjectsByClass[$class->id][] = $examSubject;
                }
            }
        }

        $teachers = Staff::where('school_id', $school->id)->get();

        $activeStudents = collect($students)->filter(fn (Student $student) => $student->status === 'active');

        foreach ($examSubjectsByClass as $classId => $classExamSubjects) {
            $classStudents = $activeStudents->filter(fn (Student $student) => $student->section->class_id === $classId);

            foreach ($classExamSubjects as $examSubject) {
                $markingTeacher = $teachers->random();

                foreach ($classStudents as $student) {
                    $fullMarks = (float) $examSubject->full_marks;
                    $passMarks = (float) $examSubject->pass_marks;

                    $ability = random_int(1, 100);
                    $percentage = match (true) {
                        $ability <= 15 => random_int(25, 45),
                        $ability <= 45 => random_int(45, 65),
                        $ability <= 75 => random_int(65, 80),
                        default => random_int(80, 97),
                    };

                    $marksObtained = round($fullMarks * $percentage / 100, 2);

                    Mark::create([
                        'exam_subject_id' => $examSubject->id,
                        'student_id' => $student->id,
                        'marks_obtained' => $marksObtained,
                        'entered_by' => $markingTeacher->user_id,
                        'remarks' => random_int(1, 100) <= 20 ? fake()->sentence(4) : null,
                    ]);
                }
            }
        }
    }
}
