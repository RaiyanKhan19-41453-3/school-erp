<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesAcademicYear;
use App\Http\Controllers\Concerns\RestrictsTeacherAccess;
use App\Http\Requests\StoreClassRequest;
use App\Http\Requests\UpdateClassRequest;
use App\Models\SchoolClass;
use App\Models\Section;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ClassController extends Controller
{
    use ResolvesAcademicYear;
    use RestrictsTeacherAccess;

    public function index(): Response
    {
        $this->authorize('viewAny', SchoolClass::class);

        $schoolId = auth()->user()->school_id;
        $academicYearId = $this->selectedAcademicYearId($schoolId);

        $perPage = request()->integer('per_page', 10);
        $page = request()->integer('page', 1);
        $sort = request()->string('sort', 'created_at')->value();
        $direction = request()->string('direction', 'desc')->value();
        $search = request()->string('search')->value();

        $allowedSorts = ['name', 'created_at'];
        if (! in_array($sort, $allowedSorts)) {
            $sort = 'created_at';
        }
        $direction = in_array(strtolower($direction), ['asc', 'desc']) ? $direction : 'desc';

        $query = SchoolClass::where('school_id', $schoolId)
            ->where('academic_year_id', $academicYearId);

        if (auth()->user()->hasRole('teacher')) {
            $sectionIds = $this->assignedSectionIds($academicYearId);
            $query->with(['sections' => fn ($q) => $q->whereIn('sections.id', $sectionIds)->orderBy('name')])
                ->whereHas('sections', fn (Builder $q) => $q->whereIn('sections.id', $sectionIds));
        } else {
            $query->with('sections');
        }

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $classes = $query->orderBy($sort, $direction)
            ->paginate($perPage, ['*'], 'page', $page);

        return Inertia::render('classes/Index', [
            'classes' => $classes,
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
                'per_page' => $perPage,
                'year_id' => $academicYearId,
            ],
            'academicYears' => $this->academicYears($schoolId),
            'selectedYearIsCurrent' => $this->selectedYearIsCurrent($schoolId, $academicYearId),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', SchoolClass::class);

        return Inertia::render('classes/Create');
    }

    public function store(StoreClassRequest $request): RedirectResponse
    {
        $class = SchoolClass::create([
            'school_id' => $request->user()->school_id,
            'academic_year_id' => $request->academic_year_id,
            'name' => $request->name,
        ]);

        foreach ($request->sections as $sectionData) {
            Section::create([
                'class_id' => $class->id,
                'name' => $sectionData['name'],
                'capacity' => $sectionData['capacity'],
            ]);
        }

        return to_route('classes.index')
            ->with('success', 'Class and sections created successfully.');
    }

    public function update(UpdateClassRequest $request, SchoolClass $class): RedirectResponse
    {
        $class->update([
            'name' => $request->name,
        ]);

        $incomingIds = collect($request->sections)->pluck('id')->filter()->all();

        $class->sections()->whereNotIn('id', $incomingIds)->delete();

        foreach ($request->sections as $sectionData) {
            if (isset($sectionData['id'])) {
                Section::where('id', $sectionData['id'])
                    ->where('class_id', $class->id)
                    ->update([
                        'name' => $sectionData['name'],
                        'capacity' => $sectionData['capacity'],
                    ]);
            } else {
                Section::create([
                    'class_id' => $class->id,
                    'name' => $sectionData['name'],
                    'capacity' => $sectionData['capacity'],
                ]);
            }
        }

        return to_route('classes.index')
            ->with('success', 'Class updated successfully.');
    }
}
