<?php

namespace App\Policies;

use App\Models\Period;
use App\Models\User;

class PeriodPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function view(User $user, Period $period): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function update(User $user, Period $period): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function delete(User $user, Period $period): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }
}
