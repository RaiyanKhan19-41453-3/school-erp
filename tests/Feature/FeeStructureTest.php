<?php

use App\Models\AcademicYear;
use App\Models\FeeCategory;
use App\Models\FeeStructure;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\User;
use Spatie\Permission\Models\Role;

function createFeeStructureEnvironment(): array
{
    $school = School::create(['name' => 'Test School']);
    $academicYear = AcademicYear::create([
        'school_id' => $school->id,
        'name' => '2025-2026',
        'start_date' => '2025-09-01',
        'end_date' => '2026-06-30',
        'is_current' => true,
    ]);
    $class = SchoolClass::create([
        'school_id' => $school->id,
        'academic_year_id' => $academicYear->id,
        'name' => 'Grade 1',
    ]);
    $category = FeeCategory::create(['school_id' => $school->id, 'name' => 'Tuition']);

    return ['school' => $school, 'academicYear' => $academicYear, 'class' => $class, 'category' => $category];
}

function validFeeStructureData(SchoolClass $class, FeeCategory $category, array $overrides = []): array
{
    return array_merge([
        'class_id' => $class->id,
        'fee_category_id' => $category->id,
        'amount' => 2500.00,
        'frequency' => FeeStructure::FREQUENCY_MONTHLY,
        'due_day' => 10,
    ], $overrides);
}

beforeEach(function () {
    Role::create(['name' => 'super-admin', 'guard_name' => 'web']);
    Role::create(['name' => 'admin', 'guard_name' => 'web']);
    Role::create(['name' => 'teacher', 'guard_name' => 'web']);
    Role::create(['name' => 'student', 'guard_name' => 'web']);
    Role::create(['name' => 'parent', 'guard_name' => 'web']);
});

test('admin can view fee structures', function () {
    ['school' => $school, 'academicYear' => $academicYear, 'class' => $class, 'category' => $category] = createFeeStructureEnvironment();

    FeeStructure::create([
        'school_id' => $school->id,
        'academic_year_id' => $academicYear->id,
        'class_id' => $class->id,
        'fee_category_id' => $category->id,
        'amount' => 2500.00,
        'frequency' => FeeStructure::FREQUENCY_MONTHLY,
    ]);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('fee-structures.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('feeStructures.data', fn ($data) => count($data) === 1 && $data[0]['amount'] === '2500.00')
            ->where('classes', fn ($data) => count($data) === 1)
            ->where('categories', fn ($data) => count($data) === 1));
});

test('admin can create a fee structure', function () {
    ['school' => $school, 'class' => $class, 'category' => $category] = createFeeStructureEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('fee-structures.store'), validFeeStructureData($class, $category))
        ->assertSessionHasNoErrors();

    $structure = FeeStructure::where('school_id', $school->id)->first();

    expect($structure)->not->toBeNull()
        ->and($structure->class_id)->toBe($class->id)
        ->and($structure->fee_category_id)->toBe($category->id)
        ->and((float) $structure->amount)->toBe(2500.00)
        ->and($structure->frequency)->toBe(FeeStructure::FREQUENCY_MONTHLY)
        ->and($structure->due_day)->toBe(10);
});

test('fee structure requires class, category, amount, and frequency', function () {
    ['school' => $school, 'class' => $class, 'category' => $category] = createFeeStructureEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('fee-structures.store'), [])
        ->assertSessionHasErrors(['class_id', 'fee_category_id', 'amount', 'frequency']);
});

test('fee structure rejects invalid frequency and due day', function () {
    ['school' => $school, 'class' => $class, 'category' => $category] = createFeeStructureEnvironment();

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('fee-structures.store'), validFeeStructureData($class, $category, [
            'frequency' => 'weekly',
            'due_day' => 0,
        ]))
        ->assertSessionHasErrors(['frequency', 'due_day']);
});

test('admin cannot create a fee structure for a class from another school', function () {
    ['school' => $school, 'category' => $category] = createFeeStructureEnvironment();
    $otherSchool = School::create(['name' => 'Other School']);
    $otherAcademicYear = AcademicYear::create([
        'school_id' => $otherSchool->id,
        'name' => '2025-2026',
        'start_date' => '2025-09-01',
        'end_date' => '2026-06-30',
        'is_current' => true,
    ]);
    $otherClass = SchoolClass::create([
        'school_id' => $otherSchool->id,
        'academic_year_id' => $otherAcademicYear->id,
        'name' => 'Grade 9',
    ]);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->post(route('fee-structures.store'), validFeeStructureData($otherClass, $category))
        ->assertSessionHasErrors('class_id');
});

test('admin can update a fee structure', function () {
    ['school' => $school, 'academicYear' => $academicYear, 'class' => $class, 'category' => $category] = createFeeStructureEnvironment();

    $structure = FeeStructure::create([
        'school_id' => $school->id,
        'academic_year_id' => $academicYear->id,
        'class_id' => $class->id,
        'fee_category_id' => $category->id,
        'amount' => 2500.00,
        'frequency' => FeeStructure::FREQUENCY_MONTHLY,
    ]);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->put(route('fee-structures.update', $structure), validFeeStructureData($class, $category, [
            'amount' => 2800.00,
            'frequency' => FeeStructure::FREQUENCY_QUARTERLY,
        ]))
        ->assertSessionHasNoErrors();

    expect($structure->fresh()->amount)->toBe('2800.00')
        ->and($structure->fresh()->frequency)->toBe(FeeStructure::FREQUENCY_QUARTERLY);
});

test('admin can delete a fee structure', function () {
    ['school' => $school, 'academicYear' => $academicYear, 'class' => $class, 'category' => $category] = createFeeStructureEnvironment();

    $structure = FeeStructure::create([
        'school_id' => $school->id,
        'academic_year_id' => $academicYear->id,
        'class_id' => $class->id,
        'fee_category_id' => $category->id,
        'amount' => 2500.00,
        'frequency' => FeeStructure::FREQUENCY_MONTHLY,
    ]);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->delete(route('fee-structures.destroy', $structure))
        ->assertSessionHasNoErrors();

    expect(FeeStructure::find($structure->id))->toBeNull();
});

test('admin can filter fee structures by class', function () {
    ['school' => $school, 'academicYear' => $academicYear, 'class' => $class, 'category' => $category] = createFeeStructureEnvironment();

    $class2 = SchoolClass::create([
        'school_id' => $school->id,
        'academic_year_id' => $academicYear->id,
        'name' => 'Grade 2',
    ]);

    FeeStructure::create([
        'school_id' => $school->id,
        'academic_year_id' => $academicYear->id,
        'class_id' => $class->id,
        'fee_category_id' => $category->id,
        'amount' => 2500.00,
        'frequency' => FeeStructure::FREQUENCY_MONTHLY,
    ]);
    FeeStructure::create([
        'school_id' => $school->id,
        'academic_year_id' => $academicYear->id,
        'class_id' => $class2->id,
        'fee_category_id' => $category->id,
        'amount' => 2000.00,
        'frequency' => FeeStructure::FREQUENCY_MONTHLY,
    ]);

    $admin = User::factory()->create(['school_id' => $school->id])->assignRole('admin');

    $this->actingAs($admin)
        ->get(route('fee-structures.index', ['class_id' => $class->id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('filters.class_id', $class->id)
            ->where('feeStructures.data', fn ($data) => count($data) === 1 && $data[0]['class_id'] === $class->id));
});

test('teacher cannot access fee structures', function () {
    ['school' => $school] = createFeeStructureEnvironment();

    $teacher = User::factory()->create(['school_id' => $school->id])->assignRole('teacher');

    $this->actingAs($teacher)
        ->get(route('fee-structures.index'))
        ->assertForbidden();
});
