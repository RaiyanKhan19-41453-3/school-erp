<?php

namespace App\Http\Requests;

use App\Models\School;
use App\Models\SchoolProfile;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSchoolProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        $school = $this->user()->school_id
            ? School::find($this->user()->school_id)
            : School::query()->oldest('id')->first();

        if (! $school) {
            return false;
        }

        return $this->user()->can('update', SchoolProfile::firstOrCreate(['school_id' => $school->id]));
    }

    public function rules(): array
    {
        return [
            'tagline' => ['nullable', 'string', 'max:255'],
            'hero_title' => ['nullable', 'string', 'max:255'],
            'hero_subtitle' => ['nullable', 'string', 'max:500'],
            'about' => ['nullable', 'string', 'max:20000'],
            'history' => ['nullable', 'string', 'max:20000'],
            'mission' => ['nullable', 'string', 'max:20000'],
            'vision' => ['nullable', 'string', 'max:20000'],
            'principal_name' => ['nullable', 'string', 'max:255'],
            'principal_message' => ['nullable', 'string', 'max:20000'],
            'admission_info' => ['nullable', 'string', 'max:20000'],
            'admission_requirements' => ['nullable', 'string', 'max:5000'],
            'admission_steps' => ['nullable', 'string', 'max:5000'],
            'stats_students' => ['nullable', 'string', 'max:30'],
            'stats_teachers' => ['nullable', 'string', 'max:30'],
            'stats_years' => ['nullable', 'string', 'max:30'],
            'stats_pass_rate' => ['nullable', 'string', 'max:30'],
            'facebook_url' => ['nullable', 'url', 'max:255'],
            'youtube_url' => ['nullable', 'url', 'max:255'],
        ];
    }
}
