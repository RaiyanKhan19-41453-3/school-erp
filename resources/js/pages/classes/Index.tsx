import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreateClassModal } from '@/components/create-class-modal';
import { EditClassModal } from '@/components/edit-class-modal';
import { ManageSectionsModal } from '@/components/manage-sections-modal';
import { Layers, Pencil } from 'lucide-react';
import { formatDMY } from '@/lib/format';

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
    created_at: string;
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
    filters 
}: { 
    classes: PaginatedData<SchoolClass>; 
    filters: { search: string; sort: string; direction: string; per_page: number };
}) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [sectionsClassId, setSectionsClassId] = useState<number | null>(null);
    const [sectionsModalOpen, setSectionsModalOpen] = useState(false);

    const openEditModal = (row: SchoolClass) => {
        setEditingClass(row);
        setEditModalOpen(true);
    };

    const openSectionsModal = (row: SchoolClass) => {
        setSectionsClassId(row.id);
        setSectionsModalOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Classes" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">Classes</h2>
                    <p className="text-muted-foreground text-sm">Manage classes and their sections</p>
                </div>
                <Button onClick={() => setCreateModalOpen(true)}>Add Class</Button>
            </div>

            <DataTable
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
            <EditClassModal
                class={editingClass}
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
            />
            <ManageSectionsModal
                classId={sectionsClassId}
                open={sectionsModalOpen}
                onOpenChange={setSectionsModalOpen}
            />
        </AppLayout>
    );
}
