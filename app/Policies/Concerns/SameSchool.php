<?php

namespace App\Policies\Concerns;

use App\Models\User;

class SameSchool
{
    /**
     * Whether the user may access a record belonging to the given school.
     * A user with no school (global super-admin) may access everything.
     */
    public static function check(User $user, ?int $schoolId): bool
    {
        if ($user->school_id === null) {
            return true;
        }

        return $schoolId !== null && (int) $user->school_id === (int) $schoolId;
    }
}
