<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notice extends Model
{
    public const CATEGORY_GENERAL = 'general';

    public const CATEGORY_URGENT = 'urgent';

    public const CATEGORY_ACADEMIC = 'academic';

    public const CATEGORY_HOLIDAY = 'holiday';

    public const CATEGORY_EXAM = 'exam';

    public static function categories(): array
    {
        return [
            self::CATEGORY_GENERAL,
            self::CATEGORY_URGENT,
            self::CATEGORY_ACADEMIC,
            self::CATEGORY_HOLIDAY,
            self::CATEGORY_EXAM,
        ];
    }

    protected $fillable = [
        'school_id',
        'title',
        'body',
        'category',
        'is_published',
        'published_at',
        'expires_at',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'published_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query
            ->where('is_published', true)
            ->where(fn (Builder $q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()))
            ->where(fn (Builder $q) => $q->whereNull('expires_at')->orWhere('expires_at', '>=', now()));
    }
}
