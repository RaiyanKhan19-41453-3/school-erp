'use client';

import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { SectionsEditor } from '@/components/sections-editor';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { KeyboardEvent } from 'react';

interface SectionForm {
    id?: number;
    name: string;
    capacity: number;
}

interface ClassData {
    id: number;
    name: string;
    sections: SectionForm[];
}

interface EditClassModalProps {
    class: ClassData | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditClassModal({ class: classData, open, onOpenChange }: EditClassModalProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: '',
        sections: [{ name: '', capacity: 30 }] as SectionForm[],
    });

    useEffect(() => {
        if (classData) {
            setData({
                name: classData.name,
                sections: classData.sections?.map((s) => ({
                    id: s.id,
                    name: s.name,
                    capacity: s.capacity,
                })),
            });
        }
    }, [classData]);

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
        const sections = data.sections.map((section, i) =>
            i === index ? { ...section, [field]: value } : section,
        );
        setData('sections', sections);
    }

    function save() {
        put(route('classes.update', classData.id), {
            onSuccess: () => {
                reset();
                onOpenChange(false);
                toast.success('Class updated successfully');
            },
            onError: () => {
                toast.error('Failed to update class');
            },
        });
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
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Class</DialogTitle>
                    <DialogDescription>Update the class and its sections</DialogDescription>
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
                        <Label htmlFor="edit-name">Class Name</Label>
                        <Input
                            id="edit-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Grade 3"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <SectionsEditor
                        sections={data.sections}
                        errors={errors}
                        onAdd={addSection}
                        onRemove={removeSection}
                        onFieldChange={setSection}
                    />

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}