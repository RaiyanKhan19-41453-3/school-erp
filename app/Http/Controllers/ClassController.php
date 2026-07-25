<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClassRequest;
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

        $classes = SchoolClass::with('sections')
            ->where('school_id', auth()->user()->school_id)
            ->latest()
            ->get();

        return Inertia::render('classes/Index', [
            'classes' => $classes,
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
}
