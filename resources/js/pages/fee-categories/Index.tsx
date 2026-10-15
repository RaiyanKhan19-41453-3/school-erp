import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table';
import { FeeCategoryModal } from '@/components/fee-category-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Fee Categories', href: '/fee-categories' },
];

interface FeeCategory {
    id: number;
    name: string;
    fee_structures_count: number;
    created_at: string;
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

export default function FeeCategoriesIndex({
    categories,
    filters,
}: {
    categories: PaginatedData<FeeCategory>;
    filters: { search: string; sort: string; direction: string; per_page: number };
}) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<FeeCategory | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deletingCategory, setDeletingCategory] = useState<FeeCategory | null>(null);
    const { delete: destroy } = useForm();

    const openEditModal = (row: FeeCategory) => {
        setEditingCategory(row);
        setEditModalOpen(true);
    };

    function confirmDelete() {
        if (!deletingCategory) return;

        destroy(route('fee-categories.destroy', deletingCategory.id), {
            onSuccess: () => {
                setDeletingCategory(null);
                toast.success('Fee category deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete fee category');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Fee Categories" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">Fee Categories</h2>
                        <p className="text-muted-foreground text-sm">Manage fee categories like Tuition, Transport, and Library</p>
                    </div>
                    <Button onClick={() => setCreateModalOpen(true)}>Add Fee Category</Button>
                </div>

                <DataTable
                    routeName="fee-categories.index"
                    searchPlaceholder="Search categories..."
                    columns={[
                        { key: 'name', label: 'Name', sortable: true },
                        {
                            key: 'fee_structures_count',
                            label: 'Fee Structures',
                            render: (count: number) => <Badge variant="secondary">{count} linked</Badge>,
                        },
                    ]}
                    data={categories}
                    filters={filters}
                    actions={(row) => (
                        <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditModal(row)} title="Edit">
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeletingCategory(row)} title="Delete">
                                <Trash2 className="text-destructive h-4 w-4" />
                            </Button>
                        </div>
                    )}
                />
            </div>

            <FeeCategoryModal open={createModalOpen} onOpenChange={setCreateModalOpen} category={null} />
            <FeeCategoryModal open={editModalOpen} onOpenChange={setEditModalOpen} category={editingCategory} />
            <ConfirmDialog
                open={deletingCategory !== null}
                onOpenChange={(open) => !open && setDeletingCategory(null)}
                title="Delete fee category"
                description={`Are you sure you want to delete "${deletingCategory?.name}"? This will not delete existing invoices but will remove the category and its fee structures.`}
                confirmLabel="Delete"
                onConfirm={confirmDelete}
            />
        </AppLayout>
    );
}
