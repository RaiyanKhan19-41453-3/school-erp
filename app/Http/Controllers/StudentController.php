<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesAcademicYear;
use App\Http\Controllers\Concerns\RestrictsTeacherAccess;
use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Models\AcademicYear;
use App\Models\Guardian;
use App\Models\SchoolClass;
use App\Models\Student;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    use ResolvesAcademicYear;
    use RestrictsTeacherAccess;

    public function index(): Response
    {
        $this->authorize('viewAny', Student::class);

        $schoolId = auth()->user()->school_id;
        $academicYearId = $this->selectedAcademicYearId($schoolId);

        $perPage = request()->integer('per_page', 10);
        $page = request()->integer('page', 1);
        $sort = request()->string('sort', 'created_at')->value();
        $direction = request()->string('direction', 'desc')->value();
        $search = request()->string('search')->value();
        $classId = request()->integer('class_id');
        $sectionId = request()->integer('section_id');
        $gender = request()->string('gender')->value();
        $admissionFrom = request()->date('admission_from');
        $admissionTo = request()->date('admission_to');

        $allowedSorts = ['name', 'admission_number', 'admission_date', 'created_at'];
        if (! in_array($sort, $allowedSorts)) {
            $sort = 'created_at';
        }
        $direction = in_array(strtolower($direction), ['asc', 'desc']) ? $direction : 'desc';

        $query = Student::with(['section.class', 'guardians'])
            ->where('school_id', $schoolId);

        if ($academicYearId) {
            $query->whereHas('section.class', fn (Builder $q) => $q->where('academic_year_id', $academicYearId));
        }

        if (auth()->user()->hasRole('teacher')) {
            $query->whereIn('section_id', $this->assignedSectionIds($academicYearId));
        }

        if ($search) {
            $query->where(function (Builder $q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('admission_number', 'like', "%{$search}%");
            });
        }

        if ($classId) {
            $query->whereHas('section', function (Builder $q) use ($classId) {
                $q->where('class_id', $classId);
            });
        }

        if ($sectionId) {
            $query->where('section_id', $sectionId);
        }

        if (in_array($gender, ['male', 'female'])) {
            $query->where('gender', $gender);
        }

        if ($admissionFrom) {
            $query->whereDate('admission_date', '>=', $admissionFrom);
        }

        if ($admissionTo) {
            $query->whereDate('admission_date', '<=', $admissionTo);
        }

        $students = $query->orderBy($sort, $direction)
            ->paginate($perPage, ['*'], 'page', $page);

        $classesQuery = SchoolClass::where('school_id', $schoolId)
            ->where('academic_year_id', $academicYearId);

        if (auth()->user()->hasRole('teacher')) {
            $sectionIds = $this->assignedSectionIds($academicYearId);
            $classesQuery->with(['sections' => fn ($q) => $q->whereIn('sections.id', $sectionIds)])
                ->whereHas('sections', fn (Builder $q) => $q->whereIn('sections.id', $sectionIds));
        } else {
            $classesQuery->with('sections');
        }

        return Inertia::render('students/Index', [
            'students' => $students,
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
                'per_page' => $perPage,
                'class_id' => $classId,
                'section_id' => $sectionId,
                'gender' => $gender ?: null,
                'admission_from' => $admissionFrom?->toDateString(),
                'admission_to' => $admissionTo?->toDateString(),
                'year_id' => $academicYearId,
            ],
            'academicYears' => $this->academicYears($schoolId),
            'selectedYearIsCurrent' => $this->selectedYearIsCurrent($schoolId, $academicYearId),
            'classes' => $classesQuery->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Student::class);

        return Inertia::render('students/Create', [
            'classes' => $this->classesForForm(),
            'guardians' => $this->guardiansForForm(),
        ]);
    }

    public function store(StoreStudentRequest $request): RedirectResponse
    {
        $student = DB::transaction(function () use ($request) {
            $student = Student::create([
                'school_id' => $request->user()->school_id,
                'section_id' => $request->section_id,
                'name' => $request->name,
                'admission_number' => $request->admission_number,
                'date_of_birth' => $request->date_of_birth,
                'gender' => $request->gender,
                'admission_date' => $request->admission_date,
                'status' => 'active',
            ]);

            $this->syncGuardians($student, $request->guardians);

            return $student;
        });

        return to_route('students.index')
            ->with('success', 'Student created successfully.');
    }

    public function edit(Student $student): Response
    {
        $this->authorize('update', $student);

        return Inertia::render('students/Edit', [
            'student' => $student->load(['section.class', 'guardians']),
            'classes' => $this->classesForForm(),
            'guardians' => $this->guardiansForForm(),
        ]);
    }

    public function update(UpdateStudentRequest $request, Student $student): RedirectResponse
    {
        DB::transaction(function () use ($request, $student) {
            $student->update([
                'section_id' => $request->section_id,
                'name' => $request->name,
                'admission_number' => $request->admission_number,
                'date_of_birth' => $request->date_of_birth,
                'gender' => $request->gender,
                'admission_date' => $request->admission_date,
            ]);

            $this->syncGuardians($student, $request->guardians);
        });

        return to_route('students.index')
            ->with('success', 'Student updated successfully.');
    }

    public function show(Student $student): Response
    {
        $this->authorize('view', $student);

        return Inertia::render('students/Show', [
            'student' => $student->load(['section.class', 'guardians', 'attendances']),
        ]);
    }

    private function classesForForm()
    {
        $academicYearId = AcademicYear::where('school_id', auth()->user()->school_id)
            ->where('is_current', true)
            ->value('id');

        return SchoolClass::with(['sections' => fn ($q) => $q->orderBy('name')])
            ->where('school_id', auth()->user()->school_id)
            ->where('academic_year_id', $academicYearId)
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    private function guardiansForForm()
    {
        $schoolId = auth()->user()->school_id;

        return Guardian::where(function ($q) use ($schoolId) {
            $q->whereHas('students', fn ($s) => $s->where('students.school_id', $schoolId))
                ->orWhereDoesntHave('students');
        })->orderBy('name')->get(['id', 'name', 'phone']);
    }

    private function syncGuardians(Student $student, array $guardians): void
    {
        $keepIds = [];

        foreach ($guardians as $guardianData) {
            if (! empty($guardianData['guardian_id'])) {
                $guardian = Guardian::findOrFail($guardianData['guardian_id']);

                $otherSchoolStudent = $guardian->students()
                    ->where('students.school_id', '!=', $student->school_id)
                    ->exists();

                if ($otherSchoolStudent) {
                    abort(422, 'The selected guardian belongs to another school.');
                }

                $guardianId = $guardian->id;
            } else {
                $guardian = Guardian::create([
                    'name' => $guardianData['name'],
                    'phone' => $guardianData['phone'] ?? null,
                    'email' => $guardianData['email'] ?? null,
                    'occupation' => $guardianData['occupation'] ?? null,
                ]);
                $guardianId = $guardian->id;
            }

            $keepIds[] = $guardianId;

            $student->guardians()->syncWithoutDetaching([
                $guardianId => [
                    'relationship' => $guardianData['relationship'],
                    'is_primary' => $guardianData['is_primary'] ?? false,
                ],
            ]);
        }

        $student->guardians()->wherePivotNotIn('guardian_id', $keepIds)->detach();
    }
}
