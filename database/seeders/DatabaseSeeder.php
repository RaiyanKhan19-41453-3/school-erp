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
            'name' => 'Dhaka Ideal School & College',
            'address' => '12/A, Mirpur Road, Dhanmondi, Dhaka-1205',
            'phone' => '+880-2-87145678',
            'email' => 'info@dhaka-ideal.test',
        ]);

        $academicYear = AcademicYear::create([
            'school_id' => $school->id,
            'name' => '2025-2026',
            'start_date' => '2025-01-01',
            'end_date' => '2025-12-31',
            'is_current' => true,
        ]);

        $classes = [];
        $classNames = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];
        foreach ($classNames as $className) {
            $classes[] = SchoolClass::create([
                'school_id' => $school->id,
                'academic_year_id' => $academicYear->id,
                'name' => $className,
            ]);
        }

        $sections = [];
        foreach ($classes as $class) {
            $sections[] = Section::create(['class_id' => $class->id, 'name' => 'Section A', 'capacity' => 40]);
            $sections[] = Section::create(['class_id' => $class->id, 'name' => 'Section B', 'capacity' => 40]);
        }

        $this->call(RoleSeeder::class);

        $admin = User::factory()->create([
            'name' => 'Mohammad Rafiqul Islam',
            'email' => 'admin@school-erp.test',
            'password' => bcrypt('password'),
            'school_id' => $school->id,
        ]);
        $admin->assignRole('super-admin');

        $teacherDefinitions = [
            ['name' => 'Fatema Begum', 'email' => 'fatema@school-erp.test'],
            ['name' => 'Abdul Karim Chowdhury', 'email' => 'karim@school-erp.test'],
            ['name' => 'Nasreen Akhter', 'email' => 'nasreen@school-erp.test'],
            ['name' => 'Md. Kamal Hossain', 'email' => 'kamal@school-erp.test'],
            ['name' => 'Rashida Parveen', 'email' => 'rashida@school-erp.test'],
            ['name' => 'Shahjalal Mia', 'email' => 'shahjalal@school-erp.test'],
            ['name' => 'Anwara Khatun', 'email' => 'anwara@school-erp.test'],
            ['name' => 'Jahangir Alam', 'email' => 'jahangir@school-erp.test'],
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
                'joining_date' => Carbon::create(2024, rand(1, 6), rand(1, 28))->format('Y-m-d'),
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
        $occupations = ['Business', 'Doctor', 'Engineer', 'Government Officer', 'Teacher', 'Lawyer', 'Banker', 'Farmer', 'Private Service', 'Homemaker'];
        $guardianNames = [
            'Abdul Hamid', 'Kamruzzaman', 'Mizanur Rahman', 'Shafiqul Islam', 'Anisur Rahman',
            'Abdur Rashid', 'Mokhlesur Rahman', 'Nazrul Islam', 'Abul Kalam', 'Abdus Sattar',
            'Bashir Ahmed', 'Fazlur Rahman', 'Golam Mostafa', 'Hashem Ali', 'Ishtiaq Ahmed',
            'Jamal Hossain', 'Kazi Abdul', 'Lutfur Rahman', 'Monirul Islam', 'Nurul Haque',
            'Obaidul Quader', 'Qamrul Islam', 'Ruhul Amin', 'Sohel Rana', 'Toufik Ahmed',
            'Umar Faruque', 'Wahidul Haque', 'Yasin Mia', 'Zahurul Haque', 'Zillur Rahman',
        ];

        for ($i = 0; $i < 30; $i++) {
            $guardianPool[] = Guardian::create([
                'name' => $guardianNames[$i],
                'phone' => '+880-1'.rand(7, 9).'-'.rand(10000000, 99999999),
                'email' => fake()->unique()->safeEmail(),
                'occupation' => $occupations[$i % count($occupations)],
            ]);
        }

        $demoGuardian = Guardian::create([
            'name' => 'Abdul Hamid',
            'phone' => '+880-1712345678',
            'email' => 'guardian@example.test',
            'occupation' => 'Business',
        ]);

        $parentUser = User::factory()->create([
            'name' => 'Abdul Hamid',
            'email' => 'parent@school-erp.test',
            'password' => bcrypt('password'),
            'school_id' => $school->id,
        ]);
        $parentUser->assignRole('parent');
        $demoGuardian->update(['user_id' => $parentUser->id]);

        $maleNames = [
            'Tanvir Hasan', 'Imran Hossain', 'Rafiq Uddin', 'Jamal Mia', 'Karim Sarker',
            'Alamgir Kabir', 'Hossain Ali', 'Rahman Sheikh', 'Ahmed Siddiqui', 'Islam Khan',
            'Rakibul Hasan', 'Mominul Haque', 'Shakib Al', 'Mushfiqur Rahim', 'Tamim Iqbal',
            'Mahmudullah Riyad', 'Shakib Hasan', 'Nasir Hossain', 'Mashrafe Mortaza', 'Sabbir Rahman',
            'Soumya Sarkar', 'Liton Das', 'Anamul Haque', 'Mithun Ali', 'Rony Talukdar',
            'Nurul Hasan Sohan', 'Mosaddek Hossain', 'Ariful Haque', 'Rubel Hossain', 'Mustafizur Rahman',
            'Taskin Ahmed', 'Shafiul Islam', 'Al-Amin Hossain', 'Subashis Roy', 'Abu Jayed',
            'Ebadot Hossain', 'Khaled Ahmed', 'Shoriful Islam', 'Yasir Ali', 'Najmul Hossain',
            'Shamim Hossain', 'Afif Hossain', 'Mahedi Hasan', 'Afif Hossain', 'Nurul Hasan',
            'Yushar Ali', 'Jaker Ali', 'Mahmudul Hasan', 'Amite Hossain', 'Saif Hassan',
        ];

        $femaleNames = [
            'Fatema Khatun', 'Nasrin Akhter', 'Shirin Begum', 'Razia Sultana', 'Salma Khatun',
            'Rosy Akter', 'Farida Begum', 'Monira Khatun', 'Jahanara Begum', 'Anwara Khatun',
            'Hamida Khatun', 'Rabeya Khatun', 'Momtaz Begum', 'Shahana Parveen', 'Laila Khatun',
            'Ruma Khatun', 'Nargis Akter', 'Reshma Begum', 'Sumaiya Khatun', 'Roksana Khatun',
            'Hasina Begum', 'Khaleda Zia', 'Sheikh Hasina', 'Kamrun Nahar', 'Fazilatun Nessa',
            'Begum Rokeya', 'Begum Sufia', 'Begum Bodrunnessa', 'Begum Hamida', 'Begum Mahfuza',
            'Nusrat Jahan', 'Taslima Nasrin', 'Arundhati Devi', 'Sufia Kamal', 'Begum Khaleda',
            'Shahela Khatun', 'Rokia Khatun', 'Nasima Khatun', 'Salma Khatun', 'Halima Khatun',
            'Amena Khatun', 'Zulekha Khatun', 'Rahima Khatun', 'Jamila Khatun', 'Ayesha Khatun',
            'Noorjahan Khatun', 'Shaharbanu', 'Jesminara', 'Tahsina', 'Musammat',
        ];

        $students = [];
        for ($i = 0; $i < 48; $i++) {
            $gradeIndex = intdiv($i, 10) % 5;
            $section = $sections[($i % count($sections)) % 10];
            $gender = $i % 2 === 0 ? 'male' : 'female';
            $name = $i % 2 === 0 ? $maleNames[$i % count($maleNames)] : $femaleNames[$i % count($femaleNames)];

            $dobYear = 2018 - $gradeIndex;
            $students[] = Student::create([
                'school_id' => $school->id,
                'section_id' => $section->id,
                'name' => $name,
                'admission_number' => 'ADM-2025-'.str_pad((string) ($i + 1), 3, '0', STR_PAD_LEFT),
                'date_of_birth' => Carbon::create($dobYear, rand(1, 12), rand(1, 28))->format('Y-m-d'),
                'gender' => $gender,
                'admission_date' => Carbon::create(2025, rand(1, 3), rand(1, 28))->format('Y-m-d'),
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
            'name' => 'Tanvir Hasan',
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
            ['name' => 'Tuition Fee', 'amount' => 5000.00, 'frequency' => FeeStructure::FREQUENCY_MONTHLY],
            ['name' => 'Session Fee', 'amount' => 2000.00, 'frequency' => FeeStructure::FREQUENCY_ANNUAL],
            ['name' => 'Library Fee', 'amount' => 500.00, 'frequency' => FeeStructure::FREQUENCY_ANNUAL],
            ['name' => 'Lab Fee', 'amount' => 800.00, 'frequency' => FeeStructure::FREQUENCY_MONTHLY],
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
                        0 => 5000.00,
                        1 => 2000.00,
                        2 => 500.00,
                        default => 800.00,
                    },
                    'frequency' => $category->name === 'Session Fee' ? FeeStructure::FREQUENCY_ANNUAL : ($category->name === 'Library Fee' ? FeeStructure::FREQUENCY_ANNUAL : FeeStructure::FREQUENCY_MONTHLY),
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
                'invoice_number' => 'INV-2025-'.str_pad((string) (count(Invoice::all()) + 1), 5, '0', STR_PAD_LEFT),
                'period' => $academicYear->name,
                'due_date' => '2025-06-10',
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
                    'amount' => 5000.00,
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
            ['name' => 'Bangla', 'code' => 'BAN'],
            ['name' => 'General Science', 'code' => 'SCI'],
            ['name' => 'Social Studies', 'code' => 'SOC'],
            ['name' => 'Islam & Moral Education', 'code' => 'IME'],
            ['name' => 'Information & Communication Technology', 'code' => 'ICT'],
            ['name' => 'Physical Education', 'code' => 'PE'],
            ['name' => 'Art & Drawing', 'code' => 'ART'],
            ['name' => 'Bangladesh & Global Studies', 'code' => 'BGS'],
        ])->mapWithKeys(fn (array $subject) => [
            $subject['name'] => Subject::create([
                'school_id' => $school->id,
                'name' => $subject['name'],
                'code' => $subject['code'],
            ]),
        ]);

        $lowerPrimary = ['Mathematics', 'English', 'Bangla', 'Art & Drawing', 'Physical Education', 'Islam & Moral Education'];
        $upperPrimary = ['Mathematics', 'English', 'Bangla', 'General Science', 'Social Studies', 'Information & Communication Technology', 'Art & Drawing', 'Physical Education'];

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
            ['label' => 'A+', 'min' => 90, 'max' => 100, 'point' => 5.0, 'remarks' => 'Outstanding'],
            ['label' => 'A', 'min' => 80, 'max' => 89.99, 'point' => 4.0, 'remarks' => 'Excellent'],
            ['label' => 'A-', 'min' => 70, 'max' => 79.99, 'point' => 3.5, 'remarks' => 'Very Good'],
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
            ['label' => 'Distinction', 'min' => 85, 'max' => 100, 'point' => 5.0, 'remarks' => 'Distinction'],
            ['label' => 'First Class', 'min' => 60, 'max' => 84.99, 'point' => 4.0, 'remarks' => 'First Class'],
            ['label' => 'Second Class', 'min' => 50, 'max' => 59.99, 'point' => 3.0, 'remarks' => 'Second Class'],
            ['label' => 'Pass', 'min' => 40, 'max' => 49.99, 'point' => 2.0, 'remarks' => 'Pass'],
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
            '1st Term Examination',
            '2nd Term Examination',
            'Final Examination',
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
                    'start_date' => Carbon::create(2025, [3, 6, 10][$examIndex], rand(1, 28))->format('Y-m-d'),
                    'end_date' => Carbon::create(2025, [3, 6, 10][$examIndex], rand(3, 30))->format('Y-m-d'),
                ]);

                foreach ($assignedSubjects as $subjectIndex => $subject) {
                    $fullMarks = $isLower ? 50 : 100;
                    $examSubject = ExamSubject::create([
                        'exam_id' => $exam->id,
                        'subject_id' => $subject->id,
                        'full_marks' => $fullMarks,
                        'pass_marks' => $isLower ? 20 : 40,
                        'exam_date' => Carbon::create(2025, [3, 6, 10][$examIndex], rand(1, 28))->format('Y-m-d'),
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
