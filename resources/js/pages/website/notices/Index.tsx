import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NoticeModal, type NoticeRecord } from '@/components/website/notice-modal';
import AppLayout from '@/layouts/app-layout';
import { formatDMY } from '@/lib/format';
import { type BreadcrumbItem, type PaginatedData } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Website Notices', href: '/website/notices' },
];

interface NoticesIndexProps {
    notices: PaginatedData<NoticeRecord>;
    categories: string[];
    filters: { search: string; sort: string; direction: string; per_page: number };
}

export default function NoticesIndex({ notices, categories, filters }: NoticesIndexProps) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editingNotice, setEditingNotice] = useState<NoticeRecord | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deletingNotice, setDeletingNotice] = useState<NoticeRecord | null>(null);
    const { delete: destroy } = useForm();

    function confirmDelete() {
        if (!deletingNotice) return;

        destroy(route('website.notices.destroy', deletingNotice.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeletingNotice(null);
                toast.success('Notice deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete notice');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Website Notices" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">Website Notices</h2>
                        <p className="text-muted-foreground text-sm">Publish notices and announcements to the public notice board</p>
                    </div>
                    <Button onClick={() => setCreateModalOpen(true)}>Add Notice</Button>
                </div>

                <DataTable
                    routeName="website.notices.index"
                    searchPlaceholder="Search notices..."
                    columns={[
                        { key: 'title', label: 'Title', sortable: true },
                        {
                            key: 'category',
                            label: 'Category',
                            render: (category: string) => <Badge variant="outline">{category.charAt(0).toUpperCase() + category.slice(1)}</Badge>,
                        },
                        {
                            key: 'is_published',
                            label: 'Status',
                            render: (published: boolean) => (published ? <Badge>Published</Badge> : <Badge variant="secondary">Draft</Badge>),
                        },
                        {
                            key: 'published_at',
                            label: 'Published',
                            sortable: true,
                            render: (value: string | null) =>
                                value ? <span className="text-sm">{formatDMY(value)}</span> : <span className="text-muted-foreground">—</span>,
                        },
                    ]}
                    data={notices}
                    filters={filters}
                    actions={(row) => (
                        <div className="flex items-center justify-end gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setEditingNotice(row);
                                    setEditModalOpen(true);
                                }}
                                title="Edit"
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeletingNotice(row)} title="Delete">
                                <Trash2 className="text-destructive h-4 w-4" />
                            </Button>
                        </div>
                    )}
                />
            </div>

            <NoticeModal open={createModalOpen} onOpenChange={setCreateModalOpen} notice={null} categories={categories} />
            <NoticeModal open={editModalOpen} onOpenChange={setEditModalOpen} notice={editingNotice} categories={categories} />
            <ConfirmDialog
                open={deletingNotice !== null}
                onOpenChange={(open) => !open && setDeletingNotice(null)}
                title="Delete notice"
                description={`Are you sure you want to delete "${deletingNotice?.title}"? It will disappear from the public notice board.`}
                confirmLabel="Delete"
                onConfirm={confirmDelete}
            />
        </AppLayout>
    );
}
