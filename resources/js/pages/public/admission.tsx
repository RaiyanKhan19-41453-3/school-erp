import { PageHero } from '@/components/public/page-hero';
import { SectionHeading } from '@/components/public/section-heading';
import { SiteCta } from '@/components/public/site-cta';
import { useT } from '@/i18n/public';
import PublicLayout from '@/layouts/public-layout';
import { type SiteInfo } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, Clock, FileText, Mail, Phone } from 'lucide-react';

interface AdmissionProps {
    site: SiteInfo;
    admission: {
        info: string | null;
        requirements: string[];
        steps: string[];
    };
}

export default function Admission({ site, admission }: AdmissionProps) {
    const t = useT();
    const hasRequirements = admission.requirements.length > 0;
    const hasSteps = admission.steps.length > 0;

    return (
        <PublicLayout site={site}>
            <Head title={t('Admission')} />

            <PageHero
                title={t('Admission')}
                description={admission.info ?? t('Admission is open for the new academic session — we would love to welcome your child.')}
                breadcrumbs={[{ label: t('Home'), href: '/' }, { label: t('Admission') }]}
            >
                {site.phone && (
                    <a
                        href={`tel:${site.phone}`}
                        className="bg-brand-800 text-cream-50 hover:bg-brand-950 border-brand-950 inline-flex items-center gap-2 border px-5 py-2.5 text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors"
                    >
                        <Phone className="h-4 w-4" />
                        {t('Call the admission desk')}
                    </a>
                )}
                <a
                    href={site.email ? `mailto:${site.email}` : route('site.contact')}
                    className="border-brand-950 text-brand-950 hover:bg-brand-950 hover:text-cream-50 inline-flex items-center gap-2 border px-5 py-2.5 text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors"
                >
                    <Mail className="h-4 w-4" />
                    {t('Email us')}
                </a>
            </PageHero>

            <section className="py-10 lg:py-14">
                <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
                    <div>
                        {hasRequirements ? (
                            <>
                                <SectionHeading
                                    eyebrow={t('Checklist')}
                                    title={t('Documents to bring')}
                                    description={t('Please prepare the following documents before visiting the school office.')}
                                />
                                <ul className="border-brand-900/20 divide-brand-900/10 mt-8 divide-y border bg-white">
                                    {admission.requirements.map((requirement) => (
                                        <li key={requirement} className="text-brand-900/75 flex items-start gap-3 px-5 py-4 text-sm">
                                            <CheckCircle2 className="text-brand-700 mt-0.5 h-4 w-4 shrink-0" />
                                            {requirement}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <div className="bg-cream-100 border-l-brand-800 border border-l-4 p-6">
                                <p className="text-brand-700 text-[11px] font-semibold tracking-[0.24em] uppercase">{t('Admission Enquiry')}</p>
                                <p className="text-brand-900/80 mt-3 text-sm leading-relaxed">
                                    {t('Visit the school office with your child for admission details, seat availability and the application form.')}
                                </p>
                            </div>
                        )}
                    </div>

                    <div>
                        {hasSteps && (
                            <>
                                <SectionHeading
                                    eyebrow={t('Process')}
                                    title={t('How to apply')}
                                    description={
                                        admission.steps.length === 1
                                            ? t('{count} simple step from first visit to first day of class.', { count: admission.steps.length })
                                            : t('{count} simple steps from first visit to first day of class.', { count: admission.steps.length })
                                    }
                                />
                                <ol className="mt-8 space-y-5">
                                    {admission.steps.map((step, index) => (
                                        <li key={step} className="flex gap-4">
                                            <span className="bg-brand-950 text-cream-50 font-display flex h-9 w-9 shrink-0 items-center justify-center text-sm font-semibold">
                                                {index + 1}
                                            </span>
                                            <p className="text-brand-900/75 pt-2 text-sm leading-relaxed">{step}</p>
                                        </li>
                                    ))}
                                </ol>
                            </>
                        )}

                        <div className="bg-cream-100 border-l-brand-800 mt-10 border border-l-4 p-6">
                            <p className="text-brand-700 flex items-center gap-2 text-[11px] font-semibold tracking-[0.24em] uppercase">
                                <FileText className="h-4 w-4" />
                                {t('Office Hours')}
                            </p>
                            <p className="text-brand-900/80 mt-3 flex items-start gap-2.5 text-sm leading-relaxed">
                                <Clock className="text-brand-700 mt-0.5 h-4 w-4 shrink-0" />
                                <span>
                                    {t('Sunday – Thursday, 8:00 AM – 4:00 PM.')}
                                    <br />
                                    {t('Admission forms are available at the school front desk.')} {t('For quick answers,')}{' '}
                                    <Link href={route('site.contact')} className="hover:text-brand-700 font-semibold">
                                        {t('send us a message')}
                                    </Link>{' '}
                                    {t('— our office will call you back.')}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <SiteCta site={site} title={t('Questions about admission?')} />
        </PublicLayout>
    );
}
