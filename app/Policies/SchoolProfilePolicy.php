<?php

namespace App\Policies;

use App\Models\SchoolProfile;
use App\Models\User;
use App\Policies\Concerns\SameSchool;

class SchoolProfilePolicy
{
    public function view(User $user, SchoolProfile $schoolProfile): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']) && SameSchool::check($user, $schoolProfile->school_id);
    }

    public function update(User $user, SchoolProfile $schoolProfile): bool
    {
        return $this->view($user, $schoolProfile);
    }
}
