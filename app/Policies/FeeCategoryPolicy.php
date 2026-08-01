<?php

namespace App\Policies;

use App\Models\FeeCategory;
use App\Models\User;

class FeeCategoryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function view(User $user, FeeCategory $feeCategory): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function update(User $user, FeeCategory $feeCategory): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function delete(User $user, FeeCategory $feeCategory): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }
}
