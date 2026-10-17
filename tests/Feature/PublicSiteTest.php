<?php

use App\Models\Achievement;
use App\Models\ContactMessage;
use App\Models\Event;
use App\Models\GalleryItem;
use App\Models\Notice;
use App\Models\School;
use App\Models\SchoolProfile;

function publicSiteSchool(): School
{
    $school = School::create([
        'name' => 'Test Ideal School',
        'address' => '12 Test Road, Dhaka',
        'phone' => '+880-2-0000000',
        'email' => 'hello@test-school.test',
    ]);

    SchoolProfile::create([
        'school_id' => $school->id,
        'tagline' => 'Learn · Lead',
        'hero_title' => 'Welcome to Test Ideal School',
        'hero_subtitle' => 'A place to grow.',
        'about' => 'A school about text.',
        'history' => 'A school history text.',
        'mission' => 'Our mission statement.',
        'vision' => 'Our vision statement.',
        'principal_name' => 'Test Principal',
        'principal_message' => 'Welcome message.',
        'admission_info' => 'Admission info text.',
        'admission_requirements' => ['Birth certificate', 'Photographs'],
        'admission_steps' => ['Submit form', 'Attend interview'],
        'stats' => ['students' => '500+', 'teachers' => '30+', 'years' => '10+', 'pass_rate' => '97%'],
    ]);

    return $school;
}

function publicSiteNotice(School $school, array $overrides = []): Notice
{
    return Notice::create(array_merge([
        'school_id' => $school->id,
        'title' => 'Published notice',
        'body' => 'Body text.',
        'category' => Notice::CATEGORY_GENERAL,
        'is_published' => true,
        'published_at' => now()->subDay(),
    ], $overrides));
}

test('home page renders school info and published highlights', function () {
    $school = publicSiteSchool();
    publicSiteNotice($school, ['title' => 'Visible notice']);
    publicSiteNotice($school, ['title' => 'Hidden draft', 'is_published' => false]);
    Event::create([
        'school_id' => $school->id,
        'title' => 'Upcoming fair',
        'starts_at' => now()->addDays(3),
        'is_published' => true,
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/home')
            ->where('site.name', 'Test Ideal School')
            ->where('site.tagline', 'Learn · Lead')
            ->where('stats.students', '500+')
            ->where('notices', fn ($notices) => collect($notices)->pluck('title')->all() === ['Visible notice'])
            ->where('events', fn ($events) => collect($events)->pluck('title')->all() === ['Upcoming fair']));
});

test('unpublished expired and future notices are hidden from the board', function () {
    $school = publicSiteSchool();
    publicSiteNotice($school, ['title' => 'Normal notice']);
    publicSiteNotice($school, ['title' => 'Draft notice', 'is_published' => false]);
    publicSiteNotice($school, ['title' => 'Expired notice', 'expires_at' => now()->subDay()]);
    publicSiteNotice($school, ['title' => 'Future notice', 'published_at' => now()->addWeek()]);

    $this->get(route('site.notices'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/notices')
            ->where('notices.data', fn ($rows) => collect($rows)->pluck('title')->all() === ['Normal notice']));
});

test('notice detail is visible only when published and within schedule', function () {
    $school = publicSiteSchool();
    $notice = publicSiteNotice($school);

    $this->get(route('site.notices.show', $notice->id))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/notice')
            ->where('notice.title', 'Published notice'));

    $draft = publicSiteNotice($school, ['title' => 'Draft', 'is_published' => false]);
    $this->get(route('site.notices.show', $draft->id))->assertNotFound();

    $expired = publicSiteNotice($school, ['title' => 'Expired', 'expires_at' => now()->subDay()]);
    $this->get(route('site.notices.show', $expired->id))->assertNotFound();
});

test('notice board can be filtered by category and searched', function () {
    $school = publicSiteSchool();
    publicSiteNotice($school, ['title' => 'Exam routine published', 'category' => Notice::CATEGORY_EXAM]);
    publicSiteNotice($school, ['title' => 'Holiday announcement', 'category' => Notice::CATEGORY_HOLIDAY]);

    $this->get(route('site.notices', ['category' => 'exam']))
        ->assertInertia(fn ($page) => $page
            ->where('notices.data', fn ($rows) => collect($rows)->pluck('title')->all() === ['Exam routine published']));

    $this->get(route('site.notices', ['search' => 'Holiday']))
        ->assertInertia(fn ($page) => $page
            ->where('notices.data', fn ($rows) => collect($rows)->pluck('title')->all() === ['Holiday announcement']));

    $this->get(route('site.notices', ['category' => 'bogus']))
        ->assertInertia(fn ($page) => $page->where('filters.category', null));
});

test('events page separates upcoming and past events', function () {
    $school = publicSiteSchool();

    Event::create(['school_id' => $school->id, 'title' => 'Upcoming day', 'starts_at' => now()->addDays(3), 'is_published' => true]);
    Event::create(['school_id' => $school->id, 'title' => 'Past day', 'starts_at' => now()->subDays(3), 'is_published' => true]);
    Event::create(['school_id' => $school->id, 'title' => 'Draft day', 'starts_at' => now()->addDays(5), 'is_published' => false]);

    $this->get(route('site.events'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/events')
            ->where('upcoming', fn ($rows) => collect($rows)->pluck('title')->all() === ['Upcoming day'])
            ->where('past', fn ($rows) => collect($rows)->pluck('title')->all() === ['Past day']));
});

test('gallery shows published images and filters by album', function () {
    $school = publicSiteSchool();

    GalleryItem::create(['school_id' => $school->id, 'title' => 'Campus photo', 'album' => 'Campus', 'image_path' => 'site/gallery/a.svg', 'is_published' => true]);
    GalleryItem::create(['school_id' => $school->id, 'title' => 'Sports photo', 'album' => 'Sports', 'image_path' => 'site/gallery/b.svg', 'is_published' => true]);
    GalleryItem::create(['school_id' => $school->id, 'title' => 'Hidden photo', 'album' => 'Campus', 'image_path' => 'site/gallery/c.svg', 'is_published' => false]);

    $this->get(route('site.gallery'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/gallery')
            ->where('items', fn ($rows) => collect($rows)->pluck('title')->sort()->values()->all() === ['Campus photo', 'Sports photo'])
            ->where('albums', fn ($albums) => collect($albums)->sort()->values()->all() === ['Campus', 'Sports']));

    $this->get(route('site.gallery', ['album' => 'Sports']))
        ->assertInertia(fn ($page) => $page
            ->where('items', fn ($rows) => collect($rows)->pluck('title')->all() === ['Sports photo']));
});

test('achievements page lists published achievements only', function () {
    $school = publicSiteSchool();

    Achievement::create(['school_id' => $school->id, 'title' => 'Medal winner', 'category' => 'olympiad', 'is_featured' => true, 'is_published' => true, 'achieved_on' => now()->subDays(3)]);
    Achievement::create(['school_id' => $school->id, 'title' => 'Draft achievement', 'category' => 'sports', 'is_published' => false]);

    $this->get(route('site.achievements'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/achievements')
            ->where('featured', fn ($rows) => collect($rows)->pluck('title')->all() === ['Medal winner'])
            ->where('achievements', fn ($rows) => collect($rows)->pluck('title')->all() === ['Medal winner']));
});

test('about and admission pages expose profile content', function () {
    publicSiteSchool();

    $this->get(route('site.about'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/about')
            ->where('profile.mission', 'Our mission statement.')
            ->where('profile.principal_name', 'Test Principal'));

    $this->get(route('site.admission'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/admission')
            ->where('admission.info', 'Admission info text.')
            ->where('admission.requirements', ['Birth certificate', 'Photographs'])
            ->where('admission.steps', ['Submit form', 'Attend interview']));
});

test('public site only shows content of the primary school', function () {
    $school = publicSiteSchool();
    $other = School::create(['name' => 'Second School']);

    publicSiteNotice($school, ['title' => 'Primary notice']);
    publicSiteNotice($other, ['title' => 'Other school notice']);

    $this->get(route('site.notices'))
        ->assertInertia(fn ($page) => $page
            ->where('notices.data', fn ($rows) => collect($rows)->pluck('title')->all() === ['Primary notice']));
});

test('contact form stores a message for the primary school', function () {
    $school = publicSiteSchool();

    $this->post(route('site.contact.store'), [
        'name' => 'Parent One',
        'email' => 'parent@example.com',
        'phone' => '+8801711111111',
        'subject' => 'Admission enquiry',
        'message' => 'Please share the admission details.',
    ])->assertRedirect()->assertSessionHas('success');

    $message = ContactMessage::first();

    expect($message)->not->toBeNull()
        ->and($message->school_id)->toBe($school->id)
        ->and($message->is_read)->toBeFalse();
});

test('contact form validates input and blocks honeypot spam', function () {
    publicSiteSchool();

    $this->post(route('site.contact.store'), ['name' => '', 'email' => 'not-an-email', 'message' => ''])
        ->assertSessionHasErrors(['name', 'email', 'message']);

    $this->post(route('site.contact.store'), [
        'name' => 'Bot',
        'email' => 'bot@example.com',
        'message' => 'spam',
        'website' => 'http://spam.example',
    ])->assertSessionHasErrors('website');

    expect(ContactMessage::count())->toBe(0);
});

test('public pages survive malformed array query parameters', function () {
    $school = publicSiteSchool();
    publicSiteNotice($school);

    $this->get('/notices?search[]=a&category[]=x')->assertOk();
    $this->get('/gallery?album[]=x')->assertOk();
    $this->get('/events?page[]=1')->assertOk();
});

test('visitors can switch the public interface language', function () {
    publicSiteSchool();

    $this->get(route('home'))
        ->assertInertia(fn ($page) => $page->where('siteLocale', 'en'));

    $this->get(route('site.language', 'bn'))->assertRedirect();

    $this->get(route('home'))
        ->assertInertia(fn ($page) => $page->where('siteLocale', 'bn'));

    $this->get(route('site.language', 'en'))->assertRedirect();

    $this->get(route('home'))
        ->assertInertia(fn ($page) => $page->where('siteLocale', 'en'));
});

test('unsupported public interface languages are rejected', function () {
    publicSiteSchool();

    $this->get(route('site.language', 'fr'))->assertNotFound();
});
