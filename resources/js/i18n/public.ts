import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export type PublicLocale = 'en' | 'bn';
export type Translate = (key: string, params?: Record<string, string | number | null | undefined>) => string;

export const publicLocales: { value: PublicLocale; label: string }[] = [
    { value: 'en', label: 'English' },
    { value: 'bn', label: 'বাংলা' },
];

/**
 * Bangla dictionary for the public website. Keys are the English strings.
 * Any untranslated key falls back to the English text.
 */
const bn: Record<string, string> = {
    // Navigation
    Home: 'হোম',
    About: 'আমাদের সম্পর্কে',
    'About Us': 'আমাদের সম্পর্কে',
    Admission: 'ভর্তি',
    Notices: 'নোটিশ',
    Events: 'ইভেন্ট',
    Gallery: 'গ্যালারি',
    Achievements: 'অর্জন',
    Contact: 'যোগাযোগ',
    'Contact Us': 'যোগাযোগ করুন',

    // Header / shared
    'Portal Login': 'পোর্টাল লগইন',
    'School Portal Login': 'স্কুল পোর্টাল লগইন',
    'Apply for Admission': 'ভর্তির আবেদন করুন',
    'Session {from}–{to}': 'শিক্ষাবর্ষ {from}–{to}',
    'Knowledge · Discipline · Character': 'শিক্ষা · শৃঙ্খলা · চরিত্র',
    Menu: 'মেন্যু',
    Welcome: 'স্বাগতম',

    // Footer
    'Quick Links': 'দ্রুত লিংক',
    Information: 'তথ্য',
    'Get in Touch': 'যোগাযোগ',
    'All rights reserved.': 'সর্বস্বত্ব সংরক্ষিত।',
    'Sunday – Thursday, 8:00 AM – 4:00 PM': 'রবিবার – বৃহস্পতিবার, সকাল ৮টা – বিকেল ৪টা',

    // Notice categories
    general: 'সাধারণ',
    urgent: 'জরুরি',
    academic: 'একাডেমিক',
    holiday: 'ছুটি',
    exam: 'পরীক্ষা',

    // Achievement categories
    olympiad: 'অলিম্পিয়াড',
    sports: 'খেলাধুলা',
    cultural: 'সাংস্কৃতিক',

    // Home
    'Latest Notices': 'সর্বশেষ নোটিশ',
    'View all →': 'সব দেখুন →',
    'Browse Notices': 'নোটিশ দেখুন',
    'Admission Open': 'ভর্তি চলছে',
    'Admissions are open for the new academic session. Seats are limited — please contact the school office for details.':
        'নতুন শিক্ষাবর্ষের ভর্তি চলছে। আসন সীমিত — বিস্তারিত জানতে অনুগ্রহ করে স্কুল অফিসে যোগাযোগ করুন।',
    'Welcome to {name}': '{name}-এ স্বাগতম',
    'A community built on knowledge, discipline and character.': 'জ্ঞান, শৃঙ্খলা ও চরিত্রে গড়া প্রাঙ্গণ।',
    'Read more about us': 'আমাদের সম্পর্কে আরও পড়ুন',
    'Years of Excellence': 'উৎকর্ষের বছর',
    Students: 'শিক্ষার্থী',
    Teachers: 'শিক্ষক',
    'SSC Pass Rate': 'এসএসসি পাসের হার',
    "Principal's Message": 'প্রধান শিক্ষকের বানী',
    Principal: 'প্রধান শিক্ষক',
    'Our Motto': 'আমাদের আদর্শ',
    'Notice Board': 'নোটিশ বোর্ড',
    'View All': 'সব দেখুন',
    'Upcoming Events': 'আসন্ন ইভেন্ট',
    'All Events': 'সব ইভেন্ট',
    'Recent Achievements': 'সাম্প্রতিক অর্জন',
    'All Achievements': 'সব অর্জন',
    'No notices have been published yet.': 'এখনো কোনো নোটিশ প্রকাশিত হয়নি।',
    'No upcoming events right now.': 'এই মুহূর্তে কোনো আসন্ন ইভেন্ট নেই।',
    'Achievements will be announced here.': 'অর্জনসমূহ এখানে জানানো হবে।',
    'Student achievement': 'শিক্ষার্থীর অর্জন',
    'Photo Gallery': 'ফটো গ্যালারি',
    'View all photos': 'সব ছবি দেখুন',
    'No photos yet': 'এখনো কোনো ছবি নেই',
    'Photographs from our campus will appear here.': 'ক্যাম্পাসের ছবিগুলো এখানে দেখা যাবে।',

    // CTA
    'Admissions open': 'ভর্তি চলছে',
    'Come and see the school for yourself': 'নিজে চলে আসুন, স্কুলটি দেখে নিন',
    'Visit our campus, meet our teachers and see the classrooms where your child will learn and grow. We are always happy to answer your questions.':
        'ক্যাম্পাস ঘুরে দেখুন, শিক্ষকদের সাথে কথা বলুন এবং দেখুন শ্রেণিকক্ষগুলো — যেখানে আপনার সন্তান শিখবে ও বেড়ে উঠবে। আপনার প্রশ্নের উত্তর দিতে আমরা সবসময় তৈরি।',
    'Admission Details': 'ভর্তির বিস্তারিত',
    'Contact us': 'যোগাযোগ করুন',

    // Notice board
    'Stay up to date with routines, exams, holidays and everything happening around the school.':
        'রুটিন, পরীক্ষা, ছুটি এবং স্কুলের সবগুলো ঘটনার খবর সবার আগে।',
    All: 'সব',
    Date: 'তারিখ',
    Category: 'ধরন',
    'Search notices…': 'নোটিশ খুঁজুন…',
    Search: 'খুঁজুন',
    'No notices found': 'কোনো নোটিশ পাওয়া যায়নি',
    'Try a different category or search term — new notices are posted regularly.':
        'ভিন্ন ক্যাটাগরি বা শব্দ দিয়ে আবার খুঁজুন — নতুন নোটিশ নিয়মিত প্রকাশ পায়।',

    // Notice detail
    Notice: 'নোটিশ',
    'Back to notice board': 'নোটিশ বোর্ডে ফিরুন',
    'Recent Notices': 'সাম্প্রতিক নোটিশ',
    'No other notices yet.': 'এখনো অন্য কোনো নোটিশ নেই।',
    'View all events →': 'সব ইভেন্ট দেখুন →',
    'Published on {date}': 'প্রকাশ: {date}',
    'Published by the school office': 'স্কুল অফিস কর্তৃক প্রকাশিত',
    'Published by the school office on {date}': '{date} তারিখে স্কুল অফিস কর্তৃক প্রকাশিত',

    // Events
    'Events & Programmes': 'ইভেন্ট ও অনুষ্ঠান',
    "Sports meets, science fairs, cultural nights and parent conferences — see what's coming up and what we celebrated.":
        'খেলাধুলা, বিজ্ঞান মেলা, সাংস্কৃতিক অনুষ্ঠান ও অভিভাবক সমাবেশ — সামনে কী আছে এবং কী উদযাপিত হয়েছে দেখুন।',
    'Past Events': 'অতীত ইভেন্ট',
    'Mark your calendar — parents and guardians are always welcome.': 'ক্যালেন্ডারে নোট করুন — অভিভাবকরা সবসময় স্বাগত।',
    'A look back at the moments our school shared.': 'আমাদের স্কুলের সেই মুহূর্তগুলোর এক ঝলক।',
    'No upcoming events': 'কোনো আসন্ন ইভেন্ট নেই',
    'New events are announced on the notice board — check back soon.': 'নতুন ইভেন্ট নোটিশ বোর্ডে জানানো হয় — শীঘ্রই আবার দেখুন।',
    'Want your child to be part of the next event?': 'আপনার সন্তান কি পরবর্তী ইভেন্টের অংশ হতে চান?',

    // Gallery
    'Life at Our School': 'আমাদের স্কুলের জীবন',
    'Classrooms and playgrounds, festivals and fairs — moments captured from our campus.':
        'শ্রেণিকক্ষ, খেলার মাঠ, উৎসব ও মেলা — ক্যাম্পাসের সেই মুহূর্তগুলো।',
    'All photos': 'সব ছবি',
    'No photos in this album yet': 'এই অ্যালবামে এখনো কোনো ছবি নেই',
    'New photographs are added regularly — please check back soon.': 'নতুন ছবি নিয়মিত যোগ করা হয় — শীঘ্রই আবার দেখুন।',
    'Show photo {n}': 'ছবি {n} দেখুন',

    // Achievements
    'Our Achievements': 'আমাদের অর্জন',
    'Olympiad medals, sports trophies and cultural honours — celebrating the students who carry our name with pride.':
        'অলিম্পিয়াড পদক, ক্রীড়া ট্রফি ও সাংস্কৃতিক সম্মাননা — যেসব শিক্ষার্থী আমাদের নাম গর্বে বহন করে, তাদের উদযাপন।',
    Highlights: 'উল্লেখযোগ্য',
    'Featured achievements': 'নির্বাচিত অর্জন',
    'The moments we will remember for years.': 'যে মুহূর্তগুলো বছরের পর বছর মনে রাখব।',
    Featured: 'নির্বাচিত',
    'Honour roll': 'সম্মাননা তালিকা',
    'Every achievement, year by year': 'প্রতিটি অর্জন, বছরের ধারায়',
    Earlier: 'পূর্ববর্তী',
    'Achievements coming soon': 'অর্জন শীঘ্রই আসছে',
    "Our students' proud moments will be showcased here.": 'শিক্ষার্থীদের গর্বের মুহূর্তগুলো এখানে দেখানো হবে।',
    "Your child's achievement story starts here": 'আপনার সন্তানের অর্জনের গল্প শুরু এখানে',

    // Admission
    'Admission is open for the new academic session — we would love to welcome your child.':
        'নতুন শিক্ষাবর্ষে ভর্তি চলছে — আপনার সন্তানকে আমরা আন্তরিকভাবে স্বাগত জানাচ্ছি।',
    'Call the admission desk': 'ভর্তি ডেস্কে কল করুন',
    'Email us': 'ইমেইল করুন',
    Checklist: 'তালিকা',
    'Documents to bring': 'সঙ্গে আনতে হবে এমন কাগজপত্র',
    'Please prepare the following documents before visiting the school office.': 'স্কুল অফিসে আসার আগে নিচের কাগজগুলো প্রস্তুত রাখুন।',
    Process: 'প্রক্রিয়া',
    'How to apply': 'আবেদন করার নিয়ম',
    '{count} simple step from first visit to first day of class.': 'প্রথম ভিজিট থেকে ক্লাসের প্রথম দিন — মাত্র {count} ধাপ।',
    '{count} simple steps from first visit to first day of class.': 'প্রথম ভিজিট থেকে ক্লাসের প্রথম দিন — মাত্র {count} ধাপ।',
    'Admission Enquiry': 'ভর্তি সংক্রান্ত জিজ্ঞাসা',
    'Visit the school office with your child for admission details, seat availability and the application form.':
        'ভর্তির বিস্তারিত তথ্য, আসনের প্রাপ্যতা ও আবেদন ফরম জানতে সন্তানের সাথে স্কুল অফিসে আসুন।',
    'Office Hours': 'অফিস সময়সূচি',
    'Sunday – Thursday, 8:00 AM – 4:00 PM.': 'রবিবার – বৃহস্পতিবার, সকাল ৮টা – বিকেল ৪টা।',
    'Admission forms are available at the school front desk.': 'ভর্তি ফরম স্কুলের রিসিপশন ডেস্কে পাওয়া যায়।',
    'For quick answers,': 'দ্রুত উত্তরের জন্য আমাদের কাছে',
    'send us a message': 'বার্তা পাঠান',
    '— our office will call you back.': 'করুন — অফিস থেকে আমরা আপনাকে কল করব।',
    'Questions about admission?': 'ভর্তি সংক্রান্ত কোনো প্রশ্ন আছে?',

    // Contact
    'Questions about admission, fees or academics? Reach out and our office will get back to you shortly.':
        'ভর্তি, বেতন বা একাডেমিক বিষয়ে প্রশ্ন? আমাদের জানান — অফিস থেকে দ্রুত উত্তর পাবেন।',
    'Campus Address': 'ক্যাম্পাসের ঠিকানা',
    Phone: 'ফোন',
    Email: 'ইমেইল',
    'Closed on Fridays, Saturdays and government holidays.': 'শুক্রবার, শনিবার ও সরকারি ছুটির দিনে বন্ধ।',
    'Send us a message': 'আমাদের মেসেজ পাঠান',
    'Fill in the form and we will get back to you as soon as possible.': 'ফরমটি পূরণ করুন — আমরা যত দ্রুত সম্ভব আপনার সাথে যোগাযোগ করব।',
    'Your name': 'আপনার নাম',
    Subject: 'বিষয়',
    Message: 'মেসেজ',
    'Full name': 'পূর্ণ নাম',
    'e.g. Admission enquiry': 'যেমন: ভর্তি সংক্রান্ত',
    'Write your message here…': 'এখানে আপনার মেসেজ লিখুন…',
    'Thank you!': 'ধন্যবাদ!',
    'Your message has been received. Our office will contact you soon.': 'আপনার মেসেজ গ্রহণ করা হয়েছে। অফিস থেকে দ্রুত যোগাযোগ করা হবে।',
    'Send another message': 'আরেকটি মেসেজ পাঠান',
    'Sending…': 'পাঠানো হচ্ছে…',
    'Send message': 'মেসেজ পাঠান',

    // About
    'About {name}': '{name} সম্পর্কে',
    'Who we are': 'আমরা কারা',
    'A tradition of learning': 'শিক্ষার ঐতিহ্য',
    'Our school has been a home of learning for thousands of students.': 'আমাদের স্কুল হাজারো শিক্ষার্থীর জ্ঞানের আঁতুড়ঘর।',
    'Our Journey': 'আমাদের যাত্রা',
    'Our Mission': 'আমাদের লক্ষ্য',
    'Our Vision': 'আমাদের স্বপ্ন',
    'To nurture knowledge, discipline and character in every student.': 'প্রতিটি শিক্ষার্থীর মধ্যে জ্ঞান, শৃঙ্খলা ও চরিত্র গড়ে তোলা।',
    'To be a model institution where academic brilliance and integrity grow together.':
        'এমন এক আদর্শ প্রতিষ্ঠান হওয়া, যেখানে শিক্ষার উজ্জ্বলতা ও সততা একসাথে বেড়ে ওঠে।',
    'Students Enrolled': 'শিক্ষার্থী',
    'Dedicated Teachers': 'নিবেদিতপ্রাণ শিক্ষক',
    "From the Principal's Desk": 'প্রধান শিক্ষকের কলম থেকে',
    'The Principal': 'প্রধান শিক্ষক',

    // Pagination (accessibility)
    'Previous page': 'পূর্ববর্তী পৃষ্ঠা',
    'Next page': 'পরবর্তী পৃষ্ঠা',

    // Gallery lightbox (accessibility)
    Close: 'বন্ধ করুন',
    'Previous image': 'পূর্ববর্তী ছবি',
    'Next image': 'পরবর্তী ছবি',
};

function interpolate(text: string, params?: Record<string, string | number | null | undefined>): string {
    if (!params) {
        return text;
    }

    for (const [param, value] of Object.entries(params)) {
        text = text.replaceAll(`{${param}}`, String(value ?? ''));
    }

    return text;
}

export function capitalizeFirst(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export function translate(key: string, params?: Record<string, string | number | null | undefined>): string {
    return interpolate(bn[key] ?? key, params);
}

export function usePublicLocale(): PublicLocale {
    return usePage<SharedData>().props.siteLocale === 'bn' ? 'bn' : 'en';
}

export function useT(): Translate {
    const locale = usePublicLocale();

    if (locale !== 'bn') {
        return interpolate;
    }

    return translate;
}
