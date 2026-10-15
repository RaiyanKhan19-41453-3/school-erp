<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAchievementRequest;
use App\Http\Requests\UpdateAchievementRequest;
use App\Models\Achievement;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AchievementController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', Achievement::class);

        $perPage = max(1, min(request()->integer('per_page', 10), 100));
        $page = max(1, request()->integer('page', 1));
        $sort = request()->string('sort', 'achieved_on')->value();
        $direction = request()->string('direction', 'desc')->value();
        $search = request()->string('search')->value();

        $allowedSorts = ['title', 'student_name', 'category', 'achieved_on', 'created_at'];
        if (! in_array($sort, $allowedSorts, true)) {
            $sort = 'achieved_on';
        }
        $direction = in_array(strtolower($direction), ['asc', 'desc'], true) ? $direction : 'desc';

        $achievements = Achievement::query()
            ->where('school_id', auth()->user()->school_id)
            ->when($search, fn ($query) => $query->where(fn ($q) => $q
                ->where('title', 'like', "%{$search}%")
                ->orWhere('student_name', 'like', "%{$search}%")))
            ->orderBy($sort, $direction)
            ->paginate($perPage, ['*'], 'page', $page);

        return Inertia::render('website/achievements/Index', [
            'achievements' => $achievements,
            'categories' => Achievement::categories(),
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(StoreAchievementRequest $request): RedirectResponse
    {
        Achievement::create([
            'school_id' => $request->user()->school_id,
            ...$request->validated(),
        ]);

        return back()->with('success', 'Achievement created successfully.');
    }

    public function update(UpdateAchievementRequest $request, Achievement $achievement): RedirectResponse
    {
        $achievement->update($request->validated());

        return back()->with('success', 'Achievement updated successfully.');
    }

    public function destroy(Achievement $achievement): RedirectResponse
    {
        $this->authorize('delete', $achievement);

        $achievement->delete();

        return back()->with('success', 'Achievement deleted successfully.');
    }
}
