import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { PeriodModal } from '@/components/period-modal';
import { Pencil, Trash2 } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Periods', href: '/periods' },
];

interface Period {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    sort_order: number;
    is_break: boolean;
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

export default function PeriodsIndex({
    periods,
    filters,
}: {
    periods: PaginatedData<Period>;
    filters: { search: string; sort: string; direction: string; per_page: number };
}) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deletingPeriod, setDeletingPeriod] = useState<Period | null>(null);
    const { delete: destroy } = useForm();

    const openEditModal = (row: Period) => {
        setEditingPeriod(row);
        setEditModalOpen(true);
    };

    function confirmDelete() {
        if (!deletingPeriod) return;

        destroy(route('periods.destroy', deletingPeriod.id), {
            onSuccess: () => {
                setDeletingPeriod(null);
                toast.success('Period deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete period');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Periods" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">Periods</h2>
                        <p className="text-muted-foreground text-sm">Define the periods and breaks used in the school timetable</p>
                    </div>
                    <Button onClick={() => setCreateModalOpen(true)}>Add Period</Button>
                </div>

                <DataTable
                    routeName="periods.index"
                    searchPlaceholder="Search periods..."
                    columns={[
                        { key: 'sort_order', label: 'Order', sortable: true },
                        { key: 'name', label: 'Name', sortable: true },
                        { key: 'start_time', label: 'Start', sortable: true },
                        { key: 'end_time', label: 'End', sortable: true },
                        {
                            key: 'is_break',
                            label: 'Type',
                            render: (isBreak: boolean) =>
                                isBreak ? <Badge variant="secondary">Break</Badge> : <Badge>Period</Badge>,
                        },
                    ]}
                    data={periods}
                    filters={filters}
                    actions={(row) => (
                        <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditModal(row)} title="Edit">
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeletingPeriod(row)} title="Delete">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    )}
                />
            </div>

            <PeriodModal open={createModalOpen} onOpenChange={setCreateModalOpen} period={null} />
            <PeriodModal open={editModalOpen} onOpenChange={setEditModalOpen} period={editingPeriod} />
            <ConfirmDialog
                open={deletingPeriod !== null}
                onOpenChange={(open) => !open && setDeletingPeriod(null)}
                title="Delete period"
                description={`Are you sure you want to delete "${deletingPeriod?.name}"? Timetable slots assigned to this period will also be removed.`}
                confirmLabel="Delete"
                onConfirm={confirmDelete}
            />
        </AppLayout>
    );
}
