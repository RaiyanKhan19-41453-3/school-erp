<?php

namespace App\Policies;

use App\Models\ExamSubject;
use App\Models\Section;
use App\Models\User;
use App\Policies\Concerns\SameSchool;

class MarkPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'teacher']);
    }

    public function enter(User $user, Section $section, ExamSubject $examSubject): bool
    {
        if (! SameSchool::check($user, $section->class?->school_id) || ! SameSchool::check($user, $examSubject->exam?->school_id)) {
            return false;
        }

        if ($user->hasAnyRole(['super-admin', 'admin'])) {
            return true;
        }

        if (! $user->hasRole('teacher')) {
            return false;
        }

        $staff = $user->staff()->first();

        if (! $staff) {
            return false;
        }

        $academicYearId = $examSubject->exam->academic_year_id;

        return $staff->assignedSections($academicYearId)
            ->where('sections.id', $section->id)
            ->exists();
    }
}
