import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { type ReactNode } from 'react';

interface WidgetPanelProps {
    title: ReactNode;
    action?: { label: string; href: string };
    className?: string;
    bodyClassName?: string;
    children?: ReactNode;
}

/**
 * Prospectus content box: hairline frame, Fraunces title closed by a heavy
 * rule — rules instead of filled colour blocks.
 */
export function WidgetPanel({ title, action, className, bodyClassName, children }: WidgetPanelProps) {
    return (
        <div className={cn('border-brand-900/20 border bg-white', className)}>
            <div className="border-brand-950 flex items-baseline justify-between gap-4 border-b-2 px-5 pt-4 pb-2.5">
                <h3 className="font-display text-lg leading-none font-semibold tracking-tight">{title}</h3>
                {action && (
                    <Link
                        href={action.href}
                        className="text-brand-700 hover:text-brand-950 text-[10px] font-semibold tracking-[0.16em] whitespace-nowrap uppercase underline-offset-4 hover:underline"
                    >
                        {action.label} →
                    </Link>
                )}
            </div>
            <div className={bodyClassName}>{children}</div>
        </div>
    );
}
