import { AchievementCard, useAchievementCategoryLabel } from '@/components/public/achievement-card';
import { EmptyState } from '@/components/public/empty-state';
import { PageHero } from '@/components/public/page-hero';
import { SectionHeading } from '@/components/public/section-heading';
import { SiteCta } from '@/components/public/site-cta';
import { usePublicLocale, useT } from '@/i18n/public';
import PublicLayout from '@/layouts/public-layout';
import { formatDate } from '@/lib/format';
import { type PublicAchievement, type SiteInfo } from '@/types';
import { Head } from '@inertiajs/react';
import { Trophy } from 'lucide-react';

interface AchievementsProps {
    site: SiteInfo;
    featured: PublicAchievement[];
    achievements: PublicAchievement[];
}

export default function Achievements({ site, featured, achievements }: AchievementsProps) {
    const t = useT();
    const locale = usePublicLocale();
    const achievementCategory = useAchievementCategoryLabel();

    const featuredIds = new Set(featured.map((item) => item.id));

    const grouped = achievements.reduce<Record<string, PublicAchievement[]>>((acc, item) => {
        if (featuredIds.has(item.id)) {
            return acc;
        }

        const key = item.achieved_on ? String(new Date(item.achieved_on).getFullYear()) : t('Earlier');

        (acc[key] ??= []).push(item);

        return acc;
    }, {});

    const years = Object.keys(grouped).sort((a, b) => (a === t('Earlier') ? 1 : b === t('Earlier') ? -1 : Number(b) - Number(a)));

    return (
        <PublicLayout site={site}>
            <Head title={t('Achievements')} />

            <PageHero
                title={t('Our Achievements')}
                description={t('Olympiad medals, sports trophies and cultural honours — celebrating the students who carry our name with pride.')}
                breadcrumbs={[{ label: t('Home'), href: '/' }, { label: t('Achievements') }]}
            />

            {featured.length > 0 && (
                <section className="py-10 lg:py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <SectionHeading
                            eyebrow={t('Highlights')}
                            title={t('Featured achievements')}
                            description={t('The moments we will remember for years.')}
                        />
                        <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {featured.map((achievement) => (
                                <AchievementCard key={achievement.id} achievement={achievement} featured />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section className="border-brand-900/10 border-t bg-white">
                <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
                    <SectionHeading eyebrow={t('Honour roll')} title={t('Every achievement, year by year')} />
                    {achievements.length > 0 ? (
                        <div className="mt-10 space-y-12">
                            {years.map((year) => (
                                <div key={year}>
                                    <div className="flex items-center gap-4">
                                        <span className="font-display text-brand-700 text-2xl font-semibold">{year}</span>
                                        <span className="border-brand-900/15 h-px flex-1 border-b" />
                                    </div>
                                    <ul className="mt-6 space-y-4">
                                        {grouped[year].map((achievement) => (
                                            <li key={achievement.id} className="border-brand-900/20 bg-cream-50 border p-5">
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                                                    <span className="text-brand-700 border-brand-900/25 flex h-9 w-9 shrink-0 items-center justify-center border bg-white">
                                                        <Trophy className="h-4.5 w-4.5" />
                                                    </span>
                                                    <h3 className="font-display text-brand-950 text-base leading-snug font-semibold">
                                                        {achievement.title}
                                                    </h3>
                                                    <span className="border-brand-900/25 text-brand-800 border bg-white px-2 py-0.5 text-[9px] font-semibold tracking-[0.14em] uppercase">
                                                        {achievementCategory(achievement.category)}
                                                    </span>
                                                </div>
                                                {achievement.student_name && (
                                                    <p className="text-brand-700 mt-2 text-sm font-medium">{achievement.student_name}</p>
                                                )}
                                                {achievement.description && (
                                                    <p className="text-brand-900/60 mt-2 text-sm leading-relaxed">{achievement.description}</p>
                                                )}
                                                {achievement.achieved_on && (
                                                    <p className="text-brand-900/50 mt-2 text-xs">{formatDate(achievement.achieved_on, locale)}</p>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-10">
                            <EmptyState
                                icon={Trophy}
                                title={t('Achievements coming soon')}
                                description={t("Our students' proud moments will be showcased here.")}
                            />
                        </div>
                    )}
                </div>
            </section>

            <SiteCta site={site} title={t("Your child's achievement story starts here")} />
        </PublicLayout>
    );
}
