<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClassRequest;
use App\Http\Requests\UpdateClassRequest;
use App\Models\SchoolClass;
use App\Models\Section;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ClassController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', SchoolClass::class);

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

        $query = SchoolClass::with('sections')
            ->where('school_id', auth()->user()->school_id);

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
            ],
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
