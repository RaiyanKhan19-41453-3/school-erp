'use client';

import { Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ExistingGuardian {
    id: number;
    name: string;
}

export interface GuardianForm {
    guardian_id: number | null;
    relationship: string;
    is_primary: boolean;
    name: string;
    phone: string;
    email: string;
    occupation: string;
}

interface GuardiansEditorProps {
    guardians: GuardianForm[];
    existingGuardians: ExistingGuardian[];
    errors: Record<string, string | undefined>;
    onAdd: () => void;
    onRemove: (index: number) => void;
    onFieldChange: (index: number, field: keyof GuardianForm, value: string | number | boolean | null) => void;
}

const RELATIONSHIPS = ['father', 'mother', 'guardian', 'other'];

export function GuardiansEditor({ guardians, existingGuardians, errors, onAdd, onRemove, onFieldChange }: GuardiansEditorProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Label className="text-base">Guardians</Label>
                    <p className="text-sm text-muted-foreground">Attach existing guardians or add a new one</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={onAdd}>
                    <Plus className="h-4 w-4" />
                    Add Guardian
                </Button>
            </div>
            <InputError message={errors.guardians} />

            {guardians.map((guardian, index) => (
                <div key={index} className="rounded-lg border bg-card p-4">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="h-6 w-6 justify-center rounded-full p-0">
                                {index + 1}
                            </Badge>
                            <span className="text-sm font-medium">Guardian {index + 1}</span>
                            {guardian.is_primary && <Badge>Primary</Badge>}
                        </div>
                        {guardians.length > 1 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-destructive"
                                onClick={() => onRemove(index)}
                                title="Remove guardian"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor={`guardian-${index}-select`}>Existing Guardian</Label>
                            <Combobox
                                options={existingGuardians.map((g) => ({ value: String(g.id), label: g.name }))}
                                value={guardian.guardian_id ? String(guardian.guardian_id) : ''}
                                onValueChange={(v) => {
                                    const existing = existingGuardians.find((g) => g.id === parseInt(v));
                                    onFieldChange(index, 'guardian_id', v ? parseInt(v) : null);
                                    onFieldChange(index, 'name', existing?.name ?? '');
                                }}
                                placeholder="Select an existing guardian"
                                searchPlaceholder="Search guardians..."
                                emptyText="No guardian found."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`guardian-${index}-relationship`}>Relationship</Label>
                            <Select value={guardian.relationship} onValueChange={(v) => onFieldChange(index, 'relationship', v)}>
                                <SelectTrigger id={`guardian-${index}-relationship`} className="w-full">
                                    <SelectValue placeholder="Select relationship" />
                                </SelectTrigger>
                                <SelectContent>
                                    {RELATIONSHIPS.map((r) => (
                                        <SelectItem key={r} value={r}>
                                            {r.charAt(0).toUpperCase() + r.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors[`guardians.${index}.relationship`]} />
                        </div>

                        {guardian.guardian_id === null && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor={`guardian-${index}-name`}>Full Name</Label>
                                    <Input
                                        id={`guardian-${index}-name`}
                                        value={guardian.name}
                                        onChange={(e) => onFieldChange(index, 'name', e.target.value)}
                                        placeholder="e.g. John Doe"
                                    />
                                    <InputError message={errors[`guardians.${index}.name`]} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`guardian-${index}-phone`}>Phone</Label>
                                    <Input
                                        id={`guardian-${index}-phone`}
                                        value={guardian.phone}
                                        onChange={(e) => onFieldChange(index, 'phone', e.target.value)}
                                        placeholder="e.g. +1-555-0100"
                                    />
                                    <InputError message={errors[`guardians.${index}.phone`]} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`guardian-${index}-email`}>Email</Label>
                                    <Input
                                        id={`guardian-${index}-email`}
                                        type="email"
                                        value={guardian.email}
                                        onChange={(e) => onFieldChange(index, 'email', e.target.value)}
                                        placeholder="e.g. john@example.com"
                                    />
                                    <InputError message={errors[`guardians.${index}.email`]} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`guardian-${index}-occupation`}>Occupation</Label>
                                    <Input
                                        id={`guardian-${index}-occupation`}
                                        value={guardian.occupation}
                                        onChange={(e) => onFieldChange(index, 'occupation', e.target.value)}
                                        placeholder="e.g. Engineer"
                                    />
                                    <InputError message={errors[`guardians.${index}.occupation`]} />
                                </div>
                            </>
                        )}

                        <div className="flex items-end space-y-2 sm:col-span-2">
                            <Button
                                type="button"
                                variant={guardian.is_primary ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => onFieldChange(index, 'is_primary', !guardian.is_primary)}
                            >
                                {guardian.is_primary ? 'Primary Contact' : 'Mark as Primary Contact'}
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
