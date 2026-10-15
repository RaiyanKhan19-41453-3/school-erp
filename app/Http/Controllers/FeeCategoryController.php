<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFeeCategoryRequest;
use App\Http\Requests\UpdateFeeCategoryRequest;
use App\Models\FeeCategory;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class FeeCategoryController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', FeeCategory::class);

        $perPage = max(1, min(request()->integer('per_page', 10), 100));
        $page = max(1, request()->integer('page', 1));
        $sort = $this->queryString('sort', 'created_at');
        $direction = $this->queryString('direction', 'desc');
        $search = $this->queryString('search');

        $allowedSorts = ['name', 'created_at'];
        if (! in_array($sort, $allowedSorts)) {
            $sort = 'created_at';
        }
        $direction = in_array(strtolower($direction), ['asc', 'desc']) ? $direction : 'desc';

        $query = FeeCategory::where('school_id', auth()->user()->school_id)
            ->withCount('feeStructures');

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $categories = $query->orderBy($sort, $direction)
            ->paginate($perPage, ['*'], 'page', $page);

        return Inertia::render('fee-categories/Index', [
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(StoreFeeCategoryRequest $request): RedirectResponse
    {
        FeeCategory::create([
            'school_id' => $request->user()->school_id,
            'name' => $request->name,
        ]);

        return back()->with('success', 'Fee category created successfully.');
    }

    public function update(UpdateFeeCategoryRequest $request, FeeCategory $feeCategory): RedirectResponse
    {
        $feeCategory->update([
            'name' => $request->name,
        ]);

        return back()->with('success', 'Fee category updated successfully.');
    }

    public function destroy(FeeCategory $feeCategory): RedirectResponse
    {
        $this->authorize('delete', $feeCategory);

        $feeCategory->delete();

        return back()->with('success', 'Fee category deleted successfully.');
    }
}
