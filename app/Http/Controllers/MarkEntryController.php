<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesAcademicYear;
use App\Http\Requests\StoreMarksRequest;
use App\Models\Exam;
use App\Models\ExamSubject;
use App\Models\Mark;
use App\Models\Section;
use App\Models\Student;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MarkEntryController extends Controller
{
    use ResolvesAcademicYear;

    public function index(): Response
    {
        $this->authorize('viewAny', Mark::class);

        $user = auth()->user();
        $schoolId = $user->school_id;
        $academicYearId = $this->selectedAcademicYearId($schoolId);

        $sections = $this->visibleSections($user, $academicYearId);

        $sectionId = request()->integer('section_id');
        $selectedSection = $sectionId ? $sections->firstWhere('id', $sectionId) : $sections->first();

        $exams = collect();
        $selectedExam = null;
        $examSubjects = collect();
        $selectedExamSubject = null;
        $canEnter = false;
        $students = collect();

        if ($selectedSection) {
            $exams = Exam::where('school_id', $schoolId)
                ->where('academic_year_id', $academicYearId)
                ->where('class_id', $selectedSection->class_id)
                ->orderBy('start_date', 'desc')
                ->orderBy('id', 'desc')
                ->get(['id', 'name']);

            $examId = request()->integer('exam_id');
            $selectedExam = $examId ? $exams->firstWhere('id', $examId) : $exams->first();

            if ($selectedExam) {
                $examSubjects = ExamSubject::with('subject:id,name,code')
                    ->where('exam_id', $selectedExam->id)
                    ->orderBy('exam_date')
                    ->orderBy('id')
                    ->get();

                $examSubjectId = request()->integer('exam_subject_id');
                $selectedExamSubject = $examSubjectId ? $examSubjects->firstWhere('id', $examSubjectId) : $examSubjects->first();
            }

            if ($selectedExamSubject) {
                $canEnter = $user->can('enter-marks', [$selectedSection, $selectedExamSubject]);

                $students = Student::where('school_id', $schoolId)
                    ->where('section_id', $selectedSection->id)
                    ->where('status', 'active')
                    ->orderBy('name')
                    ->get(['id', 'name', 'admission_number'])
                    ->map(function (Student $student) use ($selectedExamSubject) {
                        $mark = Mark::where('exam_subject_id', $selectedExamSubject->id)
                            ->where('student_id', $student->id)
                            ->first();

                        return [
                            'id' => $student->id,
                            'name' => $student->name,
                            'admission_number' => $student->admission_number,
                            'marks_obtained' => $mark?->marks_obtained,
                            'remarks' => $mark?->remarks,
                        ];
                    });
            }
        }

        return Inertia::render('mark-entry/Index', [
            'academicYears' => $this->academicYears($schoolId),
            'selectedYearId' => $academicYearId,
            'selectedYearIsCurrent' => $this->selectedYearIsCurrent($schoolId, $academicYearId),
            'sections' => $sections->map(fn (Section $section) => [
                'id' => $section->id,
                'name' => $section->name,
                'class' => $section->class->name,
            ])->values(),
            'selectedSectionId' => $selectedSection?->id,
            'exams' => $exams->values(),
            'selectedExamId' => $selectedExam?->id,
            'examSubjects' => $examSubjects->map(fn (ExamSubject $examSubject) => [
                'id' => $examSubject->id,
                'full_marks' => $examSubject->full_marks,
                'pass_marks' => $examSubject->pass_marks,
                'subject' => $examSubject->subject->name,
                'code' => $examSubject->subject->code,
            ])->values(),
            'selectedExamSubjectId' => $selectedExamSubject?->id,
            'canEnter' => $canEnter,
            'students' => $students->values(),
            'isAdmin' => $user->hasAnyRole(['super-admin', 'admin']),
        ]);
    }

    public function store(StoreMarksRequest $request): RedirectResponse
    {
        $examSubject = ExamSubject::findOrFail($request->exam_subject_id);
        $section = Section::findOrFail($request->section_id);

        $this->authorize('enter-marks', [$section, $examSubject]);

        DB::transaction(function () use ($request, $examSubject) {
            foreach ($request->records as $record) {
                $mark = Mark::where('exam_subject_id', $examSubject->id)
                    ->where('student_id', $record['student_id'])
                    ->first();

                if ($mark) {
                    $mark->update([
                        'marks_obtained' => $record['marks_obtained'],
                        'entered_by' => $request->user()->id,
                        'remarks' => $record['remarks'] ?? null,
                    ]);
                } else {
                    Mark::create([
                        'exam_subject_id' => $examSubject->id,
                        'student_id' => $record['student_id'],
                        'marks_obtained' => $record['marks_obtained'],
                        'entered_by' => $request->user()->id,
                        'remarks' => $record['remarks'] ?? null,
                    ]);
                }
            }
        });

        return back()->with('success', 'Marks saved.');
    }

    private function visibleSections(object $user, ?int $academicYearId)
    {
        if ($user->hasAnyRole(['super-admin', 'admin'])) {
            return Section::with('class')
                ->whereHas('class', fn (Builder $q) => $q
                    ->where('school_id', $user->school_id)
                    ->where('academic_year_id', $academicYearId))
                ->orderBy('name')
                ->get();
        }

        $staff = $user->staff()->first();

        if (! $staff) {
            return collect();
        }

        return $staff->assignedSections($academicYearId)
            ->with('class')
            ->orderBy('name')
            ->get();
    }
}
