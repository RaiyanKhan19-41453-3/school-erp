import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EventModal, type EventRecord } from '@/components/website/event-modal';
import AppLayout from '@/layouts/app-layout';
import { formatDate, formatTime } from '@/lib/format';
import { type BreadcrumbItem, type PaginatedData } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Website Events', href: '/website/events' },
];

interface EventsIndexProps {
    events: PaginatedData<EventRecord>;
    filters: { search: string; sort: string; direction: string; per_page: number };
}

export default function EventsIndex({ events, filters }: EventsIndexProps) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deletingEvent, setDeletingEvent] = useState<EventRecord | null>(null);
    const { delete: destroy } = useForm();

    function confirmDelete() {
        if (!deletingEvent) return;

        destroy(route('website.events.destroy', deletingEvent.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeletingEvent(null);
                toast.success('Event deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete event');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Website Events" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">Website Events</h2>
                        <p className="text-muted-foreground text-sm">Manage the public school calendar</p>
                    </div>
                    <Button onClick={() => setCreateModalOpen(true)}>Add Event</Button>
                </div>

                <DataTable
                    routeName="website.events.index"
                    searchPlaceholder="Search events..."
                    columns={[
                        { key: 'title', label: 'Title', sortable: true },
                        {
                            key: 'starts_at',
                            label: 'Starts',
                            sortable: true,
                            render: (value: string) => (
                                <span className="text-sm">
                                    {formatDate(value)} · {formatTime(value)}
                                </span>
                            ),
                        },
                        {
                            key: 'location',
                            label: 'Location',
                            sortable: true,
                            render: (value: string | null) => value ?? <span className="text-muted-foreground">—</span>,
                        },
                        {
                            key: 'is_published',
                            label: 'Status',
                            render: (published: boolean) => (published ? <Badge>Published</Badge> : <Badge variant="secondary">Draft</Badge>),
                        },
                    ]}
                    data={events}
                    filters={filters}
                    actions={(row) => (
                        <div className="flex items-center justify-end gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setEditingEvent(row);
                                    setEditModalOpen(true);
                                }}
                                title="Edit"
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeletingEvent(row)} title="Delete">
                                <Trash2 className="text-destructive h-4 w-4" />
                            </Button>
                        </div>
                    )}
                />
            </div>

            <EventModal open={createModalOpen} onOpenChange={setCreateModalOpen} event={null} />
            <EventModal open={editModalOpen} onOpenChange={setEditModalOpen} event={editingEvent} />
            <ConfirmDialog
                open={deletingEvent !== null}
                onOpenChange={(open) => !open && setDeletingEvent(null)}
                title="Delete event"
                description={`Are you sure you want to delete "${deletingEvent?.title}"? It will be removed from the public calendar.`}
                confirmLabel="Delete"
                onConfirm={confirmDelete}
            />
        </AppLayout>
    );
}
