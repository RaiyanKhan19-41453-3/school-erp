<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesAcademicYear;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\SchoolClass;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FeeReportController extends Controller
{
    use ResolvesAcademicYear;

    private const PAID_SUBQUERY = '(SELECT COALESCE(SUM(payments.amount), 0) FROM payments WHERE payments.invoice_id = invoices.id AND payments.status = ?)';

    public function dues(): Response
    {
        $this->authorize('viewReports', Invoice::class);

        [$schoolId, $academicYearId, $classId, $sectionId, $search] = $this->duesFilters();

        $perPage = max(1, min(request()->integer('per_page', 10), 100));
        $page = max(1, request()->integer('page', 1));
        $sort = $this->queryString('sort', 'balance');
        $direction = strtolower($this->queryString('direction', 'desc'));

        if (! in_array($sort, ['student_name', 'billed', 'balance'], true)) {
            $sort = 'balance';
        }
        $direction = in_array($direction, ['asc', 'desc'], true) ? $direction : 'desc';

        $dues = $this->duesQuery($schoolId, $academicYearId, $classId, $sectionId, $search)
            ->selectRaw('students.id as student_id, students.name as student_name, students.admission_number, sections.name as section_name, classes.name as class_name')
            ->selectRaw('SUM(invoice_totals.billed) as billed')
            ->selectRaw('SUM(invoice_totals.paid) as paid')
            ->selectRaw('SUM(invoice_totals.billed) - SUM(invoice_totals.paid) as balance')
            ->orderBy($sort === 'student_name' ? 'students.name' : $sort, $direction)
            ->paginate($perPage, ['*'], 'page', $page);

        return Inertia::render('reports/fee-dues', [
            'dues' => $dues,
            'totals' => $this->duesTotals($schoolId, $academicYearId, $classId, $sectionId, $search),
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
                'per_page' => $perPage,
                'class_id' => $classId,
                'section_id' => $sectionId,
                'year_id' => $academicYearId,
            ],
            'academicYears' => $this->academicYears($schoolId),
            'classes' => $this->classesForYear($schoolId, $academicYearId),
        ]);
    }

    public function exportDues(): StreamedResponse
    {
        $this->authorize('viewReports', Invoice::class);

        [$schoolId, $academicYearId, $classId, $sectionId, $search] = $this->duesFilters();

        $query = $this->duesQuery($schoolId, $academicYearId, $classId, $sectionId, $search)
            ->selectRaw('students.name as student_name, students.admission_number, classes.name as class_name, sections.name as section_name')
            ->selectRaw('SUM(invoice_totals.billed) as billed')
            ->selectRaw('SUM(invoice_totals.paid) as paid')
            ->selectRaw('SUM(invoice_totals.billed) - SUM(invoice_totals.paid) as balance')
            ->orderBy('balance', 'desc');

        $totals = $this->duesTotals($schoolId, $academicYearId, $classId, $sectionId, $search);

        return response()->streamDownload(function () use ($query, $totals): void {
            $handle = fopen('php://output', 'w');

            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, ['Student', 'Admission No', 'Class', 'Section', 'Billed', 'Paid', 'Balance']);

            foreach ($query->cursor() as $row) {
                fputcsv($handle, [
                    $row->student_name,
                    $row->admission_number,
                    $row->class_name ?? '',
                    $row->section_name ?? '',
                    number_format((float) $row->billed, 2, '.', ''),
                    number_format((float) $row->paid, 2, '.', ''),
                    number_format((float) $row->balance, 2, '.', ''),
                ]);
            }

            fputcsv($handle, [
                'Total ('.$totals['students'].' students)',
                '',
                '',
                '',
                number_format($totals['billed'], 2, '.', ''),
                number_format($totals['paid'], 2, '.', ''),
                number_format($totals['balance'], 2, '.', ''),
            ]);

            fclose($handle);
        }, 'fee-dues-'.now()->toDateString().'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    public function collection(): Response
    {
        $this->authorize('viewReports', Invoice::class);

        [$schoolId, $academicYearId, $classId, $sectionId, $method, $fromDate, $toDate, $search] = $this->collectionFilters();

        $perPage = max(1, min(request()->integer('per_page', 10), 100));
        $page = max(1, request()->integer('page', 1));
        $sort = $this->queryString('sort', 'paid_at');
        $direction = strtolower($this->queryString('direction', 'desc'));

        if (! in_array($sort, ['paid_at', 'amount'], true)) {
            $sort = 'paid_at';
        }
        $direction = in_array($direction, ['asc', 'desc'], true) ? $direction : 'desc';

        $payments = $this->collectionQuery($schoolId, $academicYearId, $classId, $sectionId, $method, $fromDate, $toDate, $search)
            ->with(['invoice.student.section.class', 'recorder:id,name'])
            ->orderBy('payments.'.$sort, $direction)
            ->orderBy('payments.id', $direction)
            ->paginate($perPage, ['*'], 'page', $page);

        return Inertia::render('reports/fee-collection', [
            'payments' => $payments,
            'summary' => $this->collectionSummary($schoolId, $academicYearId, $classId, $sectionId, $method, $fromDate, $toDate, $search),
            'paymentMethods' => Payment::methods(),
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
                'per_page' => $perPage,
                'class_id' => $classId,
                'section_id' => $sectionId,
                'year_id' => $academicYearId,
                'method' => $method ?: null,
                'from_date' => $fromDate,
                'to_date' => $toDate,
            ],
            'academicYears' => $this->academicYears($schoolId),
            'classes' => $this->classesForYear($schoolId, $academicYearId),
        ]);
    }

    public function exportCollection(): StreamedResponse
    {
        $this->authorize('viewReports', Invoice::class);

        [$schoolId, $academicYearId, $classId, $sectionId, $method, $fromDate, $toDate, $search] = $this->collectionFilters();

        $query = DB::table('payments')
            ->join('invoices', 'invoices.id', '=', 'payments.invoice_id')
            ->join('students', 'students.id', '=', 'invoices.student_id')
            ->leftJoin('sections', 'sections.id', '=', 'students.section_id')
            ->leftJoin('classes', 'classes.id', '=', 'sections.class_id')
            ->leftJoin('users', 'users.id', '=', 'payments.recorded_by')
            ->where('payments.status', Payment::STATUS_COMPLETED)
            ->whereBetween('payments.paid_at', [Carbon::parse($fromDate)->startOfDay(), Carbon::parse($toDate)->endOfDay()])
            ->where('students.school_id', $schoolId)
            ->when($academicYearId, fn (QueryBuilder $q) => $q->where('invoices.academic_year_id', $academicYearId))
            ->when($classId, fn (QueryBuilder $q) => $q->where('classes.id', $classId))
            ->when($sectionId, fn (QueryBuilder $q) => $q->where('sections.id', $sectionId))
            ->when($method !== '', fn (QueryBuilder $q) => $q->where('payments.payment_method', $method))
            ->when($search !== '', function (QueryBuilder $q) use ($search): void {
                $q->where(function (QueryBuilder $w) use ($search): void {
                    $w->where('students.name', 'like', "%{$search}%")
                        ->orWhere('students.admission_number', 'like', "%{$search}%")
                        ->orWhere('invoices.invoice_number', 'like', "%{$search}%");
                });
            })
            ->orderBy('payments.paid_at')
            ->select([
                'payments.paid_at',
                'students.name as student_name',
                'students.admission_number',
                'classes.name as class_name',
                'sections.name as section_name',
                'invoices.invoice_number',
                'payments.payment_method',
                'payments.amount',
                'users.name as recorded_by_name',
                'payments.remarks',
            ]);

        return response()->streamDownload(function () use ($query): void {
            $handle = fopen('php://output', 'w');

            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, ['Paid At', 'Student', 'Admission No', 'Class', 'Section', 'Invoice No', 'Method', 'Amount', 'Recorded By', 'Remarks']);

            foreach ($query->cursor() as $row) {
                fputcsv($handle, [
                    $row->paid_at ? substr((string) $row->paid_at, 0, 16) : '',
                    $row->student_name,
                    $row->admission_number,
                    $row->class_name ?? '',
                    $row->section_name ?? '',
                    $row->invoice_number,
                    Str::headline($row->payment_method),
                    number_format((float) $row->amount, 2, '.', ''),
                    $row->recorded_by_name ?? '',
                    $row->remarks ?? '',
                ]);
            }

            fclose($handle);
        }, "fee-collection-{$fromDate}-to-{$toDate}.csv", ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /**
     * @return array{0: int|null, 1: int|null, 2: int|null, 3: int|null, 4: string}
     */
    private function duesFilters(): array
    {
        $schoolId = auth()->user()->school_id;

        return [
            $schoolId,
            $this->selectedAcademicYearId($schoolId),
            request()->integer('class_id') ?: null,
            request()->integer('section_id') ?: null,
            $this->queryString('search'),
        ];
    }

    /**
     * @return array{0: int|null, 1: int|null, 2: int|null, 3: int|null, 4: string, 5: string, 6: string, 7: string}
     */
    private function collectionFilters(): array
    {
        $schoolId = auth()->user()->school_id;

        $method = $this->queryString('method');

        if (! in_array($method, Payment::methods(), true)) {
            $method = '';
        }

        return [
            $schoolId,
            $this->selectedAcademicYearId($schoolId),
            request()->integer('class_id') ?: null,
            request()->integer('section_id') ?: null,
            $method,
            $this->queryDate('from_date') ?? now()->startOfMonth()->toDateString(),
            $this->queryDate('to_date') ?? now()->toDateString(),
            $this->queryString('search'),
        ];
    }

    /**
     * Per-invoice totals aggregated per student, limited to students whose
     * completed payments do not cover everything billed.
     *
     * Payment totals are computed in a non-grouped inner query so the
     * correlated subquery stays valid under MySQL's ONLY_FULL_GROUP_BY mode.
     */
    private function duesQuery(int $schoolId, ?int $academicYearId, ?int $classId, ?int $sectionId, string $search): QueryBuilder
    {
        $invoiceTotals = DB::table('invoices')
            ->selectRaw('invoices.student_id')
            ->selectRaw('invoices.total_amount as billed')
            ->selectRaw('('.self::PAID_SUBQUERY.') as paid', [Payment::STATUS_COMPLETED])
            ->when($academicYearId, fn (QueryBuilder $q) => $q->where('invoices.academic_year_id', $academicYearId));

        return DB::query()
            ->fromSub($invoiceTotals, 'invoice_totals')
            ->join('students', 'students.id', '=', 'invoice_totals.student_id')
            ->leftJoin('sections', 'sections.id', '=', 'students.section_id')
            ->leftJoin('classes', 'classes.id', '=', 'sections.class_id')
            ->where('students.school_id', $schoolId)
            ->when($classId, fn (QueryBuilder $q) => $q->where('classes.id', $classId))
            ->when($sectionId, fn (QueryBuilder $q) => $q->where('sections.id', $sectionId))
            ->when($search !== '', function (QueryBuilder $q) use ($search): void {
                $q->where(function (QueryBuilder $w) use ($search): void {
                    $w->where('students.name', 'like', "%{$search}%")
                        ->orWhere('students.admission_number', 'like', "%{$search}%");
                });
            })
            ->groupBy('students.id', 'students.name', 'students.admission_number', 'sections.name', 'classes.name')
            ->havingRaw('SUM(invoice_totals.billed) > SUM(invoice_totals.paid)');
    }

    /**
     * @return array{students: int, billed: float, paid: float, balance: float}
     */
    private function duesTotals(int $schoolId, ?int $academicYearId, ?int $classId, ?int $sectionId, string $search): array
    {
        $row = DB::query()
            ->fromSub(
                $this->duesQuery($schoolId, $academicYearId, $classId, $sectionId, $search)
                    ->selectRaw('SUM(invoice_totals.billed) as billed')
                    ->selectRaw('SUM(invoice_totals.paid) as paid'),
                'dues'
            )
            ->selectRaw('COUNT(*) as students_count, COALESCE(SUM(billed), 0) as billed, COALESCE(SUM(paid), 0) as paid')
            ->first();

        $billed = round((float) $row->billed, 2);
        $paid = round((float) $row->paid, 2);

        return [
            'students' => (int) $row->students_count,
            'billed' => $billed,
            'paid' => $paid,
            'balance' => round($billed - $paid, 2),
        ];
    }

    private function collectionQuery(int $schoolId, ?int $academicYearId, ?int $classId, ?int $sectionId, string $method, string $fromDate, string $toDate, string $search): EloquentBuilder
    {
        return Payment::query()
            ->where('payments.status', Payment::STATUS_COMPLETED)
            ->whereBetween('payments.paid_at', [Carbon::parse($fromDate)->startOfDay(), Carbon::parse($toDate)->endOfDay()])
            ->when($method !== '', fn (EloquentBuilder $q) => $q->where('payments.payment_method', $method))
            ->whereHas('invoice', function (EloquentBuilder $invoice) use ($schoolId, $academicYearId, $classId, $sectionId): void {
                $invoice->whereHas('student', function (EloquentBuilder $student) use ($schoolId, $classId, $sectionId): void {
                    $student->where('students.school_id', $schoolId);

                    if ($classId) {
                        $student->whereHas('section', fn (EloquentBuilder $section) => $section->where('sections.class_id', $classId));
                    }

                    if ($sectionId) {
                        $student->where('students.section_id', $sectionId);
                    }
                });

                if ($academicYearId) {
                    $invoice->where('invoices.academic_year_id', $academicYearId);
                }
            })
            ->when($search !== '', function (EloquentBuilder $q) use ($search): void {
                $q->where(function (EloquentBuilder $w) use ($search): void {
                    $w->whereHas('invoice', fn (EloquentBuilder $i) => $i->where('invoices.invoice_number', 'like', "%{$search}%"))
                        ->orWhereHas('invoice.student', fn (EloquentBuilder $s) => $s->where('students.name', 'like', "%{$search}%")
                            ->orWhere('students.admission_number', 'like', "%{$search}%"));
                });
            });
    }

    /**
     * @return array{by_method: array<int, array{method: string, count: int, total: float}>, total: float, count: int}
     */
    private function collectionSummary(int $schoolId, ?int $academicYearId, ?int $classId, ?int $sectionId, string $method, string $fromDate, string $toDate, string $search): array
    {
        $rows = $this->collectionQuery($schoolId, $academicYearId, $classId, $sectionId, $method, $fromDate, $toDate, $search)
            ->selectRaw('payments.payment_method, COUNT(*) as payments_count, COALESCE(SUM(payments.amount), 0) as total')
            ->groupBy('payments.payment_method')
            ->orderBy('payments.payment_method')
            ->get();

        return [
            'by_method' => $rows->map(fn ($row): array => [
                'method' => $row->payment_method,
                'count' => (int) $row->payments_count,
                'total' => round((float) $row->total, 2),
            ])->all(),
            'total' => round((float) $rows->sum('total'), 2),
            'count' => (int) $rows->sum('payments_count'),
        ];
    }

    /**
     * @return Collection<int, SchoolClass>
     */
    private function classesForYear(int $schoolId, ?int $academicYearId): Collection
    {
        return SchoolClass::where('school_id', $schoolId)
            ->where('academic_year_id', $academicYearId)
            ->with('sections:id,class_id,name')
            ->orderBy('name')
            ->get(['id', 'name']);
    }
}
