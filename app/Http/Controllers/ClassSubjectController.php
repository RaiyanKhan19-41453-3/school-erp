<?php

namespace App\Http\Controllers;

use App\Http\Requests\SyncClassSubjectsRequest;
use App\Models\SchoolClass;
use Illuminate\Http\RedirectResponse;

class ClassSubjectController extends Controller
{
    public function sync(SyncClassSubjectsRequest $request, SchoolClass $class): RedirectResponse
    {
        $this->authorize('assign', Subject::class);

        $class->subjects()->sync($request->subject_ids);

        return back()->with('success', 'Class subjects updated successfully.');
    }
}
