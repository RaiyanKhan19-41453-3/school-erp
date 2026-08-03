<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GradeBand extends Model
{
    protected $fillable = [
        'grading_scale_id',
        'label',
        'min_percentage',
        'max_percentage',
        'grade_point',
        'remarks',
    ];

    protected function casts(): array
    {
        return [
            'min_percentage' => 'decimal:2',
            'max_percentage' => 'decimal:2',
            'grade_point' => 'decimal:2',
        ];
    }

    public function gradingScale(): BelongsTo
    {
        return $this->belongsTo(GradingScale::class);
    }
}
