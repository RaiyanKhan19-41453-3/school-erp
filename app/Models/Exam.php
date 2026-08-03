<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;

class Exam extends Model
{
    protected $fillable = [
        'school_id',
        'academic_year_id',
        'class_id',
        'name',
        'grading_scale_id',
        'start_date',
        'end_date',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function class(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class);
    }

    public function gradingScale(): BelongsTo
    {
        return $this->belongsTo(GradingScale::class);
    }

    public function examSubjects(): HasMany
    {
        return $this->hasMany(ExamSubject::class)->orderBy('exam_date')->orderBy('id');
    }

    protected function getClassSubjectsAttribute(): Collection
    {
        return $this->class?->subjects ?? collect();
    }
}
