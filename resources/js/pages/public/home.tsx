import { EmptyState } from '@/components/public/empty-state';
import { EventRow } from '@/components/public/event-card';
import { NoticeRow } from '@/components/public/notice-card';
import { Ornament } from '@/components/public/ornament';
import { SectionHeading } from '@/components/public/section-heading';
import { SiteCta } from '@/components/public/site-cta';
import { WidgetPanel } from '@/components/public/widget';
import { usePublicLocale, useT } from '@/i18n/public';
import PublicLayout from '@/layouts/public-layout';
import { formatDate } from '@/lib/format';
import { type PublicAchievement, type PublicEvent, type PublicGalleryItem, type PublicNotice, type SiteInfo, type SiteStats } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, GraduationCap, Images } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HomeProps {
    site: SiteInfo;
    stats: SiteStats | null;
    hero: { title: string | null; subtitle: string | null };
    aboutExcerpt: string | null;
    notices: PublicNotice[];
    events: PublicEvent[];
    achievements: PublicAchievement[];
    gallery: PublicGalleryItem[];
    principal: { name: string | null; message: string | null };
}

function principalInitials(name: string | null): string {
    return (name ?? '')
        .split(/\s+/)
        .filter((word) => /^[A-Za-z]/.test(word))
        .slice(0, 2)
        .map((word) => word.charAt(0).toUpperCase())
        .join('');
}

export default function Home({ site, stats, hero, aboutExcerpt, notices, events, achievements, gallery, principal }: HomeProps) {
    const t = useT();
    const locale = usePublicLocale();
    const sessionYear = new Date().getFullYear();
    const photos = gallery.filter((item) => item.image_url).slice(0, 6);

    const statsBand = [
        { value: stats?.years ?? '', label: t('Years of Excellence') },
        { value: stats?.students ?? '', label: t('Students') },
        { value: stats?.teachers ?? '', label: t('Teachers') },
        { value: stats?.pass_rate ?? '', label: t('SSC Pass Rate') },
    ].filter((stat) => stat.value !== '');

    const [slide, setSlide] = useState(0);

    useEffect(() => {
        if (photos.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const timer = window.setInterval(() => {
            setSlide((current) => (current + 1) % photos.length);
        }, 5000);

        return () => window.clearInterval(timer);
    }, [photos.length]);

    const activePhoto = photos[slide] ?? null;
    const initials = principalInitials(principal.name);

    return (
        <PublicLayout site={site}>
            <Head title={locale === 'bn' ? 'হোম' : 'Home'} />

            {/* ── Notice ticker ─────────────────────────────────────── */}
            {notices.length > 0 && (
                <div className="border-brand-900/15 border-b bg-white">
                    <div className="mx-auto flex max-w-7xl items-stretch px-4 sm:px-6 lg:px-8">
                        <span className="bg-brand-800 text-cream-50 flex shrink-0 items-center px-3.5 text-[9px] font-bold tracking-[0.22em] uppercase sm:mr-4">
                            {t('Latest Notices')}
                        </span>
                        <div className="site-ticker relative hidden flex-1 items-center overflow-hidden sm:flex">
                            <div className="site-ticker-track flex w-max items-center whitespace-nowrap">
                                {[0, 1].map((copy) => (
                                    <div key={copy} className="flex items-center" aria-hidden={copy === 1}>
                                        {notices.map((notice) => (
                                            <Link
                                                key={`${copy}-${notice.id}`}
                                                href={route('site.notices.show', notice.id)}
                                                className="group mr-12 flex items-center gap-2.5 py-2.5 text-sm"
                                                tabIndex={copy === 1 ? -1 : undefined}
                                            >
                                                {notice.published_at && (
                                                    <span className="text-brand-700 text-xs">{formatDate(notice.published_at, locale)}</span>
                                                )}
                                                <span className="decoration-brand-700 font-semibold underline-offset-4 group-hover:underline">
                                                    {notice.title}
                                                </span>
                                                <span className="text-brand-400" aria-hidden>
                                                    •
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Link
                            href={route('site.notices')}
                            className="text-brand-700 hover:text-brand-950 flex items-center py-2.5 pl-6 text-[10px] font-semibold tracking-[0.16em] whitespace-nowrap uppercase sm:p-0 sm:pl-4"
                        >
                            {t('View all →')}
                        </Link>
                    </div>
                </div>
            )}

            {/* ── Hero ──────────────────────────────────────────────── */}
            <section className="py-12 lg:py-16">
                <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8">
                    <div>
                        <p className="border-brand-800 text-brand-800 inline-flex w-fit -rotate-1 border px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] uppercase">
                            {t('Admission Open')} · {t('Session {from}–{to}', { from: sessionYear, to: sessionYear + 1 })}
                        </p>

                        <h1 className="font-display text-brand-950 mt-6 text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl lg:text-[3.4rem]">
                            {hero.title ?? t('Welcome to {name}', { name: site.name })}
                        </h1>

                        <p className="font-display text-brand-700 mt-4 text-xl italic">{site.tagline ?? t('Knowledge · Discipline · Character')}</p>

                        <p className="text-brand-900/75 mt-5 max-w-xl text-[15px] leading-relaxed">
                            {hero.subtitle ?? t('A community built on knowledge, discipline and character.')}
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                href={route('site.admission')}
                                className="bg-brand-800 text-cream-50 hover:bg-brand-950 border-brand-950 border px-6 py-3.5 text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors"
                            >
                                {t('Apply for Admission')}
                            </Link>
                            <Link
                                href={route('site.notices')}
                                className="border-brand-950 text-brand-950 hover:bg-brand-950 hover:text-cream-50 border px-6 py-3.5 text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors"
                            >
                                {t('Browse Notices')}
                            </Link>
                        </div>

                        {statsBand.length > 0 && (
                            <div className="border-brand-950 mt-10 grid grid-cols-2 border-y sm:grid-cols-4">
                                {statsBand.map((stat, index) => (
                                    <div
                                        key={stat.label}
                                        className={
                                            index > 0
                                                ? 'border-brand-900/25 border-t px-4 py-4 sm:border-t-0 sm:border-l sm:first:border-l-0'
                                                : 'px-4 py-4'
                                        }
                                    >
                                        <p className="font-display text-brand-800 text-2xl leading-none font-semibold sm:text-3xl">{stat.value}</p>
                                        <p className="text-brand-900/60 mt-2 text-[9px] font-semibold tracking-[0.16em] uppercase">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Framed campus photograph */}
                    <figure className="border-brand-950/30 self-start border bg-white p-2.5 shadow-[4px_4px_0_rgba(27,53,42,0.10)]">
                        <div className="bg-cream-100 relative aspect-4/3 overflow-hidden">
                            {photos.length > 0 ? (
                                <>
                                    {photos.map((photo, index) => (
                                        <img
                                            key={photo.id}
                                            src={photo.image_url ?? ''}
                                            alt={photo.title ?? photo.album}
                                            loading={index === 0 ? 'eager' : 'lazy'}
                                            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
                                            style={index === slide ? undefined : { opacity: 0 }}
                                            aria-hidden={index !== slide}
                                        />
                                    ))}
                                    {photos.length > 1 && (
                                        <div className="absolute right-3 bottom-3 flex gap-1.5">
                                            {photos.map((photo, index) => (
                                                <button
                                                    key={photo.id}
                                                    type="button"
                                                    onClick={() => setSlide(index)}
                                                    aria-label={t('Show photo {n}', { n: index + 1 })}
                                                    className={
                                                        index === slide
                                                            ? 'bg-cream-50 border-brand-950/40 h-2 w-5 border'
                                                            : 'bg-cream-50/70 hover:bg-cream-50 border-brand-950/30 h-2 w-2 border transition-colors'
                                                    }
                                                />
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-cream-50 flex h-full flex-col items-center justify-center px-8 text-center">
                                    <span className="border-cream-100/60 ring-cream-100/20 flex h-16 w-16 items-center justify-center rounded-full border-2 ring-2 ring-inset">
                                        <GraduationCap className="h-7 w-7" />
                                    </span>
                                    <p className="font-display mt-5 max-w-md text-2xl leading-snug font-semibold">
                                        {hero.title ?? t('Welcome to {name}', { name: site.name })}
                                    </p>
                                    <p className="text-cream-100/70 mt-2 text-sm">{site.tagline ?? t('Knowledge · Discipline · Character')}</p>
                                </div>
                            )}
                        </div>
                        <figcaption className="flex items-center justify-between gap-3 px-1 pt-3 pb-0.5 text-[9px] font-semibold tracking-[0.18em] uppercase">
                            <span className="text-brand-900/60 truncate">{activePhoto ? activePhoto.album : site.name}</span>
                            <Link
                                href={route('site.gallery')}
                                className="text-brand-700 hover:text-brand-950 shrink-0 underline-offset-4 hover:underline"
                            >
                                {t('View all photos')} →
                            </Link>
                        </figcaption>
                    </figure>
                </div>
            </section>

            {/* ── Welcome + principal ───────────────────────────────── */}
            <section className="border-brand-900/15 border-y bg-white">
                <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
                    <SectionHeading eyebrow={t('Welcome')} title={t('Welcome to {name}', { name: site.name })} />

                    <div className="mt-10 grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
                        <div>
                            <div className="text-brand-900/80 [&>p:first-child]:first-letter:font-display [&>p:first-child]:first-letter:text-brand-700 text-[15px] leading-[1.85] [&>p:first-child]:first-letter:float-left [&>p:first-child]:first-letter:mr-2.5 [&>p:first-child]:first-letter:text-5xl [&>p:first-child]:first-letter:leading-[0.9] [&>p:first-child]:first-letter:font-semibold">
                                {(aboutExcerpt ?? t('A community built on knowledge, discipline and character.'))
                                    .split(/\n{2,}/)
                                    .map((paragraph, index) => (
                                        <p key={index} className={index > 0 ? 'mt-4' : undefined}>
                                            {paragraph}
                                        </p>
                                    ))}
                            </div>
                            <Link
                                href={route('site.about')}
                                className="text-brand-700 hover:text-brand-950 mt-6 inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] uppercase underline-offset-4 hover:underline"
                            >
                                {t('Read more about us')}
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>

                        <div className="border-brand-900/20 bg-cream-50 self-start border">
                            <div className="border-brand-950 border-b px-5 py-3">
                                <p className="text-brand-700 text-[10px] font-semibold tracking-[0.24em] uppercase">
                                    {t("From the Principal's Desk")}
                                </p>
                            </div>
                            <div className="px-5 py-5">
                                <p className="font-display text-brand-950/25 text-4xl leading-none font-semibold" aria-hidden>
                                    “
                                </p>
                                <p className="font-display text-brand-950 -mt-2 text-[15px] leading-relaxed italic">
                                    {principal.message ?? site.tagline ?? t('Knowledge · Discipline · Character')}
                                </p>
                                <div className="border-brand-900/20 mt-5 flex items-center gap-3 border-t pt-4">
                                    <span className="border-brand-950 text-brand-950 ring-brand-950/10 font-display flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 bg-white text-sm font-semibold ring-2 ring-inset">
                                        {initials}
                                    </span>
                                    <div>
                                        <p className="font-display text-brand-950 text-sm font-semibold">{principal.name ?? t('The Principal')}</p>
                                        <p className="text-brand-900/55 mt-0.5 text-[9px] font-semibold tracking-[0.2em] uppercase">
                                            {t('Principal')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Notice board + sidebars ───────────────────────────── */}
            <section className="py-14 lg:py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading eyebrow={t('Notices')} title={t('Notice Board')} action={{ label: t('View All'), href: route('site.notices') }} />

                    <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
                        <div className="border-brand-900/20 border bg-white">
                            <div className="border-brand-950 grid grid-cols-[64px_1fr] border-b-2 px-5 pt-4 pb-2 text-[9px] font-semibold tracking-[0.2em] uppercase sm:grid-cols-[64px_1fr_120px]">
                                <span>{t('Date')}</span>
                                <span>{t('Notice')}</span>
                                <span className="hidden text-right sm:block">{t('Category')}</span>
                            </div>
                            {notices.length > 0 ? (
                                notices.map((notice) => <NoticeRow key={notice.id} notice={notice} />)
                            ) : (
                                <p className="text-brand-900/60 px-5 py-6 text-sm">{t('No notices have been published yet.')}</p>
                            )}
                        </div>

                        <div className="space-y-8">
                            <WidgetPanel title={t('Upcoming Events')} action={{ label: t('All Events'), href: route('site.events') }}>
                                {events.length > 0 ? (
                                    <div>
                                        {events.slice(0, 3).map((event) => (
                                            <EventRow key={event.id} event={event} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-brand-900/60 px-5 py-6 text-sm">{t('No upcoming events right now.')}</p>
                                )}
                            </WidgetPanel>

                            <WidgetPanel title={t('Recent Achievements')} action={{ label: t('All Achievements'), href: route('site.achievements') }}>
                                {achievements.length > 0 ? (
                                    <ul>
                                        {achievements.slice(0, 3).map((achievement, index) => (
                                            <li
                                                key={achievement.id}
                                                className="border-brand-900/10 flex items-baseline gap-4 border-b px-5 py-4 last:border-b-0"
                                            >
                                                <span className="font-display text-brand-700 w-6 shrink-0 text-sm font-semibold">
                                                    {String(index + 1).padStart(2, '0')}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="text-brand-950 line-clamp-1 text-sm font-semibold">{achievement.title}</p>
                                                    <p className="mt-1 text-xs">
                                                        {achievement.student_name ? (
                                                            <span className="text-brand-700 font-semibold">{achievement.student_name}</span>
                                                        ) : (
                                                            <span className="text-brand-900/50">{t('Student achievement')}</span>
                                                        )}
                                                        {achievement.achieved_on && (
                                                            <span className="text-brand-900/50">
                                                                {' '}
                                                                · {formatDate(achievement.achieved_on, locale)}
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-brand-900/60 px-5 py-6 text-sm">{t('Achievements will be announced here.')}</p>
                                )}
                            </WidgetPanel>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Gallery strip ─────────────────────────────────────── */}
            <section className="border-brand-900/15 border-t bg-white">
                <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
                    <SectionHeading
                        eyebrow={t('Gallery')}
                        title={t('Photo Gallery')}
                        action={{ label: t('View all photos'), href: route('site.gallery') }}
                    />

                    {photos.length > 0 ? (
                        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                            {photos.map((photo) => (
                                <Link
                                    key={photo.id}
                                    href={route('site.gallery')}
                                    className="group border-brand-900/25 bg-cream-50 hover:border-brand-950 block border p-1.5 transition-all hover:shadow-[3px_3px_0_rgba(27,53,42,0.10)]"
                                >
                                    <span className="block aspect-4/3 overflow-hidden">
                                        <img
                                            src={photo.image_url ?? ''}
                                            alt={photo.title ?? photo.album}
                                            loading="lazy"
                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                                        />
                                    </span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-10">
                            <EmptyState icon={Images} title={t('No photos yet')} description={t('Photographs from our campus will appear here.')} />
                        </div>
                    )}
                    <Ornament className="mt-10" />
                </div>
            </section>

            <SiteCta site={site} />
        </PublicLayout>
    );
}
