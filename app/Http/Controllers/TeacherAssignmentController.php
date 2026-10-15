<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesAcademicYear;
use App\Http\Requests\StoreTeacherAssignmentRequest;
use App\Models\AcademicYear;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Staff;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TeacherAssignmentController extends Controller
{
    use ResolvesAcademicYear;

    public function index(): Response
    {
        $this->authorize('viewAny', Section::class);

        $schoolId = auth()->user()->school_id;
        $academicYearId = $this->selectedAcademicYearId($schoolId);

        $perPage = max(1, min(request()->integer('per_page', 10), 100));
        $page = max(1, request()->integer('page', 1));
        $sort = request()->string('sort', 'name')->value();
        $direction = request()->string('direction', 'asc')->value();
        $search = request()->string('search')->value();
        $classId = request()->integer('class_id');
        $sectionId = request()->integer('section_id');
        $teacherId = request()->integer('teacher_id');

        $allowedSorts = ['name', 'class_name', 'created_at'];
        if (! in_array($sort, $allowedSorts)) {
            $sort = 'name';
        }
        $direction = in_array(strtolower($direction), ['asc', 'desc']) ? $direction : 'asc';

        $query = Section::with([
            'class',
            'teachers' => fn ($q) => $q
                ->wherePivot('academic_year_id', $academicYearId)
                ->with('user')
                ->orderBy('staff.employee_id'),
        ])->whereHas('class', fn (Builder $q) => $q
            ->where('school_id', $schoolId)
            ->where('academic_year_id', $academicYearId));

        if ($search) {
            $query->where(function (Builder $q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereHas('class', fn (Builder $c) => $c->where('name', 'like', "%{$search}%"));
            });
        }

        if ($classId) {
            $query->where('class_id', $classId);
        }

        if ($sectionId) {
            $query->where('sections.id', $sectionId);
        }

        if ($teacherId) {
            $query->whereHas('teachers', function (Builder $q) use ($teacherId, $academicYearId) {
                $q->where('staff.id', $teacherId)
                    ->where('teacher_section.academic_year_id', $academicYearId);
            });
        }

        if ($sort === 'class_name') {
            $query->orderBy(
                Section::select('name')
                    ->from('classes')
                    ->whereColumn('classes.id', 'sections.class_id')
                    ->limit(1),
                $direction,
            );
        } else {
            $query->orderBy($sort, $direction);
        }

        $sections = $query->paginate($perPage, ['*'], 'page', $page);

        return Inertia::render('teacher-assignments/Index', [
            'sections' => $sections,
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
                'per_page' => $perPage,
                'class_id' => $classId,
                'section_id' => $sectionId,
                'teacher_id' => $teacherId,
                'year_id' => $academicYearId,
            ],
            'academicYears' => $this->academicYears($schoolId),
            'selectedYearIsCurrent' => $this->selectedYearIsCurrent($schoolId, $academicYearId),
            'staff' => Staff::with('user')
                ->where('school_id', $schoolId)
                ->orderBy('employee_id')
                ->get(['id', 'employee_id', 'designation', 'user_id']),
            'classes' => SchoolClass::where('school_id', $schoolId)
                ->where('academic_year_id', $academicYearId)
                ->with(['sections.teachers' => fn ($q) => $q
                    ->wherePivot('academic_year_id', $academicYearId)
                    ->with('user')])
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    public function store(StoreTeacherAssignmentRequest $request): RedirectResponse
    {
        $schoolId = $request->user()->school_id;
        $academicYearId = $this->currentAcademicYearId($schoolId);

        if (! $academicYearId) {
            return back()->withErrors(['section_id' => 'No active academic year. Activate one first.'])->withInput();
        }

        $section = Section::whereHas('class', fn (Builder $q) => $q->where('school_id', $schoolId))
            ->findOrFail($request->section_id);

        $staff = Staff::where('school_id', $schoolId)->findOrFail($request->staff_id);

        DB::transaction(function () use ($section, $staff, $academicYearId, $request) {
            $existing = DB::table('teacher_section')
                ->where('section_id', $section->id)
                ->where('staff_id', $staff->id)
                ->where('academic_year_id', $academicYearId)
                ->first();

            if ($existing) {
                DB::table('teacher_section')
                    ->where('id', $existing->id)
                    ->update(['is_class_teacher' => $request->boolean('is_class_teacher')]);
            } else {
                $section->teachers()->attach($staff->id, [
                    'academic_year_id' => $academicYearId,
                    'is_class_teacher' => $request->boolean('is_class_teacher'),
                ]);
            }

            if ($request->boolean('is_class_teacher')) {
                DB::table('teacher_section')
                    ->where('section_id', $section->id)
                    ->where('academic_year_id', $academicYearId)
                    ->where('staff_id', '!=', $staff->id)
                    ->update(['is_class_teacher' => false]);
            }
        });

        return back()->with('success', 'Teacher assigned to section.');
    }

    public function destroy(Section $section, Staff $staff): RedirectResponse
    {
        $this->authorize('update', $section->class);

        $schoolId = auth()->user()->school_id;

        if ($staff->school_id !== $schoolId || $section->class->school_id !== $schoolId) {
            abort(403);
        }

        $academicYearId = $this->currentAcademicYearId($schoolId);

        $section->teachers()
            ->wherePivot('academic_year_id', $academicYearId)
            ->detach($staff->id);

        return back()->with('success', 'Teacher removed from section.');
    }

    public function setClassTeacher(Section $section, Staff $staff): RedirectResponse
    {
        $this->authorize('update', $section->class);

        $schoolId = auth()->user()->school_id;
        $academicYearId = $this->currentAcademicYearId($schoolId);

        if ($staff->school_id !== $schoolId || $section->class->school_id !== $schoolId) {
            abort(403);
        }

        DB::transaction(function () use ($section, $staff, $academicYearId) {
            $exists = DB::table('teacher_section')
                ->where('section_id', $section->id)
                ->where('staff_id', $staff->id)
                ->where('academic_year_id', $academicYearId)
                ->exists();

            if (! $exists) {
                $section->teachers()->attach($staff->id, [
                    'academic_year_id' => $academicYearId,
                    'is_class_teacher' => true,
                ]);
            } else {
                DB::table('teacher_section')
                    ->where('section_id', $section->id)
                    ->where('staff_id', $staff->id)
                    ->where('academic_year_id', $academicYearId)
                    ->update(['is_class_teacher' => true]);
            }

            DB::table('teacher_section')
                ->where('section_id', $section->id)
                ->where('academic_year_id', $academicYearId)
                ->where('staff_id', '!=', $staff->id)
                ->update(['is_class_teacher' => false]);
        });

        return back()->with('success', 'Class teacher updated.');
    }

    private function currentAcademicYearId(int $schoolId): ?int
    {
        return AcademicYear::where('school_id', $schoolId)
            ->where('is_current', true)
            ->value('id');
    }
}
