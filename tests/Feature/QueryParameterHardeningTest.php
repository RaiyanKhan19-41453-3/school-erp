<?php

use App\Models\School;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::create(['name' => 'super-admin', 'guard_name' => 'web']);
    Role::create(['name' => 'admin', 'guard_name' => 'web']);
    Role::create(['name' => 'teacher', 'guard_name' => 'web']);
    Role::create(['name' => 'student', 'guard_name' => 'web']);
    Role::create(['name' => 'parent', 'guard_name' => 'web']);
});

test('admin list pages ignore malformed array query parameters', function () {
    $school = School::create(['name' => 'Test School']);
    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $arrayParams = [
        'search' => ['a'],
        'sort' => ['title'],
        'direction' => ['asc'],
        'per_page' => ['10'],
        'page' => ['1'],
        'gender' => ['female'],
        'status' => ['unpaid'],
        'date' => ['2026-01-01'],
        'admission_from' => ['2026-01-01'],
        'admission_to' => ['2026-12-31'],
    ];

    $routes = [
        'classes.index',
        'subjects.index',
        'students.index',
        'grading-scales.index',
        'periods.index',
        'exams.index',
        'academic-years.index',
        'teacher-assignments.index',
        'attendance.index',
        'mark-entry.index',
        'report-cards.index',
        'fee-categories.index',
        'fee-structures.index',
        'invoices.index',
    ];

    foreach ($routes as $routeName) {
        $this->actingAs($admin)
            ->get(route($routeName, $arrayParams))
            ->assertOk();
    }
});
