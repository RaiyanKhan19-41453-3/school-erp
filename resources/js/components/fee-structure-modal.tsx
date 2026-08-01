'use client';

import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useEffect, KeyboardEvent } from 'react';

interface SchoolClass {
    id: number;
    name: string;
}

interface FeeCategory {
    id: number;
    name: string;
}

interface FeeStructure {
    id: number;
    class_id: number;
    fee_category_id: number;
    amount: string;
    frequency: string;
    due_day: number | null;
}

interface FeeStructureModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    structure: FeeStructure | null;
    classes: SchoolClass[];
    categories: FeeCategory[];
}

const FREQUENCY_OPTIONS = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'annual', label: 'Annual' },
    { value: 'one_time', label: 'One-time' },
];

export function FeeStructureModal({ open, onOpenChange, structure, classes, categories }: FeeStructureModalProps) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        class_id: '',
        fee_category_id: '',
        amount: '',
        frequency: 'monthly',
        due_day: '',
    });

    useEffect(() => {
        if (open) {
            reset();
            if (structure) {
                setData({
                    class_id: String(structure.class_id),
                    fee_category_id: String(structure.fee_category_id),
                    amount: structure.amount,
                    frequency: structure.frequency,
                    due_day: structure.due_day !== null ? String(structure.due_day) : '',
                });
            }
        }
    }, [open, structure]);

    function save() {
        const options = {
            onSuccess: () => {
                onOpenChange(false);
                toast.success(structure ? 'Fee structure updated successfully' : 'Fee structure created successfully');
            },
            onError: () => {
                toast.error(structure ? 'Failed to update fee structure' : 'Failed to create fee structure');
            },
        };

        if (structure) {
            put(route('fee-structures.update', structure.id), options);
        } else {
            post(route('fee-structures.store'), options);
        }
    }

    function handleKeyDown(e: KeyboardEvent<HTMLElement>) {
        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            const target = e.target as HTMLElement;

            if (target.tagName === 'INPUT' && target.type !== 'button') {
                e.preventDefault();
                save();
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{structure ? 'Edit Fee Structure' : 'Create Fee Structure'}</DialogTitle>
                    <DialogDescription>Assign a fee category and amount to a class for the current academic year.</DialogDescription>
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
                        <Label>Class</Label>
                        <Combobox
                            options={classes.map((c) => ({ value: String(c.id), label: c.name }))}
                            value={data.class_id}
                            onValueChange={(v) => setData('class_id', v)}
                            placeholder="Select class"
                            searchPlaceholder="Search classes..."
                            emptyText="No class found."
                        />
                        <InputError message={errors.class_id} />
                    </div>

                    <div className="space-y-2">
                        <Label>Fee Category</Label>
                        <Combobox
                            options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
                            value={data.fee_category_id}
                            onValueChange={(v) => setData('fee_category_id', v)}
                            placeholder="Select category"
                            searchPlaceholder="Search categories..."
                            emptyText="No category found."
                        />
                        <InputError message={errors.fee_category_id} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                placeholder="e.g. 2500.00"
                            />
                            <InputError message={errors.amount} />
                        </div>
                        <div className="space-y-2">
                            <Label>Frequency</Label>
                            <Select value={data.frequency} onValueChange={(v) => setData('frequency', v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {FREQUENCY_OPTIONS.map((f) => (
                                        <SelectItem key={f.value} value={f.value}>
                                            {f.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.frequency} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="due_day">Due Day (optional)</Label>
                        <Input
                            id="due_day"
                            type="number"
                            min="1"
                            max="31"
                            value={data.due_day}
                            onChange={(e) => setData('due_day', e.target.value)}
                            placeholder="e.g. 10 (day of month due)"
                        />
                        <InputError message={errors.due_day} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {structure ? 'Update Structure' : 'Create Structure'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
