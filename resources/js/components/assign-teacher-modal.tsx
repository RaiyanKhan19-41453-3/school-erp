'use client';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface StaffMember {
    id: number;
    employee_id: string;
    designation: string;
    user: { id: number; name: string };
}

interface AssignedTeacher {
    id: number;
    name?: string;
    user: { id: number; name: string };
    pivot: { is_class_teacher: boolean };
}

interface SectionRow {
    id: number;
    name: string;
    class: { id: number; name: string };
    teachers: AssignedTeacher[];
}

interface AssignTeacherModalProps {
    section: SectionRow | null;
    staff: StaffMember[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AssignTeacherModal({ section, staff, open, onOpenChange }: AssignTeacherModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        section_id: '',
        staff_id: '',
        is_class_teacher: false as boolean,
    });

    const assignedStaffIds = new Set((section?.teachers ?? []).map((t) => t.id));

    useEffect(() => {
        if (section) {
            setData({
                section_id: String(section.id),
                staff_id: '',
                is_class_teacher: false as boolean,
            });
        }
    }, [section, setData]);

    function save() {
        post(route('teacher-assignments.store'), {
            onSuccess: () => {
                reset();
                onOpenChange(false);
                toast.success('Teacher assigned to section');
            },
            onError: () => {
                toast.error('Failed to assign teacher');
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Assign Teacher</DialogTitle>
                    <DialogDescription>
                        Assign a teacher to {section?.class.name} - {section?.name}
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        save();
                    }}
                    className="space-y-6"
                >
                    <div className="space-y-2">
                        <Label htmlFor="staff_id">Teacher</Label>
                        <Select value={data.staff_id} onValueChange={(v) => setData('staff_id', v)}>
                            <SelectTrigger id="staff_id">
                                <SelectValue placeholder="Select a teacher" />
                            </SelectTrigger>
                            <SelectContent>
                                {staff
                                    .filter((s) => !assignedStaffIds.has(s.user?.id))
                                    .map((s) => (
                                        <SelectItem key={s.id} value={String(s.id)}>
                                            {s.user?.name} ({s.employee_id})
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.staff_id} />
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="is_class_teacher"
                            checked={data.is_class_teacher}
                            onCheckedChange={(checked) => setData('is_class_teacher', checked === true)}
                        />
                        <Label htmlFor="is_class_teacher" className="font-normal">
                            Class teacher for this section
                        </Label>
                    </div>
                    <InputError message={errors.is_class_teacher} />

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Assign
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
