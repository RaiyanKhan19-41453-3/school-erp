<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSectionRequest;
use App\Models\SchoolClass;
use App\Models\Section;
use Illuminate\Http\RedirectResponse;

class SectionController extends Controller
{
    public function store(StoreSectionRequest $request, SchoolClass $class): RedirectResponse
    {
        if ($class->school_id !== $request->user()->school_id) {
            abort(403);
        }

        Section::create([
            'class_id' => $class->id,
            'name' => $request->name,
            'capacity' => $request->capacity,
        ]);

        return back();
    }

    public function destroy(Section $section): RedirectResponse
    {
        $this->authorize('update', $section->class);

        $section->delete();

        return back();
    }
}
