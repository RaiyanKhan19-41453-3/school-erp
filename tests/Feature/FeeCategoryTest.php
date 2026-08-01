<?php

use App\Models\FeeCategory;
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

test('admin can view fee categories', function () {
    $school = School::create(['name' => 'Test School']);
    FeeCategory::create(['school_id' => $school->id, 'name' => 'Tuition']);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('fee-categories.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('categories.data', fn ($data) => count($data) === 1 && $data[0]['name'] === 'Tuition'));
});

test('teacher cannot view fee categories', function () {
    $school = School::create(['name' => 'Test School']);

    $teacher = User::factory()->create(['school_id' => $school->id])->assignRole('teacher');

    $this->actingAs($teacher)
        ->get(route('fee-categories.index'))
        ->assertForbidden();
});

test('admin can create a fee category', function () {
    $school = School::create(['name' => 'Test School']);
    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('fee-categories.store'), ['name' => 'Transport'])
        ->assertSessionHasNoErrors();

    expect(FeeCategory::where('school_id', $school->id)->where('name', 'Transport')->exists())->toBeTrue();
});

test('fee category name is required and unique within a school', function () {
    $school = School::create(['name' => 'Test School']);
    FeeCategory::create(['school_id' => $school->id, 'name' => 'Tuition']);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('fee-categories.store'), ['name' => ''])
        ->assertSessionHasErrors('name');

    $this->actingAs($admin)
        ->post(route('fee-categories.store'), ['name' => 'Tuition'])
        ->assertSessionHasErrors('name');
});

test('same fee category name is allowed across different schools', function () {
    $schoolA = School::create(['name' => 'School A']);
    $schoolB = School::create(['name' => 'School B']);

    $adminA = User::factory()->create(['school_id' => $schoolA->id])->assignRole('admin');
    $adminB = User::factory()->create(['school_id' => $schoolB->id])->assignRole('admin');

    $this->actingAs($adminA)
        ->post(route('fee-categories.store'), ['name' => 'Tuition'])
        ->assertSessionHasNoErrors();

    $this->actingAs($adminB)
        ->post(route('fee-categories.store'), ['name' => 'Tuition'])
        ->assertSessionHasNoErrors();

    expect(FeeCategory::count())->toBe(2);
});

test('admin can update a fee category', function () {
    $school = School::create(['name' => 'Test School']);
    $category = FeeCategory::create(['school_id' => $school->id, 'name' => 'Tuition']);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->put(route('fee-categories.update', $category), ['name' => 'School Fees'])
        ->assertSessionHasNoErrors();

    expect($category->fresh()->name)->toBe('School Fees');
});

test('admin can delete a fee category', function () {
    $school = School::create(['name' => 'Test School']);
    $category = FeeCategory::create(['school_id' => $school->id, 'name' => 'Tuition']);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->delete(route('fee-categories.destroy', $category))
        ->assertSessionHasNoErrors();

    expect(FeeCategory::find($category->id))->toBeNull();
});

test('teacher cannot create a fee category', function () {
    $school = School::create(['name' => 'Test School']);
    $teacher = User::factory()->create(['school_id' => $school->id])->assignRole('teacher');

    $this->actingAs($teacher)
        ->post(route('fee-categories.store'), ['name' => 'Tuition'])
        ->assertForbidden();
});
