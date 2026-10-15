import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AchievementModal, type AchievementRecord } from '@/components/website/achievement-modal';
import AppLayout from '@/layouts/app-layout';
import { formatDMY } from '@/lib/format';
import { type BreadcrumbItem, type PaginatedData } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Pencil, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Website Achievements', href: '/website/achievements' },
];

interface AchievementsIndexProps {
    achievements: PaginatedData<AchievementRecord>;
    categories: string[];
    filters: { search: string; sort: string; direction: string; per_page: number };
}

function categoryLabel(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1);
}

export default function AchievementsIndex({ achievements, categories, filters }: AchievementsIndexProps) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editingAchievement, setEditingAchievement] = useState<AchievementRecord | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deletingAchievement, setDeletingAchievement] = useState<AchievementRecord | null>(null);
    const { delete: destroy } = useForm();

    function confirmDelete() {
        if (!deletingAchievement) return;

        destroy(route('website.achievements.destroy', deletingAchievement.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeletingAchievement(null);
                toast.success('Achievement deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete achievement');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Website Achievements" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">Website Achievements</h2>
                        <p className="text-muted-foreground text-sm">Showcase student achievements on the public website</p>
                    </div>
                    <Button onClick={() => setCreateModalOpen(true)}>Add Achievement</Button>
                </div>

                <DataTable
                    routeName="website.achievements.index"
                    searchPlaceholder="Search achievements..."
                    columns={[
                        { key: 'title', label: 'Title', sortable: true },
                        {
                            key: 'student_name',
                            label: 'Student',
                            sortable: true,
                            render: (value: string | null) => value ?? <span className="text-muted-foreground">—</span>,
                        },
                        {
                            key: 'category',
                            label: 'Category',
                            sortable: true,
                            render: (category: string) => <Badge variant="outline">{categoryLabel(category)}</Badge>,
                        },
                        {
                            key: 'is_featured',
                            label: 'Featured',
                            render: (featured: boolean) =>
                                featured ? (
                                    <Badge variant="secondary" className="gap-1">
                                        <Star className="h-3 w-3" /> Highlight
                                    </Badge>
                                ) : (
                                    <span className="text-muted-foreground">—</span>
                                ),
                        },
                        {
                            key: 'achieved_on',
                            label: 'Date',
                            sortable: true,
                            render: (value: string | null) =>
                                value ? <span className="text-sm">{formatDMY(value)}</span> : <span className="text-muted-foreground">—</span>,
                        },
                        {
                            key: 'is_published',
                            label: 'Status',
                            render: (published: boolean) => (published ? <Badge>Published</Badge> : <Badge variant="secondary">Draft</Badge>),
                        },
                    ]}
                    data={achievements}
                    filters={filters}
                    actions={(row) => (
                        <div className="flex items-center justify-end gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setEditingAchievement(row);
                                    setEditModalOpen(true);
                                }}
                                title="Edit"
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeletingAchievement(row)} title="Delete">
                                <Trash2 className="text-destructive h-4 w-4" />
                            </Button>
                        </div>
                    )}
                />
            </div>

            <AchievementModal open={createModalOpen} onOpenChange={setCreateModalOpen} achievement={null} categories={categories} />
            <AchievementModal open={editModalOpen} onOpenChange={setEditModalOpen} achievement={editingAchievement} categories={categories} />
            <ConfirmDialog
                open={deletingAchievement !== null}
                onOpenChange={(open) => !open && setDeletingAchievement(null)}
                title="Delete achievement"
                description={`Are you sure you want to delete "${deletingAchievement?.title}"? It will be removed from the public website.`}
                confirmLabel="Delete"
                onConfirm={confirmDelete}
            />
        </AppLayout>
    );
}
