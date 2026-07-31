'use client';

import { Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

interface Section {
    id?: number;
    name: string;
    capacity: number;
}

interface SectionsEditorProps {
    sections: Section[];
    errors: Record<string, string | undefined>;
    onAdd: () => void;
    onRemove: (index: number) => void;
    onFieldChange: (index: number, field: 'name' | 'capacity', value: string | number) => void;
}

export function SectionsEditor({ sections, errors, onAdd, onRemove, onFieldChange }: SectionsEditorProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Label className="text-base">Sections</Label>
                    <p className="text-sm text-muted-foreground">Add one or more sections to this class</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={onAdd}>
                    <Plus className="h-4 w-4" />
                    Add Section
                </Button>
            </div>
            <InputError message={errors.sections} />

            {sections.map((section, index) => (
                <div key={index} className="rounded-lg border bg-card p-4">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="h-6 w-6 justify-center rounded-full p-0">
                                {index + 1}
                            </Badge>
                            <span className="text-sm font-medium">Section {index + 1}</span>
                        </div>
                        {sections.length > 1 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-destructive"
                                onClick={() => onRemove(index)}
                                title="Remove section"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    <div className="flex items-end gap-4">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor={`section-${index}-name`}>Section Name</Label>
                            <Input
                                id={`section-${index}-name`}
                                value={section.name}
                                onChange={(e) => onFieldChange(index, 'name', e.target.value)}
                                placeholder="e.g. Section A"
                            />
                            <InputError message={errors[`sections.${index}.name`]} />
                        </div>
                        <div className="w-28 space-y-2">
                            <Label htmlFor={`section-${index}-capacity`}>Capacity</Label>
                            <Input
                                id={`section-${index}-capacity`}
                                type="number"
                                value={section.capacity}
                                onChange={(e) => onFieldChange(index, 'capacity', parseInt(e.target.value) || 0)}
                            />
                            <InputError message={errors[`sections.${index}.capacity`]} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
