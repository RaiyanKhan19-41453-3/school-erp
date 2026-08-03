import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { GradingScaleModal } from '@/components/grading-scale-modal';
import { GradeBandsModal } from '@/components/grade-bands-modal';
import { ListChecks, Pencil, Trash2 } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Grading Scales', href: '/grading-scales' },
];

interface GradeBand {
    id: number;
    label: string;
    min_percentage: string;
    max_percentage: string;
    grade_point: string | null;
    remarks: string | null;
}

interface GradingScale {
    id: number;
    name: string;
    grade_bands_count: number;
    grade_bands: GradeBand[];
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

export default function GradingScalesIndex({
    scales,
    filters,
}: {
    scales: PaginatedData<GradingScale>;
    filters: { search: string; per_page: number };
}) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editingScale, setEditingScale] = useState<GradingScale | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [bandsScale, setBandsScale] = useState<GradingScale | null>(null);
    const [bandsModalOpen, setBandsModalOpen] = useState(false);
    const [deletingScale, setDeletingScale] = useState<GradingScale | null>(null);
    const { delete: destroy } = useForm();

    const openEditModal = (row: GradingScale) => {
        setEditingScale(row);
        setEditModalOpen(true);
    };

    const openBandsModal = (row: GradingScale) => {
        setBandsScale(row);
        setBandsModalOpen(true);
    };

    function confirmDelete() {
        if (!deletingScale) return;

        destroy(route('grading-scales.destroy', deletingScale.id), {
            onSuccess: () => {
                setDeletingScale(null);
                toast.success('Grading scale deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete grading scale');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Grading Scales" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">Grading Scales</h2>
                        <p className="text-muted-foreground text-sm">Define percentage ranges for grades used on report cards</p>
                    </div>
                    <Button onClick={() => setCreateModalOpen(true)}>Add Grading Scale</Button>
                </div>

                <DataTable
                    routeName="grading-scales.index"
                    searchPlaceholder="Search grading scales..."
                    columns={[
                        { key: 'name', label: 'Name', sortable: true },
                        {
                            key: 'grade_bands_count',
                            label: 'Bands',
                            render: (count: number) => <Badge variant="secondary">{count} bands</Badge>,
                        },
                    ]}
                    data={scales}
                    filters={filters}
                    actions={(row) => (
                        <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openBandsModal(row)} title="Manage grade bands">
                                <ListChecks className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openEditModal(row)} title="Edit">
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeletingScale(row)} title="Delete">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    )}
                />
            </div>

            <GradingScaleModal open={createModalOpen} onOpenChange={setCreateModalOpen} scale={null} />
            <GradingScaleModal open={editModalOpen} onOpenChange={setEditModalOpen} scale={editingScale} />
            <GradeBandsModal
                open={bandsModalOpen}
                onOpenChange={setBandsModalOpen}
                scaleId={bandsScale?.id ?? null}
                scaleName={bandsScale?.name ?? ''}
                bands={bandsScale?.grade_bands ?? []}
            />
            <ConfirmDialog
                open={deletingScale !== null}
                onOpenChange={(open) => !open && setDeletingScale(null)}
                title="Delete grading scale"
                description={`Are you sure you want to delete "${deletingScale?.name}"? Exams using this scale will fall back to marks and percentages only.`}
                confirmLabel="Delete"
                onConfirm={confirmDelete}
            />
        </AppLayout>
    );
}
