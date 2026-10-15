import { Inbox, type LucideIcon } from 'lucide-react';

export function EmptyState({ icon: Icon = Inbox, title, description }: { icon?: LucideIcon; title: string; description?: string }) {
    return (
        <div className="border-brand-900/20 flex flex-col items-center justify-center rounded-2xl border border-dashed bg-white/60 px-6 py-14 text-center">
            <span className="bg-cream-100 text-gold-600 flex h-12 w-12 items-center justify-center rounded-full">
                <Icon className="h-5 w-5" />
            </span>
            <p className="font-display text-brand-950 mt-4 text-lg font-semibold">{title}</p>
            {description && <p className="text-brand-900/60 mt-1.5 max-w-sm text-sm">{description}</p>}
        </div>
    );
}
