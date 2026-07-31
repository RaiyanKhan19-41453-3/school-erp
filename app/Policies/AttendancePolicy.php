<?php

namespace App\Policies;

use App\Models\AcademicYear;
use App\Models\Section;
use App\Models\User;

class AttendancePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'teacher']);
    }

    public function mark(User $user, Section $section, string $date): bool
    {
        if ($user->hasAnyRole(['super-admin', 'admin'])) {
            return true;
        }

        if (! $user->hasRole('teacher')) {
            return false;
        }

        if (! $this->isTeacherAssignedToSection($user, $section)) {
            return false;
        }

        return $date === now()->toDateString();
    }

    private function isTeacherAssignedToSection(User $user, Section $section): bool
    {
        $staff = $user->staff()->first();

        if (! $staff) {
            return false;
        }

        $academicYearId = AcademicYear::where('school_id', $section->class->school_id)
            ->where('is_current', true)
            ->value('id');

        return $staff->assignedSections($academicYearId)
            ->where('sections.id', $section->id)
            ->exists();
    }
}
