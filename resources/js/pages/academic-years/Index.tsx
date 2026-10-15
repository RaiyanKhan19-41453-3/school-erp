import { AcademicYearModal } from '@/components/academic-year-modal';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { formatDMY } from '@/lib/format';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { CheckCircle2, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Academic Years', href: '/academic-years' },
];

interface AcademicYear {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
    classes_count: number;
    invoices_count: number;
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

export default function AcademicYearsIndex({
    years,
    filters,
}: {
    years: PaginatedData<AcademicYear>;
    filters: { search: string; sort: string; direction: string; per_page: number };
}) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [activatingYear, setActivatingYear] = useState<AcademicYear | null>(null);
    const { put } = useForm();

    function confirmActivate() {
        if (!activatingYear) return;

        put(route('academic-years.activate', activatingYear.id), {
            onSuccess: () => {
                setActivatingYear(null);
                toast.success(`${activatingYear.name} is now the current academic year`);
            },
            onError: () => {
                toast.error('Failed to activate academic year');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Academic Years" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">Academic Years</h2>
                        <p className="text-muted-foreground text-sm">Manage school years and set which one is active</p>
                    </div>
                    <Button onClick={() => setCreateModalOpen(true)}>
                        <Plus className="h-4 w-4" />
                        Add Year
                    </Button>
                </div>

                <DataTable
                    routeName="academic-years.index"
                    searchPlaceholder="Search academic years..."
                    columns={[
                        {
                            key: 'name',
                            label: 'Year',
                            sortable: true,
                            render: (name: string, row: AcademicYear) => (
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{name}</span>
                                    {row.is_current && <Badge variant="default">Current</Badge>}
                                </div>
                            ),
                        },
                        {
                            key: 'start_date',
                            label: 'Start',
                            sortable: true,
                            render: (date: string) => formatDMY(date),
                        },
                        {
                            key: 'end_date',
                            label: 'End',
                            sortable: true,
                            render: (date: string) => formatDMY(date),
                        },
                        {
                            key: 'classes_count',
                            label: 'Classes',
                            render: (count: number) => count,
                        },
                        {
                            key: 'invoices_count',
                            label: 'Invoices',
                            render: (count: number) => count,
                        },
                    ]}
                    data={years}
                    filters={filters}
                    actions={(row) => (
                        <div className="flex items-center justify-end">
                            {!row.is_current && (
                                <Button variant="outline" size="sm" onClick={() => setActivatingYear(row)}>
                                    <CheckCircle2 className="h-4 w-4" />
                                    Set as Current
                                </Button>
                            )}
                        </div>
                    )}
                />
            </div>

            <AcademicYearModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
            <ConfirmDialog
                open={activatingYear !== null}
                onOpenChange={(open) => !open && setActivatingYear(null)}
                title="Set current academic year"
                description={`Make "${activatingYear?.name}" the current academic year? All new classes, fee structures, and invoices will be created under it.`}
                confirmLabel="Set as Current"
                onConfirm={confirmActivate}
            />
        </AppLayout>
    );
}
