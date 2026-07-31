<?php

namespace App\Policies;

use App\Models\AcademicYear;
use App\Models\Student;
use App\Models\User;

class StudentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'teacher']);
    }

    public function view(User $user, Student $student): bool
    {
        if ($user->hasAnyRole(['super-admin', 'admin'])) {
            return true;
        }

        if ($user->hasRole('teacher')) {
            return $this->isTeacherAssignedToStudent($user, $student);
        }

        if ($user->hasRole('student')) {
            return $student->user_id === $user->id;
        }

        if ($user->hasRole('parent')) {
            return $student->guardians()->where('user_id', $user->id)->exists();
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function update(User $user, Student $student): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    private function isTeacherAssignedToStudent(User $user, Student $student): bool
    {
        $staff = $user->staff()->first();

        if (! $staff) {
            return false;
        }

        $currentAcademicYearId = AcademicYear::where('school_id', $student->school_id)
            ->where('is_current', true)
            ->value('id');

        return $staff->assignedSections($currentAcademicYearId)
            ->where('sections.id', $student->section_id)
            ->exists();
    }
}
