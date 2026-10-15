<?php

namespace App\Policies;

use App\Models\Section;
use App\Models\User;
use App\Policies\Concerns\SameSchool;

class SectionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function update(User $user, Section $section): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']) && SameSchool::check($user, $section->class?->school_id);
    }
}
