<?php

namespace App\Policies;

use App\Models\Subject;
use App\Models\User;
use App\Policies\Concerns\SameSchool;

class SubjectPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'teacher']);
    }

    public function view(User $user, Subject $subject): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'teacher']) && SameSchool::check($user, $subject->school_id);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function update(User $user, Subject $subject): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']) && SameSchool::check($user, $subject->school_id);
    }

    public function delete(User $user, Subject $subject): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']) && SameSchool::check($user, $subject->school_id);
    }

    public function assign(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }
}
