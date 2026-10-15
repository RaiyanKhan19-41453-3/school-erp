<?php

namespace App\Policies;

use App\Models\Invoice;
use App\Models\User;
use App\Policies\Concerns\SameSchool;

class InvoicePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function viewMine(User $user): bool
    {
        return $user->hasAnyRole(['student', 'parent']);
    }

    public function view(User $user, Invoice $invoice): bool
    {
        if (! SameSchool::check($user, $invoice->student?->school_id)) {
            return false;
        }

        if ($user->hasAnyRole(['super-admin', 'admin'])) {
            return true;
        }

        if ($user->hasRole('student')) {
            return $invoice->student_id === $user->student()->value('id');
        }

        if ($user->hasRole('parent')) {
            return $this->isParentOfStudent($user, $invoice);
        }

        return false;
    }

    public function generate(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function recordPayment(User $user, Invoice $invoice): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']) && SameSchool::check($user, $invoice->student?->school_id);
    }

    private function isParentOfStudent(User $user, Invoice $invoice): bool
    {
        $guardian = $user->guardian()->first();

        if (! $guardian) {
            return false;
        }

        return $guardian->students()
            ->where('students.id', $invoice->student_id)
            ->exists();
    }
}
