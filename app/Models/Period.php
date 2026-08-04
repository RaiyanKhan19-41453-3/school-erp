<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Period extends Model
{
    protected $fillable = [
        'school_id',
        'name',
        'start_time',
        'end_time',
        'sort_order',
        'is_break',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_break' => 'boolean',
        ];
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function timetableSlots(): HasMany
    {
        return $this->hasMany(TimetableSlot::class);
    }
}
