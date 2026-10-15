<?php

namespace App\Policies;

use App\Models\SchoolClass;
use App\Models\User;
use App\Policies\Concerns\SameSchool;

class SchoolClassPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'teacher']);
    }

    public function view(User $user, SchoolClass $schoolClass): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'teacher']) && SameSchool::check($user, $schoolClass->school_id);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function update(User $user, SchoolClass $schoolClass): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']) && SameSchool::check($user, $schoolClass->school_id);
    }

    public function delete(User $user, SchoolClass $schoolClass): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']) && SameSchool::check($user, $schoolClass->school_id);
    }
}
