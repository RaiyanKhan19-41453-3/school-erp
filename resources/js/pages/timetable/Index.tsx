import { useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Combobox } from '@/components/ui/combobox';
import { AcademicYearFilter } from '@/components/academic-year-filter';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { TimetableSlotModal } from '@/components/timetable-slot-modal';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Timetable', href: '/timetable' },
];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

interface Period {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    is_break: boolean;
}

interface Subject {
    id: number;
    name: string;
}

interface StaffMember {
    id: number;
    employee_id: string;
    designation: string;
    user: { id: number; name: string };
}

interface Slot {
    id: number;
    day_of_week: string;
    period_id: number;
    subject: Subject | null;
    staff: StaffMember | null;
    room: string | null;
}

interface Section {
    id: number;
    class_id: number;
    name: string;
}

interface SchoolClass {
    id: number;
    name: string;
}

interface AcademicYear {
    id: number;
    name: string;
    is_current: boolean;
}

interface Filters {
    year_id: number | null;
    class_id: number | null;
    section_id: number | null;
}

export default function TimetableIndex({
    periods,
    sections,
    slots,
    subjects,
    staff,
    classes,
    academicYears,
    filters,
}: {
    periods: Period[];
    sections: Section[];
    slots: Slot[];
    subjects: Subject[];
    staff: StaffMember[];
    classes: SchoolClass[];
    academicYears: AcademicYear[];
    filters: Filters;
}) {
    const [selectedYear, setSelectedYear] = useState<string>(filters.year_id ? String(filters.year_id) : '');
    const [selectedClass, setSelectedClass] = useState<string>(filters.class_id ? String(filters.class_id) : '');
    const [selectedSection, setSelectedSection] = useState<string>(filters.section_id ? String(filters.section_id) : '');

    const [modalState, setModalState] = useState<{
        open: boolean;
        period: Period | null;
        day: string;
        slot: Slot | null;
    }>({ open: false, period: null, day: 'monday', slot: null });

    const [deletingSlot, setDeletingSlot] = useState<Slot | null>(null);
    const { delete: destroy } = useForm<Record<string, never>>();

    const activeSection = sections.find((s) => String(s.id) === selectedSection);
    const activeClass = classes.find((c) => String(c.id) === selectedClass);

    const sectionOptions = useMemo(() => {
        if (!selectedClass) {
            return sections;
        }

        return sections.filter((s) => String(s.class_id) === selectedClass);
    }, [sections, selectedClass]);

    function applyYearFilter(value: string) {
        setSelectedYear(value);
        setSelectedClass('');
        setSelectedSection('');

        router.get(route('timetable.index'), { year_id: value }, { preserveState: true, preserveScroll: true });
    }

    function applyClassFilter(value: string) {
        setSelectedClass(value);
        setSelectedSection('');

        router.get(route('timetable.index'), { year_id: selectedYear, class_id: value }, { preserveState: true, preserveScroll: true });
    }

    function applySectionFilter(value: string) {
        setSelectedSection(value);

        router.get(route('timetable.index'), { year_id: selectedYear, class_id: selectedClass, section_id: value }, { preserveState: true, preserveScroll: true });
    }

    const openAddModal = (period: Period, day: string) => {
        setModalState({ open: true, period, day, slot: null });
    };

    const openEditModal = (period: Period, day: string, slot: Slot) => {
        setModalState({ open: true, period, day, slot });
    };

    function confirmDelete() {
        if (!deletingSlot) return;

        destroy(route('timetable.slots.destroy', deletingSlot.id), {
            onSuccess: () => {
                setDeletingSlot(null);
                toast.success('Timetable slot removed');
            },
            onError: () => {
                toast.error('Failed to remove timetable slot');
            },
        });
    }

    const slotMap = useMemo(() => {
        const map = new Map<string, Slot>();

        slots.forEach((slot) => {
            map.set(`${slot.day_of_week}-${slot.period_id}`, slot);
        });

        return map;
    }, [slots]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Timetable" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold tracking-tight">Timetable Builder</h2>
                    <p className="text-muted-foreground text-sm">Build the weekly timetable for a section</p>
                </div>

                <div className="mb-4 flex flex-wrap items-end gap-4">
                    <AcademicYearFilter academicYears={academicYears} value={selectedYear} onValueChange={applyYearFilter} />
                    <div className="w-56 space-y-1.5">
                        <span className="text-sm font-medium">Class</span>
                        <Combobox
                            options={classes.map((c) => ({ value: String(c.id), label: c.name }))}
                            value={selectedClass}
                            onValueChange={applyClassFilter}
                            placeholder="Select a class..."
                            searchPlaceholder="Search classes..."
                            emptyText="No class found."
                        />
                    </div>
                    <div className="w-56 space-y-1.5">
                        <span className="text-sm font-medium">Section</span>
                        <Combobox
                            options={sectionOptions.map((s) => ({ value: String(s.id), label: s.name }))}
                            value={selectedSection}
                            onValueChange={applySectionFilter}
                            disabled={!activeClass}
                            placeholder="Select a section..."
                            searchPlaceholder="Search sections..."
                            emptyText="No section found."
                        />
                    </div>
                </div>

                {!activeSection ? (
                    <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
                        <p className="text-muted-foreground text-sm">
                            {selectedClass ? 'Select a section to build its timetable.' : 'Select a class and section to build the timetable.'}
                        </p>
                    </div>
                ) : periods.length === 0 ? (
                    <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
                        <p className="text-muted-foreground text-sm">
                            No periods defined yet.{' '}
                            <a href="/periods" className="text-primary underline">
                                Add periods first
                            </a>
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-muted/50">
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Day</th>
                                    {periods.map((period) => (
                                        <th key={period.id} className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                                            {period.name}
                                            <span className="block text-xs font-normal text-muted-foreground/70">
                                                {period.start_time}–{period.end_time}
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {DAYS.map((day) => (
                                    <tr key={day} className="border-t transition-colors hover:bg-muted/30">
                                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium capitalize">{day}</td>
                                        {periods.map((period) => {
                                            const slot = slotMap.get(`${day}-${period.id}`);

                                            if (period.is_break) {
                                                return (
                                                    <td key={period.id} className="border-l px-4 py-3">
                                                        <div className="rounded-md bg-muted/60 px-3 py-3 text-center text-xs font-medium text-muted-foreground">
                                                            Break
                                                        </div>
                                                    </td>
                                                );
                                            }

                                            if (!slot) {
                                                return (
                                                    <td key={period.id} className="border-l px-4 py-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => openAddModal(period, day)}
                                                            className="flex h-full min-h-[56px] w-full items-center justify-center gap-1 rounded-md border border-dashed border-border px-3 text-xs text-muted-foreground hover:border-primary hover:text-primary"
                                                        >
                                                            <Plus className="h-3.5 w-3.5" />
                                                            Add
                                                        </button>
                                                    </td>
                                                );
                                            }

                                            return (
                                                <td key={period.id} className="border-l px-4 py-3">
                                                    <div className="group relative rounded-md border border-border bg-background px-3 py-2">
                                                        <button type="button" onClick={() => openEditModal(period, day, slot)} className="block w-full text-left">
                                                            <div className="text-sm font-medium">{slot.subject?.name ?? '—'}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {slot.staff?.user.name ?? '—'}
                                                                {slot.room ? ` · ${slot.room}` : ''}
                                                            </div>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeletingSlot(slot)}
                                                            title="Remove slot"
                                                            className="absolute right-1 top-1 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeSection && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        Building timetable for{' '}
                        <Badge variant="secondary">
                            {activeClass?.name} · {activeSection.name}
                        </Badge>
                        {slots.length === 0 && <span>— no slots yet</span>}
                    </div>
                )}
            </div>

            <TimetableSlotModal
                open={modalState.open}
                onOpenChange={(open) => setModalState((s) => ({ ...s, open }))}
                period={modalState.period}
                day={modalState.day}
                slot={modalState.slot}
                subjects={subjects}
                staff={staff}
                sectionId={activeSection?.id ?? null}
                academicYearId={filters.year_id}
            />
            <ConfirmDialog
                open={deletingSlot !== null}
                onOpenChange={(open) => !open && setDeletingSlot(null)}
                title="Remove timetable slot"
                description="Are you sure you want to remove this slot from the timetable?"
                confirmLabel="Remove"
                onConfirm={confirmDelete}
            />
        </AppLayout>
    );
}
