<?php

namespace App\Http\Controllers;

use App\Http\Requests\SyncClassSubjectsRequest;
use App\Models\SchoolClass;
use App\Models\Subject;
use Illuminate\Http\RedirectResponse;

class ClassSubjectController extends Controller
{
    public function sync(SyncClassSubjectsRequest $request, SchoolClass $class): RedirectResponse
    {
        if ($class->school_id !== $request->user()->school_id) {
            abort(403);
        }

        $this->authorize('assign', Subject::class);

        $class->subjects()->sync($request->subject_ids);

        return back()->with('success', 'Class subjects updated successfully.');
    }
}
