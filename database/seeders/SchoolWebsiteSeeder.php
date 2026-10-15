<?php

namespace Database\Seeders;

use App\Models\Achievement;
use App\Models\ContactMessage;
use App\Models\Event;
use App\Models\GalleryItem;
use App\Models\Notice;
use App\Models\School;
use App\Models\SchoolProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

class SchoolWebsiteSeeder extends Seeder
{
    public function run(): void
    {
        $school = School::query()->oldest('id')->first();

        if (! $school) {
            return;
        }

        $admin = User::query()->where('school_id', $school->id)->first();

        $this->seedProfile($school);
        $this->seedNotices($school, $admin);
        $this->seedEvents($school);
        $this->seedAchievements($school);
        $this->seedGallery($school);
        $this->seedMessages($school);
    }

    private function seedProfile(School $school): void
    {
        SchoolProfile::updateOrCreate(
            ['school_id' => $school->id],
            [
                'tagline' => 'Knowledge · Discipline · Character',
                'hero_title' => 'Nurturing Bright Minds for a Brighter Tomorrow',
                'hero_subtitle' => 'A premier institution in the heart of Dhaka, providing quality education from Play Group to Class 10 with an unwavering commitment to academic excellence and moral values.',
                'about' => "Founded in 1998, Dhaka Ideal School & College has grown into one of the capital's most trusted institutions. We combine a rigorous national curriculum with modern teaching methods, co-curricular activities and a culture of care.\n\nOur spacious campus in Dhanmondi houses well-equipped science laboratories, a digital computer lab, a rich library, and dedicated play areas — everything a growing child needs to learn, explore and thrive.",
                'history' => 'What began as a modest primary school with 84 students in a rented building is today a full-fledged institution serving over 1,450 students. Over two and a half decades we have produced thousands of graduates, many of whom now serve the nation as doctors, engineers, teachers and entrepreneurs. Our journey has been guided by one belief — that every child deserves an education that shapes both the mind and the character.',
                'mission' => 'To provide a learner-centered education that develops critical thinking, creativity and compassion, preparing students to excel in national examinations and in life.',
                'vision' => 'To be a model institution for Bangladesh — where academic brilliance, moral integrity and civic responsibility grow together in every student.',
                'principal_name' => 'Prof. Mohammad Rafiqul Islam',
                'principal_message' => 'Dear parents and students, welcome to Dhaka Ideal School & College. For more than 25 years we have shared one mission: to help every child discover their strengths and use them for the good of society. Our teachers are mentors, our classrooms are spaces of curiosity, and our playgrounds are where friendships and sportsmanship are born. I invite you to visit us and become part of our family.',
                'admission_info' => 'Admission is open for the 2026-2027 academic session for Play Group through Class 9. Seats are limited and admission is granted on a first-come, first-served basis after a short interview with the prospective student and parents.',
                'admission_requirements' => [
                    'Photocopy of birth certificate (attested)',
                    'Two passport-size photographs of the student',
                    'Passport-size photograph of father and mother',
                    'Previous school transfer certificate (for Class 2 and above)',
                    'Last examination result card (for Class 2 and above)',
                    'Blood group and immunisation record',
                ],
                'admission_steps' => [
                    'Collect or download the admission form from the school office.',
                    'Submit the completed form with all required documents.',
                    'Attend the friendly interview / assessment with your child.',
                    'Receive the admission confirmation over SMS and phone.',
                    'Complete the payment process and collect the student ID card.',
                ],
                'stats' => [
                    'students' => '1,450+',
                    'teachers' => '75+',
                    'years' => '25+',
                    'pass_rate' => '98%',
                ],
                'facebook_url' => 'https://www.facebook.com/dhakaideal',
                'youtube_url' => 'https://www.youtube.com/@dhakaideal',
            ],
        );
    }

    private function seedNotices(School $school, ?User $admin): void
    {
        $notices = [
            [
                'title' => 'Admission Open for Session 2026-2027',
                'category' => Notice::CATEGORY_URGENT,
                'body' => "Applications are now open for the 2026-2027 academic session for Play Group to Class 9.\n\nPlease collect the admission form from the school office (Room 104) between 9:00 AM and 1:00 PM, Sunday to Thursday. Limited seats are available, so early applications are encouraged.",
                'days_ago' => 2,
            ],
            [
                'title' => 'Annual Sports Day 2026: Schedule Announced',
                'category' => Notice::CATEGORY_GENERAL,
                'body' => "The 27th Annual Sports Day will be held at the school playground. All students must report by 8:30 AM in their sports uniform.\n\nParents are warmly invited to attend and cheer for our young athletes. Refreshments will be available on the ground.",
                'days_ago' => 4,
            ],
            [
                'title' => 'Half-Yearly Examination Routine Published',
                'category' => Notice::CATEGORY_EXAM,
                'body' => 'The half-yearly examination routine for Classes 1-10 is now published. Please check the attached notice board outside the academic office. Examinations begin at 9:00 AM sharp.',
                'days_ago' => 6,
            ],
            [
                'title' => 'International Science Olympiad: Registration Open',
                'category' => Notice::CATEGORY_ACADEMIC,
                'body' => 'Students of Classes 6-10 are invited to register for the International Science Olympiad. The preliminary round will be held in the school auditorium. Register with your class teacher before the deadline.',
                'days_ago' => 8,
            ],
            [
                'title' => 'Parent-Teacher Meeting on 25 October',
                'category' => Notice::CATEGORY_GENERAL,
                'body' => 'Dear parents, the Parent-Teacher Meeting for all classes will be held from 9:00 AM to 1:00 PM. Report cards for the term assessments will be handed over during the meeting. Your presence is highly requested.',
                'days_ago' => 10,
            ],
            [
                'title' => 'Monthly Tuition Fee Payment Reminder',
                'category' => Notice::CATEGORY_GENERAL,
                'body' => 'Please clear the monthly tuition fee within the 10th of every month through bKash, Nagad or the school accounts office to avoid a late fine. Receipts must be retained for verification.',
                'days_ago' => 12,
            ],
            [
                'title' => 'Winter Uniform Notice',
                'category' => Notice::CATEGORY_GENERAL,
                'body' => 'Winter uniforms (blazer/sweater with school monogram) are now available at the school uniform corner. All students must wear the winter uniform from the start of the winter season.',
                'days_ago' => 15,
            ],
            [
                'title' => 'Victory Day Celebration Programme',
                'category' => Notice::CATEGORY_HOLIDAY,
                'body' => 'Our school will observe Victory Day with a special cultural programme at the auditorium at 9:00 AM. A drawing competition on the theme of independence will be held for the junior section.',
                'days_ago' => 18,
            ],
            [
                'title' => 'Class Routine Update for Classes 6-10',
                'category' => Notice::CATEGORY_ACADEMIC,
                'body' => 'Following the science lab upgrade, the class routines of Classes 6-10 have been revised. The updated routine is effective from next week and available at the class notice boards.',
                'days_ago' => 21,
            ],
            [
                'title' => 'Library Orientation for Junior Section',
                'category' => Notice::CATEGORY_ACADEMIC,
                'body' => 'A library orientation programme will be conducted for Classes 1-3 to encourage the habit of reading. Each student will receive a library card during the session.',
                'days_ago' => 25,
            ],
        ];

        foreach ($notices as $notice) {
            Notice::updateOrCreate(
                ['school_id' => $school->id, 'title' => $notice['title']],
                [
                    'body' => $notice['body'],
                    'category' => $notice['category'],
                    'is_published' => true,
                    'published_at' => now()->subDays($notice['days_ago']),
                    'created_by' => $admin?->id,
                ],
            );
        }
    }

    private function seedEvents(School $school): void
    {
        $events = [
            [
                'title' => 'Parent-Teacher Conference',
                'description' => 'Meet the teachers, collect term report cards and discuss your child\'s progress one-on-one.',
                'location' => 'Respective Classrooms',
                'starts_at' => Carbon::today()->addDays(7)->setTime(9, 0),
                'ends_at' => Carbon::today()->addDays(7)->setTime(13, 0),
            ],
            [
                'title' => 'Annual Sports Meet 2026',
                'description' => 'A full day of athletics, relay races, football and the famous house relay final. Parents and alumni are welcome.',
                'location' => 'School Playground',
                'starts_at' => Carbon::today()->addDays(14)->setTime(8, 30),
                'ends_at' => Carbon::today()->addDays(14)->setTime(15, 0),
            ],
            [
                'title' => 'Science & Robotics Fair',
                'description' => 'Student-built robots, science projects and interactive experiments from every class. Open to the public in the afternoon.',
                'location' => 'School Auditorium',
                'starts_at' => Carbon::today()->addDays(21)->setTime(10, 0),
                'ends_at' => Carbon::today()->addDays(21)->setTime(16, 0),
            ],
            [
                'title' => 'Inter-School Quiz Championship',
                'description' => 'Sixteen schools from across Dhaka battled it out in our annual quiz championship. Team DISC lifted the trophy in a nail-biting final round.',
                'location' => 'School Auditorium',
                'starts_at' => Carbon::today()->subDays(10)->setTime(10, 0),
            ],
            [
                'title' => 'Pohela Boishakh Celebration',
                'description' => 'Mangal Shobhajatra, folk music and traditional pitha — our campus welcomed the new Bangla year with colour and joy.',
                'location' => 'School Campus',
                'starts_at' => Carbon::today()->subDays(32)->setTime(8, 0),
            ],
            [
                'title' => 'Art & Craft Exhibition',
                'description' => 'Nine hundred pieces of student artwork filled the gallery hall for three days. Parents purchased student artwork to support the art fund.',
                'location' => 'Gallery Hall',
                'starts_at' => Carbon::today()->subDays(45)->setTime(11, 0),
            ],
        ];

        foreach ($events as $event) {
            Event::updateOrCreate(
                ['school_id' => $school->id, 'title' => $event['title']],
                [
                    'description' => $event['description'],
                    'location' => $event['location'],
                    'starts_at' => $event['starts_at'],
                    'ends_at' => $event['ends_at'] ?? null,
                    'is_published' => true,
                ],
            );
        }
    }

    private function seedAchievements(School $school): void
    {
        $achievements = [
            [
                'title' => 'Champion — National Science Olympiad 2025',
                'student_name' => 'Nusrat Jahan',
                'category' => Achievement::CATEGORY_OLYMPIAD,
                'description' => 'Nusrat from Class 10 bested 3,200 participants nationwide with a project on low-cost water purification.',
                'days_ago' => 20,
                'is_featured' => true,
            ],
            [
                'title' => 'Gold Medal — Bangladesh Mathematical Olympiad',
                'student_name' => 'Rafiq Uddin',
                'category' => Achievement::CATEGORY_ACADEMIC,
                'description' => 'Rafiq solved all problems in the regional round to win gold in the junior category.',
                'days_ago' => 55,
                'is_featured' => true,
            ],
            [
                'title' => '98% Pass Rate in SSC 2025',
                'student_name' => null,
                'category' => Achievement::CATEGORY_ACADEMIC,
                'description' => '412 of our 420 SSC candidates passed, with 78 students achieving GPA 5.0.',
                'days_ago' => 90,
                'is_featured' => true,
            ],
            [
                'title' => 'Champions — Inter-School Cricket Tournament',
                'student_name' => null,
                'category' => Achievement::CATEGORY_SPORTS,
                'description' => 'Our under-16 cricket team remained unbeaten across six matches to lift the Dhanmondi zone trophy.',
                'days_ago' => 40,
                'is_featured' => false,
            ],
            [
                'title' => 'Winner — National Children\'s Art Competition',
                'student_name' => 'Ayesha Khatun',
                'category' => Achievement::CATEGORY_CULTURAL,
                'description' => 'Ayesha (Class 5) won the national round with a watercolour painting of monsoon in old Dhaka.',
                'days_ago' => 70,
                'is_featured' => false,
            ],
            [
                'title' => 'Best Debater — Dhaka Divisional Debate',
                'student_name' => 'Tanvir Hasan',
                'category' => Achievement::CATEGORY_ACADEMIC,
                'description' => 'Tanvir was adjudged best speaker in the English panel of the divisional debate festival.',
                'days_ago' => 100,
                'is_featured' => false,
            ],
            [
                'title' => 'Gold — District Athletics (Long Jump)',
                'student_name' => 'Mominul Haque',
                'category' => Achievement::CATEGORY_SPORTS,
                'description' => 'A leap of 5.42 metres earned Mominul the district gold in the under-16 category.',
                'days_ago' => 120,
                'is_featured' => false,
            ],
            [
                'title' => 'Champion — Inter-School Recitation Festival',
                'student_name' => 'Sumaiya Khatun',
                'category' => Achievement::CATEGORY_CULTURAL,
                'description' => 'Sumaiya won hearts and the first prize with her recitation of a Nazrul poem.',
                'days_ago' => 140,
                'is_featured' => false,
            ],
        ];

        foreach ($achievements as $achievement) {
            Achievement::updateOrCreate(
                ['school_id' => $school->id, 'title' => $achievement['title']],
                [
                    'description' => $achievement['description'],
                    'student_name' => $achievement['student_name'],
                    'category' => $achievement['category'],
                    'achieved_on' => Carbon::today()->subDays($achievement['days_ago']),
                    'is_featured' => $achievement['is_featured'],
                    'is_published' => true,
                ],
            );
        }
    }

    private function seedGallery(School $school): void
    {
        $items = [
            ['title' => 'Main Academic Building', 'album' => 'Campus', 'motif' => 'campus', 'palette' => ['#1b3050', '#0a1729', '#cf9a2e']],
            ['title' => 'Central Library', 'album' => 'Campus', 'motif' => 'library', 'palette' => ['#284366', '#12233c', '#ddb254']],
            ['title' => 'Science Laboratories', 'album' => 'Campus', 'motif' => 'science', 'palette' => ['#16433f', '#0b2422', '#e9cd84']],
            ['title' => 'Football Final — House Lions', 'album' => 'Sports', 'motif' => 'sports', 'palette' => ['#283c66', '#131f3a', '#ddb254']],
            ['title' => 'Annual Sports Meet', 'album' => 'Sports', 'motif' => 'sports', 'palette' => ['#5a2b12', '#2e1509', '#e9a13b']],
            ['title' => 'Inter-School Cricket Champions', 'album' => 'Sports', 'motif' => 'sports2', 'palette' => ['#123d2a', '#0a241a', '#d9c15a']],
            ['title' => 'Pohela Boishakh Mangal Shobhajatra', 'album' => 'Cultural', 'motif' => 'cultural', 'palette' => ['#6b1d3a', '#3a0f20', '#f0b657']],
            ['title' => 'Annual Cultural Night', 'album' => 'Cultural', 'motif' => 'cultural', 'palette' => ['#3a1a5e', '#201038', '#e3a0d8']],
            ['title' => 'Recitation Festival Winners', 'album' => 'Cultural', 'motif' => 'cultural', 'palette' => ['#1d4a5e', '#0f2933', '#8fd8e9']],
            ['title' => 'Digital Classroom in Action', 'album' => 'Classrooms', 'motif' => 'class', 'palette' => ['#24405e', '#111f30', '#7fb2e0']],
            ['title' => 'Science Fair Projects', 'album' => 'Classrooms', 'motif' => 'class', 'palette' => ['#3d4a12', '#222708', '#d3d97a']],
            ['title' => 'Art Class Creations', 'album' => 'Classrooms', 'motif' => 'class', 'palette' => ['#5e2c24', '#301610', '#e8a98f']],
        ];

        foreach ($items as $index => $item) {
            $path = 'site/gallery/seed-'.str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT).'.svg';

            Storage::disk('public')->put($path, $this->galleryArtwork($item['title'], $item['album'], $item['motif'], $item['palette']));

            GalleryItem::updateOrCreate(
                ['school_id' => $school->id, 'title' => $item['title']],
                [
                    'album' => $item['album'],
                    'image_path' => $path,
                    'sort_order' => $index,
                    'is_published' => true,
                ],
            );
        }
    }

    private function seedMessages(School $school): void
    {
        $messages = [
            [
                'name' => 'Shirin Sultana',
                'email' => 'shirin.sultana@example.com',
                'phone' => '+880-1711223344',
                'subject' => 'Admission enquiry for Class 3',
                'message' => 'Assalamu alaikum. I would like to know the admission procedure and fees for Class 3 for the next session. My daughter currently studies in another school in Mirpur.',
                'is_read' => false,
                'days_ago' => 1,
            ],
            [
                'name' => 'Delwar Hossain',
                'email' => 'delwar.h@example.com',
                'phone' => '+880-1812345678',
                'subject' => 'Request for transfer certificate',
                'message' => 'My son studied in Class 7 until last month. We are relocating to Chattogram and need his transfer certificate. Please let me know the process.',
                'is_read' => true,
                'days_ago' => 3,
            ],
        ];

        foreach ($messages as $message) {
            ContactMessage::updateOrCreate(
                ['school_id' => $school->id, 'email' => $message['email'], 'subject' => $message['subject']],
                [
                    'name' => $message['name'],
                    'phone' => $message['phone'],
                    'message' => $message['message'],
                    'is_read' => $message['is_read'],
                    'created_at' => now()->subDays($message['days_ago']),
                ],
            );
        }
    }

    /**
     * @param  array<int, string>  $palette
     */
    private function galleryArtwork(string $title, string $album, string $motif, array $palette): string
    {
        [$primary, $dark, $accent] = $palette;

        $motifs = [
            'campus' => '<rect x="330" y="330" width="540" height="420" fill="rgba(255,255,255,0.08)"/><rect x="390" y="240" width="420" height="90" fill="rgba(255,255,255,0.12)"/><rect x="510" y="150" width="180" height="90" fill="rgba(255,255,255,0.16)"/>',
            'library' => '<rect x="300" y="360" width="600" height="380" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="6"/><rect x="330" y="390" width="120" height="320" fill="rgba(255,255,255,0.12)"/><rect x="480" y="390" width="120" height="320" fill="rgba(255,255,255,0.18)"/><rect x="630" y="390" width="120" height="320" fill="rgba(255,255,255,0.12)"/><rect x="780" y="390" width="90" height="320" fill="rgba(255,255,255,0.18)"/>',
            'science' => '<circle cx="600" cy="520" r="150" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="6"/><circle cx="600" cy="520" r="60" fill="rgba(255,255,255,0.2)"/><circle cx="600" cy="520" r="210" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="4"/>',
            'sports' => '<circle cx="600" cy="500" r="170" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="6"/><path d="M600 330 l90 250 -90 250 -90 -250 z" fill="rgba(255,255,255,0.14)"/>',
            'sports2' => '<rect x="380" y="330" width="120" height="430" rx="60" fill="rgba(255,255,255,0.16)"/><rect x="700" y="330" width="120" height="430" rx="60" fill="rgba(255,255,255,0.16)"/><rect x="460" y="290" width="280" height="90" rx="45" fill="rgba(255,255,255,0.24)"/>',
            'cultural' => '<path d="M330 700 Q 480 380 600 560 Q 720 740 870 420" stroke="rgba(255,255,255,0.4)" stroke-width="8" fill="none"/><circle cx="870" cy="420" r="26" fill="rgba(255,255,255,0.35)"/><circle cx="330" cy="700" r="26" fill="rgba(255,255,255,0.35)"/>',
            'class' => '<rect x="300" y="420" width="600" height="330" fill="rgba(255,255,255,0.08)"/><rect x="340" y="460" width="520" height="60" fill="rgba(255,255,255,0.16)"/><rect x="340" y="560" width="360" height="40" fill="rgba(255,255,255,0.12)"/><rect x="340" y="630" width="440" height="40" fill="rgba(255,255,255,0.12)"/>',
        ];

        $motifArt = $motifs[$motif] ?? $motifs['campus'];
        $title = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
        $album = htmlspecialchars(strtoupper($album), ENT_QUOTES, 'UTF-8');

        return <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
    <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="{$primary}"/>
            <stop offset="1" stop-color="{$dark}"/>
        </linearGradient>
    </defs>
    <rect width="1200" height="900" fill="url(#bg)"/>
    {$motifArt}
    <circle cx="1080" cy="120" r="230" fill="{$accent}" opacity="0.16"/>
    <circle cx="120" cy="820" r="200" fill="#ffffff" opacity="0.05"/>
    <text x="80" y="115" font-family="Georgia, 'Times New Roman', serif" font-size="34" letter-spacing="10" fill="{$accent}">{$album}</text>
    <text x="80" y="820" font-family="Georgia, 'Times New Roman', serif" font-size="52" fill="#f6f1e6">{$title}</text>
    <rect x="80" y="846" width="150" height="5" fill="{$accent}"/>
</svg>
SVG;
    }
}
