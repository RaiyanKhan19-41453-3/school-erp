<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateSchoolProfileRequest;
use App\Models\School;
use App\Models\SchoolProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SchoolProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $school = $this->resolveSchool($request);
        $profile = SchoolProfile::firstOrCreate(['school_id' => $school->id]);

        $this->authorize('update', $profile);

        return Inertia::render('website/content/Edit', [
            'profile' => [
                'tagline' => $profile->tagline,
                'hero_title' => $profile->hero_title,
                'hero_subtitle' => $profile->hero_subtitle,
                'about' => $profile->about,
                'history' => $profile->history,
                'mission' => $profile->mission,
                'vision' => $profile->vision,
                'principal_name' => $profile->principal_name,
                'principal_message' => $profile->principal_message,
                'admission_info' => $profile->admission_info,
                'admission_requirements' => implode("\n", $profile->admission_requirements ?? []),
                'admission_steps' => implode("\n", $profile->admission_steps ?? []),
                'stats_students' => $profile->stats['students'] ?? '',
                'stats_teachers' => $profile->stats['teachers'] ?? '',
                'stats_years' => $profile->stats['years'] ?? '',
                'stats_pass_rate' => $profile->stats['pass_rate'] ?? '',
                'facebook_url' => $profile->facebook_url,
                'youtube_url' => $profile->youtube_url,
            ],
        ]);
    }

    public function update(UpdateSchoolProfileRequest $request): RedirectResponse
    {
        $school = $this->resolveSchool($request);
        $profile = SchoolProfile::firstOrCreate(['school_id' => $school->id]);

        $this->authorize('update', $profile);

        $data = $request->validated();

        $profile->update([
            'tagline' => $data['tagline'] ?? null,
            'hero_title' => $data['hero_title'] ?? null,
            'hero_subtitle' => $data['hero_subtitle'] ?? null,
            'about' => $data['about'] ?? null,
            'history' => $data['history'] ?? null,
            'mission' => $data['mission'] ?? null,
            'vision' => $data['vision'] ?? null,
            'principal_name' => $data['principal_name'] ?? null,
            'principal_message' => $data['principal_message'] ?? null,
            'admission_info' => $data['admission_info'] ?? null,
            'admission_requirements' => $this->toLines($data['admission_requirements'] ?? null),
            'admission_steps' => $this->toLines($data['admission_steps'] ?? null),
            'stats' => $this->statsFrom($data),
            'facebook_url' => $data['facebook_url'] ?? null,
            'youtube_url' => $data['youtube_url'] ?? null,
        ]);

        return back()->with('success', 'Website content updated successfully.');
    }

    private function resolveSchool(Request $request): School
    {
        $school = $request->user()->school_id
            ? School::find($request->user()->school_id)
            : School::query()->oldest('id')->first();

        abort_unless($school, 404);

        return $school;
    }

    /**
     * @return array<int, string>
     */
    private function toLines(?string $value): array
    {
        if (! $value) {
            return [];
        }

        return collect(preg_split('/\r\n|\r|\n/', $value))
            ->map(fn ($line) => trim($line))
            ->filter()
            ->values()
            ->all();
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, string>
     */
    private function statsFrom(array $data): array
    {
        $stats = [
            'students' => $data['stats_students'] ?? null,
            'teachers' => $data['stats_teachers'] ?? null,
            'years' => $data['stats_years'] ?? null,
            'pass_rate' => $data['stats_pass_rate'] ?? null,
        ];

        return array_filter($stats, fn ($value) => $value !== null && $value !== '');
    }
}
