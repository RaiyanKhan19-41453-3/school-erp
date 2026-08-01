<?php

namespace App\Http\Controllers\Concerns;

use App\Models\AcademicYear;

trait RestrictsTeacherAccess
{
    /**
     * Section ids assigned to the authenticated teacher for the given academic year.
     *
     * @return array<int, int>
     */
    private function assignedSectionIds(?int $academicYearId = null): array
    {
        $user = auth()->user();

        if (! $user->hasRole('teacher')) {
            return [];
        }

        $staff = $user->staff()->first();

        if (! $staff) {
            return [];
        }

        $academicYearId ??= AcademicYear::where('school_id', $user->school_id)
            ->where('is_current', true)
            ->value('id');

        return $staff->assignedSections($academicYearId)
            ->pluck('sections.id')
            ->all();
    }
}
