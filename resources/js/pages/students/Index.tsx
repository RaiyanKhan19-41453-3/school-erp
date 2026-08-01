import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { DataTable } from '@/components/data-table';
import { DatePicker } from '@/components/date-picker';
import { formatDMY } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Combobox } from '@/components/ui/combobox';
import { AcademicYearFilter } from '@/components/academic-year-filter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Pencil } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Students', href: '/students' },
];

interface Guardian {
    id: number;
    name: string;
}

interface Section {
    id: number;
    name: string;
}

interface SchoolClass {
    id: number;
    name: string;
    sections: Section[];
}

interface AcademicYear {
    id: number;
    name: string;
    is_current: boolean;
}

interface Student {
    id: number;
    name: string;
    admission_number: string;
    admission_date: string;
    gender: string;
    status: string;
    created_at: string;
    section: { id: number; name: string; class: SchoolClass };
    guardians: Guardian[];
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

export default function StudentsIndex({
    students,
    filters,
    classes,
    academicYears,
    selectedYearIsCurrent,
}: {
    students: PaginatedData<Student>;
    filters: { search: string; sort: string; direction: string; per_page: number; class_id: number | null; section_id: number | null; gender: string | null; admission_from: string | null; admission_to: string | null; year_id: number | null };
    classes: SchoolClass[];
    academicYears: AcademicYear[];
    selectedYearIsCurrent: boolean;
}) {
    const [selectedYear, setSelectedYear] = useState<string>(filters.year_id ? String(filters.year_id) : '');
    const [selectedClass, setSelectedClass] = useState<string>(filters.class_id ? String(filters.class_id) : 'all');
    const [selectedSection, setSelectedSection] = useState<string>(filters.section_id ? String(filters.section_id) : 'all');
    const [selectedGender, setSelectedGender] = useState<string>(filters.gender ?? 'all');
    const [admissionFrom, setAdmissionFrom] = useState<string>(filters.admission_from ?? '');
    const [admissionTo, setAdmissionTo] = useState<string>(filters.admission_to ?? '');

    const activeClass = classes.find((c) => c.id === parseInt(selectedClass));

    const cleanValue = (value: string) => (value === 'all' ? '' : value);

    function applyYearFilter(value: string) {
        setSelectedYear(value);
        setSelectedClass('all');
        setSelectedSection('all');

        router.get(
            route('students.index'),
            {
                search: filters.search,
                page: 1,
                sort: filters.sort,
                direction: filters.direction,
                per_page: filters.per_page,
                year_id: value,
                gender: cleanValue(selectedGender),
                admission_from: admissionFrom,
                admission_to: admissionTo,
            },
            { preserveState: true, preserveScroll: true },
        );
    }

    function applyFilter(key: 'class_id' | 'section_id' | 'gender', value: string) {
        if (key === 'class_id') {
            setSelectedClass(value);
            setSelectedSection('all');
        } else if (key === 'section_id') {
            setSelectedSection(value);
        } else {
            setSelectedGender(value);
        }

        router.get(
            route('students.index'),
            {
                search: filters.search,
                page: 1,
                sort: filters.sort,
                direction: filters.direction,
                per_page: filters.per_page,
                year_id: selectedYear,
                class_id: key === 'class_id' ? cleanValue(value) : cleanValue(selectedClass),
                section_id: key === 'class_id' ? '' : key === 'section_id' ? cleanValue(value) : cleanValue(selectedSection),
                gender: key === 'gender' ? cleanValue(value) : cleanValue(selectedGender),
                admission_from: admissionFrom,
                admission_to: admissionTo,
            },
            { preserveState: true, preserveScroll: true },
        );
    }

    function applyDateFilter(key: 'admission_from' | 'admission_to', value: string) {
        const newFrom = key === 'admission_from' ? value : admissionFrom;
        const newTo = key === 'admission_to' ? value : admissionTo;

        if (key === 'admission_from') {
            setAdmissionFrom(value);
        } else {
            setAdmissionTo(value);
        }

        router.get(
            route('students.index'),
            {
                search: filters.search,
                page: 1,
                sort: filters.sort,
                direction: filters.direction,
                per_page: filters.per_page,
                year_id: selectedYear,
                class_id: cleanValue(selectedClass),
                section_id: cleanValue(selectedSection),
                gender: cleanValue(selectedGender),
                admission_from: newFrom,
                admission_to: newTo,
            },
            { preserveState: true, preserveScroll: true },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Students" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">Students</h2>
                        <p className="text-muted-foreground text-sm">Manage students and their guardians</p>
                    </div>
                    {selectedYearIsCurrent ? (
                        <Link href={route('students.create')}>
                            <Button>Add Student</Button>
                        </Link>
                    ) : (
                        <Button disabled title="Students are created for the current academic year only">
                            Add Student
                        </Button>
                    )}
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
                            options={[{ value: 'all', label: 'All' }, ...(activeClass?.sections ?? []).map((s) => ({ value: String(s.id), label: s.name }))]}
                            value={selectedSection}
                            onValueChange={(v) => applyFilter('section_id', v)}
                            disabled={!activeClass}
                            placeholder="All sections"
                            searchPlaceholder="Search sections..."
                            emptyText="No section found."
                        />
                    </div>
                    <div className="w-56 space-y-1.5">
                        <span className="text-sm font-medium">Gender</span>
                        <Select value={selectedGender} onValueChange={(v) => applyFilter('gender', v)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="All genders" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-56 space-y-1.5">
                        <span className="text-sm font-medium">Admission from</span>
                        <DatePicker value={admissionFrom} onChange={(v) => applyDateFilter('admission_from', v)} />
                    </div>
                    <div className="w-56 space-y-1.5">
                        <span className="text-sm font-medium">Admission to</span>
                        <DatePicker value={admissionTo} onChange={(v) => applyDateFilter('admission_to', v)} />
                    </div>
                </div>

                <DataTable
                    routeName="students.index"
                    searchPlaceholder="Search by name or admission number..."
                    extraParams={{
                        year_id: selectedYear,
                        class_id: cleanValue(selectedClass),
                        section_id: cleanValue(selectedSection),
                        gender: cleanValue(selectedGender),
                        admission_from: admissionFrom,
                        admission_to: admissionTo,
                    }}
                    columns={[
                        { key: 'name', label: 'Name', sortable: true },
                        { key: 'admission_number', label: 'Admission No', sortable: true },
                        {
                            key: 'admission_date',
                            label: 'Admission Date',
                            sortable: true,
                            render: (date: string) => formatDMY(date) || '—',
                        },
                        {
                            key: 'section',
                            label: 'Section',
                            render: (section: Student['section']) =>
                                section ? `${section.class.name} - ${section.name}` : '—',
                        },
                        {
                            key: 'gender',
                            label: 'Gender',
                            render: (gender: string) => (gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : '—'),
                        },
                        {
                            key: 'status',
                            label: 'Status',
                            render: (status: string) => (
                                <Badge variant={status === 'active' ? 'default' : 'secondary'}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </Badge>
                            ),
                        },
                    ]}
                    data={students}
                    filters={filters}
                    actions={(row) => (
                        <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => router.get(route('students.show', row.id))} title="View">
                                <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => router.get(route('students.edit', row.id))} title="Edit">
                                <Pencil className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                />
            </div>
        </AppLayout>
    );
}
