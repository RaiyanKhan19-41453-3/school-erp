<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TimetableSlot extends Model
{
    public const DAY_MONDAY = 'monday';

    public const DAY_TUESDAY = 'tuesday';

    public const DAY_WEDNESDAY = 'wednesday';

    public const DAY_THURSDAY = 'thursday';

    public const DAY_FRIDAY = 'friday';

    public const DAY_SATURDAY = 'saturday';

    public const DAY_SUNDAY = 'sunday';

    public static function days(): array
    {
        return [
            self::DAY_MONDAY,
            self::DAY_TUESDAY,
            self::DAY_WEDNESDAY,
            self::DAY_THURSDAY,
            self::DAY_FRIDAY,
            self::DAY_SATURDAY,
            self::DAY_SUNDAY,
        ];
    }

    protected $fillable = [
        'section_id',
        'academic_year_id',
        'subject_id',
        'staff_id',
        'period_id',
        'day_of_week',
        'room',
    ];

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class);
    }

    public function period(): BelongsTo
    {
        return $this->belongsTo(Period::class);
    }
}
