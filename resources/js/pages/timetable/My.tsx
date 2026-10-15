import { AcademicYearFilter } from '@/components/academic-year-filter';
import { TimetableGrid } from '@/components/timetable-grid';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'My Timetable', href: '/timetable/my' },
];

interface AcademicYear {
    id: number;
    name: string;
    is_current: boolean;
}

interface Period {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    is_break: boolean;
}

interface Slot {
    id: number;
    day_of_week: string;
    period_id: number;
    subject: { id: number; name: string } | null;
    staff: { id: number; employee_id: string; user: { id: number; name: string } } | null;
    room: string | null;
    section: { id: number; name: string; class: { id: number; name: string } };
}

export default function MyTimetable({
    academicYears,
    selectedYearId,
    periods,
    slots,
    teacherName,
}: {
    academicYears: AcademicYear[];
    selectedYearId: number | null;
    periods: Period[];
    slots: Slot[];
    teacherName: string;
}) {
    const [selectedYear, setSelectedYear] = useState<string>(selectedYearId ? String(selectedYearId) : '');

    function applyYearFilter(value: string) {
        setSelectedYear(value);

        router.get(route('timetable.my'), { year_id: value }, { preserveState: true, preserveScroll: true });
    }

    const slotCount = slots.length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Timetable" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">My Timetable</h2>
                        <p className="text-muted-foreground text-sm">{teacherName}'s weekly schedule across all sections</p>
                    </div>
                    <AcademicYearFilter academicYears={academicYears} value={selectedYear} onValueChange={applyYearFilter} />
                </div>

                <TimetableGrid periods={periods} slots={slots} showSection />

                <p className="text-muted-foreground text-sm">
                    {slotCount === 0
                        ? 'No classes assigned for this academic year.'
                        : `${slotCount} class${slotCount === 1 ? '' : 'es'} scheduled this week.`}
                </p>
            </div>
        </AppLayout>
    );
}
