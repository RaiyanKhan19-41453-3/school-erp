<?php

namespace App\Policies;

use App\Models\Exam;
use App\Models\Student;
use App\Models\User;
use App\Policies\Concerns\SameSchool;

class ReportCardPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'teacher', 'student', 'parent']);
    }

    public function view(User $user, Student $student, Exam $exam): bool
    {
        if (! SameSchool::check($user, $student->school_id) || ! SameSchool::check($user, $exam->school_id)) {
            return false;
        }

        if ($exam->school_id !== $student->school_id || $exam->class_id !== $student->section?->class_id) {
            return false;
        }

        if ($user->hasAnyRole(['super-admin', 'admin'])) {
            return true;
        }

        if ($user->hasRole('teacher')) {
            return $user->staff()->first()?->assignedSections($exam->academic_year_id)
                ?->where('sections.id', $student->section_id)->exists() ?? false;
        }

        if ($user->hasRole('student')) {
            return $student->id === $user->student()->value('id');
        }

        if ($user->hasRole('parent')) {
            $guardian = $user->guardian()->first();

            return $guardian && $guardian->students()
                ->where('students.id', $student->id)
                ->exists();
        }

        return false;
    }
}
