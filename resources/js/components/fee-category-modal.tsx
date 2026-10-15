'use client';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { KeyboardEvent, useEffect } from 'react';
import { toast } from 'sonner';

interface FeeCategoryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: { id: number; name: string } | null;
}

export function FeeCategoryModal({ open, onOpenChange, category }: FeeCategoryModalProps) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
    });

    useEffect(() => {
        if (open) {
            reset();
            if (category) {
                setData('name', category.name);
            }
        }
    }, [open, category, reset, setData]);

    function save() {
        const options = {
            onSuccess: () => {
                onOpenChange(false);
                toast.success(category ? 'Fee category updated successfully' : 'Fee category created successfully');
            },
            onError: () => {
                toast.error(category ? 'Failed to update fee category' : 'Failed to create fee category');
            },
        };

        if (category) {
            put(route('fee-categories.update', category.id), options);
        } else {
            post(route('fee-categories.store'), options);
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
                    <DialogTitle>{category ? 'Edit Fee Category' : 'Create Fee Category'}</DialogTitle>
                    <DialogDescription>
                        {category ? 'Update the fee category name.' : 'Add a new fee category (e.g. Tuition, Transport, Library).'}
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
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="e.g. Tuition" autoFocus />
                        <InputError message={errors.name} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {category ? 'Update Category' : 'Create Category'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
