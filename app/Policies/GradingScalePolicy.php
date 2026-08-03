<?php

namespace App\Policies;

use App\Models\GradingScale;
use App\Models\User;

class GradingScalePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function view(User $user, GradingScale $gradingScale): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function update(User $user, GradingScale $gradingScale): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function delete(User $user, GradingScale $gradingScale): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }
}
