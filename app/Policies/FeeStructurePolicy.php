<?php

namespace App\Policies;

use App\Models\FeeStructure;
use App\Models\User;
use App\Policies\Concerns\SameSchool;

class FeeStructurePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function view(User $user, FeeStructure $feeStructure): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']) && SameSchool::check($user, $feeStructure->school_id);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function update(User $user, FeeStructure $feeStructure): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']) && SameSchool::check($user, $feeStructure->school_id);
    }

    public function delete(User $user, FeeStructure $feeStructure): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']) && SameSchool::check($user, $feeStructure->school_id);
    }
}
