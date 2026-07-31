'use client';

import { useEffect, useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

interface Section {
    id: number;
    name: string;
    capacity: number;
}

interface SchoolClass {
    id: number;
    name: string;
    sections: Section[];
}

interface PageProps {
    classes: {
        data: SchoolClass[];
    };
}

interface ManageSectionsModalProps {
    classId: number | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ManageSectionsModal({ classId, open, onOpenChange }: ManageSectionsModalProps) {
    const [removingId, setRemovingId] = useState<number | null>(null);
    const { classes } = usePage<PageProps>().props;
    const classData = classes.data.find((c) => c.id === classId);

    const { data, setData, post, reset, errors, processing } = useForm({
        name: '',
        capacity: 30,
    });

    useEffect(() => {
        if (open) {
            reset('name', 'capacity');
        }
    }, [open, reset]);

    function addSection(e: React.FormEvent) {
        e.preventDefault();
        post(route('classes.sections.store', classId), {
            onSuccess: () => {
                reset('name');
                router.reload({ only: ['classes'] });
            },
            onError: () => {
                toast.error('Failed to add section');
            },
        });
    }

    function removeSection(section: Section) {
        if (removingId) return;

        setRemovingId(section.id);
        router.delete(route('sections.destroy', section.id), {
            onSuccess: () => {
                router.reload({ only: ['classes'] });
            },
            onError: () => {
                toast.error('Failed to remove section');
            },
            onFinish: () => {
                setRemovingId(null);
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Sections</DialogTitle>
                    <DialogDescription>Add or remove sections for {classData?.name}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {classData?.sections.length === 0 && (
                        <p className="py-4 text-center text-sm text-muted-foreground">No sections yet. Add one below.</p>
                    )}

                    <div className="space-y-2">
                        {classData?.sections.map((section) => (
                            <div key={section.id} className="flex items-center justify-between gap-4 rounded-lg border bg-card px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{section.name}</span>
                                    <Badge variant="secondary">{section.capacity} capacity</Badge>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-destructive"
                                    onClick={() => removeSection(section)}
                                    disabled={removingId === section.id}
                                    title="Remove section"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="border-t pt-4">
                        <form onSubmit={addSection} className="space-y-4">
                            <div className="flex items-end gap-4">
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor="new-section-name">New Section</Label>
                                    <Input
                                        id="new-section-name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g. Section C"
                                    />
                                </div>
                                <div className="w-28 space-y-2">
                                    <Label htmlFor="new-section-capacity">Capacity</Label>
                                    <Input
                                        id="new-section-capacity"
                                        type="number"
                                        value={data.capacity}
                                        onChange={(e) => setData('capacity', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                <Button type="submit" size="icon" disabled={processing}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <InputError message={errors.name} />
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
