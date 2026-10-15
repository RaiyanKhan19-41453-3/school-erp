<?php

namespace App\Policies;

use App\Models\AcademicYear;
use App\Models\User;
use App\Policies\Concerns\SameSchool;

class AcademicYearPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function view(User $user, AcademicYear $academicYear): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']) && SameSchool::check($user, $academicYear->school_id);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function activate(User $user, AcademicYear $academicYear): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']) && SameSchool::check($user, $academicYear->school_id);
    }
}
