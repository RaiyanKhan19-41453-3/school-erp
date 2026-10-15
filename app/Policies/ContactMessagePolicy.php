<?php

namespace App\Policies;

use App\Models\ContactMessage;
use App\Models\User;
use App\Policies\Concerns\SameSchool;

class ContactMessagePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function update(User $user, ContactMessage $contactMessage): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']) && SameSchool::check($user, $contactMessage->school_id);
    }

    public function delete(User $user, ContactMessage $contactMessage): bool
    {
        return $this->update($user, $contactMessage);
    }
}
