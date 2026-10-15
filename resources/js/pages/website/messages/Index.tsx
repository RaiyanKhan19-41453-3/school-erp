import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { formatDate, formatTime } from '@/lib/format';
import { type BreadcrumbItem, type PaginatedData } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Eye, Mail, MailOpen, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Website Messages', href: '/website/messages' },
];

interface ContactMessageRecord {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    subject: string | null;
    message: string;
    is_read: boolean;
    created_at: string;
}

interface MessagesIndexProps {
    messages: PaginatedData<ContactMessageRecord>;
    unreadCount: number;
    filters: { search: string; sort: string; direction: string; per_page: number };
}

export default function MessagesIndex({ messages, unreadCount, filters }: MessagesIndexProps) {
    const [viewing, setViewing] = useState<ContactMessageRecord | null>(null);
    const [deleting, setDeleting] = useState<ContactMessageRecord | null>(null);
    const { delete: destroy } = useForm();

    function toggleRead(message: ContactMessageRecord) {
        router.put(
            route('website.messages.update', message.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setViewing((current) => (current?.id === message.id ? { ...current, is_read: !current.is_read } : current));
                    toast.success(message.is_read ? 'Message marked as unread' : 'Message marked as read');
                },
                onError: () => toast.error('Failed to update message'),
            },
        );
    }

    function confirmDelete() {
        if (!deleting) return;

        destroy(route('website.messages.destroy', deleting.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleting(null);
                setViewing(null);
                toast.success('Message deleted successfully');
            },
            onError: () => toast.error('Failed to delete message'),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Website Messages" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">Website Messages</h2>
                        <p className="text-muted-foreground text-sm">Enquiries submitted through the public contact form</p>
                    </div>
                    {unreadCount > 0 && <Badge>{unreadCount} unread</Badge>}
                </div>

                <DataTable
                    routeName="website.messages.index"
                    searchPlaceholder="Search messages..."
                    columns={[
                        {
                            key: 'name',
                            label: 'From',
                            render: (value: string, row: ContactMessageRecord) => (
                                <div>
                                    <p className="font-medium">{value}</p>
                                    <p className="text-muted-foreground text-xs">{row.email}</p>
                                </div>
                            ),
                        },
                        {
                            key: 'subject',
                            label: 'Subject',
                            render: (value: string | null) => value ?? <span className="text-muted-foreground">—</span>,
                        },
                        {
                            key: 'created_at',
                            label: 'Received',
                            render: (value: string) => (
                                <span className="text-sm">
                                    {formatDate(value)} · {formatTime(value)}
                                </span>
                            ),
                        },
                        {
                            key: 'is_read',
                            label: 'Status',
                            render: (read: boolean) => (read ? <Badge variant="secondary">Read</Badge> : <Badge>Unread</Badge>),
                        },
                    ]}
                    data={messages}
                    filters={filters}
                    actions={(row) => (
                        <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => setViewing(row)} title="View message">
                                <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => toggleRead(row)} title={row.is_read ? 'Mark unread' : 'Mark read'}>
                                {row.is_read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleting(row)} title="Delete">
                                <Trash2 className="text-destructive h-4 w-4" />
                            </Button>
                        </div>
                    )}
                />
            </div>

            <Dialog open={viewing !== null} onOpenChange={(open) => !open && setViewing(null)}>
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{viewing?.subject ?? 'Message'}</DialogTitle>
                        <DialogDescription>
                            From {viewing?.name} &lt;{viewing?.email}&gt;
                            {viewing?.phone ? ` · ${viewing.phone}` : ''}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="text-muted-foreground text-xs">
                        {viewing && `${formatDate(viewing.created_at)} · ${formatTime(viewing.created_at)}`}
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-line">{viewing?.message}</p>
                    <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
                        <Button variant="outline" onClick={() => viewing && toggleRead(viewing)}>
                            {viewing?.is_read ? 'Mark as unread' : 'Mark as read'}
                        </Button>
                        <Button variant="destructive" onClick={() => viewing && setDeleting(viewing)}>
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="Delete message"
                description={`Are you sure you want to delete the message from "${deleting?.name}"?`}
                confirmLabel="Delete"
                onConfirm={confirmDelete}
            />
        </AppLayout>
    );
}
