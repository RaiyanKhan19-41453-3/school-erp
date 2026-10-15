import { noticeCategoryClass, noticeCategoryLabel } from '@/components/public/notice-card';
import { PageHero } from '@/components/public/page-hero';
import PublicLayout from '@/layouts/public-layout';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
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
    return (
        <PublicLayout site={site}>
            <Head title={notice.title} />

            <PageHero
                eyebrow={`Notice · ${noticeCategoryLabel(notice.category)}`}
                title={notice.title}
                description={notice.published_at ? `Published on ${formatDate(notice.published_at)}` : null}
            />

            <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                <Link
                    href={route('site.notices')}
                    className="text-brand-800 hover:text-gold-600 mb-8 inline-flex items-center gap-2 text-sm font-semibold transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to notice board
                </Link>

                <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
                    <article className="border-brand-900/10 rounded-3xl border bg-white p-8 shadow-sm sm:p-10">
                        <span
                            className={cn(
                                'inline-block rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide uppercase',
                                noticeCategoryClass(notice.category),
                            )}
                        >
                            {noticeCategoryLabel(notice.category)}
                        </span>
                        <p className="text-brand-900/80 mt-6 text-sm leading-7 whitespace-pre-line sm:text-base sm:leading-8">{notice.body}</p>
                        <div className="border-brand-900/10 text-brand-900/50 mt-10 border-t pt-6 text-xs">
                            Published by the school office
                            {notice.published_at ? ` on ${formatDate(notice.published_at)}` : ''}
                        </div>
                    </article>

                    <aside className="space-y-8">
                        <div className="border-brand-900/10 bg-cream-100 rounded-3xl border p-6">
                            <h2 className="font-display text-brand-950 text-lg font-semibold">Recent notices</h2>
                            <ul className="mt-4 space-y-4">
                                {recent.length > 0 ? (
                                    recent.map((item) => (
                                        <li key={item.id}>
                                            <Link href={route('site.notices.show', item.id)} className="group block">
                                                <span className="text-brand-900/50 text-xs">{formatDate(item.published_at)}</span>
                                                <span className="text-brand-900 group-hover:text-gold-700 mt-0.5 block text-sm leading-snug font-medium transition-colors">
                                                    {item.title}
                                                </span>
                                            </Link>
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-brand-900/60 text-sm">No other notices yet.</li>
                                )}
                            </ul>
                        </div>

                        {events.length > 0 && (
                            <div className="bg-brand-900 text-cream-50 rounded-3xl p-6">
                                <h2 className="font-display flex items-center gap-2 text-lg font-semibold">
                                    <CalendarClock className="text-gold-400 h-5 w-5" />
                                    Upcoming events
                                </h2>
                                <ul className="mt-4 space-y-4">
                                    {events.map((event) => (
                                        <li key={event.id}>
                                            <p className="text-gold-400 text-xs">{formatDate(event.starts_at)}</p>
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
                                <Link
                                    href={route('site.events')}
                                    className="text-gold-300 hover:text-gold-200 mt-5 inline-block text-sm font-semibold transition-colors"
                                >
                                    View all events →
                                </Link>
                            </div>
                        )}
                    </aside>
                </div>
            </section>
        </PublicLayout>
    );
}
