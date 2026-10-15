import { type SiteInfo } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowRight, PhoneCall } from 'lucide-react';

export function SiteCta({ site, title = 'Ready to join our community?' }: { site: SiteInfo; title?: string }) {
    return (
        <section className="bg-cream-100 py-16 lg:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="site-dot-pattern bg-brand-950 text-cream-50 relative overflow-hidden rounded-3xl px-8 py-12 sm:px-12 lg:px-16">
                    <div className="bg-gold-500/25 absolute -top-20 -right-16 h-56 w-56 rounded-full blur-3xl" aria-hidden />
                    <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
                        <div className="max-w-xl">
                            <p className="text-gold-400 text-xs font-semibold tracking-[0.3em] uppercase">Admissions open</p>
                            <h2 className="font-display mt-3 text-2xl leading-tight font-semibold sm:text-3xl">{title}</h2>
                            <p className="text-cream-100/75 mt-3 text-sm leading-relaxed">
                                Visit our campus, meet our teachers and see the classrooms where your child will learn and grow. We are always happy
                                to answer your questions.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                href={route('site.admission')}
                                className="bg-gold-500 text-brand-950 hover:bg-gold-400 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors"
                            >
                                Admission Details
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href={route('site.contact')}
                                className="border-cream-100/25 text-cream-50 hover:border-gold-400 hover:text-gold-300 inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-colors"
                            >
                                <PhoneCall className="h-4 w-4" />
                                {site.phone ?? 'Contact us'}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
