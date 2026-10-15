<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SchoolProfile extends Model
{
    protected $fillable = [
        'school_id',
        'tagline',
        'hero_title',
        'hero_subtitle',
        'about',
        'history',
        'mission',
        'vision',
        'principal_name',
        'principal_message',
        'admission_info',
        'admission_requirements',
        'admission_steps',
        'stats',
        'facebook_url',
        'youtube_url',
    ];

    protected function casts(): array
    {
        return [
            'admission_requirements' => 'array',
            'admission_steps' => 'array',
            'stats' => 'array',
        ];
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * @return array<string, string>
     */
    public function statHighlights(): array
    {
        $stats = $this->stats ?? [];
        $highlights = [];

        foreach (['students', 'teachers', 'years', 'pass_rate'] as $key) {
            $value = $stats[$key] ?? null;

            if ($value !== null && $value !== '') {
                $highlights[$key] = (string) $value;
            }
        }

        return $highlights;
    }
}
