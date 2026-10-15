import { AcademicYearFilter } from '@/components/academic-year-filter';
import { AssignSubjectsModal } from '@/components/assign-subjects-modal';
import { CreateClassModal } from '@/components/create-class-modal';
import { DataTable } from '@/components/data-table';
import { EditClassModal } from '@/components/edit-class-modal';
import { ManageSectionsModal } from '@/components/manage-sections-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { formatDMY } from '@/lib/format';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { BookOpenCheck, Layers, Pencil } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Classes', href: '/classes' },
];

interface Section {
    id: number;
    name: string;
    capacity: number;
}

interface SchoolClass {
    id: number;
    name: string;
    sections: Section[];
    subjects: Subject[];
    created_at: string;
}

interface Subject {
    id: number;
    name: string;
    code: string | null;
}

interface AcademicYear {
    id: number;
    name: string;
    is_current: boolean;
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

export default function ClassesIndex({
    classes,
    subjects,
    filters,
    academicYears,
    selectedYearIsCurrent,
}: {
    classes: PaginatedData<SchoolClass>;
    subjects: Subject[];
    filters: { search: string; sort: string; direction: string; per_page: number; year_id: number | null };
    academicYears: AcademicYear[];
    selectedYearIsCurrent: boolean;
}) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [sectionsClassId, setSectionsClassId] = useState<number | null>(null);
    const [sectionsModalOpen, setSectionsModalOpen] = useState(false);
    const [subjectsClass, setSubjectsClass] = useState<SchoolClass | null>(null);
    const [subjectsModalOpen, setSubjectsModalOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState<string>(filters.year_id ? String(filters.year_id) : '');

    const openEditModal = (row: SchoolClass) => {
        setEditingClass(row);
        setEditModalOpen(true);
    };

    const openSectionsModal = (row: SchoolClass) => {
        setSectionsClassId(row.id);
        setSectionsModalOpen(true);
    };

    const openSubjectsModal = (row: SchoolClass) => {
        setSubjectsClass(row);
        setSubjectsModalOpen(true);
    };

    function applyYearFilter(value: string) {
        setSelectedYear(value);
        router.get(
            route('classes.index'),
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Classes" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">Classes</h2>
                        <p className="text-muted-foreground text-sm">Manage classes and their sections</p>
                    </div>
                    {selectedYearIsCurrent ? (
                        <Button onClick={() => setCreateModalOpen(true)}>Add Class</Button>
                    ) : (
                        <Button disabled title="Classes are created for the current academic year only">
                            Add Class
                        </Button>
                    )}
                </div>

                <div className="mb-4 flex flex-wrap items-end gap-4">
                    <AcademicYearFilter academicYears={academicYears} value={selectedYear} onValueChange={applyYearFilter} />
                </div>

                <DataTable
                    routeName="classes.index"
                    searchPlaceholder="Search classes..."
                    extraParams={{
                        year_id: selectedYear,
                    }}
                    columns={[
                        { key: 'name', label: 'Class Name', sortable: true },
                        {
                            key: 'sections',
                            label: 'Sections',
                            render: (sections: Section[]) =>
                                sections?.map((s) => (
                                    <Badge key={s.id} variant="secondary" className="mr-1">
                                        {s.name} ({s.capacity})
                                    </Badge>
                                )),
                        },
                        {
                            key: 'subjects',
                            label: 'Subjects',
                            render: (subs: Subject[]) => (
                                <div className="flex max-w-md flex-wrap gap-1">
                                    {subs?.length ? (
                                        subs.map((s) => (
                                            <Badge key={s.id} variant="outline" className="mr-1">
                                                {s.name}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-muted-foreground text-sm">No subjects</span>
                                    )}
                                </div>
                            ),
                        },
                        {
                            key: 'created_at',
                            label: 'Created',
                            sortable: true,
                            render: (date: string) => formatDMY(date),
                        },
                    ]}
                    data={classes}
                    filters={filters}
                    actions={(row) => (
                        <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openSubjectsModal(row)} title="Assign subjects">
                                <BookOpenCheck className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openSectionsModal(row)} title="Manage sections">
                                <Layers className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openEditModal(row)} title="Edit">
                                <Pencil className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                />
            </div>

            <CreateClassModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
            <EditClassModal class={editingClass} open={editModalOpen} onOpenChange={setEditModalOpen} />
            <ManageSectionsModal classId={sectionsClassId} open={sectionsModalOpen} onOpenChange={setSectionsModalOpen} />
            <AssignSubjectsModal
                open={subjectsModalOpen}
                onOpenChange={setSubjectsModalOpen}
                classId={subjectsClass?.id ?? null}
                className={subjectsClass?.name ?? ''}
                subjects={subjects}
                assignedSubjectIds={subjectsClass?.subjects?.map((s) => s.id) ?? []}
            />
        </AppLayout>
    );
}
