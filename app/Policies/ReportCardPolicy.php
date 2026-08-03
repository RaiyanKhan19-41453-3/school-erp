<?php

namespace App\Policies;

use App\Models\Exam;
use App\Models\Student;
use App\Models\User;

class ReportCardPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'teacher', 'student', 'parent']);
    }

    public function view(User $user, Student $student, Exam $exam): bool
    {
        if ($user->hasAnyRole(['super-admin', 'admin', 'teacher'])) {
            return true;
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
