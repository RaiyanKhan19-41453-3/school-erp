'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface Band {
    id: number | null;
    label: string;
    min_percentage: string;
    max_percentage: string;
    grade_point: string;
    remarks: string;
}

interface GradeBandsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    scaleId: number | null;
    scaleName: string;
    bands: Band[];
}

const SCALE_COLORS = [
    'bg-emerald-500',
    'bg-green-500',
    'bg-lime-500',
    'bg-yellow-400',
    'bg-amber-500',
    'bg-orange-500',
    'bg-rose-500',
    'bg-red-600',
];

function toNumber(value: string): number | null {
    if (value === '' || value === null || value === undefined) return null;
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? null : parsed;
}

export function GradeBandsModal({ open, onOpenChange, scaleId, scaleName, bands }: GradeBandsModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        bands: [] as Band[],
    });

    useEffect(() => {
        if (open) {
            setData(
                'bands',
                bands.map((band) => ({
                    id: band.id,
                    label: band.label,
                    min_percentage: String(band.min_percentage),
                    max_percentage: String(band.max_percentage),
                    grade_point: band.grade_point !== null && band.grade_point !== undefined ? String(band.grade_point) : '',
                    remarks: band.remarks ?? '',
                })),
            );
        }
    }, [open, bands]);

    function updateBand(index: number, field: keyof Band, value: string) {
        setData(
            'bands',
            data.bands.map((band, i) => (i === index ? { ...band, [field]: value } : band)),
        );
    }

    function addBand() {
        setData('bands', [
            ...data.bands,
            { id: null, label: '', min_percentage: '', max_percentage: '', grade_point: '', remarks: '' },
        ]);
    }

    function removeBand(index: number) {
        setData('bands', data.bands.filter((_, i) => i !== index));
    }

    function moveBand(index: number, direction: -1 | 1) {
        const target = index + direction;
        if (target < 0 || target >= data.bands.length) return;

        setData(
            'bands',
            data.bands.map((band, i) => {
                if (i === index) return data.bands[target];
                if (i === target) return data.bands[index];
                return band;
            }),
        );
    }

    const issues = useMemo(() => {
        const problems: { index: number; message: string }[] = [];

        data.bands.forEach((band, index) => {
            const min = toNumber(band.min_percentage);
            const max = toNumber(band.max_percentage);

            if (min !== null && (min < 0 || min > 100)) {
                problems.push({ index, message: 'Min % must be between 0 and 100.' });
            }
            if (max !== null && (max < 0 || max > 100)) {
                problems.push({ index, message: 'Max % must be between 0 and 100.' });
            }
            if (min !== null && max !== null && min > max) {
                problems.push({ index, message: 'Min % cannot be greater than Max %.' });
            }
        });

        data.bands.forEach((band, index) => {
            const min = toNumber(band.min_percentage);
            const max = toNumber(band.max_percentage);
            if (min === null || max === null) return;

            data.bands.forEach((other, otherIndex) => {
                if (otherIndex === index) return;
                const otherMin = toNumber(other.min_percentage);
                const otherMax = toNumber(other.max_percentage);
                if (otherMin === null || otherMax === null) return;

                if (min <= otherMax && max >= otherMin) {
                    problems.push({
                        index,
                        message: `Overlaps with "${other.label || `Band ${otherIndex + 1}`}" (${otherMin}–${otherMax}%).`,
                    });
                }
            });
        });

        return problems;
    }, [data.bands]);

    function issuesFor(index: number) {
        return issues.filter((issue) => issue.index === index).map((issue) => issue.message);
    }

    const sortedForPreview = useMemo(() => {
        return data.bands
            .map((band, index) => ({ ...band, index }))
            .sort((a, b) => (toNumber(a.min_percentage) ?? 0) - (toNumber(b.min_percentage) ?? 0));
    }, [data.bands]);

    const previewValid = sortedForPreview.every((band) => {
        const min = toNumber(band.min_percentage);
        const max = toNumber(band.max_percentage);
        return min !== null && max !== null && min <= max && min >= 0 && max <= 100;
    });

    function save() {
        if (!scaleId) return;

        if (issues.length > 0) {
            toast.error('Fix the highlighted issues before saving.');
            return;
        }

        post(route('grading-scales.bands.store', scaleId), {
            onSuccess: () => {
                onOpenChange(false);
                reset();
                toast.success('Grade bands saved successfully');
            },
            onError: () => {
                toast.error('Failed to save grade bands');
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Grade Bands — {scaleName}</DialogTitle>
                    <DialogDescription>
                        Each band is one grade. The percentage of a student's marks decides which band they fall into. Bands must not overlap and
                        must stay within 0–100.
                    </DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        save();
                    }}
                    className="space-y-6"
                >
                    <div className="space-y-2">
                        <Label>Scale preview (0% – 100%)</Label>
                        {previewValid ? (
                            <div className="flex h-10 w-full overflow-hidden rounded-md border">
                                {sortedForPreview.map((band) => {
                                    const min = toNumber(band.min_percentage) ?? 0;
                                    const max = toNumber(band.max_percentage) ?? 100;
                                    const width = Math.max(0, Math.min(100, max) - Math.min(100, Math.max(0, min)));

                                    return (
                                        <div
                                            key={band.index}
                                            className={cn(
                                                'flex min-w-0 items-center justify-center px-1 text-[11px] font-semibold text-white',
                                                SCALE_COLORS[band.index % SCALE_COLORS.length],
                                            )}
                                            style={{ width: `${width}%` }}
                                            title={`${band.label}: ${min}–${max}%`}
                                        >
                                            {width > 10 ? band.label || '?' : ''}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                                Fill in valid percentage ranges to see the preview.
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">Bands are sorted from lowest to highest percentage.</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Bands</Label>
                        <div className="overflow-x-auto rounded-md border">
                            <table className="w-full min-w-[700px] text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                                        <th className="px-3 py-2 font-medium">Grade</th>
                                        <th className="px-3 py-2 font-medium">Min %</th>
                                        <th className="px-3 py-2 font-medium">Max %</th>
                                        <th className="px-3 py-2 font-medium">Grade Points</th>
                                        <th className="px-3 py-2 font-medium">Remarks</th>
                                        <th className="px-3 py-2 text-right font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.bands.map((band, index) => {
                                        const bandIssues = issuesFor(index);

                                        return (
                                            <tr key={index} className={cn('border-b last:border-0', bandIssues.length > 0 && 'bg-destructive/5')}>
                                                <td className="px-3 py-2">
                                                    <Input
                                                        value={band.label}
                                                        onChange={(e) => updateBand(index, 'label', e.target.value)}
                                                        placeholder="e.g. A+"
                                                        className="w-20"
                                                        aria-label={`Grade label ${index + 1}`}
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        max="100"
                                                        value={band.min_percentage}
                                                        onChange={(e) => updateBand(index, 'min_percentage', e.target.value)}
                                                        placeholder="0"
                                                        className="w-24"
                                                        aria-label={`Min % ${index + 1}`}
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        max="100"
                                                        value={band.max_percentage}
                                                        onChange={(e) => updateBand(index, 'max_percentage', e.target.value)}
                                                        placeholder="100"
                                                        className="w-24"
                                                        aria-label={`Max % ${index + 1}`}
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={band.grade_point}
                                                        onChange={(e) => updateBand(index, 'grade_point', e.target.value)}
                                                        placeholder="—"
                                                        className="w-20"
                                                        aria-label={`Grade points ${index + 1}`}
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <Input
                                                        value={band.remarks}
                                                        onChange={(e) => updateBand(index, 'remarks', e.target.value)}
                                                        placeholder="e.g. Outstanding"
                                                        className="w-40"
                                                        aria-label={`Remarks ${index + 1}`}
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <div className="flex flex-col">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6"
                                                                onClick={() => moveBand(index, -1)}
                                                                disabled={index === 0}
                                                                title="Move up"
                                                            >
                                                                ↑
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6"
                                                                onClick={() => moveBand(index, 1)}
                                                                disabled={index === data.bands.length - 1}
                                                                title="Move down"
                                                            >
                                                                ↓
                                                            </Button>
                                                        </div>
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeBand(index)} title="Remove band">
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={addBand}>
                                <Plus className="mr-1 h-4 w-4" /> Add Band
                            </Button>
                            {issues.length > 0 && (
                                <div className="text-sm font-medium text-destructive">
                                    {issues.length} issue{issues.length > 1 ? 's' : ''} to fix
                                </div>
                            )}
                        </div>

                        <div className="space-y-1">
                            {data.bands.some((band, index) => issuesFor(index).length > 0) && (
                                <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                                    {data.bands.map(
                                        (band, index) =>
                                            issuesFor(index).length > 0 && (
                                                <div key={index}>
                                                    <span className="font-medium">{band.label || `Band ${index + 1}`}:</span>{' '}
                                                    {issuesFor(index).join(' ')}
                                                </div>
                                            ),
                                    )}
                                </div>
                            )}
                        </div>

                        <InputError message={errors.bands} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Save Bands
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
