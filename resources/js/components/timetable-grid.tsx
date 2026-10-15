const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

interface Period {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    is_break: boolean;
}

interface SlotSubject {
    id: number;
    name: string;
}

interface SlotStaff {
    id: number;
    employee_id: string;
    designation?: string;
    user: { id: number; name: string };
}

interface SlotSection {
    id: number;
    name: string;
    class: { id: number; name: string };
}

interface Slot {
    id: number;
    day_of_week: string;
    period_id: number;
    subject: SlotSubject | null;
    staff: SlotStaff | null;
    room: string | null;
    section?: SlotSection;
}

interface TimetableGridProps {
    periods: Period[];
    slots: Slot[];
    showSection?: boolean;
}

export function TimetableGrid({ periods, slots, showSection = false }: TimetableGridProps) {
    const slotMap = new Map<string, Slot>();

    slots.forEach((slot) => {
        slotMap.set(`${slot.day_of_week}-${slot.period_id}`, slot);
    });

    if (periods.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
                <p className="text-muted-foreground text-sm">No periods defined yet.</p>
            </div>
        );
    }

    return (
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
                                            <div className="flex h-full min-h-[56px] items-center justify-center rounded-md border border-dashed border-border px-3 text-xs text-muted-foreground">
                                                —
                                            </div>
                                        </td>
                                    );
                                }

                                return (
                                    <td key={period.id} className="border-l px-4 py-3">
                                        <div className="rounded-md border border-border bg-background px-3 py-2">
                                            <div className="text-sm font-medium">{slot.subject?.name ?? '—'}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {showSection && slot.section
                                                    ? `${slot.section.class.name} · ${slot.section.name}`
                                                    : slot.staff?.user.name ?? '—'}
                                                {slot.room ? ` · ${slot.room}` : ''}
                                            </div>
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
