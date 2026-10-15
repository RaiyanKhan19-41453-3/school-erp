import { AcademicYearFilter } from '@/components/academic-year-filter';
import { DatePicker } from '@/components/date-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import AppLayout from '@/layouts/app-layout';
import { formatDMY } from '@/lib/format';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Attendance', href: '/attendance' },
];

interface SectionOption {
    id: number;
    name: string;
    class: string;
}

interface StudentRoster {
    id: number;
    name: string;
    admission_number: string;
    status: string | null;
    remarks: string | null;
}

const STATUS_OPTIONS = [
    { value: 'present', label: 'Present', variant: 'default' },
    { value: 'late', label: 'Late', variant: 'secondary' },
    { value: 'leave', label: 'Leave', variant: 'outline' },
    { value: 'absent', label: 'Absent', variant: 'destructive' },
] as const;

type StatusValue = (typeof STATUS_OPTIONS)[number]['value'];

export default function AttendanceIndex({
    academicYears,
    selectedYearId,
    sections,
    selectedSectionId,
    date,
    students,
    canMark,
    isAdmin,
    prevDate,
    nextDate,
}: {
    academicYears: { id: number; name: string; is_current: boolean }[];
    selectedYearId: number | null;
    sections: SectionOption[];
    selectedSectionId: number | null;
    date: string;
    students: StudentRoster[];
    canMark: boolean;
    isAdmin: boolean;
    prevDate: string;
    nextDate: string;
}) {
    const [statuses, setStatuses] = useState<Record<number, StatusValue>>(() => {
        const initial: Record<number, StatusValue> = {};
        students.forEach((s) => {
            if (s.status) initial[s.id] = s.status as StatusValue;
        });
        return initial;
    });

    const [saving, setSaving] = useState(false);
    const { errors } = usePage<{ errors: Record<string, string> }>().props;

    useEffect(() => {
        const next: Record<number, StatusValue> = {};
        students.forEach((s) => {
            if (s.status) next[s.id] = s.status as StatusValue;
        });
        setStatuses(next);
    }, [students]);

    const selectedSection = sections.find((s) => s.id === selectedSectionId);

    function applyYear(yearId: string) {
        router.get(route('attendance.index'), { year_id: yearId, date }, { preserveState: true, preserveScroll: true });
    }

    function applySection(sectionId: string) {
        router.get(
            route('attendance.index'),
            { year_id: selectedYearId || '', section_id: sectionId, date },
            { preserveState: true, preserveScroll: true },
        );
    }

    function applyDate(newDate: string) {
        router.get(
            route('attendance.index'),
            { year_id: selectedYearId || '', section_id: selectedSectionId || '', date: newDate },
            { preserveState: true, preserveScroll: true },
        );
    }

    function saveAttendance() {
        router.post(
            route('attendance.store'),
            {
                section_id: selectedSectionId,
                date,
                records: students.map((s) => ({
                    student_id: s.id,
                    status: statuses[s.id] ?? 'present',
                })),
            },
            {
                onStart: () => setSaving(true),
                onFinish: () => setSaving(false),
                onSuccess: () => {
                    toast.success('Attendance saved');
                },
                onError: () => {
                    toast.error('Failed to save attendance');
                },
            },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Attendance" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold tracking-tight">Attendance</h2>
                    <p className="text-muted-foreground text-sm">
                        {isAdmin ? 'View and record attendance for any section' : 'Record attendance for your assigned sections'}
                    </p>
                </div>

                <div className="mb-4 flex flex-wrap items-end gap-4">
                    <AcademicYearFilter
                        academicYears={academicYears}
                        value={selectedYearId ? String(selectedYearId) : ''}
                        onValueChange={applyYear}
                    />
                    <div className="w-64 space-y-2">
                        <label className="text-sm font-medium">Section</label>
                        <Combobox
                            options={sections.map((s) => ({ value: String(s.id), label: `${s.class} - ${s.name}` }))}
                            value={selectedSectionId ? String(selectedSectionId) : ''}
                            onValueChange={applySection}
                            placeholder="Select a section"
                            searchPlaceholder="Search sections..."
                            emptyText="No section found."
                        />
                    </div>

                    <div className="w-64 space-y-2">
                        <label className="text-sm font-medium">Date</label>
                        <DatePicker value={date} onChange={applyDate} placeholder="DD/MM/YYYY" />
                    </div>

                    <div className="flex items-center gap-2 pb-0">
                        <Button variant="outline" size="icon" onClick={() => applyDate(prevDate)} title="Previous day">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => applyDate(nextDate)} title="Next day">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {selectedSection && (
                    <div className="rounded-lg border">
                        <div className="flex items-center justify-between border-b px-4 py-3">
                            <div className="text-sm font-medium">
                                {selectedSection.class} - {selectedSection.name} · {formatDMY(date)}
                            </div>
                            {!canMark && <Badge variant="secondary">Read-only</Badge>}
                        </div>

                        {students.length === 0 ? (
                            <p className="text-muted-foreground px-4 py-8 text-center text-sm">No active students in this section.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-muted/50">
                                            <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">Student</th>
                                            <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">Admission No</th>
                                            <th className="text-muted-foreground px-4 py-3 text-right text-sm font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((student) => (
                                            <tr key={student.id} className="hover:bg-muted/30 border-t transition-colors">
                                                <td className="px-4 py-3 text-sm font-medium">{student.name}</td>
                                                <td className="text-muted-foreground px-4 py-3 text-sm">{student.admission_number}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {STATUS_OPTIONS.map((option) => {
                                                            const active = statuses[student.id] === option.value;
                                                            return (
                                                                <Button
                                                                    key={option.value}
                                                                    type="button"
                                                                    size="sm"
                                                                    variant={active ? 'default' : 'outline'}
                                                                    disabled={!canMark}
                                                                    onClick={() => setStatuses((prev) => ({ ...prev, [student.id]: option.value }))}
                                                                >
                                                                    {option.label}
                                                                </Button>
                                                            );
                                                        })}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {canMark && students.length > 0 && (
                            <div className="flex flex-col items-end gap-2 border-t px-4 py-3">
                                {errors.records && <span className="text-destructive text-sm">{errors.records}</span>}
                                {Object.entries(errors)
                                    .filter(([key]) => key.startsWith('records.'))
                                    .slice(0, 3)
                                    .map(([key, message]) => (
                                        <span key={key} className="text-destructive text-sm">
                                            {String(message)}
                                        </span>
                                    ))}
                                <Button onClick={saveAttendance} disabled={saving}>
                                    <Save className="h-4 w-4" />
                                    Save Attendance
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
