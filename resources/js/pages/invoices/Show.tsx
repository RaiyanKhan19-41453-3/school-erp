import { DatePicker } from '@/components/date-picker';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatDMY } from '@/lib/format';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Invoices', href: '/invoices' },
    { title: 'Invoice', href: '/invoices' },
];

interface InvoiceItem {
    id: number;
    description: string;
    amount: string;
    fee_structure: { id: number; fee_category: { name: string } } | null;
}

interface Payment {
    id: number;
    amount: string;
    payment_method: string;
    status: string;
    paid_at: string | null;
    remarks: string | null;
    recorder: { id: number; name: string } | null;
}

interface Invoice {
    id: number;
    invoice_number: string;
    due_date: string;
    total_amount: string;
    status: string;
    period: string | null;
    student: { id: number; name: string; admission_number: string; section: { name: string; class: { name: string } } };
    items: InvoiceItem[];
    payments: Payment[];
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    unpaid: 'secondary',
    partial: 'outline',
    paid: 'default',
    overdue: 'destructive',
};

const PAYMENT_METHODS = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'online', label: 'Online' },
];

export default function InvoiceShow({
    invoice,
    balanceDue,
    amountPaid,
    canRecordPayment = false,
}: {
    invoice: Invoice;
    balanceDue: string;
    amountPaid: string;
    canRecordPayment?: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        payment_method: 'cash',
        remarks: '',
        paid_at: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('invoices.payments.store', invoice.id), {
            onSuccess: () => {
                reset();
                toast.success('Payment recorded');
            },
            onError: () => {
                toast.error('Failed to record payment');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Invoice ${invoice.invoice_number}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-2">
                    <Link
                        href={canRecordPayment ? route('invoices.index') : route('invoices.my')}
                        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to invoices
                    </Link>
                </div>

                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">{invoice.invoice_number}</h2>
                        <p className="text-muted-foreground text-sm">
                            {invoice.student.name} · {invoice.student.admission_number} · {invoice.student.section?.class?.name} -{' '}
                            {invoice.student.section?.name}
                            {invoice.period ? ` · Period ${invoice.period}` : ''}
                        </p>
                    </div>
                    <Badge variant={STATUS_VARIANTS[invoice.status] ?? 'secondary'}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-lg border p-6">
                        <h3 className="mb-4 text-sm font-semibold">Invoice Breakdown</h3>
                        <div className="space-y-3">
                            {invoice.items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between border-b pb-2 text-sm">
                                    <div>
                                        <div>{item.description}</div>
                                        <div className="text-muted-foreground text-xs">
                                            {item.fee_structure ? item.fee_structure.fee_category?.name : 'Ad-hoc charge'}
                                        </div>
                                    </div>
                                    <div className="font-medium">৳{parseFloat(item.amount).toFixed(2)}</div>
                                </div>
                            ))}
                            <div className="flex items-center justify-between pt-2 font-medium">
                                <span>Total</span>
                                <span>৳{parseFloat(invoice.total_amount).toFixed(2)}</span>
                            </div>
                            <div className="text-muted-foreground flex items-center justify-between text-sm">
                                <span>Paid</span>
                                <span>৳{parseFloat(amountPaid).toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between pt-2 text-lg font-semibold">
                                <span>Balance Due</span>
                                <span className={parseFloat(balanceDue) > 0 ? 'text-destructive' : 'text-primary'}>
                                    ৳{parseFloat(balanceDue).toFixed(2)}
                                </span>
                            </div>
                            <div className="text-muted-foreground flex items-center justify-between text-sm">
                                <span>Due Date</span>
                                <span>{formatDMY(invoice.due_date)}</span>
                            </div>
                        </div>
                    </div>

                    {canRecordPayment && (
                        <div className="rounded-lg border p-6">
                            <h3 className="mb-4 text-sm font-semibold">Record Payment</h3>
                            {parseFloat(balanceDue) <= 0 ? (
                                <p className="text-muted-foreground text-sm">This invoice is fully paid. No further payments can be recorded.</p>
                            ) : (
                                <form onSubmit={submit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="amount">Amount</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            max={balanceDue}
                                            value={data.amount}
                                            onChange={(e) => setData('amount', e.target.value)}
                                            placeholder={`Up to ৳${parseFloat(balanceDue).toFixed(2)}`}
                                        />
                                        <InputError message={errors.amount} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Payment Method</Label>
                                        <Select value={data.payment_method} onValueChange={(v) => setData('payment_method', v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PAYMENT_METHODS.map((m) => (
                                                    <SelectItem key={m.value} value={m.value}>
                                                        {m.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.payment_method} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Payment Date</Label>
                                        <DatePicker
                                            value={data.paid_at}
                                            onChange={(v) => setData('paid_at', v)}
                                            placeholder="DD/MM/YYYY (defaults to today)"
                                        />
                                        <InputError message={errors.paid_at} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="remarks">Remarks (optional)</Label>
                                        <Input
                                            id="remarks"
                                            value={data.remarks}
                                            onChange={(e) => setData('remarks', e.target.value)}
                                            placeholder="e.g. Cheque #1234"
                                        />
                                        <InputError message={errors.remarks} />
                                    </div>

                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Recording...' : 'Record Payment'}
                                    </Button>
                                </form>
                            )}
                        </div>
                    )}
                </div>

                <div className="rounded-lg border p-6">
                    <h3 className="mb-4 text-sm font-semibold">Payment History</h3>
                    {invoice.payments.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No payments recorded yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-muted/50 text-muted-foreground text-left text-sm font-medium">
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Method</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Amount</th>
                                        <th className="px-4 py-3">Recorded By</th>
                                        <th className="px-4 py-3">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.payments.map((payment) => (
                                        <tr key={payment.id} className="border-t text-sm">
                                            <td className="px-4 py-3">{payment.paid_at ? formatDMY(payment.paid_at) : '—'}</td>
                                            <td className="px-4 py-3 capitalize">{payment.payment_method.replace('_', ' ')}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                                                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">৳{parseFloat(payment.amount).toFixed(2)}</td>
                                            <td className="px-4 py-3">{payment.recorder?.name ?? '—'}</td>
                                            <td className="text-muted-foreground px-4 py-3">{payment.remarks ?? '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
