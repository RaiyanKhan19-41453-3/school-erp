import { AchievementCard, achievementCategoryLabel } from '@/components/public/achievement-card';
import { EmptyState } from '@/components/public/empty-state';
import { PageHero } from '@/components/public/page-hero';
import { SectionHeading } from '@/components/public/section-heading';
import { SiteCta } from '@/components/public/site-cta';
import PublicLayout from '@/layouts/public-layout';
import { formatDate } from '@/lib/format';
import { type PublicAchievement, type SiteInfo } from '@/types';
import { Head } from '@inertiajs/react';
import { Medal, Trophy } from 'lucide-react';

interface AchievementsProps {
    site: SiteInfo;
    featured: PublicAchievement[];
    achievements: PublicAchievement[];
}

export default function Achievements({ site, featured, achievements }: AchievementsProps) {
    const grouped = achievements.reduce<Record<string, PublicAchievement[]>>((acc, item) => {
        const key = item.achieved_on ? String(new Date(item.achieved_on).getFullYear()) : 'Earlier';

        (acc[key] ??= []).push(item);

        return acc;
    }, {});

    const years = Object.keys(grouped).sort((a, b) => (a === 'Earlier' ? 1 : b === 'Earlier' ? -1 : Number(b) - Number(a)));

    return (
        <PublicLayout site={site}>
            <Head title="Achievements" />

            <PageHero
                eyebrow="Proud moments"
                title="Our Achievements"
                description="Olympiad medals, sports trophies and cultural honours — celebrating the students who carry our name with pride."
            />

            {featured.length > 0 && (
                <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <SectionHeading eyebrow="Highlights" title="Featured achievements" description="The moments we will remember for years." />
                    <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {featured.map((achievement) => (
                            <AchievementCard key={achievement.id} achievement={achievement} featured />
                        ))}
                    </div>
                </section>
            )}

            <section className="bg-cream-100 py-16 lg:py-20">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading eyebrow="Honour roll" title="Every achievement, year by year" />
                    {achievements.length > 0 ? (
                        <div className="mt-10 space-y-12">
                            {years.map((year) => (
                                <div key={year}>
                                    <div className="flex items-center gap-4">
                                        <span className="font-display text-gold-600 text-2xl font-semibold">{year}</span>
                                        <span className="bg-brand-900/15 h-px flex-1" />
                                    </div>
                                    <ul className="mt-6 space-y-5">
                                        {grouped[year].map((achievement) => (
                                            <li
                                                key={achievement.id}
                                                className="border-brand-900/10 flex gap-5 rounded-2xl border bg-white p-6 shadow-sm"
                                            >
                                                <span className="bg-gold-100 text-gold-700 flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
                                                    <Medal className="h-5 w-5" />
                                                </span>
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                                        <h3 className="font-display text-brand-950 text-lg leading-snug font-semibold">
                                                            {achievement.title}
                                                        </h3>
                                                        <span className="bg-brand-100 text-brand-800 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase">
                                                            {achievementCategoryLabel(achievement.category)}
                                                        </span>
                                                    </div>
                                                    {achievement.student_name && (
                                                        <p className="text-gold-700 mt-1 text-sm font-medium">{achievement.student_name}</p>
                                                    )}
                                                    {achievement.description && (
                                                        <p className="text-brand-900/65 mt-2 text-sm leading-relaxed">{achievement.description}</p>
                                                    )}
                                                    {achievement.achieved_on && (
                                                        <p className="text-brand-900/50 mt-2 text-xs">{formatDate(achievement.achieved_on)}</p>
                                                    )}
                                                </div>
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
                                title="Achievements coming soon"
                                description="Our students' proud moments will be showcased here."
                            />
                        </div>
                    )}
                </div>
            </section>

            <SiteCta site={site} title="Your child's achievement story starts here" />
        </PublicLayout>
    );
}
