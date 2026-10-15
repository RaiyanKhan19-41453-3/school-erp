<?php

use App\Models\Achievement;
use App\Models\ContactMessage;
use App\Models\Event;
use App\Models\GalleryItem;
use App\Models\Notice;
use App\Models\School;
use App\Models\SchoolProfile;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::create(['name' => 'super-admin', 'guard_name' => 'web']);
    Role::create(['name' => 'admin', 'guard_name' => 'web']);
    Role::create(['name' => 'teacher', 'guard_name' => 'web']);
    Role::create(['name' => 'student', 'guard_name' => 'web']);
    Role::create(['name' => 'parent', 'guard_name' => 'web']);
});

function websiteAdmin(School $school): User
{
    return User::factory()->create(['school_id' => $school->id])->assignRole('admin');
}

test('guests cannot access website management', function () {
    $this->get(route('website.notices.index'))->assertRedirect(route('login'));
    $this->get(route('website.content.edit'))->assertRedirect(route('login'));
    $this->get(route('website.messages.index'))->assertRedirect(route('login'));
});

test('non-admin roles cannot manage website content', function () {
    $school = School::create(['name' => 'Site School']);
    $teacher = User::factory()->create(['school_id' => $school->id])->assignRole('teacher');
    $student = User::factory()->create(['school_id' => $school->id])->assignRole('student');

    $this->actingAs($teacher)->get(route('website.notices.index'))->assertForbidden();
    $this->actingAs($teacher)->get(route('website.gallery-items.index'))->assertForbidden();
    $this->actingAs($teacher)->get(route('website.messages.index'))->assertForbidden();
    $this->actingAs($teacher)->get(route('website.content.edit'))->assertForbidden();
    $this->actingAs($student)->get(route('website.events.index'))->assertForbidden();
});

test('website management pages render for admins', function () {
    $school = School::create(['name' => 'Site School']);
    $admin = websiteAdmin($school);

    $pages = [
        'website.notices.index' => 'website/notices/Index',
        'website.events.index' => 'website/events/Index',
        'website.achievements.index' => 'website/achievements/Index',
        'website.gallery-items.index' => 'website/gallery/Index',
        'website.content.edit' => 'website/content/Edit',
        'website.messages.index' => 'website/messages/Index',
    ];

    foreach ($pages as $routeName => $component) {
        $this->actingAs($admin)
            ->get(route($routeName))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component($component));
    }
});

test('admin can create update and delete a notice', function () {
    $school = School::create(['name' => 'Site School']);
    $admin = websiteAdmin($school);

    $this->actingAs($admin)->post(route('website.notices.store'), [
        'title' => 'Sports day',
        'body' => 'Come one, come all.',
        'category' => 'general',
        'is_published' => true,
    ])->assertRedirect()->assertSessionHas('success');

    $notice = Notice::first();

    expect($notice->title)->toBe('Sports day')
        ->and($notice->is_published)->toBeTrue()
        ->and($notice->published_at)->not->toBeNull()
        ->and($notice->created_by)->toBe($admin->id);

    $this->actingAs($admin)->put(route('website.notices.update', $notice->id), [
        'title' => 'Sports day updated',
        'body' => 'New details.',
        'category' => 'academic',
        'is_published' => true,
    ])->assertRedirect();

    expect($notice->fresh()->title)->toBe('Sports day updated');

    $this->actingAs($admin)->delete(route('website.notices.destroy', $notice->id))->assertRedirect();
    expect(Notice::count())->toBe(0);
});

test('notice creation validates input', function () {
    $school = School::create(['name' => 'Site School']);
    $admin = websiteAdmin($school);

    $this->actingAs($admin)->post(route('website.notices.store'), [
        'title' => '',
        'body' => '',
        'category' => 'bogus',
    ])->assertSessionHasErrors(['title', 'body', 'category']);

    $this->actingAs($admin)->post(route('website.notices.store'), [
        'title' => 'Expiry before publish',
        'body' => 'Body.',
        'category' => 'general',
        'published_at' => '2026-05-10',
        'expires_at' => '2026-05-01',
    ])->assertSessionHasErrors('expires_at');
});

test('admin can manage events with image uploads', function () {
    Storage::fake('public');

    $school = School::create(['name' => 'Site School']);
    $admin = websiteAdmin($school);

    $this->actingAs($admin)->post(route('website.events.store'), [
        'title' => 'Science fair',
        'starts_at' => now()->addDays(5)->format('Y-m-d H:i:s'),
        'ends_at' => now()->addDays(5)->addHours(4)->format('Y-m-d H:i:s'),
        'location' => 'Auditorium',
        'is_published' => true,
        'image' => UploadedFile::fake()->image('fair.jpg'),
    ])->assertRedirect();

    $event = Event::first();
    expect($event)->not->toBeNull()
        ->and($event->image_path)->not->toBeNull();

    Storage::disk('public')->assertExists($event->image_path);
    $firstPath = $event->image_path;

    $this->actingAs($admin)->post(route('website.events.update', $event->id), [
        '_method' => 'put',
        'title' => 'Science fair 2026',
        'starts_at' => now()->addDays(6)->format('Y-m-d H:i:s'),
        'is_published' => true,
        'image' => UploadedFile::fake()->image('fair-new.jpg'),
    ])->assertRedirect();

    $event->refresh();

    expect($event->title)->toBe('Science fair 2026')
        ->and($event->image_path)->not->toBe($firstPath);

    Storage::disk('public')->assertMissing($firstPath);
    Storage::disk('public')->assertExists($event->image_path);

    $this->actingAs($admin)->delete(route('website.events.destroy', $event->id))->assertRedirect();

    expect(Event::count())->toBe(0);
    Storage::disk('public')->assertMissing($event->image_path);
});

test('gallery item requires an image and replaces files on update', function () {
    Storage::fake('public');

    $school = School::create(['name' => 'Site School']);
    $admin = websiteAdmin($school);

    $this->actingAs($admin)->post(route('website.gallery-items.store'), [
        'album' => 'Campus',
        'is_published' => true,
    ])->assertSessionHasErrors('image');

    $this->actingAs($admin)->post(route('website.gallery-items.store'), [
        'title' => 'Main gate',
        'album' => 'Campus',
        'is_published' => true,
        'image' => UploadedFile::fake()->image('gate.jpg'),
    ])->assertRedirect();

    $item = GalleryItem::first();
    expect($item)->not->toBeNull()->and($item->image_path)->not->toBeNull();

    Storage::disk('public')->assertExists($item->image_path);

    $this->actingAs($admin)->delete(route('website.gallery-items.destroy', $item->id))->assertRedirect();

    expect(GalleryItem::count())->toBe(0);
    Storage::disk('public')->assertMissing($item->image_path);
});

test('admin can manage achievements', function () {
    $school = School::create(['name' => 'Site School']);
    $admin = websiteAdmin($school);

    $this->actingAs($admin)->post(route('website.achievements.store'), [
        'title' => 'Olympiad gold',
        'student_name' => 'Nusrat Jahan',
        'category' => 'olympiad',
        'achieved_on' => now()->subDays(2)->toDateString(),
        'is_featured' => true,
        'is_published' => true,
    ])->assertRedirect();

    $achievement = Achievement::first();
    expect($achievement->is_featured)->toBeTrue();

    $this->actingAs($admin)->put(route('website.achievements.update', $achievement->id), [
        'title' => 'Olympiad gold medal',
        'category' => 'olympiad',
        'is_published' => false,
    ])->assertRedirect();

    expect($achievement->fresh()->title)->toBe('Olympiad gold medal')
        ->and($achievement->fresh()->is_published)->toBeFalse();

    $this->actingAs($admin)->delete(route('website.achievements.destroy', $achievement->id))->assertRedirect();
    expect(Achievement::count())->toBe(0);
});

test('admin can update the website content profile', function () {
    $school = School::create(['name' => 'Site School']);
    $admin = websiteAdmin($school);

    $this->actingAs($admin)->get(route('website.content.edit'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('website/content/Edit'));

    $this->actingAs($admin)->put(route('website.content.update'), [
        'tagline' => 'Learn · Lead',
        'hero_title' => 'New hero title',
        'about' => 'New about text.',
        'admission_requirements' => "Birth certificate\nPhotographs\n",
        'admission_steps' => "Submit form\nAttend interview",
        'stats_students' => '900+',
        'stats_pass_rate' => '99%',
        'facebook_url' => 'https://facebook.com/test',
    ])->assertRedirect()->assertSessionHas('success');

    $profile = SchoolProfile::where('school_id', $school->id)->first();

    expect($profile->hero_title)->toBe('New hero title')
        ->and($profile->admission_requirements)->toBe(['Birth certificate', 'Photographs'])
        ->and($profile->admission_steps)->toBe(['Submit form', 'Attend interview'])
        ->and($profile->stats)->toBe(['students' => '900+', 'pass_rate' => '99%'])
        ->and($profile->facebook_url)->toBe('https://facebook.com/test');
});

test('admin can read and delete contact messages', function () {
    $school = School::create(['name' => 'Site School']);
    $admin = websiteAdmin($school);

    $message = ContactMessage::create([
        'school_id' => $school->id,
        'name' => 'Parent One',
        'email' => 'parent@example.com',
        'subject' => 'Admission',
        'message' => 'Please share details.',
    ]);

    $this->actingAs($admin)->get(route('website.messages.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('website/messages/Index')
            ->where('unreadCount', 1));

    $this->actingAs($admin)->put(route('website.messages.update', $message->id))->assertRedirect();
    expect($message->fresh()->is_read)->toBeTrue();

    $this->actingAs($admin)->delete(route('website.messages.destroy', $message->id))->assertRedirect();
    expect(ContactMessage::count())->toBe(0);
});

test('admin cannot modify another school website records', function () {
    $schoolA = School::create(['name' => 'School A']);
    $schoolB = School::create(['name' => 'School B']);
    $adminA = websiteAdmin($schoolA);

    $notice = Notice::create([
        'school_id' => $schoolB->id,
        'title' => 'School B notice',
        'body' => 'Body.',
        'category' => 'general',
        'is_published' => true,
        'published_at' => now()->subDay(),
    ]);

    $message = ContactMessage::create([
        'school_id' => $schoolB->id,
        'name' => 'Someone',
        'email' => 'someone@example.com',
        'message' => 'Hello.',
    ]);

    $this->actingAs($adminA)->put(route('website.notices.update', $notice->id), [
        'title' => 'Hacked',
        'body' => 'Hacked.',
        'category' => 'general',
    ])->assertForbidden();

    $this->actingAs($adminA)->delete(route('website.notices.destroy', $notice->id))->assertForbidden();
    $this->actingAs($adminA)->put(route('website.messages.update', $message->id))->assertForbidden();
    $this->actingAs($adminA)->delete(route('website.messages.destroy', $message->id))->assertForbidden();

    expect($notice->fresh()->title)->toBe('School B notice')
        ->and($message->fresh()->is_read)->toBeFalse();
});

test('website management lists survive malformed array query parameters', function () {
    $school = School::create(['name' => 'Site School']);
    $admin = websiteAdmin($school);

    $this->actingAs($admin)
        ->get(route('website.notices.index', ['search' => ['a'], 'sort' => ['title'], 'direction' => ['asc']]))
        ->assertOk();

    $this->actingAs($admin)
        ->get(route('website.gallery-items.index', ['search' => ['a'], 'album' => ['x']]))
        ->assertOk();

    $this->actingAs($admin)
        ->get(route('website.messages.index', ['search' => ['a']]))
        ->assertOk();
});
