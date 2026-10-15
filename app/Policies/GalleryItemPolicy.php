<?php

namespace App\Policies;

use App\Models\GalleryItem;
use App\Models\User;
use App\Policies\Concerns\SameSchool;

class GalleryItemPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    public function update(User $user, GalleryItem $galleryItem): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']) && SameSchool::check($user, $galleryItem->school_id);
    }

    public function delete(User $user, GalleryItem $galleryItem): bool
    {
        return $this->update($user, $galleryItem);
    }
}
