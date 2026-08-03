<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesAcademicYear;
use App\Http\Requests\StoreExamRequest;
use App\Http\Requests\StoreExamSubjectsRequest;
use App\Http\Requests\UpdateExamRequest;
use App\Models\Exam;
use App\Models\GradingScale;
use App\Models\SchoolClass;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ExamController extends Controller
{
    use ResolvesAcademicYear;

    public function index(): Response
    {
        $this->authorize('viewAny', Exam::class);

        $schoolId = auth()->user()->school_id;
        $academicYearId = $this->selectedAcademicYearId($schoolId);

        $perPage = request()->integer('per_page', 10);
        $page = request()->integer('page', 1);
        $sort = request()->string('sort', 'start_date')->value();
        $direction = request()->string('direction', 'desc')->value();
        $search = request()->string('search')->value();
        $classId = request()->integer('class_id');

        $allowedSorts = ['name', 'start_date', 'created_at'];
        if (! in_array($sort, $allowedSorts)) {
            $sort = 'start_date';
        }
        $direction = in_array(strtolower($direction), ['asc', 'desc']) ? $direction : 'desc';

        $query = Exam::where('school_id', $schoolId)
            ->with([
                'class:id,name',
                'gradingScale:id,name',
                'class.subjects:id,name,code',
                'examSubjects' => fn ($q) => $q->withCount('marks')->with('subject:id,name,code'),
            ])
            ->withCount('examSubjects');

        if ($academicYearId) {
            $query->where('academic_year_id', $academicYearId);
        }

        if ($search) {
            $query->where(function (Builder $q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereHas('class', fn (Builder $c) => $c->where('name', 'like', "%{$search}%"));
            });
        }

        if ($classId) {
            $query->where('class_id', $classId);
        }

        $exams = $query->orderBy($sort, $direction)
            ->paginate($perPage, ['*'], 'page', $page)
            ->through(fn (Exam $exam) => $exam->append('class_subjects'));

        return Inertia::render('exams/Index', [
            'exams' => $exams,
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
                'per_page' => $perPage,
                'class_id' => $classId,
                'year_id' => $academicYearId,
            ],
            'academicYears' => $this->academicYears($schoolId),
            'selectedYearIsCurrent' => $this->selectedYearIsCurrent($schoolId, $academicYearId),
            'classes' => SchoolClass::where('school_id', $schoolId)
                ->where('academic_year_id', $academicYearId)
                ->orderBy('name')
                ->get(['id', 'name']),
            'gradingScales' => GradingScale::where('school_id', $schoolId)
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    public function store(StoreExamRequest $request): RedirectResponse
    {
        Exam::create([
            'school_id' => $request->user()->school_id,
            'academic_year_id' => $request->academic_year_id,
            'class_id' => $request->class_id,
            'name' => $request->name,
            'grading_scale_id' => $request->grading_scale_id,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
        ]);

        return back()->with('success', 'Exam created successfully.');
    }

    public function update(UpdateExamRequest $request, Exam $exam): RedirectResponse
    {
        $exam->update([
            'class_id' => $request->class_id,
            'name' => $request->name,
            'grading_scale_id' => $request->grading_scale_id,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
        ]);

        return back()->with('success', 'Exam updated successfully.');
    }

    public function destroy(Exam $exam): RedirectResponse
    {
        $this->authorize('delete', $exam);

        $exam->delete();

        return back()->with('success', 'Exam deleted successfully.');
    }

    public function storeSubjects(StoreExamSubjectsRequest $request, Exam $exam): RedirectResponse
    {
        DB::transaction(function () use ($exam, $request) {
            $submitted = collect($request->subjects)->keyBy('subject_id');

            foreach ($submitted as $subjectId => $subject) {
                $exam->examSubjects()->updateOrCreate(
                    ['subject_id' => $subjectId],
                    [
                        'full_marks' => $subject['full_marks'],
                        'pass_marks' => $subject['pass_marks'],
                        'exam_date' => $subject['exam_date'] ?? null,
                    ],
                );
            }

            $exam->examSubjects()
                ->whereNotIn('subject_id', $submitted->keys())
                ->delete();
        });

        return back()->with('success', 'Exam subjects saved successfully.');
    }
}
