import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, UserRound } from 'lucide-react';
import { formatDMY } from '@/lib/format';

interface Guardian {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
    occupation: string | null;
    pivot: {
        relationship: string;
        is_primary: boolean;
    };
}

interface Section {
    id: number;
    name: string;
    class: { id: number; name: string };
}

interface Attendance {
    id: number;
    date: string;
    status: string;
}

interface StudentData {
    id: number;
    name: string;
    admission_number: string;
    date_of_birth: string;
    gender: string;
    admission_date: string;
    status: string;
    section: Section;
    guardians: Guardian[];
    attendances: Attendance[];
}

const breadcrumbs = (student: StudentData): BreadcrumbItem[] => [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Students', href: '/students' },
    { title: student.name, href: `/students/${student.id}` },
];

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between gap-4 py-2">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-medium text-right">{value}</span>
        </div>
    );
}

export default function StudentShow({ student }: { student: StudentData }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs(student)}>
            <Head title={student.name} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">{student.name}</h2>
                        <p className="text-muted-foreground text-sm">
                            {student.section ? `${student.section.class?.name ?? '—'} · ${student.section.name}` : 'No section assigned'}
                        </p>
                    </div>
                    <Link href={route('students.edit', student.id)}>
                        <Button>
                            <Pencil className="h-4 w-4" />
                            Edit Student
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Student Details</CardTitle>
                            <CardDescription>Personal and admission information</CardDescription>
                        </CardHeader>
                        <CardContent className="divide-y">
                            <InfoRow label="Admission No" value={student.admission_number} />
                            <InfoRow label="Date of Birth" value={formatDMY(student.date_of_birth)} />
                            <InfoRow label="Gender" value={student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : '—'} />
                            <InfoRow label="Admission Date" value={formatDMY(student.admission_date)} />
                            <div className="flex justify-between gap-4 py-2">
                                <span className="text-sm text-muted-foreground">Status</span>
                                <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                                    {student.status ? student.status.charAt(0).toUpperCase() + student.status.slice(1) : '—'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base">Guardians</CardTitle>
                            <CardDescription>Linked guardians and their relationship</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {student.guardians.length === 0 && (
                                <p className="py-4 text-center text-sm text-muted-foreground">No guardians linked.</p>
                            )}
                            {student.guardians.map((guardian) => (
                                <div key={guardian.id} className="flex items-center justify-between gap-4 rounded-lg border bg-card px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                                            <UserRound className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">{guardian.name}</span>
                                                {guardian.pivot.is_primary ? <Badge>Primary</Badge> : null}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {guardian.pivot.relationship.charAt(0).toUpperCase() + guardian.pivot.relationship.slice(1)}
                                                {guardian.phone ? ` · ${guardian.phone}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    {guardian.email && <span className="text-sm text-muted-foreground">{guardian.email}</span>}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
