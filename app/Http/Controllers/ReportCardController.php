<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesAcademicYear;
use App\Models\Exam;
use App\Models\ExamSubject;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Student;
use App\Policies\ReportCardPolicy;
use App\Services\GradeCalculator;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Builder;
use Inertia\Inertia;
use Inertia\Response;

class ReportCardController extends Controller
{
    use ResolvesAcademicYear;

    public function index(): Response
    {
        abort_unless((new ReportCardPolicy)->viewAny(auth()->user()), 403);

        $user = auth()->user();
        $schoolId = $user->school_id;
        $academicYearId = $this->selectedAcademicYearId($schoolId);

        $isStaff = $user->hasAnyRole(['super-admin', 'admin', 'teacher']);

        $classes = collect();
        $selectedClassId = null;
        $sections = collect();
        $selectedSectionId = null;
        $students = collect();
        $selectedStudentId = null;
        $studentIds = collect();

        if ($isStaff) {
            $classes = SchoolClass::where('school_id', $schoolId)
                ->where('academic_year_id', $academicYearId)
                ->orderBy('name')
                ->get(['id', 'name']);

            $classId = request()->integer('class_id');
            $selectedClass = $classId ? $classes->firstWhere('id', $classId) : null;
            $selectedClassId = $selectedClass?->id;

            if ($selectedClass) {
                $sections = Section::with('class:id,name')
                    ->where('class_id', $selectedClass->id)
                    ->orderBy('name')
                    ->get(['id', 'name', 'class_id']);

                $sectionId = request()->integer('section_id');
                $selectedSection = $sectionId ? $sections->firstWhere('id', $sectionId) : null;
                $selectedSectionId = $selectedSection?->id;

                if ($selectedSection) {
                    $students = Student::where('school_id', $schoolId)
                        ->where('section_id', $selectedSection->id)
                        ->where('status', 'active')
                        ->orderBy('name')
                        ->get(['id', 'name', 'admission_number']);

                    $studentId = request()->integer('student_id');
                    $selectedStudent = $studentId ? $students->firstWhere('id', $studentId) : null;
                    $selectedStudentId = $selectedStudent?->id;

                    $studentIds = $selectedStudent ? collect([$selectedStudent->id]) : collect();
                }
            }
        } elseif ($user->hasRole('student')) {
            $studentIds = $user->student()->pluck('students.id');
        } else {
            $studentIds = $user->guardian()->first()?->students()->pluck('students.id') ?? collect();
        }

        $exams = $studentIds->isEmpty()
            ? collect()
            : Exam::with(['class:id,name', 'gradingScale:id,name'])
                ->where('school_id', $schoolId)
                ->where('academic_year_id', $academicYearId)
                ->whereHas('examSubjects.marks', fn (Builder $m) => $m->whereIn('student_id', $studentIds))
                ->orderBy('start_date')
                ->orderBy('id')
                ->get(['id', 'name', 'class_id', 'academic_year_id']);

        return Inertia::render('report-cards/Index', [
            'academicYears' => $this->academicYears($schoolId),
            'selectedYearId' => $academicYearId,
            'isStaff' => $isStaff,
            'classes' => $classes->values(),
            'selectedClassId' => $selectedClassId,
            'sections' => $sections->values(),
            'selectedSectionId' => $selectedSectionId,
            'students' => $students->values(),
            'selectedStudentId' => $selectedStudentId,
            'exams' => $exams,
        ]);
    }

    public function show(Exam $exam, Student $student, GradeCalculator $calculator): Response
    {
        abort_unless((new ReportCardPolicy)->view(auth()->user(), $student, $exam), 403);

        $data = $this->reportCardData($exam, $student, $calculator);
        $data['canDownload'] = auth()->user()->hasAnyRole(['super-admin', 'admin', 'teacher']);

        return Inertia::render('report-cards/Show', $data);
    }

    public function pdf(Exam $exam, Student $student, GradeCalculator $calculator)
    {
        abort_unless((new ReportCardPolicy)->view(auth()->user(), $student, $exam), 403);

        $data = $this->reportCardData($exam, $student, $calculator);

        $pdf = Pdf::loadView('pdfs.report-card', $data);

        return $pdf->download("report-card-{$student->admission_number}-{$exam->id}.pdf");
    }

    private function reportCardData(Exam $exam, Student $student, GradeCalculator $calculator): array
    {
        $exam->load(['class', 'academicYear', 'gradingScale.gradeBands', 'examSubjects.subject']);

        $examSubjects = $exam->examSubjects
            ->map(function (ExamSubject $examSubject) use ($exam, $student, $calculator) {
                $mark = $examSubject->marks()
                    ->where('student_id', $student->id)
                    ->first();

                if (! $mark) {
                    return null;
                }

                $fullMarks = (float) $examSubject->full_marks;
                $obtained = (float) $mark->marks_obtained;
                $percentage = $calculator->percentage($obtained, $fullMarks);
                $grade = $calculator->gradeFor($exam, $obtained, $fullMarks);

                return [
                    'subject' => $examSubject->subject->name,
                    'code' => $examSubject->subject->code,
                    'full_marks' => $fullMarks,
                    'pass_marks' => (float) $examSubject->pass_marks,
                    'marks_obtained' => $obtained,
                    'percentage' => $percentage,
                    'grade_label' => $grade?->label,
                    'grade_point' => $grade?->grade_point,
                    'grade_remarks' => $grade?->remarks,
                    'passed' => $obtained >= (float) $examSubject->pass_marks,
                    'remarks' => $mark->remarks,
                ];
            })
            ->filter()
            ->values();

        $totalMarks = $examSubjects->sum('marks_obtained');
        $totalFull = $examSubjects->sum('full_marks');
        $overallPercentage = $calculator->percentage($totalMarks, $totalFull);
        $overallGrade = $exam->gradingScale
            ? $calculator->gradeForPercentage($exam->gradingScale, $overallPercentage)
            : null;

        return [
            'exam' => [
                'id' => $exam->id,
                'name' => $exam->name,
                'class' => $exam->class->name,
                'academic_year' => $exam->academicYear?->name,
                'grading_scale' => $exam->gradingScale?->name,
            ],
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'admission_number' => $student->admission_number,
            ],
            'subjects' => $examSubjects,
            'totals' => [
                'marks_obtained' => $totalMarks,
                'full_marks' => $totalFull,
                'percentage' => $overallPercentage,
                'grade_label' => $overallGrade?->label,
                'grade_point' => $overallGrade?->grade_point,
                'grade_remarks' => $overallGrade?->remarks,
                'passed_subjects' => $examSubjects->where('passed', true)->count(),
                'total_subjects' => $examSubjects->count(),
            ],
        ];
    }
}
