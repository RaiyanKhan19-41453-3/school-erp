import { useT } from '@/i18n/public';
import { type SiteInfo } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowRight, PhoneCall } from 'lucide-react';

export function SiteCta({ site, title }: { site: SiteInfo; title?: string }) {
    const t = useT();

    return (
        <section className="bg-brand-950 text-cream-50">
            <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20">
                <p className="text-brand-300 text-[10px] font-semibold tracking-[0.3em] uppercase">{t('Admissions open')}</p>
                <h2 className="font-display mt-4 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
                    {title ? t(title) : t('Come and see the school for yourself')}
                </h2>
                <p className="text-cream-100/70 mx-auto mt-5 max-w-2xl text-sm leading-relaxed sm:text-[15px]">
                    {t(
                        'Visit our campus, meet our teachers and see the classrooms where your child will learn and grow. We are always happy to answer your questions.',
                    )}
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <Link
                        href={route('site.admission')}
                        className="bg-cream-50 text-brand-950 hover:bg-cream-100 border-cream-50 inline-flex items-center gap-2 border px-6 py-3.5 text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors"
                    >
                        {t('Admission Details')}
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                        href={route('site.contact')}
                        className="border-cream-100/40 text-cream-50 hover:border-cream-50 inline-flex items-center gap-2 border px-6 py-3.5 text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors"
                    >
                        <PhoneCall className="h-4 w-4" />
                        {site.phone ?? t('Contact us')}
                    </Link>
                </div>
            </div>
        </section>
    );
}
