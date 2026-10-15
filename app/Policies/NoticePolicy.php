<?php

namespace App\Policies;

use App\Models\Notice;
use App\Models\User;
use App\Policies\Concerns\SameSchool;

class NoticePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function update(User $user, Notice $notice): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']) && SameSchool::check($user, $notice->school_id);
    }

    public function delete(User $user, Notice $notice): bool
    {
        return $this->update($user, $notice);
    }
}
