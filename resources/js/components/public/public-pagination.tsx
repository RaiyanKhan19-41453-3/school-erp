import { cn } from '@/lib/utils';
import { type PaginatedData } from '@/types';
import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PublicPaginationProps {
    paginator: PaginatedData<unknown>;
    routeName: string;
    params?: Record<string, string | number | null | undefined>;
}

export function PublicPagination({ paginator, routeName, params = {} }: PublicPaginationProps) {
    if (paginator.last_page <= 1) {
        return null;
    }

    const go = (page: number) => {
        const query = Object.fromEntries(Object.entries(params).filter(([, value]) => value !== null && value !== undefined && value !== ''));

        router.get(route(routeName), { ...query, page }, { preserveScroll: true, preserveState: true });
    };

    let start = Math.max(1, paginator.current_page - 2);
    const end = Math.min(paginator.last_page, start + 4);
    start = Math.max(1, end - 4);

    const pages = Array.from({ length: end - start + 1 }, (_, index) => start + index);

    return (
        <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
            <button
                type="button"
                onClick={() => go(paginator.current_page - 1)}
                disabled={paginator.current_page === 1}
                className="border-brand-900/15 text-brand-900 hover:border-gold-500 hover:text-gold-600 flex h-9 w-9 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>
            {pages.map((page) => (
                <button
                    key={page}
                    type="button"
                    onClick={() => go(page)}
                    className={cn(
                        'h-9 min-w-9 rounded-full px-3 text-sm font-medium transition-colors',
                        page === paginator.current_page
                            ? 'bg-brand-900 text-cream-50'
                            : 'border-brand-900/15 text-brand-900 hover:border-gold-500 hover:text-gold-600 border',
                    )}
                >
                    {page}
                </button>
            ))}
            <button
                type="button"
                onClick={() => go(paginator.current_page + 1)}
                disabled={paginator.current_page === paginator.last_page}
                className="border-brand-900/15 text-brand-900 hover:border-gold-500 hover:text-gold-600 flex h-9 w-9 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </nav>
    );
}
