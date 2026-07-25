import { Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

export default function ClassesIndex({ classes }: { classes: SchoolClass[] }) {
    const { props } = usePage();
    const flash = (props as any).flash;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Classes" />

            {flash?.success && (
                <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    {flash.success}
                </div>
            )}

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">Classes</h2>
                    <p className="text-muted-foreground text-sm">Manage classes and their sections</p>
                </div>
                <Link href={route('classes.create')}>
                    <Button>Add Class</Button>
                </Link>
            </div>

            <DataTable
                columns={[
                    { key: 'name', label: 'Class Name' },
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
                        render: (date: string) => new Date(date).toLocaleDateString(),
                    },
                ]}
                data={classes}
            />
        </AppLayout>
    );
}
