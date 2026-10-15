import { PageHero } from '@/components/public/page-hero';
import { SectionHeading } from '@/components/public/section-heading';
import { SiteCta } from '@/components/public/site-cta';
import PublicLayout from '@/layouts/public-layout';
import { type SiteInfo, type SiteStats } from '@/types';
import { Head } from '@inertiajs/react';
import { BookOpenCheck, Eye, Quote, Target } from 'lucide-react';

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

export default function About({ site, stats, profile }: AboutProps) {
    const statBand = [
        { value: stats?.years ?? '—', label: 'Years of Excellence' },
        { value: stats?.students ?? '—', label: 'Students Enrolled' },
        { value: stats?.teachers ?? '—', label: 'Dedicated Teachers' },
        { value: stats?.pass_rate ?? '—', label: 'SSC Pass Rate' },
    ];

    return (
        <PublicLayout site={site}>
            <Head title="About Us" />

            <PageHero eyebrow="About us" title={`About ${site.name}`} description={site.tagline ?? 'Knowledge · Discipline · Character'} />

            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
                    <div>
                        <SectionHeading eyebrow="Who we are" title="A tradition of learning" />
                        <div className="text-brand-900/75 mt-6 space-y-5 text-sm leading-relaxed sm:text-base">
                            {(profile.about ?? 'Our school has been a home of learning for thousands of students.')
                                .split(/\n{2,}/)
                                .map((paragraph, index) => (
                                    <p key={index}>{paragraph}</p>
                                ))}
                        </div>
                        {profile.history && (
                            <div className="border-gold-300 bg-gold-100/60 mt-10 rounded-2xl border p-6">
                                <p className="text-gold-700 flex items-center gap-2 text-xs font-semibold tracking-[0.25em] uppercase">
                                    <BookOpenCheck className="h-4 w-4" />
                                    Our Journey
                                </p>
                                <p className="text-brand-900/80 mt-3 text-sm leading-relaxed">{profile.history}</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-5">
                        <div className="bg-brand-900 text-cream-50 rounded-2xl p-7">
                            <span className="bg-cream-50/10 text-gold-400 flex h-11 w-11 items-center justify-center rounded-full">
                                <Target className="h-5 w-5" />
                            </span>
                            <h3 className="font-display mt-4 text-xl font-semibold">Our Mission</h3>
                            <p className="text-cream-100/80 mt-3 text-sm leading-relaxed">
                                {profile.mission ?? 'To nurture knowledge, discipline and character in every student.'}
                            </p>
                        </div>
                        <div className="border-brand-900/10 rounded-2xl border bg-white p-7 shadow-sm">
                            <span className="bg-gold-100 text-gold-700 flex h-11 w-11 items-center justify-center rounded-full">
                                <Eye className="h-5 w-5" />
                            </span>
                            <h3 className="font-display text-brand-950 mt-4 text-xl font-semibold">Our Vision</h3>
                            <p className="text-brand-900/70 mt-3 text-sm leading-relaxed">
                                {profile.vision ?? 'To be a model institution where academic brilliance and integrity grow together.'}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-brand-900">
                <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
                    {statBand.map((stat) => (
                        <div key={stat.label} className="text-center lg:text-left">
                            <p className="font-display text-gold-400 text-3xl font-semibold sm:text-4xl">{stat.value}</p>
                            <p className="text-cream-100/70 mt-1.5 text-xs font-medium tracking-wider uppercase">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {profile.principal_message && (
                <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                    <div className="border-brand-900/10 mx-auto max-w-3xl rounded-3xl border bg-white p-8 shadow-sm sm:p-10">
                        <Quote className="text-gold-500 h-8 w-8" />
                        <p className="text-brand-900/75 mt-5 text-sm leading-relaxed sm:text-base">{profile.principal_message}</p>
                        <div className="border-brand-900/10 mt-8 flex items-center gap-4 border-t pt-6">
                            <span className="bg-brand-900 font-display text-gold-300 flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold">
                                {(profile.principal_name ?? 'Principal')
                                    .split(/\s+/)
                                    .filter((word) => /^[A-Za-z]/.test(word))
                                    .slice(-2)
                                    .map((word) => word.charAt(0).toUpperCase())
                                    .join('')}
                            </span>
                            <div>
                                <p className="font-display text-brand-950 text-lg font-semibold">{profile.principal_name ?? 'The Principal'}</p>
                                <p className="text-gold-600 text-xs tracking-wider uppercase">Principal</p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <SiteCta site={site} />
        </PublicLayout>
    );
}
