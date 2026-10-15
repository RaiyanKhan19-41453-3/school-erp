'use client';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { KeyboardEvent, useEffect } from 'react';
import { toast } from 'sonner';

interface SubjectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subject: { id: number; name: string; code: string | null } | null;
}

export function SubjectModal({ open, onOpenChange, subject }: SubjectModalProps) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        code: '',
    });

    useEffect(() => {
        if (open) {
            reset();
            if (subject) {
                setData('name', subject.name);
                setData('code', subject.code ?? '');
            }
        }
    }, [open, subject, reset, setData]);

    function save() {
        const options = {
            onSuccess: () => {
                onOpenChange(false);
                toast.success(subject ? 'Subject updated successfully' : 'Subject created successfully');
            },
            onError: () => {
                toast.error(subject ? 'Failed to update subject' : 'Failed to create subject');
            },
        };

        if (subject) {
            put(route('subjects.update', subject.id), options);
        } else {
            post(route('subjects.store'), options);
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
                    <DialogTitle>{subject ? 'Edit Subject' : 'Create Subject'}</DialogTitle>
                    <DialogDescription>
                        {subject ? 'Update the subject details.' : 'Add a new subject (e.g. Mathematics, English).'}
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
                            placeholder="e.g. Mathematics"
                            autoFocus
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="code">Code</Label>
                        <Input id="code" value={data.code} onChange={(e) => setData('code', e.target.value)} placeholder="e.g. MATH" />
                        <InputError message={errors.code} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {subject ? 'Update Subject' : 'Create Subject'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
