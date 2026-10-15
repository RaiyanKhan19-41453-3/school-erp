<?php

namespace App\Policies;

use App\Models\Exam;
use App\Models\User;
use App\Policies\Concerns\SameSchool;

class ExamPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'teacher']);
    }

    public function view(User $user, Exam $exam): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'teacher']) && SameSchool::check($user, $exam->school_id);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function update(User $user, Exam $exam): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']) && SameSchool::check($user, $exam->school_id);
    }

    public function delete(User $user, Exam $exam): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']) && SameSchool::check($user, $exam->school_id);
    }
}
