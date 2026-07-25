<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $school = School::create([
            'name' => 'Demo International School',
            'address' => '123 Education Lane, Learning City',
            'phone' => '+1-555-0100',
            'email' => 'info@demo-school.test',
        ]);

        $academicYear = AcademicYear::create([
            'school_id' => $school->id,
            'name' => '2025-2026',
            'start_date' => '2025-09-01',
            'end_date' => '2026-06-30',
            'is_current' => true,
        ]);

        $classes = [
            SchoolClass::create(['school_id' => $school->id, 'academic_year_id' => $academicYear->id, 'name' => 'Grade 1']),
            SchoolClass::create(['school_id' => $school->id, 'academic_year_id' => $academicYear->id, 'name' => 'Grade 2']),
        ];

        foreach ($classes as $class) {
            Section::create(['class_id' => $class->id, 'name' => 'Section A', 'capacity' => 30]);
            Section::create(['class_id' => $class->id, 'name' => 'Section B', 'capacity' => 30]);
        }

        $this->call(RoleSeeder::class);

        $admin = User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'admin@school-erp.test',
            'password' => bcrypt('password'),
            'school_id' => $school->id,
        ]);
        $admin->assignRole('super-admin');
    }
}
