<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePeriodRequest;
use App\Http\Requests\UpdatePeriodRequest;
use App\Models\Period;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PeriodController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', Period::class);

        $perPage = max(1, min(request()->integer('per_page', 10), 100));
        $page = max(1, request()->integer('page', 1));
        $search = request()->string('search')->value();
        $allowedSorts = ['name', 'start_time', 'end_time', 'sort_order', 'created_at'];
        $sort = in_array(request()->string('sort')->value(), $allowedSorts) ? request()->string('sort')->value() : 'sort_order';
        $direction = in_array(request()->string('direction')->value(), ['asc', 'desc']) ? request()->string('direction')->value() : 'asc';

        $query = Period::where('school_id', auth()->user()->school_id);

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $periods = $query->orderBy($sort, $direction)
            ->orderBy('sort_order')
            ->paginate($perPage, ['*'], 'page', $page);

        return Inertia::render('periods/Index', [
            'periods' => $periods,
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(StorePeriodRequest $request): RedirectResponse
    {
        Period::create([
            'school_id' => $request->user()->school_id,
            'name' => $request->name,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'sort_order' => $request->sort_order ?? 0,
            'is_break' => $request->boolean('is_break'),
        ]);

        return back()->with('success', 'Period created successfully.');
    }

    public function update(UpdatePeriodRequest $request, Period $period): RedirectResponse
    {
        $period->update([
            'name' => $request->name,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'sort_order' => $request->sort_order ?? 0,
            'is_break' => $request->boolean('is_break'),
        ]);

        return back()->with('success', 'Period updated successfully.');
    }

    public function destroy(Period $period): RedirectResponse
    {
        $this->authorize('delete', $period);

        $period->delete();

        return back()->with('success', 'Period deleted successfully.');
    }
}
