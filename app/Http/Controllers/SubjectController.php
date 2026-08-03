<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSubjectRequest;
use App\Http\Requests\UpdateSubjectRequest;
use App\Models\Subject;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SubjectController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', Subject::class);

        $perPage = request()->integer('per_page', 10);
        $page = request()->integer('page', 1);
        $sort = request()->string('sort', 'name')->value();
        $direction = request()->string('direction', 'asc')->value();
        $search = request()->string('search')->value();

        $allowedSorts = ['name', 'code', 'created_at'];
        if (! in_array($sort, $allowedSorts)) {
            $sort = 'name';
        }
        $direction = in_array(strtolower($direction), ['asc', 'desc']) ? $direction : 'asc';

        $query = Subject::where('school_id', auth()->user()->school_id)
            ->withCount('classes');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $subjects = $query->orderBy($sort, $direction)
            ->paginate($perPage, ['*'], 'page', $page);

        return Inertia::render('subjects/Index', [
            'subjects' => $subjects,
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(StoreSubjectRequest $request): RedirectResponse
    {
        Subject::create([
            'school_id' => $request->user()->school_id,
            'name' => $request->name,
            'code' => $request->code,
        ]);

        return back()->with('success', 'Subject created successfully.');
    }

    public function update(UpdateSubjectRequest $request, Subject $subject): RedirectResponse
    {
        $subject->update([
            'name' => $request->name,
            'code' => $request->code,
        ]);

        return back()->with('success', 'Subject updated successfully.');
    }

    public function destroy(Subject $subject): RedirectResponse
    {
        $this->authorize('delete', $subject);

        $subject->delete();

        return back()->with('success', 'Subject deleted successfully.');
    }
}
