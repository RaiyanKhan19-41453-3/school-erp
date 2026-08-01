<?php

namespace App\Http\Controllers\Concerns;

use App\Models\AcademicYear;
use Illuminate\Database\Eloquent\Collection;

trait ResolvesAcademicYear
{
    /**
     * Academic years available to the school for filter dropdowns.
     *
     * @return Collection<int, AcademicYear>
     */
    protected function academicYears(int $schoolId): Collection
    {
        return AcademicYear::where('school_id', $schoolId)
            ->orderBy('start_date')
            ->get(['id', 'name', 'is_current']);
    }

    /**
     * The academic year selected via the ?year_id query param, falling back
     * to the school's current year. Returns null when neither is available.
     */
    protected function selectedAcademicYearId(int $schoolId): ?int
    {
        $yearId = request()->integer('year_id');

        if ($yearId) {
            $year = AcademicYear::where('school_id', $schoolId)
                ->where('id', $yearId)
                ->first();

            if ($year) {
                return $year->id;
            }
        }

        return AcademicYear::where('school_id', $schoolId)
            ->where('is_current', true)
            ->value('id');
    }

    protected function selectedYearIsCurrent(int $schoolId, ?int $academicYearId): bool
    {
        if (! $academicYearId) {
            return false;
        }

        return (bool) AcademicYear::where('school_id', $schoolId)
            ->where('id', $academicYearId)
            ->value('is_current');
    }
}
