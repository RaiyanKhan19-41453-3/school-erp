<?php

namespace App\Jobs;

use App\Models\AcademicYear;
use App\Models\FeeStructure;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\SchoolClass;
use App\Models\Student;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class GenerateInvoicesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 600;

    public function __construct(
        public int $schoolId,
        public int $classId,
        public int $academicYearId,
    ) {}

    public function handle(): void
    {
        $class = SchoolClass::with('sections')->findOrFail($this->classId);
        $academicYear = AcademicYear::findOrFail($this->academicYearId);

        $structures = FeeStructure::with('feeCategory')
            ->where('school_id', $this->schoolId)
            ->where('academic_year_id', $this->academicYearId)
            ->where('class_id', $this->classId)
            ->get();

        if ($structures->isEmpty()) {
            return;
        }

        $sectionIds = $class->sections->pluck('id');

        $students = Student::where('school_id', $this->schoolId)
            ->whereIn('section_id', $sectionIds)
            ->where('status', 'active')
            ->orderBy('id')
            ->get();

        $period = $academicYear->name;
        $dueDate = $this->resolveDueDate($structures);

        DB::transaction(function () use ($students, $structures, $academicYear, $period, $dueDate) {
            foreach ($students as $student) {
                $alreadyGenerated = Invoice::where('student_id', $student->id)
                    ->where('academic_year_id', $academicYear->id)
                    ->where('period', $period)
                    ->exists();

                if ($alreadyGenerated) {
                    continue;
                }

                $total = $structures->sum(fn (FeeStructure $structure) => (float) $structure->amount);

                $invoice = Invoice::create([
                    'student_id' => $student->id,
                    'academic_year_id' => $academicYear->id,
                    'invoice_number' => $this->nextInvoiceNumber(),
                    'period' => $period,
                    'due_date' => $dueDate,
                    'total_amount' => $total,
                    'status' => Invoice::STATUS_UNPAID,
                ]);

                foreach ($structures as $structure) {
                    InvoiceItem::create([
                        'invoice_id' => $invoice->id,
                        'fee_structure_id' => $structure->id,
                        'description' => $structure->feeCategory->name,
                        'amount' => $structure->amount,
                    ]);
                }
            }
        });
    }

    private function nextInvoiceNumber(): string
    {
        $prefix = 'INV-'.now()->year.'-';
        $max = Invoice::where('invoice_number', 'like', $prefix.'%')->max('invoice_number');

        $next = $max ? ((int) substr($max, strrpos($max, '-') + 1)) + 1 : 1;

        return $prefix.str_pad((string) $next, 5, '0', STR_PAD_LEFT);
    }

    private function resolveDueDate(iterable $structures): string
    {
        $dueDay = collect($structures)->pluck('due_day')->filter()->min() ?? 10;

        $date = Carbon::today()->startOfMonth()->addDays(max(0, $dueDay - 1));

        if ($date->lt(Carbon::today())) {
            $date->addMonth();
        }

        return $date->toDateString();
    }
}
