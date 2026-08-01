<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class Invoice extends Model
{
    public const STATUS_UNPAID = 'unpaid';

    public const STATUS_PARTIAL = 'partial';

    public const STATUS_PAID = 'paid';

    public const STATUS_OVERDUE = 'overdue';

    public static function statuses(): array
    {
        return [
            self::STATUS_UNPAID,
            self::STATUS_PARTIAL,
            self::STATUS_PAID,
            self::STATUS_OVERDUE,
        ];
    }

    protected $fillable = [
        'student_id',
        'academic_year_id',
        'invoice_number',
        'period',
        'due_date',
        'total_amount',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'total_amount' => 'decimal:2',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function amountPaid(): string
    {
        $amount = $this->payments()
            ->where('status', Payment::STATUS_COMPLETED)
            ->sum('amount');

        return number_format((float) $amount, 2, '.', '');
    }

    public function balanceDue(): string
    {
        return number_format((float) $this->total_amount - (float) $this->amountPaid(), 2, '.', '');
    }

    public function recalculateStatus(): void
    {
        $amountPaid = (float) $this->amountPaid();
        $total = (float) $this->total_amount;

        $status = match (true) {
            $amountPaid >= $total && $total > 0 => self::STATUS_PAID,
            $amountPaid > 0 => self::STATUS_PARTIAL,
            $this->due_date?->lt(Carbon::today()) => self::STATUS_OVERDUE,
            default => self::STATUS_UNPAID,
        };

        if ($this->status !== $status) {
            $this->update(['status' => $status]);
        }
    }
}
