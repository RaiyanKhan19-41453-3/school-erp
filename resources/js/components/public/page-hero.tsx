import { DoubleRule, Ornament } from '@/components/public/ornament';
import { cn } from '@/lib/utils';
import { Fragment, type ReactNode } from 'react';

interface Crumb {
    label: string;
    href?: string;
}

interface PageHeroProps {
    title: ReactNode;
    description?: string | null;
    breadcrumbs?: Crumb[];
    children?: ReactNode;
    className?: string;
}

/**
 * Page title band: centered prospectus-style heading on paper cream, with
 * small-cap breadcrumbs and a thick–thin rule closing the band.
 */
export function PageHero({ title, description, breadcrumbs, children, className }: PageHeroProps) {
    return (
        <section className={cn('bg-cream-100', className)}>
            <div className="mx-auto max-w-4xl px-4 py-11 text-center sm:px-6 lg:px-8 lg:py-14">
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <nav aria-label="Breadcrumb">
                        <ol className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase">
                            {breadcrumbs.map((crumb, index) => (
                                <Fragment key={`${crumb.label}-${index}`}>
                                    {index > 0 && (
                                        <li aria-hidden className="text-brand-900/35">
                                            ›
                                        </li>
                                    )}
                                    <li>
                                        {crumb.href ? (
                                            <a
                                                href={crumb.href}
                                                className="text-brand-900/60 hover:text-brand-700 underline-offset-4 hover:underline"
                                            >
                                                {crumb.label}
                                            </a>
                                        ) : (
                                            <span className="text-brand-950">{crumb.label}</span>
                                        )}
                                    </li>
                                </Fragment>
                            ))}
                        </ol>
                    </nav>
                )}
                <h1 className="font-display text-brand-950 mx-auto mt-4 max-w-3xl text-4xl leading-[1.08] font-semibold tracking-tight sm:text-5xl">
                    {title}
                </h1>
                {description && <p className="text-brand-900/70 mx-auto mt-4 max-w-2xl text-sm leading-relaxed sm:text-base">{description}</p>}
                <Ornament className="mt-6" />
                {children && <div className="mt-7 flex flex-wrap items-center justify-center gap-3">{children}</div>}
            </div>
            <DoubleRule />
        </section>
    );
}
