<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesAcademicYear;
use App\Http\Requests\StoreAttendanceRequest;
use App\Models\Attendance;
use App\Models\Section;
use App\Models\Student;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    use ResolvesAcademicYear;

    public function index(): Response
    {
        $this->authorize('viewAny', Attendance::class);

        $user = auth()->user();
        $schoolId = $user->school_id;
        $academicYearId = $this->selectedAcademicYearId($schoolId);

        $date = request()->string('date', now()->toDateString())->value();

        if (! $this->isValidDate($date)) {
            $date = now()->toDateString();
        }

        $sections = $this->visibleSections($user, $academicYearId);

        $sectionId = request()->integer('section_id');
        $selectedSection = $sectionId
            ? $sections->firstWhere('id', $sectionId)
            : $sections->first();

        $canMark = false;
        $students = collect();

        if ($selectedSection) {
            $canMark = $user->can('mark-attendance', [$selectedSection, $date]);

            $studentRows = Student::where('school_id', $schoolId)
                ->where('section_id', $selectedSection->id)
                ->where('status', 'active')
                ->orderBy('name')
                ->get(['id', 'name', 'admission_number']);

            $attendanceByStudent = Attendance::whereIn('student_id', $studentRows->pluck('id'))
                ->where('date', $date)
                ->get()
                ->keyBy('student_id');

            $students = $studentRows->map(function (Student $student) use ($attendanceByStudent) {
                $attendance = $attendanceByStudent->get($student->id);

                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'admission_number' => $student->admission_number,
                    'status' => $attendance?->status,
                    'remarks' => $attendance?->remarks,
                ];
            });
        }

        return Inertia::render('attendance/Index', [
            'academicYears' => $this->academicYears($schoolId),
            'selectedYearId' => $academicYearId,
            'selectedYearIsCurrent' => $this->selectedYearIsCurrent($schoolId, $academicYearId),
            'sections' => $sections->map(fn (Section $section) => [
                'id' => $section->id,
                'name' => $section->name,
                'class' => $section->class->name,
            ])->values(),
            'selectedSectionId' => $selectedSection?->id,
            'date' => $date,
            'students' => $students->values(),
            'canMark' => $canMark,
            'isAdmin' => $user->hasAnyRole(['super-admin', 'admin']),
            'prevDate' => Carbon::parse($date)->subDay()->toDateString(),
            'nextDate' => Carbon::parse($date)->addDay()->toDateString(),
        ]);
    }

    public function store(StoreAttendanceRequest $request): RedirectResponse
    {
        $section = Section::whereHas('class', fn ($q) => $q->where('school_id', $request->user()->school_id))
            ->findOrFail($request->section_id);
        $date = $request->date;

        $this->authorize('mark-attendance', [$section, $date]);

        DB::transaction(function () use ($request, $section, $date) {
            foreach ($request->records as $record) {
                $attendance = Attendance::where('student_id', $record['student_id'])
                    ->whereDate('date', $date)
                    ->first();

                if ($attendance) {
                    $attendance->update([
                        'section_id' => $section->id,
                        'status' => $record['status'],
                        'marked_by' => $request->user()->id,
                        'remarks' => $record['remarks'] ?? null,
                    ]);
                } else {
                    try {
                        Attendance::create([
                            'student_id' => $record['student_id'],
                            'section_id' => $section->id,
                            'date' => $date,
                            'status' => $record['status'],
                            'marked_by' => $request->user()->id,
                            'remarks' => $record['remarks'] ?? null,
                        ]);
                    } catch (UniqueConstraintViolationException) {
                        Attendance::where('student_id', $record['student_id'])
                            ->whereDate('date', $date)
                            ->update([
                                'section_id' => $section->id,
                                'status' => $record['status'],
                                'marked_by' => $request->user()->id,
                                'remarks' => $record['remarks'] ?? null,
                            ]);
                    }
                }
            }
        });

        return back()->with('success', 'Attendance saved.');
    }

    private function visibleSections(object $user, ?int $academicYearId)
    {
        if ($user->hasAnyRole(['super-admin', 'admin'])) {
            return Section::with('class')
                ->whereHas('class', fn (Builder $q) => $q
                    ->where('school_id', $user->school_id)
                    ->where('academic_year_id', $academicYearId))
                ->orderBy('name')
                ->get();
        }

        $staff = $user->staff()->first();

        if (! $staff) {
            return collect();
        }

        return $staff->assignedSections($academicYearId)
            ->with('class')
            ->orderBy('name')
            ->get();
    }

    private function isValidDate(string $date): bool
    {
        return preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) === 1
            && Carbon::hasFormat($date, 'Y-m-d')
            && Carbon::parse($date)->format('Y-m-d') === $date;
    }
}
