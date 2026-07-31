import { useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AssignTeacherModal } from '@/components/assign-teacher-modal';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { toast } from 'sonner';
import { Star, UserPlus, X } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Teacher Assignments', href: '/teacher-assignments' },
];

interface StaffMember {
    id: number;
    employee_id: string;
    designation: string;
    user: { id: number; name: string };
}

interface AssignedTeacher {
    id: number;
    user: { id: number; name: string };
    pivot: { is_class_teacher: boolean };
}

interface SectionRow {
    id: number;
    name: string;
    class: { id: number; name: string };
    teachers: AssignedTeacher[];
    created_at: string;
}

interface SchoolClass {
    id: number;
    name: string;
    sections: {
        id: number;
        name: string;
        teachers: { id: number; user: { id: number; name: string } }[];
    }[];
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

export default function TeacherAssignmentsIndex({
    sections,
    filters,
    staff,
    classes,
}: {
    sections: PaginatedData<SectionRow>;
    filters: { search: string; sort: string; direction: string; per_page: number; class_id: number | null; section_id: number | null; teacher_id: number | null };
    staff: StaffMember[];
    classes: SchoolClass[];
}) {
    const [assigningSection, setAssigningSection] = useState<SectionRow | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [removingTeacher, setRemovingTeacher] = useState<{ section: SectionRow; teacher: AssignedTeacher } | null>(null);
    const [promotingTeacher, setPromotingTeacher] = useState<{ section: SectionRow; teacher: AssignedTeacher } | null>(null);

    const [selectedClass, setSelectedClass] = useState<string>(filters.class_id ? String(filters.class_id) : 'all');
    const [selectedSection, setSelectedSection] = useState<string>(filters.section_id ? String(filters.section_id) : 'all');
    const [selectedTeacher, setSelectedTeacher] = useState<string>(filters.teacher_id ? String(filters.teacher_id) : 'all');

    const activeClass = classes.find((c) => c.id === parseInt(selectedClass));
    const cleanValue = (value: string) => (value === 'all' ? '' : value);

    const teacherOptions = useMemo(() => {
        if (!activeClass) {
            return staff;
        }

        const seen = new Set<number>();
        return activeClass.sections.flatMap((section) => section.teachers).filter((teacher) => {
            if (seen.has(teacher.id)) {
                return false;
            }

            seen.add(teacher.id);

            return true;
        });
    }, [activeClass, staff]);

    function applyFilter(key: 'class_id' | 'section_id' | 'teacher_id', value: string) {
        if (key === 'class_id') {
            setSelectedClass(value);
            setSelectedSection('all');
            setSelectedTeacher('all');
        } else if (key === 'section_id') {
            setSelectedSection(value);
        } else {
            setSelectedTeacher(value);
        }

        router.get(
            route('teacher-assignments.index'),
            {
                search: filters.search,
                page: 1,
                sort: filters.sort,
                direction: filters.direction,
                per_page: filters.per_page,
                class_id: key === 'class_id' ? cleanValue(value) : cleanValue(selectedClass),
                section_id: key === 'class_id' ? '' : key === 'section_id' ? cleanValue(value) : cleanValue(selectedSection),
                teacher_id: key === 'class_id' ? '' : key === 'teacher_id' ? cleanValue(value) : cleanValue(selectedTeacher),
            },
            { preserveState: true, preserveScroll: true },
        );
    }

    const openAssignModal = (row: SectionRow) => {
        setAssigningSection(row);
        setModalOpen(true);
    };

    const confirmRemove = () => {
        if (!removingTeacher) {
            return;
        }

        const { section, teacher } = removingTeacher;
        setRemovingTeacher(null);

        router.delete(route('teacher-assignments.destroy', [section.id, teacher.id]), {
            onSuccess: () => {
                toast.success('Teacher removed from section');
            },
            onError: () => {
                toast.error('Failed to remove teacher');
            },
        });
    };

    const promoteClassTeacher = (section: SectionRow, teacher: AssignedTeacher) => {
        setPromotingTeacher({ section, teacher });
    };

    const confirmPromote = () => {
        if (!promotingTeacher) {
            return;
        }

        const { section, teacher } = promotingTeacher;
        setPromotingTeacher(null);

        router.put(route('teacher-assignments.set-class-teacher', [section.id, teacher.id]), {
            onSuccess: () => {
                toast.success(`${teacher.user.name} is now the class teacher`);
            },
            onError: () => {
                toast.error('Failed to update class teacher');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Teacher Assignments" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold tracking-tight">Teacher Assignments</h2>
                    <p className="text-muted-foreground text-sm">Assign teachers to sections for the current academic year</p>
                </div>

                <div className="mb-4 flex flex-wrap items-end gap-4">
                    <div className="w-56 space-y-1.5">
                        <span className="text-sm font-medium">Class</span>
                        <Select value={selectedClass} onValueChange={(v) => applyFilter('class_id', v)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="All classes" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                {classes.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-56 space-y-1.5">
                        <span className="text-sm font-medium">Section</span>
                        <Select value={selectedSection} onValueChange={(v) => applyFilter('section_id', v)}>
                            <SelectTrigger className="w-full" disabled={!activeClass}>
                                <SelectValue placeholder="All sections" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                {activeClass?.sections.map((s) => (
                                    <SelectItem key={s.id} value={String(s.id)}>
                                        {s.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-56 space-y-1.5">
                        <span className="text-sm font-medium">Teacher</span>
                        <Select value={selectedTeacher} onValueChange={(v) => applyFilter('teacher_id', v)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="All teachers" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                {teacherOptions.map((s) => (
                                    <SelectItem key={s.id} value={String(s.id)}>
                                        {s.user.name} ({s.employee_id})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DataTable
                    routeName="teacher-assignments.index"
                    searchPlaceholder="Search by class or section..."
                    extraParams={{
                        class_id: cleanValue(selectedClass),
                        section_id: cleanValue(selectedSection),
                        teacher_id: cleanValue(selectedTeacher),
                    }}
                    columns={[
                        {
                            key: 'class_name',
                            label: 'Class',
                            sortable: true,
                            render: (_: unknown, row: SectionRow) => row.class.name,
                        },
                        { key: 'name', label: 'Section', sortable: true },
                        {
                            key: 'teachers',
                            label: 'Assigned Teachers',
                            render: (teachers: AssignedTeacher[], row: SectionRow) =>
                                teachers.length === 0 ? (
                                    <span className="text-muted-foreground">No teachers assigned</span>
                                ) : (
                                    <div className="flex flex-wrap items-center gap-1">
                                        {teachers.map((teacher) => (
                                            <Badge key={teacher.id} variant={teacher.pivot.is_class_teacher ? 'default' : 'secondary'} className="gap-1">
                                                <button
                                                    type="button"
                                                    disabled={teacher.pivot.is_class_teacher}
                                                    onClick={() => promoteClassTeacher(row, teacher)}
                                                    title={teacher.pivot.is_class_teacher ? 'Class teacher' : 'Make class teacher'}
                                                    className={teacher.pivot.is_class_teacher ? 'text-yellow-400' : 'text-muted-foreground cursor-pointer transition-colors hover:text-yellow-500'}
                                                >
                                                    <Star className="h-3 w-3" fill={teacher.pivot.is_class_teacher ? 'currentColor' : 'none'} />
                                                </button>
                                                {teacher.user.name}
                                                <button
                                                    type="button"
                                                    className="ml-1 text-muted-foreground hover:text-destructive"
                                                    onClick={() => setRemovingTeacher({ section: row, teacher })}
                                                    title="Remove teacher"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                ),
                        },
                    ]}
                    data={sections}
                    filters={filters}
                    actions={(row) => (
                        <Button variant="ghost" size="icon" onClick={() => openAssignModal(row)} title="Assign teacher">
                            <UserPlus className="h-4 w-4" />
                        </Button>
                    )}
                />
            </div>

            <AssignTeacherModal
                section={assigningSection}
                staff={staff}
                open={modalOpen}
                onOpenChange={setModalOpen}
            />

            <ConfirmDialog
                open={removingTeacher !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setRemovingTeacher(null);
                    }
                }}
                title="Remove teacher from section?"
                description={
                    removingTeacher
                        ? `Are you sure you want to remove ${removingTeacher.teacher.user.name} from ${removingTeacher.section.class.name} - ${removingTeacher.section.name}? This cannot be undone.`
                        : ''
                }
                confirmLabel="Remove"
                onConfirm={confirmRemove}
            />

            <ConfirmDialog
                open={promotingTeacher !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setPromotingTeacher(null);
                    }
                }}
                title="Set as class teacher?"
                description={
                    promotingTeacher
                        ? `Make ${promotingTeacher.teacher.user.name} the class teacher of ${promotingTeacher.section.class.name} - ${promotingTeacher.section.name}? The current class teacher will be demoted.`
                        : ''
                }
                confirmLabel="Set as class teacher"
                onConfirm={confirmPromote}
            />
        </AppLayout>
    );
}
