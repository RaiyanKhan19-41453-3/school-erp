<?php

namespace App\Policies;

use App\Models\Exam;
use App\Models\User;

class ExamPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'teacher']);
    }

    public function view(User $user, Exam $exam): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'teacher']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function update(User $user, Exam $exam): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function delete(User $user, Exam $exam): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }
}
