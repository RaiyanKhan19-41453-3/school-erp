import { usePublicLocale, useT } from '@/i18n/public';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { type PublicNotice } from '@/types';
import { Link } from '@inertiajs/react';

const categoryClasses: Record<string, string> = {
    general: 'bg-brand-100 text-brand-800 border-brand-900/25',
    urgent: 'bg-red-50 text-red-700 border-red-300/60',
    academic: 'bg-sky-50 text-sky-700 border-sky-300/60',
    holiday: 'bg-emerald-50 text-emerald-700 border-emerald-300/60',
    exam: 'bg-violet-50 text-violet-700 border-violet-300/60',
};

export function noticeCategoryClass(category: string): string {
    return categoryClasses[category] ?? 'bg-brand-100 text-brand-800 border-brand-900/25';
}

export function useNoticeCategoryLabel(): (category: string) => string {
    const t = useT();

    return (category) => {
        const translated = t(category);

        return translated === category ? category.charAt(0).toUpperCase() + category.slice(1) : translated;
    };
}

export function NoticeChip({ category, className }: { category: string; className?: string }) {
    const label = useNoticeCategoryLabel();

    return (
        <span
            className={cn(
                'inline-flex items-center border px-2 py-0.5 text-[9px] font-semibold tracking-[0.14em] uppercase',
                noticeCategoryClass(category),
                className,
            )}
        >
            {label(category)}
        </span>
    );
}

export function NoticeRow({ notice }: { notice: PublicNotice }) {
    const locale = usePublicLocale();
    const date = notice.published_at ? new Date(notice.published_at) : null;
    const hasDate = date !== null && !Number.isNaN(date.getTime());

    return (
        <Link
            href={route('site.notices.show', notice.id)}
            className="group border-brand-900/10 hover:bg-cream-100/70 grid grid-cols-[64px_1fr] items-start gap-4 border-b px-5 py-4 transition-colors last:border-b-0 sm:grid-cols-[64px_1fr_120px]"
        >
            <div className="text-center">
                <p className="font-display text-brand-800 text-2xl leading-none font-semibold">{hasDate ? date.getDate() : '—'}</p>
                <p className="text-brand-900/55 mt-1.5 text-[9px] font-semibold tracking-[0.12em] uppercase">
                    {hasDate
                        ? locale === 'bn'
                            ? new Intl.DateTimeFormat('bn-BD', { month: 'short' }).format(date)
                            : `${new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(date)} '${String(date.getFullYear()).slice(2)}`
                        : '—'}
                </p>
            </div>
            <div className="min-w-0">
                <p className="text-brand-950 group-hover:text-brand-700 decoration-brand-700 text-[15px] leading-snug font-semibold underline-offset-4 group-hover:underline">
                    {notice.title}
                </p>
                <div className="mt-2 flex items-center gap-2.5 sm:hidden">
                    <NoticeChip category={notice.category} />
                    {hasDate && <span className="text-brand-900/45 text-xs">{formatDate(notice.published_at, locale)}</span>}
                </div>
                {hasDate && <p className="text-brand-900/45 mt-1.5 hidden text-xs sm:block">{formatDate(notice.published_at, locale)}</p>}
            </div>
            <div className="hidden justify-end pt-1 sm:flex">
                <NoticeChip category={notice.category} />
            </div>
        </Link>
    );
}
