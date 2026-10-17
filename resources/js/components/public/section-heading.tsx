import { Ornament } from '@/components/public/ornament';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { type ReactNode } from 'react';

interface SectionHeadingProps {
    eyebrow?: string;
    title: ReactNode;
    description?: string | null;
    action?: { label: string; href: string };
    className?: string;
    children?: ReactNode;
}

/**
 * Centered prospectus section heading: small-cap eyebrow, Fraunces title,
 * lozenge ornament, optional description.
 */
export function SectionHeading({ eyebrow, title, description, action, className, children }: SectionHeadingProps) {
    return (
        <div className={cn('mx-auto max-w-2xl text-center', className)}>
            {eyebrow && <p className="text-brand-700 text-[10px] font-semibold tracking-[0.28em] uppercase">{eyebrow}</p>}
            <h2 className="font-display text-brand-950 mt-3 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">{title}</h2>
            <Ornament className="mt-4" />
            {description && <p className="text-brand-900/70 mt-4 text-sm leading-relaxed sm:text-[15px]">{description}</p>}
            {action && (
                <Link
                    href={action.href}
                    className="text-brand-700 hover:text-brand-950 mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.16em] uppercase underline-offset-4 hover:underline"
                >
                    {action.label}
                    <span aria-hidden>→</span>
                </Link>
            )}
            {children}
        </div>
    );
}
