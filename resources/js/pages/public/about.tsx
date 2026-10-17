import { PageHero } from '@/components/public/page-hero';
import { SectionHeading } from '@/components/public/section-heading';
import { SiteCta } from '@/components/public/site-cta';
import { useT } from '@/i18n/public';
import PublicLayout from '@/layouts/public-layout';
import { type SiteInfo, type SiteStats } from '@/types';
import { Head } from '@inertiajs/react';

interface AboutProps {
    site: SiteInfo;
    stats: SiteStats | null;
    profile: {
        about: string | null;
        history: string | null;
        mission: string | null;
        vision: string | null;
        principal_name: string | null;
        principal_message: string | null;
    };
}

interface StatItem {
    value: string;
    label: string;
}

function buildStats(stats: SiteStats | null): StatItem[] {
    return [
        { value: stats?.years ?? '', label: 'Years of Excellence' },
        { value: stats?.students ?? '', label: 'Students Enrolled' },
        { value: stats?.teachers ?? '', label: 'Dedicated Teachers' },
        { value: stats?.pass_rate ?? '', label: 'SSC Pass Rate' },
    ].filter((stat) => stat.value !== '');
}

export default function About({ site, stats, profile }: AboutProps) {
    const t = useT();
    const statsBand = buildStats(stats);

    const principalInitials = (profile.principal_name ?? 'Principal')
        .split(/\s+/)
        .filter((word) => /^[A-Za-z]/.test(word))
        .slice(-2)
        .map((word) => word.charAt(0).toUpperCase())
        .join('');

    return (
        <PublicLayout site={site}>
            <Head title="About Us" />

            <PageHero
                title={t('About {name}', { name: site.name })}
                description={site.tagline ?? t('Knowledge · Discipline · Character')}
                breadcrumbs={[{ label: t('Home'), href: '/' }, { label: t('About Us') }]}
            />

            <section className="bg-white">
                <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
                    <SectionHeading eyebrow={t('Who we are')} title={t('A tradition of learning')} />
                    <div className="mt-10 grid gap-14 lg:grid-cols-[1.15fr_0.85fr]">
                        <div>
                            <div className="text-brand-900/80 [&>p:first-child]:first-letter:font-display [&>p:first-child]:first-letter:text-brand-700 space-y-5 text-sm leading-[1.85] sm:text-[15px] [&>p:first-child]:first-letter:float-left [&>p:first-child]:first-letter:mr-2.5 [&>p:first-child]:first-letter:text-5xl [&>p:first-child]:first-letter:leading-[0.9] [&>p:first-child]:first-letter:font-semibold">
                                {(profile.about ?? t('Our school has been a home of learning for thousands of students.'))
                                    .split(/\n{2,}/)
                                    .map((paragraph, index) => (
                                        <p key={index}>{paragraph}</p>
                                    ))}
                            </div>
                            {profile.history && (
                                <div className="border-brand-900/20 bg-cream-100 border-l-brand-800 mt-10 border border-l-4 px-5 py-4">
                                    <p className="text-brand-700 text-[11px] font-semibold tracking-[0.24em] uppercase">{t('Our Journey')}</p>
                                    <p className="text-brand-900/80 mt-2.5 text-sm leading-relaxed">{profile.history}</p>
                                </div>
                            )}
                        </div>

                        <div className="grid content-start gap-6">
                            <div className="bg-brand-950 text-cream-50 p-6 sm:p-7">
                                <p className="border-cream-100/20 text-brand-300 border-b pb-2.5 text-[10px] font-semibold tracking-[0.26em] uppercase">
                                    {t('Our Mission')}
                                </p>
                                <p className="font-display text-cream-100/90 mt-4 text-base leading-relaxed italic sm:text-lg">
                                    {profile.mission ?? t('To nurture knowledge, discipline and character in every student.')}
                                </p>
                            </div>
                            <div className="border-brand-900/20 border bg-white p-6 sm:p-7">
                                <p className="border-brand-950 text-brand-700 border-b pb-2.5 text-[10px] font-semibold tracking-[0.26em] uppercase">
                                    {t('Our Vision')}
                                </p>
                                <p className="text-brand-900/75 mt-4 text-sm leading-relaxed sm:text-base">
                                    {profile.vision ?? t('To be a model institution where academic brilliance and integrity grow together.')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {statsBand.length > 0 && (
                <section className="bg-brand-950">
                    <div className="lg:divide-cream-50/15 mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:divide-x lg:px-8">
                        {statsBand.map((stat, index) => (
                            <div key={stat.label} className={index > 0 ? 'lg:px-8' : undefined}>
                                <p className="font-display text-cream-50 text-3xl font-semibold sm:text-4xl">{stat.value}</p>
                                <p className="text-brand-300 mt-2 text-[10px] font-semibold tracking-[0.2em] uppercase">{t(stat.label)}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {profile.principal_message && (
                <section className="bg-cream-50">
                    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                        <div className="border-brand-900/20 mx-auto max-w-3xl border bg-white">
                            <div className="border-brand-950 border-b-[3px]" aria-hidden />
                            <div className="p-7 sm:p-10">
                                <p className="text-brand-700 text-[10px] font-semibold tracking-[0.28em] uppercase">
                                    {t("From the Principal's Desk")}
                                </p>
                                <p className="font-display text-brand-950/25 mt-4 text-4xl leading-none font-semibold" aria-hidden>
                                    “
                                </p>
                                <p className="font-display text-brand-950 -mt-2 text-base leading-relaxed italic sm:text-lg">
                                    {profile.principal_message}
                                </p>
                                <div className="border-brand-900/20 mt-8 flex items-center gap-4 border-t pt-6">
                                    <span className="border-brand-950 text-brand-950 bg-cream-50 ring-brand-950/10 font-display flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 text-base font-semibold ring-2 ring-inset">
                                        {principalInitials}
                                    </span>
                                    <div>
                                        <p className="font-display text-brand-950 text-lg font-semibold">
                                            {profile.principal_name ?? t('The Principal')}
                                        </p>
                                        <p className="text-brand-900/55 mt-0.5 text-[9px] font-semibold tracking-[0.2em] uppercase">
                                            {t('Principal')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <SiteCta site={site} />
        </PublicLayout>
    );
}
