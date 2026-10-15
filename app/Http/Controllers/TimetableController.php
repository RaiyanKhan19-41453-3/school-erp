<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesAcademicYear;
use App\Http\Requests\StoreTimetableSlotRequest;
use App\Http\Requests\UpdateTimetableSlotRequest;
use App\Models\AcademicYear;
use App\Models\Period;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Staff;
use App\Models\Subject;
use App\Models\TimetableSlot;
use App\Models\User;
use App\Policies\TimetableViewPolicy;
use App\Services\TimetableConflictService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TimetableController extends Controller
{
    use ResolvesAcademicYear;

    public function index(): Response
    {
        $this->authorize('viewAny', TimetableSlot::class);

        $schoolId = auth()->user()->school_id;
        $academicYearId = $this->selectedAcademicYearId($schoolId);
        $classId = request()->integer('class_id');
        $sectionId = request()->integer('section_id');

        $periods = Period::where('school_id', $schoolId)
            ->orderBy('sort_order')
            ->orderBy('start_time')
            ->get(['id', 'name', 'start_time', 'end_time', 'is_break']);

        $sectionsQuery = Section::with('class')
            ->whereHas('class', fn (Builder $q) => $q
                ->where('school_id', $schoolId)
                ->where('academic_year_id', $academicYearId));

        if ($classId) {
            $sectionsQuery->where('class_id', $classId);
        }

        if ($sectionId) {
            $sectionsQuery->where('sections.id', $sectionId);
        }

        $sections = $sectionsQuery->orderBy('name')->get(['id', 'class_id', 'name']);

        $slots = collect();

        if ($sectionId) {
            $slots = TimetableSlot::with(['subject', 'staff.user', 'period'])
                ->where('section_id', $sectionId)
                ->where('academic_year_id', $academicYearId)
                ->get();
        }

        $subjects = collect();

        if ($classId) {
            $subjects = SchoolClass::where('school_id', $schoolId)
                ->where('id', $classId)
                ->with('subjects')
                ->first()
                ?->subjects
                ->sortBy('name')
                ->values()
                ->map(fn ($subject) => ['id' => $subject->id, 'name' => $subject->name])
                ?? collect();
        }

        return Inertia::render('timetable/Index', [
            'periods' => $periods,
            'sections' => $sections,
            'slots' => $slots,
            'subjects' => $subjects,
            'staff' => Staff::with('user')
                ->where('school_id', $schoolId)
                ->orderBy('employee_id')
                ->get(['id', 'employee_id', 'designation', 'user_id']),
            'classes' => SchoolClass::where('school_id', $schoolId)
                ->where('academic_year_id', $academicYearId)
                ->orderBy('name')
                ->get(['id', 'name']),
            'academicYears' => $this->academicYears($schoolId),
            'filters' => [
                'year_id' => $academicYearId,
                'class_id' => $classId,
                'section_id' => $sectionId,
            ],
        ]);
    }

    public function store(StoreTimetableSlotRequest $request): RedirectResponse
    {
        $schoolId = $request->user()->school_id;

        $section = Section::whereHas('class', fn (Builder $q) => $q->where('school_id', $schoolId))
            ->findOrFail($request->section_id);

        $period = Period::where('school_id', $schoolId)->findOrFail($request->period_id);

        $academicYear = AcademicYear::where('school_id', $schoolId)->findOrFail($request->academic_year_id);

        if ($request->staff_id) {
            Staff::where('school_id', $schoolId)->findOrFail($request->staff_id);
        }

        if ($request->subject_id) {
            Subject::where('school_id', $schoolId)->findOrFail($request->subject_id);
        }

        $this->guardDuplicates($section, $period, $request->day_of_week);

        $data = $this->payload($request, $period);

        if ($data['staff_id']) {
            $conflicts = (new TimetableConflictService)->conflictsFor(
                $data['staff_id'],
                $request->day_of_week,
                $period->id,
                $request->academic_year_id,
            );

            if ($conflicts->isNotEmpty() && ! $request->boolean('force')) {
                return back()->with('timetable_conflict', $conflicts->map(fn (TimetableSlot $slot) => [
                    'class_name' => $slot->section->class->name,
                    'section_name' => $slot->section->name,
                    'day' => $slot->day_of_week,
                    'period_name' => $slot->period->name,
                ]));
            }
        }

        TimetableSlot::create([
            'section_id' => $section->id,
            'academic_year_id' => $request->academic_year_id,
            'subject_id' => $data['subject_id'],
            'staff_id' => $data['staff_id'],
            'period_id' => $period->id,
            'day_of_week' => $request->day_of_week,
            'room' => $data['room'],
        ]);

        return back()->with('success', 'Timetable slot created successfully.');
    }

    public function update(UpdateTimetableSlotRequest $request, TimetableSlot $timetableSlot): RedirectResponse
    {
        $this->authorize('update', $timetableSlot);

        $schoolId = $request->user()->school_id;
        $period = Period::where('school_id', $schoolId)->findOrFail($request->period_id);

        $this->guardDuplicates($timetableSlot->section, $period, $request->day_of_week, $timetableSlot->id);

        $data = $this->payload($request, $period);

        if ($data['staff_id']) {
            $conflicts = (new TimetableConflictService)->conflictsFor(
                $data['staff_id'],
                $request->day_of_week,
                $period->id,
                $timetableSlot->academic_year_id,
                $timetableSlot->id,
            );

            if ($conflicts->isNotEmpty() && ! $request->boolean('force')) {
                return back()->with('timetable_conflict', $conflicts->map(fn (TimetableSlot $conflict) => [
                    'class_name' => $conflict->section->class->name,
                    'section_name' => $conflict->section->name,
                    'day' => $conflict->day_of_week,
                    'period_name' => $conflict->period->name,
                ]));
            }
        }

        $timetableSlot->update([
            'subject_id' => $data['subject_id'],
            'staff_id' => $data['staff_id'],
            'period_id' => $period->id,
            'day_of_week' => $request->day_of_week,
            'room' => $data['room'],
        ]);

        return back()->with('success', 'Timetable slot updated successfully.');
    }

    public function destroy(TimetableSlot $timetableSlot): RedirectResponse
    {
        $this->authorize('delete', $timetableSlot);

        $timetableSlot->delete();

        return back()->with('success', 'Timetable slot removed.');
    }

    /**
     * Reject a slot that would duplicate another in the same section, period
     * and day.
     */
    private function guardDuplicates(Section $section, Period $period, string $dayOfWeek, ?int $excludeSlotId = null): void
    {
        $duplicate = TimetableSlot::where('section_id', $section->id)
            ->where('period_id', $period->id)
            ->where('day_of_week', $dayOfWeek)
            ->when($excludeSlotId, fn ($q) => $q->where('id', '!=', $excludeSlotId))
            ->exists();

        if ($duplicate) {
            throw ValidationException::withMessages([
                'period_id' => 'A slot already exists for this section, period and day.',
            ]);
        }
    }

    /**
     * Read-only weekly timetable for a single section, scoped by role:
     * admins see any section, teachers see their assigned sections, and
     * students/parents see their own section(s).
     */
    public function sectionTimetable(): Response
    {
        $user = auth()->user();
        $schoolId = $user->school_id;
        $academicYearId = $this->selectedAcademicYearId($schoolId);

        $sections = $this->sectionsVisibleTo($user, $schoolId, $academicYearId);

        $sectionId = request()->integer('section_id');

        if ($sectionId) {
            $selectedSection = $sections->firstWhere('id', $sectionId);

            abort_unless($selectedSection, 403);
        } else {
            $selectedSection = $sections->first();
        }

        if ($selectedSection) {
            abort_unless((new TimetableViewPolicy)->viewSection($user, $selectedSection), 403);
        }

        $periods = Period::where('school_id', $schoolId)
            ->orderBy('sort_order')
            ->orderBy('start_time')
            ->get(['id', 'name', 'start_time', 'end_time', 'is_break']);

        $slots = $selectedSection
            ? TimetableSlot::with(['subject', 'staff.user'])
                ->where('section_id', $selectedSection->id)
                ->where('academic_year_id', $academicYearId)
                ->get()
            : collect();

        return Inertia::render('timetable/Section', [
            'academicYears' => $this->academicYears($schoolId),
            'selectedYearId' => $academicYearId,
            'sections' => $sections->map(fn (Section $section) => [
                'id' => $section->id,
                'name' => $section->name,
                'class' => $section->class->name,
            ])->values(),
            'selectedSectionId' => $selectedSection?->id,
            'periods' => $periods,
            'slots' => $slots,
            'isAdmin' => $user->hasAnyRole(['super-admin', 'admin']),
        ]);
    }

    /**
     * Personal timetable for a teacher across all sections they teach.
     */
    public function myTimetable(): Response
    {
        abort_unless((new TimetableViewPolicy)->viewMy(auth()->user()), 403);

        $user = auth()->user();
        $schoolId = $user->school_id;
        $academicYearId = $this->selectedAcademicYearId($schoolId);

        $staff = $user->staff()->first();

        abort_unless($staff, 403);

        $periods = Period::where('school_id', $schoolId)
            ->orderBy('sort_order')
            ->orderBy('start_time')
            ->get(['id', 'name', 'start_time', 'end_time', 'is_break']);

        $slots = TimetableSlot::with(['subject', 'staff.user', 'section.class'])
            ->where('staff_id', $staff->id)
            ->where('academic_year_id', $academicYearId)
            ->get();

        return Inertia::render('timetable/My', [
            'academicYears' => $this->academicYears($schoolId),
            'selectedYearId' => $academicYearId,
            'periods' => $periods,
            'slots' => $slots,
            'teacherName' => $staff->user->name,
        ]);
    }

    private function payload(StoreTimetableSlotRequest|UpdateTimetableSlotRequest $request, Period $period): array
    {
        return [
            'subject_id' => $period->is_break ? null : $request->subject_id,
            'staff_id' => $period->is_break ? null : $request->staff_id,
            'room' => $period->is_break ? null : $request->room,
        ];
    }

    /**
     * Sections the given user may view timetables for, within the school and
     * academic year.
     *
     * @return Collection<int, Section>
     */
    private function sectionsVisibleTo(User $user, int $schoolId, ?int $academicYearId): Collection
    {
        if ($user->hasAnyRole(['super-admin', 'admin'])) {
            return Section::with('class')
                ->whereHas('class', fn (Builder $q) => $q
                    ->where('school_id', $schoolId)
                    ->where('academic_year_id', $academicYearId))
                ->orderBy('name')
                ->get();
        }

        if ($user->hasRole('teacher')) {
            $staff = $user->staff()->first();

            if (! $staff) {
                return collect();
            }

            return $staff->assignedSections($academicYearId)
                ->with('class')
                ->orderBy('name')
                ->get();
        }

        if ($user->hasRole('student')) {
            return $user->student()
                ->with('section.class')
                ->where('school_id', $schoolId)
                ->where('status', 'active')
                ->get()
                ->map(fn ($student) => $student->section)
                ->filter()
                ->values();
        }

        $guardian = $user->guardian()->first();

        if (! $guardian) {
            return collect();
        }

        return $guardian->students()
            ->with('section.class')
            ->where('students.school_id', $schoolId)
            ->where('students.status', 'active')
            ->get()
            ->map(fn ($student) => $student->section)
            ->filter()
            ->values();
    }
}
