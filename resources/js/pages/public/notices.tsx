import { EmptyState } from '@/components/public/empty-state';
import { NoticeCard, noticeCategoryLabel } from '@/components/public/notice-card';
import { PageHero } from '@/components/public/page-hero';
import { PublicPagination } from '@/components/public/public-pagination';
import PublicLayout from '@/layouts/public-layout';
import { cn } from '@/lib/utils';
import { type PaginatedData, type PublicNotice, type SiteInfo } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Newspaper, Search } from 'lucide-react';
import { type FormEvent, useState } from 'react';

interface NoticesProps {
    site: SiteInfo;
    notices: PaginatedData<PublicNotice>;
    categories: string[];
    filters: { category: string | null; search: string };
}

export default function Notices({ site, notices, categories, filters }: NoticesProps) {
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilters = (category: string | null, nextSearch: string = search) => {
        const query: Record<string, string> = {};

        if (category) {
            query.category = category;
        }

        if (nextSearch.trim()) {
            query.search = nextSearch.trim();
        }

        router.get(route('site.notices'), query, { preserveState: true, preserveScroll: true });
    };

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        applyFilters(filters.category);
    };

    return (
        <PublicLayout site={site}>
            <Head title="Notice Board" />

            <PageHero
                eyebrow="Notice board"
                title="Notices & Announcements"
                description="Stay up to date with routines, exams, holidays and everything happening around the school."
            >
                <div className="mt-8 flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => applyFilters(null)}
                        className={cn(
                            'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                            !filters.category ? 'bg-gold-500 text-brand-950' : 'bg-cream-50/10 text-cream-100 hover:bg-cream-50/20',
                        )}
                    >
                        All
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category}
                            type="button"
                            onClick={() => applyFilters(category)}
                            className={cn(
                                'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                                filters.category === category ? 'bg-gold-500 text-brand-950' : 'bg-cream-50/10 text-cream-100 hover:bg-cream-50/20',
                            )}
                        >
                            {noticeCategoryLabel(category)}
                        </button>
                    ))}
                </div>
                <form onSubmit={onSubmit} className="mt-6 flex max-w-md items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="text-cream-100/50 pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search notices…"
                            className="border-cream-50/20 bg-cream-50/10 text-cream-50 placeholder:text-cream-100/50 focus:border-gold-400 w-full rounded-full border py-2.5 pr-4 pl-10 text-sm focus:outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-cream-50 text-brand-950 hover:bg-gold-300 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors"
                    >
                        Search
                    </button>
                </form>
            </PageHero>

            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                {notices.data.length > 0 ? (
                    <>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {notices.data.map((notice) => (
                                <NoticeCard key={notice.id} notice={notice} />
                            ))}
                        </div>
                        <PublicPagination
                            paginator={notices}
                            routeName="site.notices"
                            params={{ category: filters.category, search: filters.search }}
                        />
                    </>
                ) : (
                    <EmptyState
                        icon={Newspaper}
                        title="No notices found"
                        description="Try a different category or search term — new notices are posted regularly."
                    />
                )}
            </section>
        </PublicLayout>
    );
}
