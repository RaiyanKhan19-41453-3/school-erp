'use client';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toDateTimeLocal } from '@/lib/format';
import { useForm } from '@inertiajs/react';
import { KeyboardEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface EventRecord {
    id: number;
    title: string;
    description: string | null;
    location: string | null;
    starts_at: string;
    ends_at: string | null;
    image_url: string | null;
    is_published: boolean;
}

interface EventModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    event: EventRecord | null;
}

export function EventModal({ open, onOpenChange, event }: EventModalProps) {
    const [image, setImage] = useState<File | null>(null);
    const { data, setData, post, put, processing, errors, reset, progress } = useForm({
        title: '',
        description: '',
        location: '',
        starts_at: '',
        ends_at: '',
        image: null as File | null,
        is_published: true as boolean,
    });

    useEffect(() => {
        if (open) {
            reset();
            setImage(null);
            if (event) {
                setData({
                    title: event.title,
                    description: event.description ?? '',
                    location: event.location ?? '',
                    starts_at: toDateTimeLocal(event.starts_at),
                    ends_at: event.ends_at ? toDateTimeLocal(event.ends_at) : '',
                    image: null,
                    is_published: event.is_published,
                });
            }
        }
    }, [open, event, reset, setData]);

    function save() {
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                toast.success(event ? 'Event updated successfully' : 'Event created successfully');
            },
            onError: () => {
                toast.error(event ? 'Failed to update event' : 'Failed to create event');
            },
        };

        if (event) {
            put(route('website.events.update', event.id), options);
        } else {
            post(route('website.events.store'), options);
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
                    <DialogTitle>{event ? 'Edit Event' : 'Create Event'}</DialogTitle>
                    <DialogDescription>
                        {event ? 'Update this event on the school website.' : 'Add an event to the public school calendar.'}
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
                        <Label htmlFor="event-title">Title</Label>
                        <Input
                            id="event-title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="e.g. Annual Sports Meet 2026"
                            autoFocus
                        />
                        <InputError message={errors.title} />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="event-starts">Starts at</Label>
                            <Input
                                id="event-starts"
                                type="datetime-local"
                                value={data.starts_at}
                                onChange={(e) => setData('starts_at', e.target.value)}
                            />
                            <InputError message={errors.starts_at} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="event-ends">Ends at (optional)</Label>
                            <Input id="event-ends" type="datetime-local" value={data.ends_at} onChange={(e) => setData('ends_at', e.target.value)} />
                            <InputError message={errors.ends_at} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="event-location">Location</Label>
                        <Input
                            id="event-location"
                            value={data.location}
                            onChange={(e) => setData('location', e.target.value)}
                            placeholder="e.g. School Playground"
                        />
                        <InputError message={errors.location} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="event-description">Description</Label>
                        <Textarea
                            id="event-description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="What is this event about?"
                            rows={4}
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="event-image">Cover image (optional)</Label>
                        {!image && event?.image_url && (
                            <img src={event.image_url} alt={event.title} className="mb-2 h-28 w-full rounded-md object-cover" />
                        )}
                        <Input
                            id="event-image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0] ?? null;
                                setImage(file);
                                setData('image', file);
                            }}
                        />
                        {progress && (
                            <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                                <div className="bg-primary h-full transition-all" style={{ width: `${progress.percentage}%` }} />
                            </div>
                        )}
                        <InputError message={errors.image} />
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="event-published-toggle"
                            checked={data.is_published}
                            onCheckedChange={(checked) => setData('is_published', checked === true)}
                        />
                        <Label htmlFor="event-published-toggle">Show on the website</Label>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {event ? 'Update Event' : 'Create Event'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
