import { AchievementCard } from '@/components/public/achievement-card';
import { EmptyState } from '@/components/public/empty-state';
import { EventCard } from '@/components/public/event-card';
import { NoticeCard } from '@/components/public/notice-card';
import { SectionHeading } from '@/components/public/section-heading';
import { SiteCta } from '@/components/public/site-cta';
import PublicLayout from '@/layouts/public-layout';
import { formatDate } from '@/lib/format';
import { type PublicAchievement, type PublicEvent, type PublicNotice, type SiteInfo, type SiteStats } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BookOpen, FlaskConical, MonitorSmartphone, Newspaper, Sparkles, Trophy } from 'lucide-react';

interface HomeProps {
    site: SiteInfo;
    stats: SiteStats | null;
    hero: { title: string | null; subtitle: string | null };
    aboutExcerpt: string | null;
    notices: PublicNotice[];
    events: PublicEvent[];
    achievements: PublicAchievement[];
}

const features = [
    {
        icon: BookOpen,
        title: 'Academic Excellence',
        description: 'A rigorous national curriculum delivered by experienced, caring teachers.',
    },
    {
        icon: FlaskConical,
        title: 'Modern Laboratories',
        description: 'Fully equipped science and computer labs where curiosity meets practice.',
    },
    {
        icon: MonitorSmartphone,
        title: 'Digital Classrooms',
        description: 'Multimedia classrooms that make every lesson vivid and interactive.',
    },
    {
        icon: Trophy,
        title: 'Sports & Culture',
        description: 'Football, cricket, debate, music and art — talent grows in every direction.',
    },
];

export default function Home({ site, stats, hero, aboutExcerpt, notices, events, achievements }: HomeProps) {
    const initials = site.name
        .split(/\s+/)
        .filter((word) => /^[A-Za-z]/.test(word))
        .slice(0, 2)
        .map((word) => word.charAt(0).toUpperCase())
        .join('');

    const statBand = [
        { value: stats?.years ?? '—', label: 'Years of Excellence' },
        { value: stats?.students ?? '—', label: 'Students Enrolled' },
        { value: stats?.teachers ?? '—', label: 'Dedicated Teachers' },
        { value: stats?.pass_rate ?? '—', label: 'SSC Pass Rate' },
    ];

    return (
        <PublicLayout site={site}>
            <Head title="Home" />

            <section className="relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(207,154,46,0.16),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(20,38,60,0.08),transparent_40%)]"
                    aria-hidden
                />
                <div className="relative mx-auto grid max-w-7xl gap-16 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-24">
                    <div>
                        <p className="border-gold-300 bg-gold-100/80 text-gold-700 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide uppercase">
                            <Sparkles className="h-3.5 w-3.5" />
                            Admissions open · Session 2026–2027
                        </p>
                        <h1 className="font-display text-brand-950 mt-6 text-4xl leading-[1.08] font-semibold sm:text-5xl lg:text-6xl">
                            {hero.title ?? `Welcome to ${site.name}`}
                        </h1>
                        <p className="text-brand-900/70 mt-6 max-w-xl text-base leading-relaxed sm:text-lg">
                            {hero.subtitle ??
                                'Quality education from Play Group to Class 10 — combining academic rigour, modern facilities and a warm, values-driven community.'}
                        </p>
                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <Link
                                href={route('site.admission')}
                                className="bg-brand-900 text-cream-50 shadow-brand-900/20 hover:bg-brand-800 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg transition-colors"
                            >
                                Apply for Admission
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href={route('site.about')}
                                className="border-brand-900/20 text-brand-900 hover:border-gold-500 hover:text-gold-700 inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-colors"
                            >
                                Discover Our Story
                            </Link>
                        </div>
                        <div className="text-brand-900/60 mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
                            <span className="inline-flex items-center gap-2">
                                <span className="bg-gold-500 h-1.5 w-1.5 rounded-full" />
                                {stats?.years ?? '25+'} years of trust
                            </span>
                            <span className="inline-flex items-center gap-2">
                                <span className="bg-gold-500 h-1.5 w-1.5 rounded-full" />
                                {stats?.students ?? '1,450+'} happy students
                            </span>
                            <span className="inline-flex items-center gap-2">
                                <span className="bg-gold-500 h-1.5 w-1.5 rounded-full" />
                                {stats?.pass_rate ?? '98%'} SSC pass rate
                            </span>
                        </div>
                    </div>

                    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                        <div className="bg-gold-200/50 absolute -inset-6 rounded-[2.5rem] blur-2xl" aria-hidden />
                        <div className="from-brand-800 via-brand-900 to-brand-950 text-cream-50 relative overflow-hidden rounded-[2rem] bg-linear-to-br p-8 shadow-2xl">
                            <div className="site-dot-pattern absolute inset-0 opacity-40" aria-hidden />
                            <div className="relative">
                                <div className="flex items-center justify-between">
                                    <span className="bg-cream-50/10 font-display text-gold-300 ring-gold-400/60 flex h-14 w-14 items-center justify-center rounded-full text-xl font-semibold ring-1">
                                        {initials}
                                    </span>
                                    <span className="text-gold-400 text-xs font-semibold tracking-[0.3em] uppercase">Est. 1998</span>
                                </div>
                                <p className="font-display mt-14 text-3xl leading-snug font-medium">
                                    A premier seat of learning in the heart of Dhaka.
                                </p>
                                <div className="mt-10 grid grid-cols-3 gap-3 text-center">
                                    {[
                                        { label: 'Students', value: stats?.students ?? '—' },
                                        { label: 'Teachers', value: stats?.teachers ?? '—' },
                                        { label: 'Pass rate', value: stats?.pass_rate ?? '—' },
                                    ].map((item) => (
                                        <div key={item.label} className="bg-cream-50/5 ring-cream-50/10 rounded-2xl px-2 py-3 ring-1">
                                            <p className="font-display text-gold-300 text-xl font-semibold">{item.value}</p>
                                            <p className="text-cream-100/70 mt-0.5 text-[11px] tracking-wide uppercase">{item.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {notices[0] && (
                            <Link
                                href={route('site.notices.show', notices[0].id)}
                                className="border-brand-900/10 absolute -bottom-6 -left-4 hidden w-72 rounded-2xl border bg-white p-4 shadow-xl transition hover:-translate-y-0.5 sm:block"
                            >
                                <p className="text-gold-600 text-[11px] font-semibold tracking-[0.22em] uppercase">Latest notice</p>
                                <p className="font-display text-brand-950 mt-1.5 line-clamp-2 text-sm leading-snug font-semibold">
                                    {notices[0].title}
                                </p>
                                <p className="text-brand-900/55 mt-1 text-xs">{formatDate(notices[0].published_at)}</p>
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            <section className="bg-brand-900">
                <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
                    {statBand.map((stat) => (
                        <div key={stat.label} className="text-center lg:text-left">
                            <p className="font-display text-gold-400 text-3xl font-semibold sm:text-4xl">{stat.value}</p>
                            <p className="text-cream-100/70 mt-1.5 text-xs font-medium tracking-wider uppercase">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                    <div>
                        <SectionHeading
                            eyebrow="Welcome"
                            title={`About ${site.name}`}
                            description={aboutExcerpt ?? 'A community built on knowledge, discipline and character.'}
                        />
                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <Link
                                href={route('site.about')}
                                className="border-brand-900/20 text-brand-900 hover:border-gold-500 hover:text-gold-700 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors"
                            >
                                More about us
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                        {features.map((feature) => (
                            <div key={feature.title} className="border-brand-900/10 rounded-2xl border bg-white p-6 shadow-sm">
                                <span className="bg-gold-100 text-gold-700 flex h-11 w-11 items-center justify-center rounded-full">
                                    <feature.icon className="h-5 w-5" />
                                </span>
                                <h3 className="font-display text-brand-950 mt-4 text-lg font-semibold">{feature.title}</h3>
                                <p className="text-brand-900/65 mt-2 text-sm leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-cream-100 py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        eyebrow="Notice board"
                        title="Latest from the school"
                        description="Routines, holidays, exams and announcements — everything parents and students need to know."
                        action={{ label: 'View all notices', href: route('site.notices') }}
                    />
                    <div className="mt-10">
                        {notices.length > 0 ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {notices.map((notice) => (
                                    <NoticeCard key={notice.id} notice={notice} />
                                ))}
                            </div>
                        ) : (
                            <EmptyState icon={Newspaper} title="No notices yet" description="Published notices will appear here." />
                        )}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                <SectionHeading
                    eyebrow="School calendar"
                    title="Upcoming events"
                    description="Sports days, science fairs and parent meetings — come and be part of them."
                    action={{ label: 'All events', href: route('site.events') }}
                />
                <div className="mt-10">
                    {events.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {events.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState title="Nothing scheduled yet" description="Upcoming events will be announced soon." />
                    )}
                </div>
            </section>

            <section className="bg-cream-100 py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading
                        eyebrow="Proud moments"
                        title="Recent achievements"
                        description="Olympiads, sports and culture — our students keep making us proud."
                        action={{ label: 'All achievements', href: route('site.achievements') }}
                    />
                    <div className="mt-10">
                        {achievements.length > 0 ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {achievements.map((achievement) => (
                                    <AchievementCard key={achievement.id} achievement={achievement} featured={achievement.is_featured} />
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={Trophy}
                                title="Achievements coming soon"
                                description="Our students' proud moments will be showcased here."
                            />
                        )}
                    </div>
                </div>
            </section>

            <SiteCta site={site} />
        </PublicLayout>
    );
}
