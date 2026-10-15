import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

interface PageHeroProps {
    eyebrow?: string;
    title: string;
    description?: string | null;
    children?: ReactNode;
    className?: string;
}

export function PageHero({ eyebrow, title, description, children, className }: PageHeroProps) {
    return (
        <section className={cn('bg-brand-950 text-cream-50 relative overflow-hidden', className)}>
            <div className="site-dot-pattern absolute inset-0 opacity-60" aria-hidden />
            <div className="bg-gold-500/20 absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl" aria-hidden />
            <div className="bg-brand-500/20 absolute -bottom-32 -left-16 h-72 w-72 rounded-full blur-3xl" aria-hidden />
            <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
                {eyebrow && <p className="text-gold-400 mb-3 text-xs font-semibold tracking-[0.3em] uppercase">{eyebrow}</p>}
                <h1 className="font-display text-3xl leading-tight font-semibold sm:text-4xl lg:text-5xl">{title}</h1>
                {description && <p className="text-cream-100/80 mt-4 max-w-2xl text-sm leading-relaxed sm:text-base">{description}</p>}
                {children}
            </div>
        </section>
    );
}
