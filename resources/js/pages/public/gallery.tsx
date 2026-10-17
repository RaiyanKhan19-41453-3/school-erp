import { EmptyState } from '@/components/public/empty-state';
import { PageHero } from '@/components/public/page-hero';
import { useT } from '@/i18n/public';
import PublicLayout from '@/layouts/public-layout';
import { cn } from '@/lib/utils';
import { type PublicGalleryItem, type SiteInfo } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Images, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface GalleryProps {
    site: SiteInfo;
    items: PublicGalleryItem[];
    albums: string[];
    filters: { album: string | null };
}

export default function Gallery({ site, items, albums, filters }: GalleryProps) {
    const t = useT();
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const close = useCallback(() => setActiveIndex(null), []);

    const step = useCallback(
        (direction: number) => {
            setActiveIndex((current) => {
                if (current === null) {
                    return current;
                }

                return (current + direction + items.length) % items.length;
            });
        },
        [items.length],
    );

    useEffect(() => {
        if (activeIndex === null) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                close();
            } else if (event.key === 'ArrowRight') {
                step(1);
            } else if (event.key === 'ArrowLeft') {
                step(-1);
            }
        };

        window.addEventListener('keydown', onKeyDown);

        return () => window.removeEventListener('keydown', onKeyDown);
    }, [activeIndex, close, step]);

    const filterByAlbum = (album: string | null) => {
        router.get(route('site.gallery'), album ? { album } : {}, { preserveScroll: true, preserveState: true });
    };

    const active = activeIndex !== null ? items[activeIndex] : null;

    const filterButton = (label: string, activeAlbum: boolean, onClick: () => void) => (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'border px-4 py-2 text-[11px] font-semibold tracking-[0.12em] uppercase transition-colors',
                activeAlbum
                    ? 'border-brand-950 bg-brand-800 text-cream-50'
                    : 'border-brand-900/30 text-brand-900 hover:border-brand-700 hover:text-brand-700',
            )}
        >
            {label}
        </button>
    );

    return (
        <PublicLayout site={site}>
            <Head title="Gallery" />

            <PageHero
                title={t('Life at Our School')}
                description={t('Classrooms and playgrounds, festivals and fairs — moments captured from our campus.')}
                breadcrumbs={[{ label: t('Home'), href: '/' }, { label: t('Photo Gallery') }]}
            >
                <div className="flex flex-wrap items-center justify-center gap-2.5">
                    {filterButton(t('All photos'), !filters.album, () => filterByAlbum(null))}
                    {albums.map((album) => filterButton(album, filters.album === album, () => filterByAlbum(album)))}
                </div>
            </PageHero>

            <section className="py-10 lg:py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {items.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                            {items.map((item, index) => (
                                <figure key={item.id} className="m-0">
                                    <button
                                        type="button"
                                        onClick={() => setActiveIndex(index)}
                                        className="group border-brand-900/25 hover:border-brand-950 bg-cream-100 relative block aspect-4/3 w-full overflow-hidden border transition-colors"
                                    >
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.title ?? item.album}
                                                loading="lazy"
                                                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                                            />
                                        ) : (
                                            <div className="text-brand-900/40 flex h-full w-full items-center justify-center">
                                                <Images className="h-8 w-8" />
                                            </div>
                                        )}
                                        <figcaption className="from-brand-950/80 absolute inset-x-0 bottom-0 bg-linear-to-t to-transparent px-3.5 pt-10 pb-3 text-left">
                                            <p className="text-brand-300 text-[10px] font-semibold tracking-[0.2em] uppercase">{item.album}</p>
                                            {item.title && <p className="text-cream-50 mt-0.5 truncate text-sm font-medium">{item.title}</p>}
                                        </figcaption>
                                    </button>
                                </figure>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={Images}
                            title={t('No photos in this album yet')}
                            description={t('New photographs are added regularly — please check back soon.')}
                        />
                    )}
                </div>
            </section>

            {active && (
                <div className="bg-brand-950/95 fixed inset-0 z-50 flex items-center justify-center p-4" onClick={close}>
                    <button
                        type="button"
                        onClick={close}
                        className="border-cream-100/25 text-cream-50 hover:border-cream-50 hover:text-cream-50 absolute top-5 right-5 flex h-10 w-10 items-center justify-center border transition-colors"
                        aria-label={t('Close')}
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            step(-1);
                        }}
                        className="border-cream-100/25 text-cream-50 hover:border-cream-50 hover:text-cream-50 absolute left-4 flex h-11 w-11 items-center justify-center border transition-colors sm:left-8"
                        aria-label={t('Previous image')}
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <figure className="max-h-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
                        {active.image_url && (
                            <img src={active.image_url} alt={active.title ?? active.album} className="max-h-[75vh] w-full object-contain" />
                        )}
                        <figcaption className="mt-4 text-center">
                            <p className="text-brand-300 text-[10px] font-semibold tracking-[0.2em] uppercase">{active.album}</p>
                            {active.title && <p className="font-display text-cream-50 mt-1 text-lg">{active.title}</p>}
                        </figcaption>
                    </figure>
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            step(1);
                        }}
                        className="border-cream-100/25 text-cream-50 hover:border-cream-50 hover:text-cream-50 absolute right-4 flex h-11 w-11 items-center justify-center border transition-colors sm:right-8"
                        aria-label={t('Next image')}
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </div>
            )}
        </PublicLayout>
    );
}
