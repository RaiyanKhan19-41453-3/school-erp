import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { type PublicNotice } from '@/types';
import { Link } from '@inertiajs/react';

const categoryClasses: Record<string, string> = {
    general: 'bg-brand-100 text-brand-800',
    urgent: 'bg-red-100 text-red-700',
    academic: 'bg-sky-100 text-sky-700',
    holiday: 'bg-emerald-100 text-emerald-700',
    exam: 'bg-violet-100 text-violet-700',
};

export function noticeCategoryLabel(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1);
}

export function noticeCategoryClass(category: string): string {
    return categoryClasses[category] ?? 'bg-brand-100 text-brand-800';
}

export function NoticeCard({ notice }: { notice: PublicNotice }) {
    return (
        <Link
            href={route('site.notices.show', notice.id)}
            className="group border-brand-900/10 hover:border-gold-400 flex h-full flex-col rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
            <div className="flex items-center justify-between gap-2">
                <span
                    className={cn('rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase', noticeCategoryClass(notice.category))}
                >
                    {noticeCategoryLabel(notice.category)}
                </span>
                <span className="text-brand-900/50 text-xs">{formatDate(notice.published_at)}</span>
            </div>
            <h3 className="font-display text-brand-950 group-hover:text-brand-700 mt-4 text-xl leading-snug font-semibold transition-colors">
                {notice.title}
            </h3>
            <p className="text-brand-900/65 mt-3 line-clamp-3 text-sm leading-relaxed">{notice.body}</p>
            <span className="text-gold-600 group-hover:text-gold-700 mt-auto pt-4 text-sm font-semibold transition-colors">Read notice →</span>
        </Link>
    );
}
