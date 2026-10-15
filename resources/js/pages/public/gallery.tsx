import { EmptyState } from '@/components/public/empty-state';
import { PageHero } from '@/components/public/page-hero';
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

    return (
        <PublicLayout site={site}>
            <Head title="Gallery" />

            <PageHero
                eyebrow="Photo gallery"
                title="Life at Our School"
                description="Classrooms and playgrounds, festivals and fairs — moments captured from our campus."
            >
                <div className="mt-8 flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => filterByAlbum(null)}
                        className={cn(
                            'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                            !filters.album ? 'bg-gold-500 text-brand-950' : 'bg-cream-50/10 text-cream-100 hover:bg-cream-50/20',
                        )}
                    >
                        All photos
                    </button>
                    {albums.map((album) => (
                        <button
                            key={album}
                            type="button"
                            onClick={() => filterByAlbum(album)}
                            className={cn(
                                'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                                filters.album === album ? 'bg-gold-500 text-brand-950' : 'bg-cream-50/10 text-cream-100 hover:bg-cream-50/20',
                            )}
                        >
                            {album}
                        </button>
                    ))}
                </div>
            </PageHero>

            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                {items.length > 0 ? (
                    <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>figure]:mb-5">
                        {items.map((item, index) => (
                            <figure key={item.id} className="break-inside-avoid">
                                <button
                                    type="button"
                                    onClick={() => setActiveIndex(index)}
                                    className="group border-brand-900/10 relative block w-full overflow-hidden rounded-2xl border bg-white shadow-sm"
                                >
                                    {item.image_url ? (
                                        <img
                                            src={item.image_url}
                                            alt={item.title ?? item.album}
                                            loading="lazy"
                                            className="w-full object-cover transition duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="bg-cream-100 text-brand-900/40 flex aspect-4/3 w-full items-center justify-center">
                                            <Images className="h-8 w-8" />
                                        </div>
                                    )}
                                    <figcaption className="from-brand-950/85 absolute inset-x-0 bottom-0 bg-linear-to-t to-transparent px-4 pt-10 pb-3.5 text-left">
                                        <p className="text-gold-300 text-[11px] font-semibold tracking-[0.2em] uppercase">{item.album}</p>
                                        {item.title && <p className="text-cream-50 mt-0.5 text-sm font-medium">{item.title}</p>}
                                    </figcaption>
                                </button>
                            </figure>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={Images}
                        title="No photos in this album yet"
                        description="New photographs are added regularly — please check back soon."
                    />
                )}
            </section>

            {active && (
                <div className="bg-brand-950/90 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={close}>
                    <button
                        type="button"
                        onClick={close}
                        className="bg-cream-50/10 text-cream-50 hover:bg-cream-50/20 absolute top-5 right-5 flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            step(-1);
                        }}
                        className="bg-cream-50/10 text-cream-50 hover:bg-cream-50/20 absolute left-4 flex h-11 w-11 items-center justify-center rounded-full transition-colors sm:left-8"
                        aria-label="Previous image"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <figure className="max-h-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
                        {active.image_url && (
                            <img
                                src={active.image_url}
                                alt={active.title ?? active.album}
                                className="max-h-[75vh] w-full rounded-2xl object-contain"
                            />
                        )}
                        <figcaption className="mt-4 text-center">
                            <p className="text-gold-300 text-[11px] font-semibold tracking-[0.2em] uppercase">{active.album}</p>
                            {active.title && <p className="font-display text-cream-50 mt-1 text-lg">{active.title}</p>}
                        </figcaption>
                    </figure>
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            step(1);
                        }}
                        className="bg-cream-50/10 text-cream-50 hover:bg-cream-50/20 absolute right-4 flex h-11 w-11 items-center justify-center rounded-full transition-colors sm:right-8"
                        aria-label="Next image"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </div>
            )}
        </PublicLayout>
    );
}
