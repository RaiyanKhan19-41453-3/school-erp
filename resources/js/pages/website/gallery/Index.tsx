import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GalleryItemModal, type GalleryItemRecord } from '@/components/website/gallery-item-modal';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PaginatedData } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Website Gallery', href: '/website/gallery-items' },
];

interface GalleryIndexProps {
    items: PaginatedData<GalleryItemRecord>;
    albums: string[];
    filters: { search: string; album: string; sort: string; direction: string; per_page: number };
}

export default function GalleryIndex({ items, albums, filters }: GalleryIndexProps) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<GalleryItemRecord | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deletingItem, setDeletingItem] = useState<GalleryItemRecord | null>(null);
    const { delete: destroy } = useForm();

    function confirmDelete() {
        if (!deletingItem) return;

        destroy(route('website.gallery-items.destroy', deletingItem.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeletingItem(null);
                toast.success('Gallery image deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete gallery image');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Website Gallery" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">Website Gallery</h2>
                        <p className="text-muted-foreground text-sm">Upload and organise photographs shown in the public gallery</p>
                    </div>
                    <Button onClick={() => setCreateModalOpen(true)}>Upload Image</Button>
                </div>

                <DataTable
                    routeName="website.gallery-items.index"
                    searchPlaceholder="Search gallery images..."
                    columns={[
                        {
                            key: 'image_url',
                            label: 'Image',
                            render: (value: string | null, row: GalleryItemRecord) =>
                                value ? (
                                    <img src={value} alt={row.title ?? row.album} className="h-12 w-20 rounded-md object-cover" />
                                ) : (
                                    <span className="text-muted-foreground">—</span>
                                ),
                        },
                        {
                            key: 'title',
                            label: 'Caption',
                            render: (value: string | null) => value ?? <span className="text-muted-foreground">Untitled</span>,
                        },
                        {
                            key: 'album',
                            label: 'Album',
                            render: (album: string) => <Badge variant="outline">{album}</Badge>,
                        },
                        {
                            key: 'sort_order',
                            label: 'Order',
                            render: (value: number) => <span className="text-sm">{value}</span>,
                        },
                        {
                            key: 'is_published',
                            label: 'Status',
                            render: (published: boolean) => (published ? <Badge>Published</Badge> : <Badge variant="secondary">Draft</Badge>),
                        },
                    ]}
                    data={items}
                    filters={filters}
                    actions={(row) => (
                        <div className="flex items-center justify-end gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setEditingItem(row);
                                    setEditModalOpen(true);
                                }}
                                title="Edit"
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeletingItem(row)} title="Delete">
                                <Trash2 className="text-destructive h-4 w-4" />
                            </Button>
                        </div>
                    )}
                />
            </div>

            <GalleryItemModal open={createModalOpen} onOpenChange={setCreateModalOpen} item={null} albums={albums} />
            <GalleryItemModal open={editModalOpen} onOpenChange={setEditModalOpen} item={editingItem} albums={albums} />
            <ConfirmDialog
                open={deletingItem !== null}
                onOpenChange={(open) => !open && setDeletingItem(null)}
                title="Delete gallery image"
                description="Are you sure you want to delete this image? It will be removed from the public gallery."
                confirmLabel="Delete"
                onConfirm={confirmDelete}
            />
        </AppLayout>
    );
}
