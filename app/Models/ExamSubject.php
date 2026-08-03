<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamSubject extends Model
{
    protected $fillable = [
        'exam_id',
        'subject_id',
        'full_marks',
        'pass_marks',
        'exam_date',
    ];

    protected function casts(): array
    {
        return [
            'full_marks' => 'decimal:2',
            'pass_marks' => 'decimal:2',
            'exam_date' => 'date',
        ];
    }

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function marks(): HasMany
    {
        return $this->hasMany(Mark::class);
    }
}
