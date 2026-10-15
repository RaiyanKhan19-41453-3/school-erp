'use client';

import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/confirm-dialog';
import InputError from '@/components/input-error';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

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

interface Period {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    is_break: boolean;
}

interface SlotData {
    id: number;
    subject: Subject | null;
    staff: StaffMember | null;
    room: string | null;
}

interface TimetableSlotModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    period: Period | null;
    day: string;
    slot: SlotData | null;
    subjects: Subject[];
    staff: StaffMember[];
    sectionId: number | null;
    academicYearId: number | null;
}

export function TimetableSlotModal({
    open,
    onOpenChange,
    period,
    day,
    slot,
    subjects,
    staff,
    sectionId,
    academicYearId,
}: TimetableSlotModalProps) {
    const { data, setData, post, put, processing, errors, reset, transform } = useForm({
        section_id: '',
        academic_year_id: '',
        period_id: '',
        day_of_week: day,
        subject_id: '',
        staff_id: '',
        room: '',
        force: false,
    });

    const [pendingPayload, setPendingPayload] = useState<Record<string, unknown> | null>(null);

    useEffect(() => {
        if (open) {
            reset();
            setPendingPayload(null);
            setData({
                section_id: sectionId ? String(sectionId) : '',
                academic_year_id: academicYearId ? String(academicYearId) : '',
                period_id: period?.id ? String(period.id) : '',
                day_of_week: day,
                subject_id: slot?.subject ? String(slot.subject.id) : '',
                staff_id: slot?.staff ? String(slot.staff.id) : '',
                room: slot?.room ?? '',
                force: false,
            });
        }
    }, [open, period, day, slot, sectionId, academicYearId, reset, setData]);

    function handleSuccess(page: { props: { flash?: { timetable_conflict?: unknown[] } } }) {
        if (page.props.flash?.timetable_conflict?.length) {
            setPendingPayload({ ...data });
            return;
        }

        onOpenChange(false);
        toast.success(slot ? 'Timetable slot updated successfully' : 'Timetable slot created successfully');
    }

    function save(force: boolean) {
        transform((d) => ({ ...d, force }));

        const options = {
            preserveScroll: true,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onSuccess: handleSuccess as (page: any) => void,
            onError: () => {
                toast.error('Failed to save timetable slot');
            },
        };

        if (slot) {
            put(route('timetable.slots.update', slot.id), options);
        } else {
            post(route('timetable.slots.store'), options);
        }
    }

    function confirmForce() {
        if (!pendingPayload) return;
        save(true);
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {slot ? 'Edit Timetable Slot' : 'Add Timetable Slot'}
                            <span className="ml-2 text-sm font-normal text-muted-foreground">
                                {day.charAt(0).toUpperCase() + day.slice(1)} · {period?.name}
                            </span>
                        </DialogTitle>
                        <DialogDescription>
                            {slot ? 'Update the subject, teacher and room for this slot.' : 'Assign a subject, teacher and optional room to this slot.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            save(false);
                        }}
                        className="space-y-6"
                    >
                        {errors.period_id && <InputError message={errors.period_id} />}

                        <div className="space-y-2">
                            <Label htmlFor="subject_id">Subject</Label>
                            <Select value={data.subject_id} onValueChange={(value) => setData('subject_id', value)}>
                                <SelectTrigger id="subject_id">
                                    <SelectValue placeholder="Select a subject..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjects.map((subject) => (
                                        <SelectItem key={subject.id} value={String(subject.id)}>
                                            {subject.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.subject_id} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="staff_id">Teacher</Label>
                            <Select value={data.staff_id} onValueChange={(value) => setData('staff_id', value)}>
                                <SelectTrigger id="staff_id">
                                    <SelectValue placeholder="Select a teacher..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {staff.map((member) => (
                                        <SelectItem key={member.id} value={String(member.id)}>
                                            {member.user.name} ({member.employee_id})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.staff_id} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="room">Room</Label>
                            <Input
                                id="room"
                                value={data.room}
                                onChange={(e) => setData('room', e.target.value)}
                                placeholder="e.g. Room 101 (optional)"
                            />
                            <InputError message={errors.room} />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {slot ? 'Update Slot' : 'Save Slot'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={pendingPayload !== null}
                onOpenChange={(open) => !open && setPendingPayload(null)}
                title="Teacher already scheduled"
                description={
                    pendingPayload
                        ? 'This teacher is already assigned during this period on this day in another section. Saving anyway will create a double booking.'
                        : ''
                }
                confirmLabel="Save Anyway"
                onConfirm={confirmForce}
            />
        </>
    );
}
