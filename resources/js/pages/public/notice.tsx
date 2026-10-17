import { NoticeChip } from '@/components/public/notice-card';
import { PageHero } from '@/components/public/page-hero';
import { WidgetPanel } from '@/components/public/widget';
import { usePublicLocale, useT } from '@/i18n/public';
import PublicLayout from '@/layouts/public-layout';
import { formatDate } from '@/lib/format';
import { type SiteInfo } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CalendarClock, MapPin } from 'lucide-react';

interface NoticePageProps {
    site: SiteInfo;
    notice: {
        id: number;
        title: string;
        body: string;
        category: string;
        published_at: string | null;
    };
    recent: { id: number; title: string; category: string; published_at: string | null }[];
    events: { id: number; title: string; starts_at: string; location: string | null }[];
}

export default function NoticePage({ site, notice, recent, events }: NoticePageProps) {
    const t = useT();
    const locale = usePublicLocale();

    return (
        <PublicLayout site={site}>
            <Head title={notice.title} />

            <PageHero
                title={notice.title}
                description={notice.published_at ? t('Published on {date}', { date: formatDate(notice.published_at, locale) }) : null}
                breadcrumbs={[
                    { label: t('Home'), href: '/' },
                    { label: t('Notice Board'), href: route('site.notices', {}, false) },
                    { label: t('Notice') },
                ]}
            />

            <section className="py-10 lg:py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <Link
                        href={route('site.notices')}
                        className="text-brand-700 hover:text-brand-800 inline-flex items-center gap-2 text-sm font-semibold"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {t('Back to notice board')}
                    </Link>

                    <div className="mt-6 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
                        <article className="border-brand-900/20 border bg-white p-6 sm:p-9">
                            <div className="border-brand-950 flex flex-wrap items-center gap-3 border-b-2 pb-4">
                                <NoticeChip category={notice.category} />
                                {notice.published_at && (
                                    <span className="text-brand-900/55 text-[10px] font-semibold tracking-[0.16em] uppercase">
                                        {formatDate(notice.published_at, locale)}
                                    </span>
                                )}
                            </div>
                            <div className="mt-6">
                                <p className="text-brand-900/80 text-sm leading-7 whitespace-pre-line sm:text-[15px] sm:leading-8">{notice.body}</p>
                            </div>
                            <div className="border-brand-900/15 text-brand-900/50 mt-8 border-t pt-5 text-xs italic">
                                {notice.published_at
                                    ? t('Published by the school office on {date}', { date: formatDate(notice.published_at, locale) })
                                    : t('Published by the school office')}
                            </div>
                        </article>

                        <aside className="space-y-7">
                            <WidgetPanel title={t('Recent Notices')}>
                                <ul className="divide-brand-900/10 divide-y">
                                    {recent.length > 0 ? (
                                        recent.map((item) => (
                                            <li key={item.id}>
                                                <Link
                                                    href={route('site.notices.show', item.id)}
                                                    className="group hover:bg-cream-100/70 -mx-1 block px-1 py-3"
                                                >
                                                    <span className="text-brand-900/50 text-xs">{formatDate(item.published_at, locale)}</span>
                                                    <span className="text-brand-900 group-hover:text-brand-700 mt-0.5 block text-sm leading-snug font-medium transition-colors">
                                                        {item.title}
                                                    </span>
                                                </Link>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-brand-900/60 py-4 text-sm">{t('No other notices yet.')}</li>
                                    )}
                                </ul>
                            </WidgetPanel>

                            {events.length > 0 && (
                                <div className="border-brand-950 bg-brand-950 text-cream-50 overflow-hidden border">
                                    <div className="border-cream-50/15 flex items-center gap-2.5 border-b px-4 py-3">
                                        <CalendarClock className="text-brand-300 h-4 w-4" />
                                        <h2 className="font-display text-[15px] leading-none font-semibold">{t('Upcoming Events')}</h2>
                                    </div>
                                    <ul className="border-cream-50/15 divide-cream-50/10 divide-y">
                                        {events.map((event) => (
                                            <li key={event.id} className="px-4 py-3.5">
                                                <p className="text-brand-300 text-xs">{formatDate(event.starts_at, locale)}</p>
                                                <p className="mt-0.5 text-sm leading-snug font-medium">{event.title}</p>
                                                {event.location && (
                                                    <p className="text-cream-100/60 mt-1 flex items-center gap-1.5 text-xs">
                                                        <MapPin className="h-3 w-3" />
                                                        {event.location}
                                                    </p>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="border-cream-50/15 border-t px-4 py-3">
                                        <Link
                                            href={route('site.events')}
                                            className="text-brand-300 hover:text-cream-50 text-[11px] font-semibold tracking-[0.14em] uppercase"
                                        >
                                            {t('View all events →')}
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </aside>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
