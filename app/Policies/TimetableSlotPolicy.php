<?php

namespace App\Policies;

use App\Models\TimetableSlot;
use App\Models\User;

class TimetableSlotPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function view(User $user, TimetableSlot $slot): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin'])
            && $slot->section?->class?->school_id === $user->school_id;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function update(User $user, TimetableSlot $slot): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin'])
            && $slot->section?->class?->school_id === $user->school_id;
    }

    public function delete(User $user, TimetableSlot $slot): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin'])
            && $slot->section?->class?->school_id === $user->school_id;
    }
}
