<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Models\Attendance;
use App\Models\Exam;
use App\Models\Guardian;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Staff;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $schoolId = $user->school_id;

        $roles = $user->getRoleNames();

        $props = ['roles' => $roles->all()];

        if ($roles->intersect(['super-admin', 'admin'])->isNotEmpty()) {
            $props = array_merge($props, $this->adminStats($schoolId));
        } elseif ($roles->contains('teacher')) {
            $props = array_merge($props, $this->teacherStats($user->id, $schoolId));
        } elseif ($roles->contains('student')) {
            $props = array_merge($props, $this->studentStats($user->id));
        } elseif ($roles->contains('parent')) {
            $props = array_merge($props, $this->parentStats($user->id));
        }

        return Inertia::render('dashboard', $props);
    }

    private function adminStats(int $schoolId): array
    {
        $studentsCount = Student::where('school_id', $schoolId)->count();
        $teachersCount = Staff::where('school_id', $schoolId)->count();
        $sectionsCount = DB::table('sections')
            ->join('classes', 'classes.id', '=', 'sections.class_id')
            ->where('classes.school_id', $schoolId)
            ->count();

        $today = Carbon::today()->format('Y-m-d');
        $todayAttendance = Attendance::whereDate('date', $today)
            ->whereHas('student', fn ($q) => $q->where('school_id', $schoolId))
            ->selectRaw('COUNT(*) as total, SUM(status IN (?, ?)) as present', [
                Attendance::STATUS_PRESENT,
                Attendance::STATUS_LATE,
            ])
            ->first();

        $todayAttendancePercent = $todayAttendance && $todayAttendance->total > 0
            ? round(($todayAttendance->present / $todayAttendance->total) * 100)
            : 0;

        $studentsPerClass = DB::table('classes')
            ->leftJoin('sections', 'sections.class_id', '=', 'classes.id')
            ->leftJoin('students', 'students.section_id', '=', 'sections.id')
            ->where('classes.school_id', $schoolId)
            ->select('classes.name', DB::raw('COUNT(students.id) as count'))
            ->groupBy('classes.id', 'classes.name')
            ->orderBy('classes.name')
            ->get()
            ->map(fn ($row) => ['name' => $row->name, 'count' => (int) $row->count])
            ->values();

        $attendanceTrend = $this->attendanceTrend($schoolId, null);

        $feeSummary = $this->feeSummary($schoolId);

        $recentPayments = Payment::with(['invoice.student'])
            ->where('status', Payment::STATUS_COMPLETED)
            ->whereHas('invoice.student', fn ($q) => $q->where('school_id', $schoolId))
            ->latest('paid_at')
            ->limit(10)
            ->get()
            ->map(fn (Payment $payment) => [
                'id' => $payment->id,
                'student' => $payment->invoice?->student?->name ?? '—',
                'amount' => (float) $payment->amount,
                'method' => $payment->payment_method,
                'paid_at' => $payment->paid_at?->format('d M Y'),
                'date' => $payment->paid_at?->format('d'),
                'month' => $payment->paid_at?->format('M'),
            ]);

        $recentAttendance = Attendance::with(['student', 'section.class'])
            ->whereHas('student', fn ($q) => $q->where('school_id', $schoolId))
            ->latest('date')
            ->limit(8)
            ->get()
            ->map(fn (Attendance $attendance) => [
                'id' => $attendance->id,
                'student' => $attendance->student?->name ?? '—',
                'section' => $attendance->section?->name ?? '—',
                'class' => $attendance->section?->class?->name ?? '—',
                'status' => $attendance->status,
                'date' => $attendance->date?->format('d M Y'),
            ]);

        return [
            'stats' => [
                ['label' => 'Students', 'value' => $studentsCount, 'icon' => 'users'],
                ['label' => 'Teachers', 'value' => $teachersCount, 'icon' => 'graduation-cap'],
                ['label' => 'Sections', 'value' => $sectionsCount, 'icon' => 'layout-grid'],
                ['label' => "Today's Attendance", 'value' => $todayAttendancePercent, 'suffix' => '%', 'icon' => 'calendar-check'],
            ],
            'studentsPerClass' => $studentsPerClass,
            'attendanceTrend' => $attendanceTrend,
            'feeSummary' => $feeSummary,
            'recentPayments' => $recentPayments,
            'recentAttendance' => $recentAttendance,
        ];
    }

    private function teacherStats(int $userId, int $schoolId): array
    {
        $staff = Staff::where('user_id', $userId)->where('school_id', $schoolId)->first();

        if (! $staff) {
            return ['stats' => [], 'attendancePie' => [], 'markDistribution' => [], 'sections' => []];
        }

        $currentYear = AcademicYear::where('school_id', $schoolId)->where('is_current', true)->first();
        $currentYearId = $currentYear?->id;

        $sectionsQuery = $staff->sections()->with('class');

        if ($currentYearId !== null) {
            $sectionsQuery->wherePivot('academic_year_id', $currentYearId);
        }

        $sections = $sectionsQuery->get();

        $sectionIds = $sections->pluck('id');
        $studentCount = Student::whereIn('section_id', $sectionIds)->count();

        $today = Carbon::today()->format('Y-m-d');
        $todayAttendance = Attendance::whereIn('section_id', $sectionIds)
            ->whereDate('date', $today)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->get()
            ->pluck('total', 'status');

        $totalMarked = $todayAttendance->sum();
        $presentCount = $todayAttendance->get(Attendance::STATUS_PRESENT, 0) + $todayAttendance->get(Attendance::STATUS_LATE, 0);
        $attendancePercent = $totalMarked > 0 ? round(($presentCount / $totalMarked) * 100) : 0;

        $attendancePie = collect(Attendance::statuses())
            ->mapWithKeys(fn (string $status) => [
                $status => $todayAttendance->get($status, 0),
            ])
            ->all();

        $markDistribution = $sectionIds->isNotEmpty()
            ? DB::table('marks')
                ->join('exam_subjects', 'exam_subjects.id', '=', 'marks.exam_subject_id')
                ->join('subjects', 'subjects.id', '=', 'exam_subjects.subject_id')
                ->join('students', 'students.id', '=', 'marks.student_id')
                ->whereIn('students.section_id', $sectionIds)
                ->select(
                    'subjects.name',
                    DB::raw('AVG((marks.marks_obtained / exam_subjects.full_marks) * 100) as avg_percentage')
                )
                ->groupBy('subjects.id', 'subjects.name')
                ->orderBy('subjects.name')
                ->get()
                ->map(fn ($row) => [
                    'name' => $row->name,
                    'avg_percentage' => round((float) $row->avg_percentage),
                ])
                ->values()
            : collect();

        return [
            'stats' => [
                ['label' => 'My Sections', 'value' => $sections->count(), 'icon' => 'layout-grid'],
                ['label' => 'My Students', 'value' => $studentCount, 'icon' => 'users'],
                ['label' => "Today's Attendance", 'value' => $attendancePercent, 'suffix' => '%', 'icon' => 'calendar-check'],
            ],
            'sections' => $sections->map(fn ($section) => [
                'id' => $section->id,
                'name' => $section->name,
                'class' => $section->class?->name ?? '—',
                'is_class_teacher' => (bool) $section->pivot?->is_class_teacher,
            ]),
            'attendancePie' => $attendancePie,
            'markDistribution' => $markDistribution,
        ];
    }

    private function studentStats(int $userId): array
    {
        $student = Student::with('section.class')->where('user_id', $userId)->first();

        if (! $student) {
            return ['stats' => [], 'attendancePie' => [], 'upcomingExams' => []];
        }

        return $this->childStats($student);
    }

    private function parentStats(int $userId): array
    {
        $guardian = Guardian::with('students.section.class')->where('user_id', $userId)->first();

        if (! $guardian || $guardian->students->isEmpty()) {
            return ['stats' => [], 'attendancePie' => [], 'upcomingExams' => []];
        }

        return $this->childStats($guardian->students->first());
    }

    private function childStats(Student $student): array
    {
        $attendancePie = $student->attendances()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->get()
            ->pluck('total', 'status')
            ->all();

        $attendancePie = collect(Attendance::statuses())
            ->mapWithKeys(fn (string $status) => [
                $status => $attendancePie[$status] ?? 0,
            ])
            ->all();

        $invoices = $student->invoices()
            ->whereIn('status', [Invoice::STATUS_UNPAID, Invoice::STATUS_PARTIAL, Invoice::STATUS_OVERDUE])
            ->get();

        $outstanding = $invoices->sum(fn (Invoice $invoice) => (float) $invoice->balanceDue());

        $upcomingExams = Exam::with('examSubjects.subject')
            ->when($student->section?->class_id, fn ($q, $classId) => $q->where('class_id', $classId), fn ($q) => $q->whereRaw('1 = 0'))
            ->whereDate('start_date', '>=', Carbon::today())
            ->orderBy('start_date')
            ->limit(5)
            ->get()
            ->map(fn (Exam $exam) => [
                'id' => $exam->id,
                'name' => $exam->name,
                'start_date' => $exam->start_date?->format('d M Y'),
                'end_date' => $exam->end_date?->format('d M Y'),
            ]);

        return [
            'stats' => [
                ['label' => 'Class', 'value' => $student->section?->class?->name ?? '—', 'icon' => 'graduation-cap'],
                ['label' => 'Section', 'value' => $student->section?->name ?? '—', 'icon' => 'layout-grid'],
                ['label' => 'Outstanding Balance', 'value' => number_format($outstanding, 0), 'prefix' => '৳', 'icon' => 'wallet'],
            ],
            'attendancePie' => $attendancePie,
            'upcomingExams' => $upcomingExams,
        ];
    }

    private function attendanceTrend(int $schoolId, ?int $sectionId): array
    {
        $dates = collect();
        for ($i = 13; $i >= 0; $i--) {
            $dates->push(Carbon::today()->subDays($i)->format('Y-m-d'));
        }

        $attendance = Attendance::query()
            ->whereHas('student', fn ($q) => $q->where('school_id', $schoolId))
            ->when($sectionId, fn ($q) => $q->where('section_id', $sectionId))
            ->whereBetween('date', [$dates->first(), $dates->last()])
            ->selectRaw('`date`, `status`, COUNT(*) as total')
            ->groupBy('date', 'status')
            ->get()
            ->groupBy('date');

        return $dates->map(function (string $date) use ($attendance) {
            $day = $attendance->get($date, collect());

            return [
                'date' => Carbon::parse($date)->format('d M'),
                'present' => $day->where('status', Attendance::STATUS_PRESENT)->sum('total'),
                'absent' => $day->where('status', Attendance::STATUS_ABSENT)->sum('total'),
                'late' => $day->where('status', Attendance::STATUS_LATE)->sum('total'),
            ];
        })->values()->all();
    }

    private function feeSummary(int $schoolId): array
    {
        $completedPayments = Payment::where('status', Payment::STATUS_COMPLETED)
            ->whereHas('invoice', fn ($q) => $q->whereHas('student', fn ($q2) => $q2->where('school_id', $schoolId)));

        $collected = (float) $completedPayments->sum('amount');

        $monthlyCollected = (float) (clone $completedPayments)
            ->whereBetween('paid_at', [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()])
            ->sum('amount');

        $invoiceStats = Invoice::whereHas('student', fn ($q) => $q->where('school_id', $schoolId))
            ->selectRaw('COUNT(*) as total_count, COALESCE(SUM(total_amount), 0) as total_amount')
            ->selectRaw("SUM(status = '".Invoice::STATUS_PAID."') as paid_count")
            ->selectRaw("SUM(status = '".Invoice::STATUS_PARTIAL."') as partial_count")
            ->selectRaw("SUM(status IN ('".Invoice::STATUS_UNPAID."', '".Invoice::STATUS_OVERDUE."')) as unpaid_count")
            ->first();

        $outstanding = (float) Invoice::whereHas('student', fn ($q) => $q->where('school_id', $schoolId))
            ->whereIn('invoices.status', [Invoice::STATUS_UNPAID, Invoice::STATUS_PARTIAL, Invoice::STATUS_OVERDUE])
            ->leftJoin('payments', function ($join) {
                $join->on('payments.invoice_id', '=', 'invoices.id')
                    ->where('payments.status', '=', Payment::STATUS_COMPLETED);
            })
            ->groupBy('invoices.id', 'invoices.total_amount')
            ->selectRaw('CASE WHEN CAST(invoices.total_amount AS DECIMAL(12,2)) - COALESCE(SUM(payments.amount), 0) < 0 THEN 0 ELSE CAST(invoices.total_amount AS DECIMAL(12,2)) - COALESCE(SUM(payments.amount), 0) END as due')
            ->get()
            ->sum('due');

        return [
            'collected' => round($collected, 2),
            'outstanding' => round($outstanding, 2),
            'monthly_collected' => round($monthlyCollected, 2),
            'total' => round((float) ($invoiceStats->total_amount ?? 0), 2),
            'counts' => [
                'paid' => (int) ($invoiceStats->paid_count ?? 0),
                'partial' => (int) ($invoiceStats->partial_count ?? 0),
                'unpaid' => (int) ($invoiceStats->unpaid_count ?? 0),
            ],
        ];
    }
}
