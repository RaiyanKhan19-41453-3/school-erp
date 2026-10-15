'use client';

import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { DatePicker } from '@/components/date-picker';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useEffect, KeyboardEvent } from 'react';

interface AcademicYearModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AcademicYearModal({ open, onOpenChange }: AcademicYearModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        start_date: '',
        end_date: '',
    });

    useEffect(() => {
        if (open) {
            reset();
        }
    }, [open, reset]);

    function save() {
        post(route('academic-years.store'), {
            onSuccess: () => {
                onOpenChange(false);
                toast.success('Academic year created successfully');
            },
            onError: () => {
                toast.error('Failed to create academic year');
            },
        });
    }

    function handleKeyDown(e: KeyboardEvent<HTMLElement>) {
        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            const target = e.target as HTMLInputElement;

            if (target.tagName === 'INPUT' && target.type !== 'button') {
                e.preventDefault();
                save();
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create Academic Year</DialogTitle>
                    <DialogDescription>Add a new academic year (e.g. 2026-2027). It will be inactive until you set it as current.</DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        save();
                    }}
                    onKeyDown={handleKeyDown}
                    className="space-y-6"
                >
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. 2026-2027"
                            autoFocus
                        />
                        <InputError message={errors.name} />
                    </div>

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

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Create Year
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
