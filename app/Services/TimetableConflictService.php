<?php

namespace App\Services;

use App\Models\TimetableSlot;
use Illuminate\Support\Collection;

class TimetableConflictService
{
    /**
     * Find timetable slots where the given teacher is already assigned for the
     * same day and period, within the same academic year.
     *
     * Pass an optional $excludeSlotId when validating an update so the slot
     * being edited does not count as a conflict against itself.
     *
     * @return Collection<int, TimetableSlot>
     */
    public function conflictsFor(int $staffId, string $dayOfWeek, int $periodId, int $academicYearId, ?int $excludeSlotId = null): Collection
    {
        return TimetableSlot::query()
            ->with(['section.class', 'period'])
            ->where('staff_id', $staffId)
            ->where('day_of_week', $dayOfWeek)
            ->where('period_id', $periodId)
            ->where('academic_year_id', $academicYearId)
            ->when($excludeSlotId, fn ($query) => $query->where('id', '!=', $excludeSlotId))
            ->get();
    }

    /**
     * Whether the teacher already occupies the given day and period elsewhere.
     */
    public function hasConflict(int $staffId, string $dayOfWeek, int $periodId, int $academicYearId, ?int $excludeSlotId = null): bool
    {
        return $this->conflictsFor($staffId, $dayOfWeek, $periodId, $academicYearId, $excludeSlotId)->isNotEmpty();
    }
}
