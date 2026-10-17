import { cn } from '@/lib/utils';

/**
 * Heritage divider: two hairlines meeting at a small lozenge. Used under
 * centered section headings and page titles.
 */
export function Ornament({ className }: { className?: string }) {
    return (
        <span className={cn('flex items-center justify-center gap-3', className)} aria-hidden>
            <span className="bg-brand-900/25 h-px w-9" />
            <span className="bg-brand-700 h-1.5 w-1.5 rotate-45" />
            <span className="bg-brand-900/25 h-px w-9" />
        </span>
    );
}

/**
 * The thick–thin rule used under the masthead and page title bands.
 */
export function DoubleRule({ className }: { className?: string }) {
    return (
        <span className={cn('block', className)} aria-hidden>
            <span className="border-brand-950 block border-b-[3px]" />
            <span className="border-brand-950 mt-[3px] block border-b" />
        </span>
    );
}
