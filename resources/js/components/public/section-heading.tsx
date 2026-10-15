import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { type ReactNode } from 'react';

interface SectionHeadingProps {
    eyebrow?: string;
    title: string;
    description?: string | null;
    action?: { label: string; href: string };
    className?: string;
    children?: ReactNode;
}

export function SectionHeading({ eyebrow, title, description, action, className, children }: SectionHeadingProps) {
    return (
        <div className={cn('flex flex-wrap items-end justify-between gap-4', className)}>
            <div className="max-w-2xl">
                {eyebrow && <p className="text-gold-600 mb-2.5 text-xs font-semibold tracking-[0.28em] uppercase">{eyebrow}</p>}
                <h2 className="font-display text-brand-950 text-2xl font-semibold sm:text-3xl lg:text-4xl">{title}</h2>
                {description && <p className="text-brand-900/65 mt-3 text-sm leading-relaxed sm:text-base">{description}</p>}
                {children}
            </div>
            {action && (
                <Link
                    href={action.href}
                    className="group text-brand-800 hover:text-gold-600 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
                >
                    {action.label}
                    <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </Link>
            )}
        </div>
    );
}
