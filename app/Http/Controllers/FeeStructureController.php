<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesAcademicYear;
use App\Http\Requests\StoreFeeStructureRequest;
use App\Http\Requests\UpdateFeeStructureRequest;
use App\Models\FeeCategory;
use App\Models\FeeStructure;
use App\Models\SchoolClass;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class FeeStructureController extends Controller
{
    use ResolvesAcademicYear;

    public function index(): Response
    {
        $this->authorize('viewAny', FeeStructure::class);

        $schoolId = auth()->user()->school_id;
        $academicYearId = $this->selectedAcademicYearId($schoolId);

        $perPage = max(1, min(request()->integer('per_page', 10), 100));
        $page = max(1, request()->integer('page', 1));
        $sort = request()->string('sort', 'created_at')->value();
        $direction = request()->string('direction', 'desc')->value();
        $search = request()->string('search')->value();
        $classId = request()->integer('class_id');

        $allowedSorts = ['class_name', 'category_name', 'amount', 'frequency', 'created_at'];
        if (! in_array($sort, $allowedSorts)) {
            $sort = 'created_at';
        }
        $direction = in_array(strtolower($direction), ['asc', 'desc']) ? $direction : 'desc';

        $query = FeeStructure::with(['class', 'feeCategory'])
            ->where('school_id', $schoolId);

        if ($academicYearId) {
            $query->where('academic_year_id', $academicYearId);
        }

        if ($search) {
            $query->where(function (Builder $q) use ($search) {
                $q->whereHas('class', fn (Builder $c) => $c->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('feeCategory', fn (Builder $c) => $c->where('name', 'like', "%{$search}%"));
            });
        }

        if ($classId) {
            $query->where('class_id', $classId);
        }

        if ($sort === 'class_name') {
            $query->orderBy(
                SchoolClass::select('name')
                    ->whereColumn('classes.id', 'fee_structures.class_id')
                    ->limit(1),
                $direction,
            );
        } elseif ($sort === 'category_name') {
            $query->orderBy(
                FeeCategory::select('name')
                    ->whereColumn('fee_categories.id', 'fee_structures.fee_category_id')
                    ->limit(1),
                $direction,
            );
        } else {
            $query->orderBy($sort, $direction);
        }

        $structures = $query->paginate($perPage, ['*'], 'page', $page);

        return Inertia::render('fee-structures/Index', [
            'feeStructures' => $structures,
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
                'per_page' => $perPage,
                'class_id' => $classId,
                'year_id' => $academicYearId,
            ],
            'academicYears' => $this->academicYears($schoolId),
            'selectedYearIsCurrent' => $this->selectedYearIsCurrent($schoolId, $academicYearId),
            'classes' => SchoolClass::where('school_id', $schoolId)
                ->where('academic_year_id', $academicYearId)
                ->orderBy('name')
                ->get(['id', 'name']),
            'categories' => FeeCategory::where('school_id', $schoolId)
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    public function store(StoreFeeStructureRequest $request): RedirectResponse
    {
        FeeStructure::create([
            'school_id' => $request->user()->school_id,
            'academic_year_id' => $request->academic_year_id,
            'class_id' => $request->class_id,
            'fee_category_id' => $request->fee_category_id,
            'amount' => $request->amount,
            'frequency' => $request->frequency,
            'due_day' => $request->due_day,
        ]);

        return back()->with('success', 'Fee structure created successfully.');
    }

    public function update(UpdateFeeStructureRequest $request, FeeStructure $feeStructure): RedirectResponse
    {
        $feeStructure->update([
            'class_id' => $request->class_id,
            'fee_category_id' => $request->fee_category_id,
            'amount' => $request->amount,
            'frequency' => $request->frequency,
            'due_day' => $request->due_day,
        ]);

        return back()->with('success', 'Fee structure updated successfully.');
    }

    public function destroy(FeeStructure $feeStructure): RedirectResponse
    {
        $this->authorize('delete', $feeStructure);

        $feeStructure->delete();

        return back()->with('success', 'Fee structure deleted successfully.');
    }
}
