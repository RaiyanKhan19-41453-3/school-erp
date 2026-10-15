import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDMY } from '@/lib/format';
import { Eye } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'My Invoices', href: '/invoices/my' },
];

interface Invoice {
    id: number;
    invoice_number: string;
    due_date: string;
    total_amount: string;
    status: string;
    period: string | null;
    student: { id: number; name: string; admission_number: string; section: { name: string; class: { name: string } } };
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    unpaid: 'secondary',
    partial: 'outline',
    paid: 'default',
    overdue: 'destructive',
};

export default function MyInvoices({ invoices }: { invoices: Invoice[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Invoices" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold tracking-tight">My Invoices</h2>
                    <p className="text-muted-foreground text-sm">View your invoices and payment status</p>
                </div>

                {invoices.length === 0 ? (
                    <p className="rounded-lg border p-8 text-center text-sm text-muted-foreground">No invoices available yet.</p>
                ) : (
                    <div className="rounded-lg border">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-muted/50 text-left text-sm font-medium text-muted-foreground">
                                        <th className="px-4 py-3">Invoice No</th>
                                        <th className="px-4 py-3">Period</th>
                                        <th className="px-4 py-3">Due Date</th>
                                        <th className="px-4 py-3 text-right">Amount</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((invoice) => (
                                        <tr key={invoice.id} className="border-t text-sm">
                                            <td className="px-4 py-3 font-medium">{invoice.invoice_number}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{invoice.period ?? '—'}</td>
                                            <td className="px-4 py-3">{formatDMY(invoice.due_date)}</td>
                                            <td className="px-4 py-3 text-right font-medium">৳{parseFloat(invoice.total_amount).toFixed(2)}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={STATUS_VARIANTS[invoice.status] ?? 'secondary'}>
                                                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end">
                                                    <Link href={route('invoices.show', invoice.id)}>
                                                        <Button variant="ghost" size="icon" title="View invoice">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
