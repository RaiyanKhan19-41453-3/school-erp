import { AcademicYearFilter } from '@/components/academic-year-filter';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Download } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Fee Dues', href: '/reports/fee-dues' },
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

interface DueRow {
    student_id: number;
    student_name: string;
    admission_number: string;
    class_name: string | null;
    section_name: string | null;
    billed: string | number;
    paid: string | number;
    balance: string | number;
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

function formatAmount(value: string | number | null | undefined): string {
    return `৳${parseFloat(String(value ?? '0')).toFixed(2)}`;
}

export default function FeeDues({
    dues,
    totals,
    filters,
    classes,
    academicYears,
}: {
    dues: PaginatedData<DueRow>;
    totals: { students: number; billed: number; paid: number; balance: number };
    filters: {
        search: string;
        sort: string;
        direction: string;
        per_page: number;
        class_id: number | null;
        section_id: number | null;
        year_id: number | null;
    };
    classes: SchoolClass[];
    academicYears: AcademicYear[];
}) {
    const [selectedYear, setSelectedYear] = useState(filters.year_id ? String(filters.year_id) : '');
    const [selectedClass, setSelectedClass] = useState(filters.class_id ? String(filters.class_id) : 'all');
    const [selectedSection, setSelectedSection] = useState(filters.section_id ? String(filters.section_id) : 'all');

    const activeClass = classes.find((c) => String(c.id) === selectedClass);
    const cleanValue = (value: string) => (value === 'all' ? '' : value);

    function applyFilters(overrides: Record<string, string>) {
        router.get(
            route('reports.fee-dues'),
            {
                search: filters.search,
                sort: filters.sort,
                direction: filters.direction,
                per_page: filters.per_page,
                page: 1,
                year_id: selectedYear,
                class_id: cleanValue(selectedClass),
                section_id: cleanValue(selectedSection),
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

    const exportParams = new URLSearchParams();
    if (selectedYear) exportParams.set('year_id', selectedYear);
    if (cleanValue(selectedClass)) exportParams.set('class_id', cleanValue(selectedClass));
    if (cleanValue(selectedSection)) exportParams.set('section_id', cleanValue(selectedSection));
    if (filters.search) exportParams.set('search', filters.search);
    const exportQuery = exportParams.toString();
    const exportUrl = route('reports.fee-dues.export') + (exportQuery ? `?${exportQuery}` : '');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Fee Dues" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">Fee Dues</h2>
                        <p className="text-muted-foreground text-sm">Students with outstanding balances</p>
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
                        <p className="text-muted-foreground text-sm">Outstanding balance</p>
                        <p className="text-destructive text-2xl font-semibold">{formatAmount(totals.balance)}</p>
                        <p className="text-muted-foreground text-xs">
                            {totals.students} {totals.students === 1 ? 'student' : 'students'} with dues
                        </p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <p className="text-muted-foreground text-sm">Billed to those students</p>
                        <p className="text-2xl font-semibold">{formatAmount(totals.billed)}</p>
                    </div>
                    <div className="rounded-lg border p-4">
                        <p className="text-muted-foreground text-sm">Already paid</p>
                        <p className="text-2xl font-semibold">{formatAmount(totals.paid)}</p>
                    </div>
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
                </div>

                <DataTable
                    routeName="reports.fee-dues"
                    searchPlaceholder="Search by student or admission number..."
                    extraParams={{
                        year_id: selectedYear,
                        class_id: cleanValue(selectedClass),
                        section_id: cleanValue(selectedSection),
                    }}
                    columns={[
                        {
                            key: 'student_name',
                            label: 'Student',
                            sortable: true,
                            render: (_: string, row: DueRow) => (
                                <div>
                                    <div className="font-medium">{row.student_name}</div>
                                    <div className="text-muted-foreground text-xs">{row.admission_number}</div>
                                </div>
                            ),
                        },
                        {
                            key: 'class_name',
                            label: 'Class',
                            render: (_: string, row: DueRow) => [row.class_name, row.section_name].filter(Boolean).join(' — ') || '—',
                        },
                        {
                            key: 'billed',
                            label: 'Billed',
                            sortable: true,
                            render: (value: string | number) => formatAmount(value),
                        },
                        {
                            key: 'paid',
                            label: 'Paid',
                            render: (value: string | number) => formatAmount(value),
                        },
                        {
                            key: 'balance',
                            label: 'Balance',
                            sortable: true,
                            render: (value: string | number) => <span className="text-destructive font-medium">{formatAmount(value)}</span>,
                        },
                    ]}
                    data={dues}
                    filters={filters}
                />
            </div>
        </AppLayout>
    );
}
