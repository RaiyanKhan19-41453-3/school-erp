<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGradeBandsRequest;
use App\Http\Requests\StoreGradingScaleRequest;
use App\Http\Requests\UpdateGradingScaleRequest;
use App\Models\GradingScale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class GradingScaleController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', GradingScale::class);

        $perPage = max(1, min(request()->integer('per_page', 10), 100));
        $page = max(1, request()->integer('page', 1));
        $search = $this->queryString('search');

        $query = GradingScale::where('school_id', auth()->user()->school_id)
            ->withCount('gradeBands')
            ->with('gradeBands');

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $scales = $query->orderBy('name')
            ->paginate($perPage, ['*'], 'page', $page);

        return Inertia::render('grading-scales/Index', [
            'scales' => $scales,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(StoreGradingScaleRequest $request): RedirectResponse
    {
        GradingScale::create([
            'school_id' => $request->user()->school_id,
            'name' => $request->name,
        ]);

        return back()->with('success', 'Grading scale created successfully.');
    }

    public function update(UpdateGradingScaleRequest $request, GradingScale $gradingScale): RedirectResponse
    {
        $gradingScale->update([
            'name' => $request->name,
        ]);

        return back()->with('success', 'Grading scale updated successfully.');
    }

    public function storeBands(StoreGradeBandsRequest $request, GradingScale $gradingScale): RedirectResponse
    {
        DB::transaction(function () use ($request, $gradingScale) {
            $gradingScale->gradeBands()->delete();

            foreach ($request->bands as $band) {
                $gradingScale->gradeBands()->create([
                    'label' => $band['label'],
                    'min_percentage' => $band['min_percentage'],
                    'max_percentage' => $band['max_percentage'],
                    'grade_point' => $band['grade_point'] ?? null,
                    'remarks' => $band['remarks'] ?? null,
                ]);
            }
        });

        return back()->with('success', 'Grade bands saved successfully.');
    }

    public function destroy(GradingScale $gradingScale): RedirectResponse
    {
        $this->authorize('delete', $gradingScale);

        $gradingScale->delete();

        return back()->with('success', 'Grading scale deleted successfully.');
    }
}
