import { usePublicLocale } from '@/i18n/public';
import { formatDate, formatTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import { type PublicEvent } from '@/types';
import { Clock, MapPin } from 'lucide-react';

export function DateBadge({ date, className }: { date: string; className?: string }) {
    const locale = usePublicLocale();
    const parsed = new Date(date);
    const day = new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric' }).format(parsed);
    const month = new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-GB', { month: 'short' }).format(parsed);

    return (
        <div className={cn('border-brand-900/25 bg-cream-100 text-brand-950 flex w-16 shrink-0 flex-col items-center border py-2.5', className)}>
            <span className="font-display text-2xl leading-none font-semibold">{day}</span>
            <span className="text-brand-700 mt-1.5 text-[9px] font-semibold tracking-[0.14em] uppercase">{month}</span>
        </div>
    );
}

export function EventRow({ event, muted = false }: { event: PublicEvent; muted?: boolean }) {
    const locale = usePublicLocale();

    return (
        <article className={cn('border-brand-900/10 flex items-start gap-4 border-b px-5 py-4 last:border-b-0 sm:gap-5', muted && 'opacity-65')}>
            <DateBadge date={event.starts_at} />
            <div className="min-w-0 flex-1">
                <h3 className="font-display text-brand-950 text-base leading-snug font-semibold tracking-tight">{event.title}</h3>
                <p className="text-brand-900/60 mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span className="inline-flex items-center gap-1.5">
                        <Clock className="text-brand-700 h-3.5 w-3.5" />
                        {formatDate(event.starts_at, locale)} · {formatTime(event.starts_at, locale)}
                        {event.ends_at ? ` – ${formatTime(event.ends_at, locale)}` : ''}
                    </span>
                    {event.location && (
                        <span className="inline-flex items-center gap-1.5">
                            <MapPin className="text-brand-700 h-3.5 w-3.5" />
                            {event.location}
                        </span>
                    )}
                </p>
                {event.description && <p className="text-brand-900/65 mt-2 line-clamp-2 text-sm leading-relaxed">{event.description}</p>}
            </div>
        </article>
    );
}
