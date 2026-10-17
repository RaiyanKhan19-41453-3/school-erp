<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactMessageRequest;
use App\Models\Achievement;
use App\Models\ContactMessage;
use App\Models\Event;
use App\Models\GalleryItem;
use App\Models\Notice;
use App\Models\School;
use App\Models\SchoolProfile;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PublicSiteController extends Controller
{
    public function home(): Response
    {
        $school = $this->school();
        $profile = $this->profile($school);

        return Inertia::render('public/home', [
            'site' => $this->siteData($school, $profile),
            'stats' => $profile?->statHighlights(),
            'hero' => [
                'title' => $profile?->hero_title,
                'subtitle' => $profile?->hero_subtitle,
            ],
            'aboutExcerpt' => $profile?->about ? str($profile->about)->limit(360)->value() : null,
            'notices' => $this->noticesQuery($school)
                ->orderByDesc('published_at')
                ->take(3)
                ->get(),
            'events' => $this->eventsQuery($school)
                ->where('starts_at', '>=', now())
                ->orderBy('starts_at')
                ->take(3)
                ->get(),
            'achievements' => $this->achievementsQuery($school)
                ->orderByDesc('is_featured')
                ->orderByDesc('achieved_on')
                ->take(3)
                ->get(),
            'gallery' => $this->galleryQuery($school)
                ->orderBy('sort_order')
                ->orderByDesc('id')
                ->take(6)
                ->get(),
            'principal' => [
                'name' => $profile?->principal_name,
                'message' => $profile?->principal_message ? str($profile->principal_message)->limit(260) : null,
            ],
        ]);
    }

    public function language(string $lang): RedirectResponse
    {
        abort_unless(in_array($lang, ['en', 'bn'], true), 404);

        session(['public_locale' => $lang]);

        return redirect()->back(fallback: route('home'));
    }

    public function about(): Response
    {
        $school = $this->school();
        $profile = $this->profile($school);

        return Inertia::render('public/about', [
            'site' => $this->siteData($school, $profile),
            'stats' => $profile?->statHighlights(),
            'profile' => [
                'about' => $profile?->about,
                'history' => $profile?->history,
                'mission' => $profile?->mission,
                'vision' => $profile?->vision,
                'principal_name' => $profile?->principal_name,
                'principal_message' => $profile?->principal_message,
            ],
        ]);
    }

    public function notices(): Response
    {
        $school = $this->school();

        $category = $this->queryString('category');
        $search = $this->queryString('search');

        if (! in_array($category, Notice::categories(), true)) {
            $category = null;
        }

        $notices = $this->noticesQuery($school)
            ->when($category, fn ($query) => $query->where('category', $category))
            ->when($search, fn ($query) => $query->where('title', 'like', "%{$search}%"))
            ->orderByDesc('published_at')
            ->paginate(9)
            ->withQueryString();

        return Inertia::render('public/notices', [
            'site' => $this->siteData($school, $this->profile($school)),
            'notices' => $notices,
            'categories' => Notice::categories(),
            'filters' => [
                'category' => $category,
                'search' => $search,
            ],
        ]);
    }

    public function notice(Notice $notice): Response
    {
        $school = $this->school();

        abort_unless($school && $notice->school_id === $school->id, 404);
        abort_unless($notice->is_published, 404);
        abort_if($notice->published_at && $notice->published_at->isFuture(), 404);
        abort_if($notice->expires_at && $notice->expires_at->isPast(), 404);

        return Inertia::render('public/notice', [
            'site' => $this->siteData($school, $this->profile($school)),
            'notice' => [
                'id' => $notice->id,
                'title' => $notice->title,
                'body' => $notice->body,
                'category' => $notice->category,
                'published_at' => $notice->published_at,
            ],
            'recent' => $this->noticesQuery($school)
                ->whereKeyNot($notice->id)
                ->orderByDesc('published_at')
                ->take(5)
                ->get(['id', 'title', 'category', 'published_at']),
            'events' => $this->eventsQuery($school)
                ->where('starts_at', '>=', now())
                ->orderBy('starts_at')
                ->take(3)
                ->get(['id', 'title', 'starts_at', 'location']),
        ]);
    }

    public function events(): Response
    {
        $school = $this->school();
        $query = $this->eventsQuery($school);

        return Inertia::render('public/events', [
            'site' => $this->siteData($school, $this->profile($school)),
            'upcoming' => (clone $query)
                ->where('starts_at', '>=', now())
                ->orderBy('starts_at')
                ->take(12)
                ->get(),
            'past' => (clone $query)
                ->where('starts_at', '<', now())
                ->orderByDesc('starts_at')
                ->take(9)
                ->get(),
        ]);
    }

    public function gallery(): Response
    {
        $school = $this->school();

        $album = $this->queryString('album');

        $albums = $this->galleryQuery($school)->select('album')->distinct()->orderBy('album')->pluck('album');

        if (! $albums->contains($album)) {
            $album = null;
        }

        $items = $this->galleryQuery($school)
            ->when($album, fn ($query) => $query->where('album', $album))
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->get();

        return Inertia::render('public/gallery', [
            'site' => $this->siteData($school, $this->profile($school)),
            'items' => $items,
            'albums' => $albums,
            'filters' => ['album' => $album],
        ]);
    }

    public function achievements(): Response
    {
        $school = $this->school();

        return Inertia::render('public/achievements', [
            'site' => $this->siteData($school, $this->profile($school)),
            'featured' => $this->achievementsQuery($school)
                ->where('is_featured', true)
                ->orderByDesc('achieved_on')
                ->take(3)
                ->get(),
            'achievements' => $this->achievementsQuery($school)
                ->orderByDesc('achieved_on')
                ->take(60)
                ->get(),
        ]);
    }

    public function admission(): Response
    {
        $school = $this->school();
        $profile = $this->profile($school);

        return Inertia::render('public/admission', [
            'site' => $this->siteData($school, $profile),
            'admission' => [
                'info' => $profile?->admission_info,
                'requirements' => $profile?->admission_requirements ?? [],
                'steps' => $profile?->admission_steps ?? [],
            ],
        ]);
    }

    public function contact(): Response
    {
        $school = $this->school();

        return Inertia::render('public/contact', [
            'site' => $this->siteData($school, $this->profile($school)),
        ]);
    }

    public function submitContact(StoreContactMessageRequest $request): RedirectResponse
    {
        $school = $this->school();

        abort_unless($school, 404);

        ContactMessage::create([
            ...$request->safe()->except('website'),
            'school_id' => $school->id,
        ]);

        return back()->with('success', 'Thank you! Your message has been sent. We will get back to you soon.');
    }

    private function school(): ?School
    {
        return School::query()->oldest('id')->first();
    }

    private function profile(?School $school): ?SchoolProfile
    {
        return $school?->profile;
    }

    /**
     * @return array<string, mixed>
     */
    private function siteData(?School $school, ?SchoolProfile $profile): array
    {
        return [
            'name' => $school?->name ?? config('app.name'),
            'tagline' => $profile?->tagline,
            'address' => $school?->address,
            'phone' => $school?->phone,
            'email' => $school?->email,
            'facebook_url' => $profile?->facebook_url,
            'youtube_url' => $profile?->youtube_url,
        ];
    }

    /**
     * @return Builder<Notice>
     */
    private function noticesQuery(?School $school)
    {
        return Notice::query()->where('school_id', $school?->id)->published();
    }

    /**
     * @return Builder<Event>
     */
    private function eventsQuery(?School $school)
    {
        return Event::query()->where('school_id', $school?->id)->published();
    }

    /**
     * @return Builder<GalleryItem>
     */
    private function galleryQuery(?School $school)
    {
        return GalleryItem::query()->where('school_id', $school?->id)->published();
    }

    /**
     * @return Builder<Achievement>
     */
    private function achievementsQuery(?School $school)
    {
        return Achievement::query()->where('school_id', $school?->id)->published();
    }
}
