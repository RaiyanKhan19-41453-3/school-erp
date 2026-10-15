<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Achievement extends Model
{
    public const CATEGORY_ACADEMIC = 'academic';

    public const CATEGORY_SPORTS = 'sports';

    public const CATEGORY_CULTURAL = 'cultural';

    public const CATEGORY_OLYMPIAD = 'olympiad';

    public const CATEGORY_OTHER = 'other';

    public static function categories(): array
    {
        return [
            self::CATEGORY_ACADEMIC,
            self::CATEGORY_SPORTS,
            self::CATEGORY_CULTURAL,
            self::CATEGORY_OLYMPIAD,
            self::CATEGORY_OTHER,
        ];
    }

    protected $fillable = [
        'school_id',
        'title',
        'description',
        'student_name',
        'category',
        'achieved_on',
        'is_featured',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'achieved_on' => 'date',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
        ];
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }
}
