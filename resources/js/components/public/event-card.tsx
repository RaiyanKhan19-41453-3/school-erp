import { formatTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import { type PublicEvent } from '@/types';
import { Clock, MapPin } from 'lucide-react';

export function DateBadge({ date, className }: { date: string; className?: string }) {
    const parsed = new Date(date);
    const day = parsed.getDate();
    const month = new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(parsed);

    return (
        <div className={cn('bg-brand-900 text-cream-50 flex w-16 shrink-0 flex-col items-center rounded-xl px-2 py-2', className)}>
            <span className="font-display text-2xl leading-none font-semibold">{day}</span>
            <span className="text-gold-400 mt-0.5 text-[11px] font-semibold tracking-widest uppercase">{month}</span>
        </div>
    );
}

export function EventCard({ event, muted = false }: { event: PublicEvent; muted?: boolean }) {
    return (
        <article
            className={cn(
                'flex h-full gap-4 rounded-2xl border bg-white p-5 shadow-sm transition',
                muted ? 'border-brand-900/10 opacity-80' : 'border-brand-900/10 hover:border-gold-400 hover:-translate-y-0.5 hover:shadow-md',
            )}
        >
            <DateBadge date={event.starts_at} />
            <div className="min-w-0">
                <h3 className="font-display text-brand-950 text-lg leading-snug font-semibold">{event.title}</h3>
                {event.description && <p className="text-brand-900/65 mt-2 line-clamp-2 text-sm leading-relaxed">{event.description}</p>}
                <div className="text-brand-900/60 mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                    <span className="inline-flex items-center gap-1.5">
                        <Clock className="text-gold-600 h-3.5 w-3.5" />
                        {formatTime(event.starts_at)}
                        {event.ends_at ? ` – ${formatTime(event.ends_at)}` : ''}
                    </span>
                    {event.location && (
                        <span className="inline-flex items-center gap-1.5">
                            <MapPin className="text-gold-600 h-3.5 w-3.5" />
                            {event.location}
                        </span>
                    )}
                </div>
            </div>
        </article>
    );
}
