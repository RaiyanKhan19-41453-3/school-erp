import { Ornament } from '@/components/public/ornament';
import { Inbox, type LucideIcon } from 'lucide-react';

export function EmptyState({ icon: Icon = Inbox, title, description }: { icon?: LucideIcon; title: string; description?: string }) {
    return (
        <div className="border-brand-900/20 bg-cream-50 flex flex-col items-center justify-center border px-6 py-14 text-center">
            <span className="text-brand-700 border-brand-900/25 flex h-12 w-12 items-center justify-center border">
                <Icon className="h-5 w-5" />
            </span>
            <p className="font-display text-brand-950 mt-4 text-xl font-semibold tracking-tight">{title}</p>
            <Ornament className="mt-3" />
            {description && <p className="text-brand-900/60 mt-3 max-w-sm text-sm leading-relaxed">{description}</p>}
        </div>
    );
}
