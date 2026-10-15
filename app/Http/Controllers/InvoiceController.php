<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesAcademicYear;
use App\Http\Requests\GenerateInvoicesRequest;
use App\Http\Requests\StorePaymentRequest;
use App\Jobs\GenerateInvoicesJob;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\SchoolClass;
use App\Models\Student;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    use ResolvesAcademicYear;

    public function index(): Response
    {
        $this->authorize('viewAny', Invoice::class);

        $schoolId = auth()->user()->school_id;
        $academicYearId = $this->selectedAcademicYearId($schoolId);

        $perPage = max(1, min(request()->integer('per_page', 10), 100));
        $page = max(1, request()->integer('page', 1));
        $sort = request()->string('sort', 'created_at')->value();
        $direction = strtolower(request()->string('direction', 'desc')->value());
        $search = request()->string('search')->value();
        $classId = request()->integer('class_id');
        $status = request()->string('status')->value();

        $allowedSorts = ['invoice_number', 'student_name', 'class_name', 'due_date', 'total_amount', 'created_at'];
        if (! in_array($sort, $allowedSorts)) {
            $sort = 'created_at';
        }
        $direction = in_array($direction, ['asc', 'desc']) ? $direction : 'desc';

        $query = Invoice::with(['student.section.class', 'academicYear'])
            ->whereHas('student', fn (Builder $q) => $q->where('school_id', $schoolId));

        if ($academicYearId) {
            $query->where('academic_year_id', $academicYearId);
        }

        if ($search) {
            $query->where(function (Builder $q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                    ->orWhereHas('student', fn (Builder $s) => $s->where('name', 'like', "%{$search}%")
                        ->orWhere('admission_number', 'like', "%{$search}%"));
            });
        }

        if ($classId) {
            $query->whereHas('student.section', fn (Builder $q) => $q->where('class_id', $classId));
        }

        if (in_array($status, Invoice::statuses())) {
            $query->where('status', $status);
        }

        if ($sort === 'student_name') {
            $query->orderBy(
                Student::select('name')
                    ->whereColumn('students.id', 'invoices.student_id')
                    ->limit(1),
                $direction,
            );
        } elseif ($sort === 'class_name') {
            $query->orderBy(
                SchoolClass::select('name')
                    ->join('sections', 'sections.class_id', '=', 'classes.id')
                    ->join('students', 'students.section_id', '=', 'sections.id')
                    ->whereColumn('students.id', 'invoices.student_id')
                    ->limit(1),
                $direction,
            );
        } else {
            $query->orderBy($sort, $direction);
        }

        $invoices = $query->paginate($perPage, ['*'], 'page', $page);

        return Inertia::render('invoices/Index', [
            'invoices' => $invoices,
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
                'per_page' => $perPage,
                'class_id' => $classId,
                'status' => $status ?: null,
                'year_id' => $academicYearId,
            ],
            'academicYears' => $this->academicYears($schoolId),
            'selectedYearIsCurrent' => $this->selectedYearIsCurrent($schoolId, $academicYearId),
            'classes' => SchoolClass::where('school_id', $schoolId)
                ->where('academic_year_id', $academicYearId)
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    public function show(Invoice $invoice): Response
    {
        $this->authorize('view', $invoice);

        $invoice->load(['student.section.class', 'academicYear', 'items.feeStructure.feeCategory', 'payments.recorder']);

        return Inertia::render('invoices/Show', [
            'invoice' => $invoice,
            'balanceDue' => $invoice->balanceDue(),
            'amountPaid' => $invoice->amountPaid(),
            'canRecordPayment' => auth()->user()?->hasAnyRole(['super-admin', 'admin']) ?? false,
        ]);
    }

    public function myInvoices(): Response
    {
        $this->authorize('viewMine', Invoice::class);

        $user = auth()->user();

        if ($user->hasRole('student')) {
            $studentIds = $user->student()->pluck('students.id');
        } else {
            $studentIds = $user->guardian()->first()?->students()->pluck('students.id') ?? collect();
        }

        $invoices = Invoice::with(['student.section.class', 'academicYear', 'payments'])
            ->whereIn('student_id', $studentIds)
            ->orderBy('due_date')
            ->orderBy('id')
            ->get();

        return Inertia::render('invoices/Mine', [
            'invoices' => $invoices,
        ]);
    }

    public function generate(): Response
    {
        $this->authorize('generate', Invoice::class);

        $schoolId = auth()->user()->school_id;
        $academicYearId = $this->selectedAcademicYearId($schoolId);

        $classes = SchoolClass::with('sections')
            ->where('school_id', $schoolId)
            ->where('academic_year_id', $academicYearId)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(function (SchoolClass $class) use ($schoolId) {
                $sectionIds = $class->sections->pluck('id');

                return [
                    'id' => $class->id,
                    'name' => $class->name,
                    'student_count' => Student::where('school_id', $schoolId)
                        ->whereIn('section_id', $sectionIds)
                        ->where('status', 'active')
                        ->count(),
                ];
            });

        return Inertia::render('invoices/Generate', [
            'classes' => $classes,
            'academicYears' => $this->academicYears($schoolId),
            'selectedYearId' => $academicYearId,
            'selectedYearIsCurrent' => $this->selectedYearIsCurrent($schoolId, $academicYearId),
        ]);
    }

    public function store(GenerateInvoicesRequest $request): RedirectResponse
    {
        GenerateInvoicesJob::dispatch($request->user()->school_id, $request->class_id, $request->year_id);

        return back()->with('success', 'Invoice generation has been queued. It will be processed shortly.');
    }

    public function recordPayment(StorePaymentRequest $request, Invoice $invoice): RedirectResponse
    {
        DB::transaction(function () use ($request, $invoice) {
            Payment::create([
                'invoice_id' => $invoice->id,
                'amount' => $request->amount,
                'payment_method' => $request->payment_method,
                'status' => Payment::STATUS_COMPLETED,
                'paid_at' => $request->paid_at ? Carbon::parse($request->paid_at) : now(),
                'recorded_by' => $request->user()->id,
                'remarks' => $request->remarks,
            ]);

            $invoice->recalculateStatus();
        });

        return back()->with('success', 'Payment recorded successfully.');
    }
}
