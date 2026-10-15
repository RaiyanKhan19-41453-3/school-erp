'use client';

import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface Subject {
    id: number;
    name: string;
    code: string | null;
}

interface AssignSubjectsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    classId: number | null;
    className: string;
    subjects: Subject[];
    assignedSubjectIds: number[];
}

export function AssignSubjectsModal({ open, onOpenChange, classId, className, subjects, assignedSubjectIds }: AssignSubjectsModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        subject_ids: [] as number[],
    });

    useEffect(() => {
        if (open) {
            setData('subject_ids', assignedSubjectIds);
        }
    }, [open, assignedSubjectIds, setData]);

    function toggle(subjectId: number) {
        setData(
            'subject_ids',
            data.subject_ids.includes(subjectId) ? data.subject_ids.filter((id) => id !== subjectId) : [...data.subject_ids, subjectId],
        );
    }

    function toggleAll() {
        setData('subject_ids', data.subject_ids.length === subjects.length ? [] : subjects.map((s) => s.id));
    }

    const selectedCount = data.subject_ids.length;
    const allSelected = subjects.length > 0 && selectedCount === subjects.length;
    const someSelected = selectedCount > 0 && !allSelected;

    function save() {
        if (!classId) return;

        post(route('classes.subjects.sync', classId), {
            onSuccess: () => {
                onOpenChange(false);
                reset();
                toast.success('Class subjects updated successfully');
            },
            onError: () => {
                toast.error('Failed to update class subjects');
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Assign Subjects — {className}</DialogTitle>
                    <DialogDescription>Choose which subjects are taught in this class.</DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        save();
                    }}
                    className="space-y-6"
                >
                    <div className="space-y-2">
                        {subjects.length === 0 ? (
                            <p className="text-muted-foreground text-sm">No subjects yet. Create subjects first.</p>
                        ) : (
                            <>
                                <div className="flex items-center justify-between">
                                    <Label>
                                        <span className="font-semibold">{selectedCount}</span>
                                        <span className="text-muted-foreground"> of {subjects.length} subjects assigned</span>
                                    </Label>
                                    <Button type="button" variant="outline" size="sm" onClick={toggleAll}>
                                        {allSelected ? 'Uncheck all' : 'Check all'}
                                    </Button>
                                </div>

                                <div className="rounded-md border">
                                    <div className="bg-muted/50 text-muted-foreground grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 border-b px-3 py-2 text-xs font-medium">
                                        <Checkbox
                                            checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                                            onCheckedChange={toggleAll}
                                            aria-label="Select all subjects"
                                        />
                                        <span>Subject</span>
                                        <span>Code</span>
                                    </div>
                                    <div className="max-h-64 divide-y overflow-y-auto">
                                        {subjects.map((subject) => {
                                            const isChecked = data.subject_ids.includes(subject.id);

                                            return (
                                                <div
                                                    key={subject.id}
                                                    className={cn(
                                                        'grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 px-3 py-2',
                                                        isChecked && 'bg-accent/40',
                                                    )}
                                                >
                                                    <Checkbox
                                                        checked={isChecked}
                                                        onCheckedChange={() => toggle(subject.id)}
                                                        aria-label={`Assign ${subject.name}`}
                                                    />
                                                    <span className={cn('text-sm font-medium', !isChecked && 'text-muted-foreground')}>
                                                        {subject.name}
                                                    </span>
                                                    {subject.code ? <Badge variant="secondary">{subject.code}</Badge> : <span />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                        <InputError message={errors.subject_ids} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Save Assignments
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
