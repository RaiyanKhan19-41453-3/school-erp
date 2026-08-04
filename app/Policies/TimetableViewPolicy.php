<?php

namespace App\Policies;

use App\Models\Section;
use App\Models\Staff;
use App\Models\User;

class TimetableViewPolicy
{
    public function viewSection(User $user, Section $section): bool
    {
        if ($user->hasAnyRole(['super-admin', 'admin'])) {
            return $section->class()->value('school_id') === $user->school_id;
        }

        if ($user->hasRole('teacher')) {
            $staff = $user->staff()->first();

            if (! $staff) {
                return false;
            }

            return $staff->sections()->where('sections.id', $section->id)->exists();
        }

        if ($user->hasRole('student')) {
            return $user->student()->where('section_id', $section->id)->exists();
        }

        if ($user->hasRole('parent')) {
            $guardian = $user->guardian()->first();

            return $guardian && $guardian->students()
                ->where('students.section_id', $section->id)
                ->exists();
        }

        return false;
    }

    public function viewMy(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'teacher'])
            && $user->staff()->first() instanceof Staff;
    }
}
