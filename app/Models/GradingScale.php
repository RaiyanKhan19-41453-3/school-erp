<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GradingScale extends Model
{
    protected $fillable = [
        'school_id',
        'name',
    ];

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function gradeBands(): HasMany
    {
        return $this->hasMany(GradeBand::class)->orderBy('min_percentage');
    }

    public function exams(): HasMany
    {
        return $this->hasMany(Exam::class);
    }
}
