import { AcademicYearFilter } from '@/components/academic-year-filter';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table';
import { ExamModal } from '@/components/exam-modal';
import { ExamSubjectsModal } from '@/components/exam-subjects-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { formatDMY } from '@/lib/format';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { BookOpenCheck, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Exams', href: '/exams' },
];

interface Subject {
    id: number;
    name: string;
    code: string | null;
}

interface ExamSubject {
    subject_id: number;
    full_marks: string;
    pass_marks: string;
    exam_date: string | null;
}

interface Exam {
    id: number;
    class_id: number;
    name: string;
    grading_scale_id: number | null;
    start_date: string | null;
    end_date: string | null;
    class: { id: number; name: string };
    grading_scale: { id: number; name: string } | null;
    exam_subjects: (ExamSubject & { subject?: Subject })[];
    class_subjects?: Subject[];
    exam_subjects_count: number;
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

export default function ExamsIndex({
    exams,
    filters,
    academicYears,
    selectedYearIsCurrent,
    classes,
    gradingScales,
}: {
    exams: PaginatedData<Exam>;
    filters: { search: string; sort: string; direction: string; per_page: number; class_id: number | null; year_id: number | null };
    academicYears: AcademicYear[];
    selectedYearIsCurrent: boolean;
    classes: { id: number; name: string }[];
    gradingScales: { id: number; name: string }[];
}) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editingExam, setEditingExam] = useState<Exam | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [subjectsExam, setSubjectsExam] = useState<Exam | null>(null);
    const [subjectsModalOpen, setSubjectsModalOpen] = useState(false);
    const [deletingExam, setDeletingExam] = useState<Exam | null>(null);
    const [selectedYear, setSelectedYear] = useState<string>(filters.year_id ? String(filters.year_id) : '');
    const { delete: destroy } = useForm();

    const openEditModal = (row: Exam) => {
        setEditingExam(row);
        setEditModalOpen(true);
    };

    const openSubjectsModal = (row: Exam) => {
        setSubjectsExam(row);
        setSubjectsModalOpen(true);
    };

    function applyYearFilter(value: string) {
        setSelectedYear(value);
        router.get(
            route('exams.index'),
            {
                search: filters.search,
                page: 1,
                sort: filters.sort,
                direction: filters.direction,
                per_page: filters.per_page,
                class_id: filters.class_id,
                year_id: value,
            },
            { preserveState: true, preserveScroll: true },
        );
    }

    function confirmDelete() {
        if (!deletingExam) return;

        destroy(route('exams.destroy', deletingExam.id), {
            onSuccess: () => {
                setDeletingExam(null);
                toast.success('Exam deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete exam');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Exams" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">Exams</h2>
                        <p className="text-muted-foreground text-sm">Create exams and configure their subjects</p>
                    </div>
                    {selectedYearIsCurrent ? (
                        <Button onClick={() => setCreateModalOpen(true)}>Add Exam</Button>
                    ) : (
                        <Button disabled title="Exams are created for the current academic year only">
                            Add Exam
                        </Button>
                    )}
                </div>

                <div className="mb-4 flex flex-wrap items-end gap-4">
                    <AcademicYearFilter academicYears={academicYears} value={selectedYear} onValueChange={applyYearFilter} />
                </div>

                <DataTable
                    routeName="exams.index"
                    searchPlaceholder="Search exams..."
                    extraParams={{ year_id: selectedYear }}
                    columns={[
                        { key: 'name', label: 'Exam', sortable: true },
                        {
                            key: 'class',
                            label: 'Class',
                            render: (classObj: Exam['class']) => <Badge variant="secondary">{classObj?.name}</Badge>,
                        },
                        {
                            key: 'grading_scale',
                            label: 'Grading Scale',
                            render: (scale: Exam['grading_scale']) =>
                                scale ? <Badge variant="outline">{scale.name}</Badge> : <span className="text-muted-foreground">—</span>,
                        },
                        {
                            key: 'exam_subjects_count',
                            label: 'Subjects',
                            render: (count: number) => <Badge variant="secondary">{count} subjects</Badge>,
                        },
                        {
                            key: 'start_date',
                            label: 'Start',
                            sortable: true,
                            render: (date: string | null) => (date ? formatDMY(date) : <span className="text-muted-foreground">—</span>),
                        },
                    ]}
                    data={exams}
                    filters={filters}
                    actions={(row) => (
                        <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openSubjectsModal(row)} title="Manage subjects">
                                <BookOpenCheck className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openEditModal(row)} title="Edit">
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeletingExam(row)} title="Delete">
                                <Trash2 className="text-destructive h-4 w-4" />
                            </Button>
                        </div>
                    )}
                />
            </div>

            <ExamModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
                exam={null}
                classes={classes}
                gradingScales={gradingScales}
                academicYearId={filters.year_id}
            />
            <ExamModal
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
                exam={editingExam}
                classes={classes}
                gradingScales={gradingScales}
                academicYearId={filters.year_id}
            />
            <ExamSubjectsModal
                open={subjectsModalOpen}
                onOpenChange={setSubjectsModalOpen}
                examId={subjectsExam?.id ?? null}
                examName={subjectsExam?.name ?? ''}
                classSubjects={subjectsExam?.class_subjects ?? []}
                examSubjects={subjectsExam?.exam_subjects ?? []}
            />
            <ConfirmDialog
                open={deletingExam !== null}
                onOpenChange={(open) => !open && setDeletingExam(null)}
                title="Delete exam"
                description={`Are you sure you want to delete "${deletingExam?.name}"? All marks for this exam will also be removed.`}
                confirmLabel="Delete"
                onConfirm={confirmDelete}
            />
        </AppLayout>
    );
}
