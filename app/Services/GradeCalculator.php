<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\GradeBand;
use App\Models\GradingScale;

class GradeCalculator
{
    /**
     * Resolve the grade band matching the given marks, or null when the exam
     * has no grading scale assigned or no band matches.
     */
    public function gradeFor(Exam $exam, float|int|string $marksObtained, float|int|string $fullMarks): ?GradeBand
    {
        if (! $exam->grading_scale_id || ! $fullMarks) {
            return null;
        }

        $percentage = $this->percentage($marksObtained, $fullMarks);

        return $this->gradeForPercentage($exam->gradingScale, $percentage);
    }

    /**
     * Resolve the grade band for a percentage within a grading scale.
     */
    public function gradeForPercentage(GradingScale $gradingScale, float|int|string $percentage): ?GradeBand
    {
        return $gradingScale->gradeBands()
            ->where('min_percentage', '<=', $percentage)
            ->where('max_percentage', '>=', $percentage)
            ->orderBy('min_percentage', 'desc')
            ->orderBy('max_percentage', 'desc')
            ->first();
    }

    /**
     * Percentage of full marks, rounded to two decimals.
     */
    public function percentage(float|int|string $marksObtained, float|int|string $fullMarks): float
    {
        if ((float) $fullMarks <= 0) {
            return 0.0;
        }

        return round(((float) $marksObtained / (float) $fullMarks) * 100, 2);
    }

    /**
     * Determine whether a proposed band overlaps any existing band within the scale.
     */
    public function bandOverlaps(GradingScale $gradingScale, float $min, float $max, ?int $excludeBandId = null): bool
    {
        return $gradingScale->gradeBands()
            ->when($excludeBandId, fn ($q) => $q->where('id', '!=', $excludeBandId))
            ->where(function ($q) use ($min, $max) {
                $q->where(function ($q) use ($min) {
                    $q->where('min_percentage', '<=', $min)
                        ->where('max_percentage', '>=', $min);
                })->orWhere(function ($q) use ($max) {
                    $q->where('min_percentage', '<=', $max)
                        ->where('max_percentage', '>=', $max);
                })->orWhere(function ($q) use ($min, $max) {
                    $q->where('min_percentage', '>=', $min)
                        ->where('max_percentage', '<=', $max);
                });
            })
            ->exists();
    }
}
