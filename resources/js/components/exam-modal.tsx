'use client';

import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/date-picker';
import InputError from '@/components/input-error';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useEffect } from 'react';

interface SchoolClass {
    id: number;
    name: string;
}

interface GradingScale {
    id: number;
    name: string;
}

interface Exam {
    id: number;
    class_id: number;
    name: string;
    grading_scale_id: number | null;
    start_date: string | null;
    end_date: string | null;
}

interface ExamModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    exam: Exam | null;
    classes: SchoolClass[];
    gradingScales: GradingScale[];
    academicYearId: number | null;
}

export function ExamModal({ open, onOpenChange, exam, classes, gradingScales, academicYearId }: ExamModalProps) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        academic_year_id: '',
        class_id: '',
        name: '',
        grading_scale_id: '',
        start_date: '',
        end_date: '',
    });

    useEffect(() => {
        if (open) {
            reset();
            setData('academic_year_id', academicYearId ? String(academicYearId) : '');
            if (exam) {
                setData({
                    academic_year_id: academicYearId ? String(academicYearId) : '',
                    class_id: String(exam.class_id),
                    name: exam.name,
                    grading_scale_id: exam.grading_scale_id ? String(exam.grading_scale_id) : '',
                    start_date: exam.start_date ?? '',
                    end_date: exam.end_date ?? '',
                });
            }
        }
    }, [open, exam, academicYearId, reset, setData]);

    function save() {
        const options = {
            onSuccess: () => {
                onOpenChange(false);
                toast.success(exam ? 'Exam updated successfully' : 'Exam created successfully');
            },
            onError: () => {
                toast.error(exam ? 'Failed to update exam' : 'Failed to create exam');
            },
        };

        if (exam) {
            put(route('exams.update', exam.id), options);
        } else {
            post(route('exams.store'), options);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{exam ? 'Edit Exam' : 'Create Exam'}</DialogTitle>
                    <DialogDescription>{exam ? 'Update the exam details.' : 'Add a new exam (e.g. Term 1 Mid-Terms).'}</DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        save();
                    }}
                    className="space-y-6"
                >
                    <div className="space-y-2">
                        <Label htmlFor="name">Exam Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Term 1 Mid-Terms"
                            autoFocus
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="class_id">Class</Label>
                        <Select value={data.class_id} onValueChange={(value) => setData('class_id', value)}>
                            <SelectTrigger id="class_id">
                                <SelectValue placeholder="Select a class..." />
                            </SelectTrigger>
                            <SelectContent>
                                {classes.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.class_id} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="grading_scale_id">Grading Scale</Label>
                        <Select
                            value={data.grading_scale_id === '' ? 'none' : data.grading_scale_id}
                            onValueChange={(value) => setData('grading_scale_id', value === 'none' ? '' : value)}
                        >
                            <SelectTrigger id="grading_scale_id">
                                <SelectValue placeholder="Select a grading scale..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No grading scale (percentages only)</SelectItem>
                                {gradingScales.map((s) => (
                                    <SelectItem key={s.id} value={String(s.id)}>
                                        {s.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.grading_scale_id} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start_date">Start Date</Label>
                            <DatePicker id="start_date" value={data.start_date} onChange={(v) => setData('start_date', v)} placeholder="DD/MM/YYYY" />
                            <InputError message={errors.start_date} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end_date">End Date</Label>
                            <DatePicker id="end_date" value={data.end_date} onChange={(v) => setData('end_date', v)} placeholder="DD/MM/YYYY" />
                            <InputError message={errors.end_date} />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {exam ? 'Update Exam' : 'Create Exam'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
