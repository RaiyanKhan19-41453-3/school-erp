<?php

namespace App\Policies;

use App\Models\Achievement;
use App\Models\User;
use App\Policies\Concerns\SameSchool;

class AchievementPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function update(User $user, Achievement $achievement): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']) && SameSchool::check($user, $achievement->school_id);
    }

    public function delete(User $user, Achievement $achievement): bool
    {
        return $this->update($user, $achievement);
    }
}
