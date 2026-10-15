'use client';

import InputError from '@/components/input-error';
import { SectionsEditor } from '@/components/sections-editor';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { KeyboardEvent } from 'react';
import { toast } from 'sonner';

interface SectionForm {
    [key: string]: string | number;
    name: string;
    capacity: number;
}

interface CreateClassModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateClassModal({ open, onOpenChange }: CreateClassModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        sections: [{ name: '', capacity: 30 }] as SectionForm[],
    });

    function addSection() {
        setData('sections', [...data.sections, { name: '', capacity: 30 }]);
    }

    function removeSection(index: number) {
        setData(
            'sections',
            data.sections.filter((_, i) => i !== index),
        );
    }

    function setSection(index: number, field: keyof SectionForm, value: string | number) {
        const sections = data.sections.map((section, i) => (i === index ? { ...section, [field]: value } : section));
        setData('sections', sections);
    }

    function save() {
        post(route('classes.store'), {
            onSuccess: () => {
                reset();
                onOpenChange(false);
                toast.success('Class created successfully');
            },
            onError: () => {
                toast.error('Failed to create class');
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
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create Class</DialogTitle>
                    <DialogDescription>Add a new class with its sections</DialogDescription>
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
                        <Label htmlFor="name">Class Name</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="e.g. Grade 3" />
                        <InputError message={errors.name} />
                    </div>

                    <SectionsEditor sections={data.sections} errors={errors} onAdd={addSection} onRemove={removeSection} onFieldChange={setSection} />

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Create Class
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
