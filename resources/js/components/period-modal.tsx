'use client';

import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useEffect, KeyboardEvent } from 'react';

interface Period {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    sort_order: number;
    is_break: boolean;
}

interface PeriodModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    period: Period | null;
}

export function PeriodModal({ open, onOpenChange, period }: PeriodModalProps) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        start_time: '',
        end_time: '',
        sort_order: '0',
        is_break: false as boolean,
    });

    useEffect(() => {
        if (open) {
            reset();
            if (period) {
                setData({
                    name: period.name,
                    start_time: period.start_time,
                    end_time: period.end_time,
                    sort_order: String(period.sort_order),
                    is_break: period.is_break,
                });
            }
        }
    }, [open, period, reset, setData]);

    function save() {
        const options = {
            onSuccess: () => {
                onOpenChange(false);
                toast.success(period ? 'Period updated successfully' : 'Period created successfully');
            },
            onError: () => {
                toast.error(period ? 'Failed to update period' : 'Failed to create period');
            },
        };

        if (period) {
            put(route('periods.update', period.id), options);
        } else {
            post(route('periods.store'), options);
        }
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
                    <DialogTitle>{period ? 'Edit Period' : 'Create Period'}</DialogTitle>
                    <DialogDescription>
                        {period ? 'Update the period details.' : 'Add a new period or break to the school timetable.'}
                    </DialogDescription>
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
                            placeholder="e.g. Period 1"
                            autoFocus
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start_time">Start Time</Label>
                            <Input
                                id="start_time"
                                type="time"
                                value={data.start_time}
                                onChange={(e) => setData('start_time', e.target.value)}
                            />
                            <InputError message={errors.start_time} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end_time">End Time</Label>
                            <Input
                                id="end_time"
                                type="time"
                                value={data.end_time}
                                onChange={(e) => setData('end_time', e.target.value)}
                            />
                            <InputError message={errors.end_time} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="sort_order">Sort Order</Label>
                        <Input
                            id="sort_order"
                            type="number"
                            value={data.sort_order}
                            onChange={(e) => setData('sort_order', e.target.value)}
                            placeholder="e.g. 1"
                        />
                        <InputError message={errors.sort_order} />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="is_break"
                            checked={data.is_break}
                            onCheckedChange={(checked) => setData('is_break', checked === true)}
                        />
                        <Label htmlFor="is_break" className="font-normal">
                            This is a break / recess
                        </Label>
                    </div>
                    <InputError message={errors.is_break} />

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {period ? 'Update Period' : 'Create Period'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
