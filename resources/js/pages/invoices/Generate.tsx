import { AcademicYearFilter } from '@/components/academic-year-filter';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Invoices', href: '/invoices' },
    { title: 'Generate', href: '/invoices/generate' },
];

interface SchoolClass {
    id: number;
    name: string;
    student_count: number;
}

interface AcademicYear {
    id: number;
    name: string;
    is_current: boolean;
}

export default function GenerateInvoices({
    classes,
    academicYears,
    selectedYearId,
}: {
    classes: SchoolClass[];
    academicYears: AcademicYear[];
    selectedYearId: number | null;
}) {
    const { data, setData, post, processing, errors } = useForm({
        class_id: '',
        year_id: selectedYearId ? String(selectedYearId) : '',
    });

    const [queued, setQueued] = useState(false);

    const selectedClass = classes.find((c) => c.id === parseInt(data.class_id));

    function applyYear(value: string) {
        setData('year_id', value);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('invoices.generate.store'), {
            onSuccess: () => {
                setQueued(true);
                toast.success('Invoice generation queued');
            },
            onError: () => {
                toast.error('Failed to queue invoice generation');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Generate Invoices" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold tracking-tight">Generate Invoices</h2>
                    <p className="text-muted-foreground text-sm">
                        Bulk-create invoices for every active student in a class based on its fee structures
                    </p>
                </div>

                <div className="max-w-2xl rounded-lg border p-6">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-2">
                            <AcademicYearFilter academicYears={academicYears} value={data.year_id} onValueChange={applyYear} />
                            <InputError message={errors.year_id} />
                        </div>

                        <div className="space-y-2">
                            <Label>Class</Label>
                            <Combobox
                                options={classes.map((c) => ({ value: String(c.id), label: `${c.name} (${c.student_count} active students)` }))}
                                value={data.class_id}
                                onValueChange={(v) => setData('class_id', v)}
                                placeholder="Select class"
                                searchPlaceholder="Search classes..."
                                emptyText="No class found."
                            />
                            <InputError message={errors.class_id} />
                            {selectedClass && (
                                <p className="text-muted-foreground text-sm">
                                    This will create one invoice per active student in {selectedClass.name}, summing all of the class's fee
                                    structures. Students who already have an invoice for the selected period are skipped.
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={processing || queued}>
                                {processing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : queued ? (
                                    'Queued'
                                ) : (
                                    'Generate Invoices'
                                )}
                            </Button>
                        </div>
                    </form>

                    {queued && (
                        <div className="border-primary/30 bg-primary/5 text-muted-foreground mt-6 rounded-md border p-4 text-sm">
                            Invoice generation is being processed in the background. Check the invoice list in a moment.
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
