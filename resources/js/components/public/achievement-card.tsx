import { useT } from '@/i18n/public';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { type PublicAchievement } from '@/types';
import { Award } from 'lucide-react';

export function useAchievementCategoryLabel(): (category: string) => string {
    const t = useT();

    return (category) => {
        const translated = t(category);

        return translated === category ? category.charAt(0).toUpperCase() + category.slice(1) : translated;
    };
}

export function AchievementCard({ achievement, featured = false }: { achievement: PublicAchievement; featured?: boolean }) {
    const t = useT();
    const label = useAchievementCategoryLabel();

    return (
        <article className={cn('flex h-full flex-col border', featured ? 'border-brand-950 bg-cream-100' : 'border-brand-900/20 bg-white')}>
            <div className="border-brand-900/20 flex items-center justify-between gap-3 border-b px-5 py-3">
                <span className="text-brand-700 inline-flex items-center gap-1.5 text-[9px] font-semibold tracking-[0.18em] uppercase">
                    <Award className="h-3.5 w-3.5" />
                    {label(achievement.category)}
                </span>
                {featured && (
                    <span className="bg-brand-800 text-cream-50 border-brand-950 border px-2 py-0.5 text-[9px] font-semibold tracking-[0.16em] uppercase">
                        {t('Featured')}
                    </span>
                )}
            </div>
            <div className="flex flex-1 flex-col px-5 py-4">
                <h3 className="font-display text-brand-950 text-lg leading-snug font-semibold tracking-tight">{achievement.title}</h3>
                {achievement.student_name && <p className="text-brand-700 mt-1 text-sm font-semibold">{achievement.student_name}</p>}
                {achievement.description && (
                    <p className="text-brand-900/65 mt-2.5 line-clamp-3 text-sm leading-relaxed">{achievement.description}</p>
                )}
                {achievement.achieved_on && (
                    <p className="border-brand-900/15 text-brand-900/50 mt-auto border-t pt-3 text-[10px] font-semibold tracking-[0.14em] uppercase">
                        {formatDate(achievement.achieved_on)}
                    </p>
                )}
            </div>
        </article>
    );
}
