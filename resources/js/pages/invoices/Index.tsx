import { AcademicYearFilter } from '@/components/academic-year-filter';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatDMY } from '@/lib/format';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Plus } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Invoices', href: '/invoices' },
];

interface SchoolClass {
    id: number;
    name: string;
}

interface AcademicYear {
    id: number;
    name: string;
    is_current: boolean;
}

interface Invoice {
    id: number;
    invoice_number: string;
    due_date: string;
    total_amount: string;
    status: string;
    student: { id: number; name: string; admission_number: string; section: { name: string; class: { id: number; name: string } } };
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

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    unpaid: 'secondary',
    partial: 'outline',
    paid: 'default',
    overdue: 'destructive',
};

export default function InvoicesIndex({
    invoices,
    filters,
    classes,
    academicYears,
}: {
    invoices: PaginatedData<Invoice>;
    filters: {
        search: string;
        sort: string;
        direction: string;
        per_page: number;
        class_id: number | null;
        status: string | null;
        year_id: number | null;
    };
    classes: SchoolClass[];
    academicYears: AcademicYear[];
}) {
    const [selectedYear, setSelectedYear] = useState<string>(filters.year_id ? String(filters.year_id) : '');
    const [selectedClass, setSelectedClass] = useState<string>(filters.class_id ? String(filters.class_id) : 'all');
    const [selectedStatus, setSelectedStatus] = useState<string>(filters.status ?? 'all');

    const cleanValue = (value: string) => (value === 'all' ? '' : value);

    function applyYearFilter(value: string) {
        setSelectedYear(value);
        setSelectedClass('all');

        router.get(
            route('invoices.index'),
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

    function applyFilter(key: 'class_id' | 'status', value: string) {
        if (key === 'class_id') {
            setSelectedClass(value);
        } else {
            setSelectedStatus(value);
        }

        router.get(
            route('invoices.index'),
            {
                search: filters.search,
                page: 1,
                sort: filters.sort,
                direction: filters.direction,
                per_page: filters.per_page,
                year_id: selectedYear,
                class_id: key === 'class_id' ? cleanValue(value) : cleanValue(selectedClass),
                status: key === 'status' ? cleanValue(value) : cleanValue(selectedStatus),
            },
            { preserveState: true, preserveScroll: true },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Invoices" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">Invoices</h2>
                        <p className="text-muted-foreground text-sm">Review invoices and record payments</p>
                    </div>
                    <Link href={route('invoices.generate')}>
                        <Button>
                            <Plus className="h-4 w-4" />
                            Generate Invoices
                        </Button>
                    </Link>
                </div>

                <div className="mb-4 flex flex-wrap items-end gap-4">
                    <AcademicYearFilter academicYears={academicYears} value={selectedYear} onValueChange={applyYearFilter} />
                    <div className="w-56 space-y-1.5">
                        <span className="text-sm font-medium">Class</span>
                        <Combobox
                            options={[{ value: 'all', label: 'All' }, ...classes.map((c) => ({ value: String(c.id), label: c.name }))]}
                            value={selectedClass}
                            onValueChange={(v) => applyFilter('class_id', v)}
                            placeholder="All classes"
                            searchPlaceholder="Search classes..."
                            emptyText="No class found."
                        />
                    </div>
                    <div className="w-56 space-y-1.5">
                        <span className="text-sm font-medium">Status</span>
                        <Select value={selectedStatus} onValueChange={(v) => applyFilter('status', v)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="unpaid">Unpaid</SelectItem>
                                <SelectItem value="partial">Partial</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DataTable
                    routeName="invoices.index"
                    searchPlaceholder="Search by student, admission number, or invoice number..."
                    extraParams={{
                        year_id: selectedYear,
                        class_id: cleanValue(selectedClass),
                        status: cleanValue(selectedStatus),
                    }}
                    columns={[
                        { key: 'invoice_number', label: 'Invoice No', sortable: true },
                        {
                            key: 'student_name',
                            label: 'Student',
                            sortable: true,
                            render: (_: string, row: Invoice) => (
                                <div>
                                    <div className="font-medium">{row.student?.name ?? '—'}</div>
                                    <div className="text-muted-foreground text-xs">{row.student?.admission_number}</div>
                                </div>
                            ),
                        },
                        {
                            key: 'class_name',
                            label: 'Class',
                            sortable: true,
                            render: (_: string, row: Invoice) => row.student?.section?.class?.name ?? '—',
                        },
                        {
                            key: 'due_date',
                            label: 'Due Date',
                            sortable: true,
                            render: (date: string) => formatDMY(date) || '—',
                        },
                        {
                            key: 'total_amount',
                            label: 'Amount',
                            sortable: true,
                            render: (amount: string) => `৳${parseFloat(amount || '0').toFixed(2)}`,
                        },
                        {
                            key: 'status',
                            label: 'Status',
                            sortable: true,
                            render: (status: string) => (
                                <Badge variant={STATUS_VARIANTS[status] ?? 'secondary'}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
                            ),
                        },
                    ]}
                    data={invoices}
                    filters={filters}
                    actions={(row) => (
                        <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => router.get(route('invoices.show', row.id))} title="View">
                                <Eye className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                />
            </div>
        </AppLayout>
    );
}
