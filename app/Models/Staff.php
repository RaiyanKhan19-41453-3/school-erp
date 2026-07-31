<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Staff extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'school_id',
        'employee_id',
        'designation',
        'joining_date',
    ];

    protected function casts(): array
    {
        return [
            'joining_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function sections(): BelongsToMany
    {
        return $this->belongsToMany(Section::class, 'teacher_section')
            ->withPivot('academic_year_id', 'is_class_teacher')
            ->withTimestamps();
    }

    public function assignedSections(int $academicYearId): BelongsToMany
    {
        return $this->sections()
            ->wherePivot('academic_year_id', $academicYearId);
    }
}
