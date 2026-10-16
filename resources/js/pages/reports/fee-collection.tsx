import { AcademicYearFilter } from '@/components/academic-year-filter';
import { DataTable } from '@/components/data-table';
import { DatePicker } from '@/components/date-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatDMY } from '@/lib/format';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Download } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Fee Collection', href: '/reports/fee-collection' },
];

interface Section {
    id: number;
    name: string;
}

interface SchoolClass {
    id: number;
    name: string;
    sections?: Section[];
}

interface AcademicYear {
    id: number;
    name: string;
    is_current: boolean;
}

interface Payment {
    id: number;
    amount: string;
    payment_method: string;
    paid_at: string | null;
    invoice: {
        id: number;
        invoice_number: string;
        student: {
            name: string;
            admission_number: string;
        };
    } | null;
    recorder: { id: number; name: string } | null;
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

interface MethodSummary {
    method: string;
    count: number;
    total: number;
}

const METHOD_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    cash: 'default',
    bank_transfer: 'secondary',
    cheque: 'outline',
    online: 'secondary',
};

function formatAmount(value: string | number | null | undefined): string {
    return `৳${parseFloat(String(value ?? '0')).toFixed(2)}`;
}

function methodLabel(method: string): string {
    return method.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function FeeCollection({
    payments,
    summary,
    paymentMethods,
    filters,
    classes,
    academicYears,
}: {
    payments: PaginatedData<Payment>;
    summary: { by_method: MethodSummary[]; total: number; count: number };
    paymentMethods: string[];
    filters: {
        search: string;
        sort: string;
        direction: string;
        per_page: number;
        class_id: number | null;
        section_id: number | null;
        year_id: number | null;
        method: string | null;
        from_date: string;
        to_date: string;
    };
    classes: SchoolClass[];
    academicYears: AcademicYear[];
}) {
    const [selectedYear, setSelectedYear] = useState(filters.year_id ? String(filters.year_id) : '');
    const [selectedClass, setSelectedClass] = useState(filters.class_id ? String(filters.class_id) : 'all');
    const [selectedSection, setSelectedSection] = useState(filters.section_id ? String(filters.section_id) : 'all');
    const [selectedMethod, setSelectedMethod] = useState(filters.method ?? 'all');
    const [fromDate, setFromDate] = useState(filters.from_date);
    const [toDate, setToDate] = useState(filters.to_date);

    const activeClass = classes.find((c) => String(c.id) === selectedClass);
    const cleanValue = (value: string) => (value === 'all' ? '' : value);

    function applyFilters(overrides: Record<string, string>) {
        router.get(
            route('reports.fee-collection'),
            {
                search: filters.search,
                sort: filters.sort,
                direction: filters.direction,
                per_page: filters.per_page,
                page: 1,
                year_id: selectedYear,
                class_id: cleanValue(selectedClass),
                section_id: cleanValue(selectedSection),
                method: cleanValue(selectedMethod),
                from_date: fromDate,
                to_date: toDate,
                ...overrides,
            },
            { preserveState: true, preserveScroll: true },
        );
    }

    function applyYearFilter(value: string) {
        setSelectedYear(value);
        setSelectedClass('all');
        setSelectedSection('all');

        applyFilters({ year_id: value, class_id: '', section_id: '' });
    }

    function applyFilter(key: 'class_id' | 'section_id', value: string) {
        if (key === 'class_id') {
            setSelectedClass(value);
            setSelectedSection('all');

            applyFilters({ class_id: cleanValue(value), section_id: '' });

            return;
        }

        setSelectedSection(value);

        applyFilters({ section_id: cleanValue(value) });
    }

    function applyMethodFilter(value: string) {
        setSelectedMethod(value);

        applyFilters({ method: cleanValue(value) });
    }

    function applyDateFilter(key: 'from_date' | 'to_date', value: string) {
        const newFrom = key === 'from_date' ? value : fromDate;
        const newTo = key === 'to_date' ? value : toDate;

        if (key === 'from_date') {
            setFromDate(value);
        } else {
            setToDate(value);
        }

        applyFilters({ from_date: newFrom, to_date: newTo });
    }

    const exportParams = new URLSearchParams();
    if (selectedYear) exportParams.set('year_id', selectedYear);
    if (cleanValue(selectedClass)) exportParams.set('class_id', cleanValue(selectedClass));
    if (cleanValue(selectedSection)) exportParams.set('section_id', cleanValue(selectedSection));
    if (cleanValue(selectedMethod)) exportParams.set('method', cleanValue(selectedMethod));
    if (fromDate) exportParams.set('from_date', fromDate);
    if (toDate) exportParams.set('to_date', toDate);
    if (filters.search) exportParams.set('search', filters.search);
    const exportQuery = exportParams.toString();
    const exportUrl = route('reports.fee-collection.export') + (exportQuery ? `?${exportQuery}` : '');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Fee Collection" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">Fee Collection</h2>
                        <p className="text-muted-foreground text-sm">Payments received in the selected period</p>
                    </div>
                    <Button variant="outline" asChild>
                        <a href={exportUrl}>
                            <Download className="h-4 w-4" />
                            Export CSV
                        </a>
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border p-4">
                        <p className="text-muted-foreground text-sm">
                            Collected ({formatDMY(filters.from_date)} – {formatDMY(filters.to_date)})
                        </p>
                        <p className="text-2xl font-semibold">{formatAmount(summary.total)}</p>
                        <p className="text-muted-foreground text-xs">
                            {summary.count} {summary.count === 1 ? 'payment' : 'payments'}
                        </p>
                    </div>
                    <div className="rounded-lg border p-4 sm:col-span-2">
                        <p className="text-muted-foreground text-sm">By method</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            {summary.by_method.length === 0 && <span className="text-muted-foreground text-sm">No payments in this period.</span>}
                            {summary.by_method.map((entry) => (
                                <Badge key={entry.method} variant={METHOD_VARIANTS[entry.method] ?? 'secondary'}>
                                    {methodLabel(entry.method)} · {formatAmount(entry.total)} ({entry.count})
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mb-4 flex flex-wrap items-end gap-4">
                    <div className="w-44 space-y-1.5">
                        <span className="text-sm font-medium">From</span>
                        <DatePicker value={fromDate} onChange={(v) => applyDateFilter('from_date', v)} />
                    </div>
                    <div className="w-44 space-y-1.5">
                        <span className="text-sm font-medium">To</span>
                        <DatePicker value={toDate} onChange={(v) => applyDateFilter('to_date', v)} />
                    </div>
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
                        <span className="text-sm font-medium">Section</span>
                        <Combobox
                            options={[
                                { value: 'all', label: 'All' },
                                ...(activeClass?.sections ?? []).map((s) => ({ value: String(s.id), label: s.name })),
                            ]}
                            value={selectedSection}
                            onValueChange={(v) => applyFilter('section_id', v)}
                            disabled={!activeClass}
                            placeholder="All sections"
                            searchPlaceholder="Search sections..."
                            emptyText="No section found."
                        />
                    </div>
                    <div className="w-56 space-y-1.5">
                        <span className="text-sm font-medium">Method</span>
                        <Select value={selectedMethod} onValueChange={applyMethodFilter}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="All methods" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                {paymentMethods.map((method) => (
                                    <SelectItem key={method} value={method}>
                                        {methodLabel(method)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DataTable
                    routeName="reports.fee-collection"
                    searchPlaceholder="Search by student, admission number, or invoice number..."
                    extraParams={{
                        year_id: selectedYear,
                        class_id: cleanValue(selectedClass),
                        section_id: cleanValue(selectedSection),
                        method: cleanValue(selectedMethod),
                        from_date: fromDate,
                        to_date: toDate,
                    }}
                    columns={[
                        {
                            key: 'paid_at',
                            label: 'Date',
                            sortable: true,
                            render: (value: string | null) => formatDMY(value ?? '') || '—',
                        },
                        {
                            key: 'student_name',
                            label: 'Student',
                            render: (_: string, row: Payment) => (
                                <div>
                                    <div className="font-medium">{row.invoice?.student?.name ?? '—'}</div>
                                    <div className="text-muted-foreground text-xs">{row.invoice?.student?.admission_number}</div>
                                </div>
                            ),
                        },
                        {
                            key: 'invoice_number',
                            label: 'Invoice',
                            render: (_: string, row: Payment) => row.invoice?.invoice_number ?? '—',
                        },
                        {
                            key: 'payment_method',
                            label: 'Method',
                            render: (method: string) => (
                                <Badge variant={METHOD_VARIANTS[method] ?? 'secondary'}>{methodLabel(method)}</Badge>
                            ),
                        },
                        {
                            key: 'amount',
                            label: 'Amount',
                            sortable: true,
                            render: (value: string) => formatAmount(value),
                        },
                        {
                            key: 'recorded_by',
                            label: 'Recorded By',
                            render: (_: string, row: Payment) => row.recorder?.name ?? '—',
                        },
                    ]}
                    data={payments}
                    filters={filters}
                />
            </div>
        </AppLayout>
    );
}
