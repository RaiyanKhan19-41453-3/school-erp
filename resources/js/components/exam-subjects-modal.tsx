'use client';

import { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Checkbox } from '@/components/ui/checkbox';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DatePicker } from '@/components/date-picker';
import { cn } from '@/lib/utils';
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
    code: string | null;
}

interface ExamSubject {
    subject_id: number;
    full_marks: string;
    pass_marks: string;
    exam_date: string | null;
    marks_count?: number;
}

interface ExamSubjectsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    examId: number | null;
    examName: string;
    classSubjects: Subject[];
    examSubjects: ExamSubject[];
}

interface FormSubject {
    [key: string]: string | number | boolean | null | undefined;
    subject_id: number;
    name: string;
    code: string | null;
    full_marks: string;
    pass_marks: string;
    exam_date: string;
    checked?: boolean;
}

export function ExamSubjectsModal({ open, onOpenChange, examId, examName, classSubjects, examSubjects }: ExamSubjectsModalProps) {
    const { data, setData, post, processing, errors, reset, transform } = useForm({
        subjects: [] as FormSubject[],
    });

    transform((formData) => ({
        subjects: (formData.subjects as FormSubject[])
            .filter((subject) => subject.checked)
            .map(({ subject_id, full_marks, pass_marks, exam_date }) => ({
                subject_id,
                full_marks,
                pass_marks,
                exam_date,
            })),
    }));

    const [validation, setValidation] = useState<Record<number, string>>({});
    const [pendingRemoval, setPendingRemoval] = useState<{ marksCount: number; subjectNames: string[] } | null>(null);

    useEffect(() => {
        if (open) {
            const existing = new Map(examSubjects.map((s) => [s.subject_id, s]));

            setData(
                'subjects',
                classSubjects.map((subject) => {
                    const existingSubject = existing.get(subject.id);

                    return {
                        subject_id: subject.id,
                        name: subject.name,
                        code: subject.code,
                        full_marks: existingSubject?.full_marks ?? '',
                        pass_marks: existingSubject?.pass_marks ?? '',
                        exam_date: existingSubject?.exam_date ?? '',
                        checked: existingSubject !== undefined,
                    };
                }),
            );
            setValidation({});
            setPendingRemoval(null);
        }
    }, [open, examSubjects, classSubjects, setData]);

    const formSubjects = (data.subjects as FormSubject[]) ?? [];
    const selectedCount = formSubjects.filter((s) => s.checked).length;
    const allSelected = formSubjects.length > 0 && selectedCount === formSubjects.length;
    const someSelected = selectedCount > 0 && !allSelected;

    function updateSubject(index: number, field: keyof FormSubject, value: string) {
        setData(
            'subjects',
            formSubjects.map((subject, i) => (i === index ? { ...subject, [field]: value } : subject)),
        );
    }

    function toggle(index: number) {
        const subject = formSubjects[index];
        const checking = !subject.checked;

        setData(
            'subjects',
            formSubjects.map((s, i) =>
                i === index
                    ? {
                          ...s,
                          checked: checking,
                          full_marks: checking && !s.full_marks ? '100' : s.full_marks,
                          pass_marks: checking && !s.pass_marks ? '40' : s.pass_marks,
                      }
                    : s,
            ),
        );
    }

    function toggleAll() {
        const next = !allSelected;

        setData(
            'subjects',
            formSubjects.map((s) => ({
                ...s,
                checked: next,
                full_marks: next && !s.full_marks ? '100' : s.full_marks,
                pass_marks: next && !s.pass_marks ? '40' : s.pass_marks,
            })),
        );
    }

    function save() {
        if (!examId) return;

        const nextValidation: Record<number, string> = {};
        formSubjects
            .filter((subject) => subject.checked)
            .forEach((subject) => {
                if (!subject.full_marks) {
                    nextValidation[subject.subject_id] = 'Full marks are required.';
                } else if (subject.pass_marks && parseFloat(subject.pass_marks) > parseFloat(subject.full_marks)) {
                    nextValidation[subject.subject_id] = 'Pass marks must not exceed full marks.';
                }
            });

        if (Object.keys(nextValidation).length > 0) {
            setValidation(nextValidation);
            return;
        }

        setValidation({});

        const existingBySubject = new Map(examSubjects.map((s) => [s.subject_id, s]));
        const removedWithMarks = formSubjects.filter(
            (subject) => !subject.checked && (existingBySubject.get(subject.subject_id)?.marks_count ?? 0) > 0,
        );

        if (removedWithMarks.length > 0) {
            setPendingRemoval({
                marksCount: removedWithMarks.reduce(
                    (sum, s) => sum + (existingBySubject.get(s.subject_id)?.marks_count ?? 0),
                    0,
                ),
                subjectNames: removedWithMarks.map((s) => s.name),
            });

            return;
        }

        submit();
    }

    function submit() {
        if (!examId) return;

        setPendingRemoval(null);
        post(route('exams.subjects.store', examId), {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                reset();
                toast.success('Exam subjects saved successfully');
            },
            onError: () => {
                toast.error('Failed to save exam subjects');
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Exam Subjects — {examName}</DialogTitle>
                    <DialogDescription>
                        Check the subjects this exam includes and set their marks. Unchecked subjects won't be part of this exam.
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
                        {formSubjects.length === 0 ? (
                            <p className="text-muted-foreground text-sm">This class has no subjects assigned yet. Assign subjects to the class first.</p>
                        ) : (
                            <>
                                <div className="flex items-center justify-between">
                                    <Label>
                                        <span className="font-semibold">{selectedCount}</span>
                                        <span className="text-muted-foreground"> of {formSubjects.length} subjects included</span>
                                    </Label>
                                    <Button type="button" variant="outline" size="sm" onClick={toggleAll}>
                                        {allSelected ? 'Uncheck all' : 'Check all'}
                                    </Button>
                                </div>

                                <div className="rounded-md border">
                                    <div className="grid grid-cols-[2.5rem_1fr_6.5rem_6.5rem_10rem] items-center gap-2 border-b bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">
                                        <Checkbox
                                            checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                                            onCheckedChange={toggleAll}
                                            aria-label="Select all subjects"
                                        />
                                        <span>Subject</span>
                                        <span className="text-right">Full marks</span>
                                        <span className="text-right">Pass marks</span>
                                        <span>Exam date</span>
                                    </div>

                                    <div className="divide-y">
                                        {formSubjects.map((subject, index) => {
                                            const error = validation[subject.subject_id];
                                            const isChecked = subject.checked ?? false;

                                            return (
                                                <div
                                                    key={subject.subject_id}
                                                    className={cn(
                                                        'grid grid-cols-[2.5rem_1fr_6.5rem_6.5rem_10rem] items-center gap-2 px-3 py-2',
                                                        isChecked && 'bg-accent/40',
                                                    )}
                                                >
                                                    <Checkbox checked={isChecked} onCheckedChange={() => toggle(index)} aria-label={`Include ${subject.name}`} />
                                                    <div className="flex min-w-0 items-center gap-2">
                                                        <span className={cn('truncate text-sm font-medium', !isChecked && 'text-muted-foreground')}>
                                                            {subject.name}
                                                        </span>
                                                        {subject.code && <Badge variant="secondary">{subject.code}</Badge>}
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            disabled={!isChecked}
                                                            value={subject.full_marks}
                                                            onChange={(e) => updateSubject(index, 'full_marks', e.target.value)}
                                                            placeholder="—"
                                                            className="h-9 w-24 text-right"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            disabled={!isChecked}
                                                            value={subject.pass_marks}
                                                            onChange={(e) => updateSubject(index, 'pass_marks', e.target.value)}
                                                            placeholder="—"
                                                            className="h-9 w-24 text-right"
                                                        />
                                                    </div>
                                                    <div className="w-40">
                                                        <DatePicker
                                                            value={subject.exam_date ?? ''}
                                                            onChange={(v) => updateSubject(index, 'exam_date', v)}
                                                            placeholder="DD/MM/YYYY"
                                                            disabled={!isChecked}
                                                        />
                                                    </div>
                                                    {error && (
                                                        <div className="col-span-5 -mt-1 text-xs text-destructive">{error}</div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                        <InputError message={errors.subjects} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Save Subjects
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>

            <ConfirmDialog
                open={pendingRemoval !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setPendingRemoval(null);
                    }
                }}
                title="Remove subjects with recorded marks?"
                description={
                    pendingRemoval
                        ? `Unchecking ${pendingRemoval.subjectNames.join(', ')} will permanently delete ${pendingRemoval.marksCount} recorded mark${pendingRemoval.marksCount === 1 ? '' : 's'}. This cannot be undone.`
                        : ''
                }
                confirmLabel="Remove and save"
                onConfirm={() => {
                    submit();
                }}
            />
        </Dialog>
    );
}
