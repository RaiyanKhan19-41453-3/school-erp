<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAcademicYearRequest;
use App\Models\AcademicYear;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AcademicYearController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', AcademicYear::class);

        $perPage = max(1, min(request()->integer('per_page', 10), 100));
        $page = max(1, request()->integer('page', 1));
        $sort = $this->queryString('sort', 'start_date');
        $direction = $this->queryString('direction', 'desc');
        $search = $this->queryString('search');

        $allowedSorts = ['name', 'start_date', 'end_date', 'is_current', 'created_at'];
        if (! in_array($sort, $allowedSorts)) {
            $sort = 'start_date';
        }
        $direction = in_array(strtolower($direction), ['asc', 'desc']) ? $direction : 'desc';

        $query = AcademicYear::where('school_id', auth()->user()->school_id)
            ->withCount('classes')
            ->withCount('invoices');

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $years = $query->orderBy($sort, $direction)
            ->paginate($perPage, ['*'], 'page', $page);

        return Inertia::render('academic-years/Index', [
            'years' => $years,
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(StoreAcademicYearRequest $request): RedirectResponse
    {
        AcademicYear::create([
            'school_id' => $request->user()->school_id,
            'name' => $request->name,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'is_current' => false,
        ]);

        return back()->with('success', 'Academic year created successfully.');
    }

    public function activate(AcademicYear $academicYear): RedirectResponse
    {
        $this->authorize('activate', $academicYear);

        $schoolId = auth()->user()->school_id;

        if ($academicYear->school_id !== $schoolId) {
            abort(403);
        }

        DB::transaction(function () use ($academicYear, $schoolId) {
            AcademicYear::where('school_id', $schoolId)->lockForUpdate()->get();
            AcademicYear::where('school_id', $schoolId)->update(['is_current' => false]);
            $academicYear->update(['is_current' => true]);
        });

        return back()->with('success', "{$academicYear->name} is now the current academic year.");
    }
}
