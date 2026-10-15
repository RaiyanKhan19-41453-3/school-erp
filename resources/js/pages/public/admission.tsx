import { PageHero } from '@/components/public/page-hero';
import { SectionHeading } from '@/components/public/section-heading';
import { SiteCta } from '@/components/public/site-cta';
import PublicLayout from '@/layouts/public-layout';
import { type SiteInfo } from '@/types';
import { Head } from '@inertiajs/react';
import { CheckCircle2, FileText, Mail, Phone } from 'lucide-react';

interface AdmissionProps {
    site: SiteInfo;
    admission: {
        info: string | null;
        requirements: string[];
        steps: string[];
    };
}

export default function Admission({ site, admission }: AdmissionProps) {
    const hasRequirements = admission.requirements.length > 0;
    const hasSteps = admission.steps.length > 0;

    return (
        <PublicLayout site={site}>
            <Head title="Admission" />

            <PageHero
                eyebrow="Admissions"
                title="Join Our School Family"
                description={admission.info ?? 'Admission is open for the new academic session — we would love to welcome your child.'}
            >
                <div className="mt-8 flex flex-wrap gap-3">
                    {site.phone && (
                        <a
                            href={`tel:${site.phone}`}
                            className="bg-gold-500 text-brand-950 hover:bg-gold-400 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors"
                        >
                            <Phone className="h-4 w-4" />
                            Call the admission desk
                        </a>
                    )}
                    <a
                        href={site.email ? `mailto:${site.email}` : route('site.contact')}
                        className="border-cream-100/25 text-cream-50 hover:border-gold-400 hover:text-gold-300 inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-colors"
                    >
                        <Mail className="h-4 w-4" />
                        Email us
                    </a>
                </div>
            </PageHero>

            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-2">
                    {hasRequirements && (
                        <div>
                            <SectionHeading
                                eyebrow="Checklist"
                                title="Documents to bring"
                                description="Please prepare the following documents before visiting the school office."
                            />
                            <ul className="mt-8 space-y-4">
                                {admission.requirements.map((requirement) => (
                                    <li
                                        key={requirement}
                                        className="border-brand-900/10 text-brand-900/80 flex items-start gap-3 rounded-2xl border bg-white p-4 text-sm shadow-sm"
                                    >
                                        <CheckCircle2 className="text-gold-600 mt-0.5 h-4.5 w-4.5 shrink-0" />
                                        {requirement}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div>
                        {hasSteps && (
                            <div>
                                <SectionHeading
                                    eyebrow="Process"
                                    title="How to apply"
                                    description={`${admission.steps.length} simple step${admission.steps.length === 1 ? '' : 's'} from first visit to first day of class.`}
                                />
                                <ol className="mt-8 space-y-6">
                                    {admission.steps.map((step, index) => (
                                        <li key={step} className="flex gap-4">
                                            <span className="bg-brand-900 font-display text-gold-300 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                                                {index + 1}
                                            </span>
                                            <p className="text-brand-900/75 pt-1.5 text-sm leading-relaxed">{step}</p>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}

                        <div className="border-gold-300 bg-gold-100/60 mt-10 rounded-2xl border p-6">
                            <p className="text-gold-700 flex items-center gap-2 text-xs font-semibold tracking-[0.25em] uppercase">
                                <FileText className="h-4 w-4" />
                                Office hours
                            </p>
                            <p className="text-brand-900/80 mt-3 text-sm leading-relaxed">
                                Sunday – Thursday, 8:00 AM – 4:00 PM. Admission forms are also available at the school front desk. For quick answers,
                                send us a message and our office will call you back.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <SiteCta site={site} title="Questions about admission?" />
        </PublicLayout>
    );
}
