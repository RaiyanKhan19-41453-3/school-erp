import { AcademicYearFilter } from '@/components/academic-year-filter';
import { TimetableGrid } from '@/components/timetable-grid';
import { Combobox } from '@/components/ui/combobox';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Timetable', href: '/timetable/section' },
];

interface Section {
    id: number;
    name: string;
    class: string;
}

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
}

export default function SectionTimetable({
    academicYears,
    selectedYearId,
    sections,
    selectedSectionId,
    periods,
    slots,
    isAdmin,
}: {
    academicYears: AcademicYear[];
    selectedYearId: number | null;
    sections: Section[];
    selectedSectionId: number | null;
    periods: Period[];
    slots: Slot[];
    isAdmin: boolean;
}) {
    const [selectedYear, setSelectedYear] = useState<string>(selectedYearId ? String(selectedYearId) : '');
    const [selectedSection, setSelectedSection] = useState<string>(selectedSectionId ? String(selectedSectionId) : '');

    const activeSection = sections.find((s) => String(s.id) === selectedSection);

    const selectedClassLabel = useMemo(() => {
        const active = sections.find((s) => String(s.id) === selectedSection);

        return active ? `${active.class} · ${active.name}` : '';
    }, [sections, selectedSection]);

    function applyYearFilter(value: string) {
        setSelectedYear(value);
        setSelectedSection('');

        router.get(route('timetable.section'), { year_id: value }, { preserveState: true, preserveScroll: true });
    }

    function applySectionFilter(value: string) {
        setSelectedSection(value);

        router.get(route('timetable.section'), { year_id: selectedYear, section_id: value }, { preserveState: true, preserveScroll: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Section Timetable" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold tracking-tight">Section Timetable</h2>
                    <p className="text-muted-foreground text-sm">
                        {isAdmin ? 'View the weekly timetable for any section' : "Your section's weekly timetable"}
                    </p>
                </div>

                <div className="mb-4 flex flex-wrap items-end gap-4">
                    <AcademicYearFilter academicYears={academicYears} value={selectedYear} onValueChange={applyYearFilter} />
                    <div className="w-64 space-y-1.5">
                        <span className="text-sm font-medium">Section</span>
                        <Combobox
                            options={sections.map((s) => ({
                                value: String(s.id),
                                label: `${s.class} · ${s.name}`,
                            }))}
                            value={selectedSection}
                            onValueChange={applySectionFilter}
                            placeholder="Select a section..."
                            searchPlaceholder="Search sections..."
                            emptyText="No section found."
                        />
                    </div>
                </div>

                {!activeSection ? (
                    <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
                        <p className="text-muted-foreground text-sm">Select a section to view its timetable.</p>
                    </div>
                ) : (
                    <>
                        <TimetableGrid periods={periods} slots={slots} />
                        <p className="text-muted-foreground text-sm">
                            Timetable for <span className="text-foreground font-medium">{selectedClassLabel}</span>
                        </p>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
