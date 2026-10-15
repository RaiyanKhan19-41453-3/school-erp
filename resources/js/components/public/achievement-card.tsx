import { formatDate } from '@/lib/format';
import { type PublicAchievement } from '@/types';
import { FlaskConical, Medal, Palette, Star, Trophy } from 'lucide-react';

const categoryMeta: Record<string, { icon: typeof Trophy; classes: string }> = {
    academic: { icon: Medal, classes: 'bg-sky-100 text-sky-700' },
    sports: { icon: Trophy, classes: 'bg-emerald-100 text-emerald-700' },
    cultural: { icon: Palette, classes: 'bg-fuchsia-100 text-fuchsia-700' },
    olympiad: { icon: FlaskConical, classes: 'bg-amber-100 text-amber-700' },
    other: { icon: Star, classes: 'bg-brand-100 text-brand-800' },
};

export function achievementCategoryLabel(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1);
}

export function AchievementCard({ achievement, featured = false }: { achievement: PublicAchievement; featured?: boolean }) {
    const meta = categoryMeta[achievement.category] ?? categoryMeta.other;
    const Icon = meta.icon;

    return (
        <article
            className={
                featured
                    ? 'border-gold-300 to-gold-100/70 relative flex h-full flex-col overflow-hidden rounded-2xl border bg-linear-to-br from-white p-6 shadow-sm'
                    : 'border-brand-900/10 hover:border-gold-400 flex h-full flex-col rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'
            }
        >
            <div className="flex items-center justify-between gap-3">
                <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase ${meta.classes}`}
                >
                    <Icon className="h-3.5 w-3.5" />
                    {achievementCategoryLabel(achievement.category)}
                </span>
                {featured && <span className="text-gold-600 text-[11px] font-semibold tracking-[0.2em] uppercase">Featured</span>}
            </div>
            <h3 className="font-display text-brand-950 mt-4 text-xl leading-snug font-semibold">{achievement.title}</h3>
            {achievement.student_name && <p className="text-gold-700 mt-1.5 text-sm font-medium">{achievement.student_name}</p>}
            {achievement.description && <p className="text-brand-900/65 mt-3 line-clamp-3 text-sm leading-relaxed">{achievement.description}</p>}
            {achievement.achieved_on && <p className="text-brand-900/50 mt-auto pt-4 text-xs">{formatDate(achievement.achieved_on)}</p>}
        </article>
    );
}
