'use client';

import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface GradingScaleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    scale: { id: number; name: string } | null;
}

export function GradingScaleModal({ open, onOpenChange, scale }: GradingScaleModalProps) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
    });

    useEffect(() => {
        if (open) {
            reset();
            if (scale) {
                setData('name', scale.name);
            }
        }
    }, [open, scale]);

    function save() {
        const options = {
            onSuccess: () => {
                onOpenChange(false);
                toast.success(scale ? 'Grading scale updated successfully' : 'Grading scale created successfully');
            },
            onError: () => {
                toast.error(scale ? 'Failed to update grading scale' : 'Failed to create grading scale');
            },
        };

        if (scale) {
            put(route('grading-scales.update', scale.id), options);
        } else {
            post(route('grading-scales.store'), options);
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
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{scale ? 'Edit Grading Scale' : 'Create Grading Scale'}</DialogTitle>
                    <DialogDescription>{scale ? 'Update the grading scale name.' : 'Add a new grading scale (e.g. Standard, A-F).'}</DialogDescription>
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
                            placeholder="e.g. Standard"
                            autoFocus
                        />
                        <InputError message={errors.name} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {scale ? 'Update Scale' : 'Create Scale'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
