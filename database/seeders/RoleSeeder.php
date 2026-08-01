<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        collect(['super-admin', 'admin', 'teacher', 'student', 'parent'])
            ->each(fn (string $role) => Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']));
    }
}
