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
                        <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">Day</th>
                        {periods.map((period) => (
                            <th key={period.id} className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                {period.name}
                                <span className="text-muted-foreground/70 block text-xs font-normal">
                                    {period.start_time}–{period.end_time}
                                </span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {DAYS.map((day) => (
                        <tr key={day} className="hover:bg-muted/30 border-t transition-colors">
                            <td className="px-4 py-3 text-sm font-medium whitespace-nowrap capitalize">{day}</td>
                            {periods.map((period) => {
                                const slot = slotMap.get(`${day}-${period.id}`);

                                if (period.is_break) {
                                    return (
                                        <td key={period.id} className="border-l px-4 py-3">
                                            <div className="bg-muted/60 text-muted-foreground rounded-md px-3 py-3 text-center text-xs font-medium">
                                                Break
                                            </div>
                                        </td>
                                    );
                                }

                                if (!slot) {
                                    return (
                                        <td key={period.id} className="border-l px-4 py-3">
                                            <div className="border-border text-muted-foreground flex h-full min-h-[56px] items-center justify-center rounded-md border border-dashed px-3 text-xs">
                                                —
                                            </div>
                                        </td>
                                    );
                                }

                                return (
                                    <td key={period.id} className="border-l px-4 py-3">
                                        <div className="border-border bg-background rounded-md border px-3 py-2">
                                            <div className="text-sm font-medium">{slot.subject?.name ?? '—'}</div>
                                            <div className="text-muted-foreground text-xs">
                                                {showSection && slot.section
                                                    ? `${slot.section.class.name} · ${slot.section.name}`
                                                    : (slot.staff?.user.name ?? '—')}
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
