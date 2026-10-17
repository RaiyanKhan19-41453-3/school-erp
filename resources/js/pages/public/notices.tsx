import { EmptyState } from '@/components/public/empty-state';
import { NoticeRow, useNoticeCategoryLabel } from '@/components/public/notice-card';
import { PageHero } from '@/components/public/page-hero';
import { PublicPagination } from '@/components/public/public-pagination';
import { useT } from '@/i18n/public';
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
    const t = useT();
    const categoryLabel = useNoticeCategoryLabel();
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
            <Head title={t('Notice Board')} />

            <PageHero
                title={t('Notice Board')}
                description={t('Stay up to date with routines, exams, holidays and everything happening around the school.')}
                breadcrumbs={[{ label: t('Home'), href: '/' }, { label: t('Notice Board') }]}
            />

            <section className="py-10 lg:py-12">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="border-brand-900/20 border bg-white p-5">
                        <div className="flex flex-wrap items-center gap-2">
                            {['', ...categories].map((category) => {
                                const isActive = (filters.category ?? '') === category;

                                return (
                                    <button
                                        key={category || 'all'}
                                        type="button"
                                        onClick={() => applyFilters(category || null)}
                                        className={cn(
                                            'border px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase transition-colors',
                                            isActive
                                                ? 'border-brand-950 bg-brand-800 text-cream-50'
                                                : 'border-brand-900/25 text-brand-900 hover:border-brand-700 hover:text-brand-700',
                                        )}
                                    >
                                        {category ? categoryLabel(category) : t('All')}
                                    </button>
                                );
                            })}
                        </div>
                        <form onSubmit={onSubmit} className="border-brand-900/15 mt-5 flex max-w-md items-center gap-2 border-t pt-5">
                            <div className="relative flex-1">
                                <Search className="text-brand-900/40 pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder={t('Search notices…')}
                                    className="border-brand-900/25 text-brand-950 placeholder:text-brand-900/40 focus:border-brand-700 w-full border bg-white px-4 py-2.5 pl-10 text-sm focus:outline-none"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-brand-800 hover:bg-brand-950 border-brand-950 text-cream-50 border px-4 py-2.5 text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors"
                            >
                                {t('Search')}
                            </button>
                        </form>
                    </div>

                    <div className="mt-8">
                        {notices.data.length > 0 ? (
                            <>
                                <div className="border-brand-900/20 overflow-hidden border bg-white">
                                    <div className="border-brand-950 grid grid-cols-[64px_1fr_120px] border-b-2 px-5 pt-4 pb-2 text-[9px] font-semibold tracking-[0.2em] uppercase">
                                        <span>{t('Date')}</span>
                                        <span>{t('Notice')}</span>
                                        <span className="hidden text-right sm:block">{t('Category')}</span>
                                    </div>
                                    {notices.data.map((notice) => (
                                        <NoticeRow key={notice.id} notice={notice} />
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
                                title={t('No notices found')}
                                description={t('Try a different category or search term — new notices are posted regularly.')}
                            />
                        )}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
