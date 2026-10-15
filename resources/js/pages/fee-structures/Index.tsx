import { AcademicYearFilter } from '@/components/academic-year-filter';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table';
import { FeeStructureModal } from '@/components/fee-structure-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Fee Structures', href: '/fee-structures' },
];

interface SchoolClass {
    id: number;
    name: string;
}

interface FeeCategory {
    id: number;
    name: string;
}

interface AcademicYear {
    id: number;
    name: string;
    is_current: boolean;
}

interface FeeStructure {
    id: number;
    class_id: number;
    fee_category_id: number;
    amount: string;
    frequency: string;
    due_day: number | null;
    class: { id: number; name: string };
    fee_category: { id: number; name: string };
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

const FREQUENCY_LABELS: Record<string, string> = {
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    annual: 'Annual',
    one_time: 'One-time',
};

export default function FeeStructuresIndex({
    feeStructures,
    filters,
    classes,
    categories,
    academicYears,
    selectedYearIsCurrent,
}: {
    feeStructures: PaginatedData<FeeStructure>;
    filters: { search: string; sort: string; direction: string; per_page: number; class_id: number | null; year_id: number | null };
    classes: SchoolClass[];
    categories: FeeCategory[];
    academicYears: AcademicYear[];
    selectedYearIsCurrent: boolean;
}) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deletingStructure, setDeletingStructure] = useState<FeeStructure | null>(null);
    const { delete: destroy } = useForm();
    const [selectedYear, setSelectedYear] = useState<string>(filters.year_id ? String(filters.year_id) : '');
    const [selectedClass, setSelectedClass] = useState<string>(filters.class_id ? String(filters.class_id) : 'all');

    const openEditModal = (row: FeeStructure) => {
        setEditingStructure(row);
        setEditModalOpen(true);
    };

    function applyYearFilter(value: string) {
        setSelectedYear(value);
        setSelectedClass('all');

        router.get(
            route('fee-structures.index'),
            {
                search: filters.search,
                page: 1,
                sort: filters.sort,
                direction: filters.direction,
                per_page: filters.per_page,
                year_id: value,
            },
            { preserveState: true, preserveScroll: true },
        );
    }

    function applyClassFilter(value: string) {
        setSelectedClass(value);
        router.get(
            route('fee-structures.index'),
            {
                search: filters.search,
                page: 1,
                sort: filters.sort,
                direction: filters.direction,
                per_page: filters.per_page,
                year_id: selectedYear,
                class_id: value === 'all' ? '' : value,
            },
            { preserveState: true, preserveScroll: true },
        );
    }

    function confirmDelete() {
        if (!deletingStructure) return;

        destroy(route('fee-structures.destroy', deletingStructure.id), {
            onSuccess: () => {
                setDeletingStructure(null);
                toast.success('Fee structure deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete fee structure');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Fee Structures" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">Fee Structures</h2>
                        <p className="text-muted-foreground text-sm">Define what each class is supposed to pay for the selected academic year</p>
                    </div>
                    <Button onClick={() => setCreateModalOpen(true)} disabled={!selectedYearIsCurrent}>
                        Add Fee Structure
                    </Button>
                </div>

                <div className="mb-4 flex flex-wrap items-end gap-4">
                    <AcademicYearFilter academicYears={academicYears} value={selectedYear} onValueChange={applyYearFilter} />
                    <div className="w-56 space-y-1.5">
                        <span className="text-sm font-medium">Class</span>
                        <Combobox
                            options={[{ value: 'all', label: 'All' }, ...classes.map((c) => ({ value: String(c.id), label: c.name }))]}
                            value={selectedClass}
                            onValueChange={applyClassFilter}
                            placeholder="All classes"
                            searchPlaceholder="Search classes..."
                            emptyText="No class found."
                        />
                    </div>
                </div>

                <DataTable
                    routeName="fee-structures.index"
                    searchPlaceholder="Search by class or category..."
                    extraParams={{
                        year_id: selectedYear,
                        class_id: selectedClass === 'all' ? '' : selectedClass,
                    }}
                    columns={[
                        {
                            key: 'class_name',
                            label: 'Class',
                            sortable: true,
                            render: (_: string, row: FeeStructure) => row.class?.name ?? '—',
                        },
                        {
                            key: 'category_name',
                            label: 'Category',
                            sortable: true,
                            render: (_: string, row: FeeStructure) => row.fee_category?.name ?? '—',
                        },
                        {
                            key: 'amount',
                            label: 'Amount',
                            sortable: true,
                            render: (amount: string) => `৳${parseFloat(amount || '0').toFixed(2)}`,
                        },
                        {
                            key: 'frequency',
                            label: 'Frequency',
                            sortable: true,
                            render: (frequency: string) => <Badge variant="secondary">{FREQUENCY_LABELS[frequency] ?? frequency}</Badge>,
                        },
                        {
                            key: 'due_day',
                            label: 'Due Day',
                            render: (day: number | null) => (day ? `Day ${day}` : '—'),
                        },
                    ]}
                    data={feeStructures}
                    filters={filters}
                    actions={(row) => (
                        <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditModal(row)} title="Edit">
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeletingStructure(row)} title="Delete">
                                <Trash2 className="text-destructive h-4 w-4" />
                            </Button>
                        </div>
                    )}
                />
            </div>

            <FeeStructureModal open={createModalOpen} onOpenChange={setCreateModalOpen} structure={null} classes={classes} categories={categories} />
            <FeeStructureModal
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
                structure={editingStructure}
                classes={classes}
                categories={categories}
            />
            <ConfirmDialog
                open={deletingStructure !== null}
                onOpenChange={(open) => !open && setDeletingStructure(null)}
                title="Delete fee structure"
                description={`Are you sure you want to delete the ${deletingStructure?.fee_category?.name} fee for ${deletingStructure?.class?.name}? Existing invoices will keep their line items.`}
                confirmLabel="Delete"
                onConfirm={confirmDelete}
            />
        </AppLayout>
    );
}
