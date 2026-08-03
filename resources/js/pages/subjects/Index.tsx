import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { SubjectModal } from '@/components/subject-modal';
import { Pencil, Trash2 } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Subjects', href: '/subjects' },
];

interface Subject {
    id: number;
    name: string;
    code: string | null;
    classes_count: number;
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

export default function SubjectsIndex({
    subjects,
    filters,
}: {
    subjects: PaginatedData<Subject>;
    filters: { search: string; sort: string; direction: string; per_page: number };
}) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
    const { delete: destroy } = useForm();

    const openEditModal = (row: Subject) => {
        setEditingSubject(row);
        setEditModalOpen(true);
    };

    function confirmDelete() {
        if (!deletingSubject) return;

        destroy(route('subjects.destroy', deletingSubject.id), {
            onSuccess: () => {
                setDeletingSubject(null);
                toast.success('Subject deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete subject');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subjects" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">Subjects</h2>
                        <p className="text-muted-foreground text-sm">Manage subjects and their class assignments</p>
                    </div>
                    <Button onClick={() => setCreateModalOpen(true)}>Add Subject</Button>
                </div>

                <DataTable
                    routeName="subjects.index"
                    searchPlaceholder="Search subjects..."
                    columns={[
                        { key: 'name', label: 'Name', sortable: true },
                        {
                            key: 'code',
                            label: 'Code',
                            render: (code: string | null) => (code ? <Badge variant="outline">{code}</Badge> : <span className="text-muted-foreground">—</span>),
                        },
                        {
                            key: 'classes_count',
                            label: 'Classes',
                            render: (count: number) => <Badge variant="secondary">{count} assigned</Badge>,
                        },
                    ]}
                    data={subjects}
                    filters={filters}
                    actions={(row) => (
                        <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditModal(row)} title="Edit">
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeletingSubject(row)} title="Delete">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    )}
                />
            </div>

            <SubjectModal open={createModalOpen} onOpenChange={setCreateModalOpen} subject={null} />
            <SubjectModal open={editModalOpen} onOpenChange={setEditModalOpen} subject={editingSubject} />
            <ConfirmDialog
                open={deletingSubject !== null}
                onOpenChange={(open) => !open && setDeletingSubject(null)}
                title="Delete subject"
                description={`Are you sure you want to delete "${deletingSubject?.name}"? This will remove it from all class assignments and exams.`}
                confirmLabel="Delete"
                onConfirm={confirmDelete}
            />
        </AppLayout>
    );
}
