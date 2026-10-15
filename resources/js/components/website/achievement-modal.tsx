'use client';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { KeyboardEvent, useEffect } from 'react';
import { toast } from 'sonner';

export interface AchievementRecord {
    id: number;
    title: string;
    description: string | null;
    student_name: string | null;
    category: string;
    achieved_on: string | null;
    is_featured: boolean;
    is_published: boolean;
}

interface AchievementModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    achievement: AchievementRecord | null;
    categories: string[];
}

function categoryLabel(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1);
}

export function AchievementModal({ open, onOpenChange, achievement, categories }: AchievementModalProps) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: '',
        description: '',
        student_name: '',
        category: 'academic',
        achieved_on: '',
        is_featured: false as boolean,
        is_published: true as boolean,
    });

    useEffect(() => {
        if (open) {
            reset();
            if (achievement) {
                setData({
                    title: achievement.title,
                    description: achievement.description ?? '',
                    student_name: achievement.student_name ?? '',
                    category: achievement.category,
                    achieved_on: achievement.achieved_on ? achievement.achieved_on.slice(0, 10) : '',
                    is_featured: achievement.is_featured,
                    is_published: achievement.is_published,
                });
            }
        }
    }, [open, achievement, reset, setData]);

    function save() {
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                toast.success(achievement ? 'Achievement updated successfully' : 'Achievement created successfully');
            },
            onError: () => {
                toast.error(achievement ? 'Failed to update achievement' : 'Failed to create achievement');
            },
        };

        if (achievement) {
            put(route('website.achievements.update', achievement.id), options);
        } else {
            post(route('website.achievements.store'), options);
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
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{achievement ? 'Edit Achievement' : 'Add Achievement'}</DialogTitle>
                    <DialogDescription>
                        {achievement ? 'Update this achievement.' : 'Celebrate a student achievement on the school website.'}
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
                        <Label htmlFor="achievement-title">Title</Label>
                        <Input
                            id="achievement-title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="e.g. Champion — National Science Olympiad"
                            autoFocus
                        />
                        <InputError message={errors.title} />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="achievement-student">Student name (optional)</Label>
                            <Input
                                id="achievement-student"
                                value={data.student_name}
                                onChange={(e) => setData('student_name', e.target.value)}
                                placeholder="e.g. Nusrat Jahan"
                            />
                            <InputError message={errors.student_name} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="achievement-date">Date achieved (optional)</Label>
                            <Input
                                id="achievement-date"
                                type="date"
                                value={data.achieved_on}
                                onChange={(e) => setData('achieved_on', e.target.value)}
                            />
                            <InputError message={errors.achieved_on} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="achievement-category">Category</Label>
                        <Select value={data.category} onValueChange={(value) => setData('category', value)}>
                            <SelectTrigger id="achievement-category">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {categoryLabel(category)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.category} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="achievement-description">Description</Label>
                        <Textarea
                            id="achievement-description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Tell the story of this achievement…"
                            rows={4}
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="achievement-featured"
                                checked={data.is_featured}
                                onCheckedChange={(checked) => setData('is_featured', checked === true)}
                            />
                            <Label htmlFor="achievement-featured">Feature as highlight</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="achievement-published"
                                checked={data.is_published}
                                onCheckedChange={(checked) => setData('is_published', checked === true)}
                            />
                            <Label htmlFor="achievement-published">Show on the website</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {achievement ? 'Update Achievement' : 'Add Achievement'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
