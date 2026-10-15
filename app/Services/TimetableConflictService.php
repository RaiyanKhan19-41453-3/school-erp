<?php

namespace App\Services;

use App\Models\Period;
use App\Models\TimetableSlot;
use Carbon\Carbon;
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
        $targetPeriod = Period::find($periodId);

        $slots = TimetableSlot::query()
            ->with(['section.class', 'period'])
            ->where('staff_id', $staffId)
            ->where('day_of_week', $dayOfWeek)
            ->where('academic_year_id', $academicYearId)
            ->when($excludeSlotId, fn ($query) => $query->where('id', '!=', $excludeSlotId))
            ->get();

        return $slots->filter(function (TimetableSlot $slot) use ($periodId, $targetPeriod) {
            if ($slot->period_id === $periodId) {
                return true;
            }

            if (! $targetPeriod || ! $slot->period) {
                return false;
            }

            return $this->periodsOverlap(
                $targetPeriod->start_time,
                $targetPeriod->end_time,
                $slot->period->start_time,
                $slot->period->end_time
            );
        })->values();
    }

    /**
     * Whether the teacher already occupies the given day and period elsewhere.
     */
    public function hasConflict(int $staffId, string $dayOfWeek, int $periodId, int $academicYearId, ?int $excludeSlotId = null): bool
    {
        return $this->conflictsFor($staffId, $dayOfWeek, $periodId, $academicYearId, $excludeSlotId)->isNotEmpty();
    }

    private function periodsOverlap(?string $startA, ?string $endA, ?string $startB, ?string $endB): bool
    {
        $a = $this->parseTimeRange($startA, $endA);
        $b = $this->parseTimeRange($startB, $endB);

        if (! $a || ! $b) {
            return false;
        }

        return $a[0] < $b[1] && $b[0] < $a[1];
    }

    /**
     * @return array{int,int}|null minutes since midnight [start, end]
     */
    private function parseTimeRange(?string $start, ?string $end): ?array
    {
        if (! $start || ! $end) {
            return null;
        }

        $s = $this->parseTime($start);
        $e = $this->parseTime($end);

        if ($s === null || $e === null || $e <= $s) {
            return null;
        }

        return [$s, $e];
    }

    private function parseTime(string $value): ?int
    {
        $value = trim($value);

        foreach (['H:i:s', 'H:i', 'h:i A', 'h:i a'] as $format) {
            try {
                $dt = Carbon::createFromFormat($format, $value);

                if ($dt && $dt->format($format) === $value) {
                    return $dt->hour * 60 + $dt->minute;
                }
            } catch (\Throwable) {
                continue;
            }
        }

        return null;
    }
}
