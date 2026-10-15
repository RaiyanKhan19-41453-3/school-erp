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

export interface NoticeRecord {
    id: number;
    title: string;
    body: string;
    category: string;
    is_published: boolean;
    published_at: string | null;
    expires_at: string | null;
}

interface NoticeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    notice: NoticeRecord | null;
    categories: string[];
}

function categoryLabel(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1);
}

export function NoticeModal({ open, onOpenChange, notice, categories }: NoticeModalProps) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: '',
        body: '',
        category: 'general',
        is_published: true as boolean,
        published_at: '',
        expires_at: '',
    });

    useEffect(() => {
        if (open) {
            reset();
            if (notice) {
                setData({
                    title: notice.title,
                    body: notice.body,
                    category: notice.category,
                    is_published: notice.is_published,
                    published_at: notice.published_at ? notice.published_at.slice(0, 10) : '',
                    expires_at: notice.expires_at ? notice.expires_at.slice(0, 10) : '',
                });
            }
        }
    }, [open, notice, reset, setData]);

    function save() {
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                toast.success(notice ? 'Notice updated successfully' : 'Notice created successfully');
            },
            onError: () => {
                toast.error(notice ? 'Failed to update notice' : 'Failed to create notice');
            },
        };

        if (notice) {
            put(route('website.notices.update', notice.id), options);
        } else {
            post(route('website.notices.store'), options);
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
                    <DialogTitle>{notice ? 'Edit Notice' : 'Create Notice'}</DialogTitle>
                    <DialogDescription>
                        {notice ? 'Update the notice published on the school website.' : 'Write a notice for the public notice board.'}
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
                        <Label htmlFor="notice-title">Title</Label>
                        <Input
                            id="notice-title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="e.g. Annual Sports Day 2026"
                            autoFocus
                        />
                        <InputError message={errors.title} />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="notice-category">Category</Label>
                            <Select value={data.category} onValueChange={(value) => setData('category', value)}>
                                <SelectTrigger id="notice-category">
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
                            <Label htmlFor="notice-expires">Expires on (optional)</Label>
                            <Input id="notice-expires" type="date" value={data.expires_at} onChange={(e) => setData('expires_at', e.target.value)} />
                            <InputError message={errors.expires_at} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notice-body">Notice details</Label>
                        <Textarea
                            id="notice-body"
                            value={data.body}
                            onChange={(e) => setData('body', e.target.value)}
                            placeholder="Write the full notice text here…"
                            rows={7}
                        />
                        <InputError message={errors.body} />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="notice-published">Publish date (optional)</Label>
                            <Input
                                id="notice-published"
                                type="date"
                                value={data.published_at}
                                onChange={(e) => setData('published_at', e.target.value)}
                            />
                            <InputError message={errors.published_at} />
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                            <Checkbox
                                id="notice-published-toggle"
                                checked={data.is_published}
                                onCheckedChange={(checked) => setData('is_published', checked === true)}
                            />
                            <Label htmlFor="notice-published-toggle">Visible on the website</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {notice ? 'Update Notice' : 'Create Notice'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
