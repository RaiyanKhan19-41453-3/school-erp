'use client';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { KeyboardEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface GalleryItemRecord {
    id: number;
    title: string | null;
    album: string;
    image_url: string | null;
    sort_order: number;
    is_published: boolean;
}

interface GalleryItemModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: GalleryItemRecord | null;
    albums: string[];
}

export function GalleryItemModal({ open, onOpenChange, item, albums }: GalleryItemModalProps) {
    const [image, setImage] = useState<File | null>(null);
    const { data, setData, post, put, processing, errors, reset, progress } = useForm({
        title: '',
        album: 'Campus',
        image: null as File | null,
        sort_order: '0',
        is_published: true as boolean,
    });

    useEffect(() => {
        if (open) {
            reset();
            setImage(null);
            if (item) {
                setData({
                    title: item.title ?? '',
                    album: item.album,
                    image: null,
                    sort_order: String(item.sort_order),
                    is_published: item.is_published,
                });
            }
        }
    }, [open, item, reset, setData]);

    function save() {
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                toast.success(item ? 'Gallery image updated successfully' : 'Gallery image uploaded successfully');
            },
            onError: () => {
                toast.error(item ? 'Failed to update image' : 'Failed to upload image');
            },
        };

        if (item) {
            put(route('website.gallery-items.update', item.id), options);
        } else {
            post(route('website.gallery-items.store'), options);
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
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{item ? 'Edit Gallery Image' : 'Upload Gallery Image'}</DialogTitle>
                    <DialogDescription>
                        {item ? 'Update the details of this photograph.' : 'Add a photograph to the public gallery.'}
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
                        <Label htmlFor="gallery-image">Image {item ? '(leave empty to keep current)' : ''}</Label>
                        {!image && item?.image_url && (
                            <img src={item.image_url} alt={item.title ?? item.album} className="mb-2 h-32 w-full rounded-md object-cover" />
                        )}
                        <Input
                            id="gallery-image"
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

                    <div className="space-y-2">
                        <Label htmlFor="gallery-title">Caption (optional)</Label>
                        <Input
                            id="gallery-title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="e.g. Annual Sports Meet"
                        />
                        <InputError message={errors.title} />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="gallery-album">Album</Label>
                            <Input
                                id="gallery-album"
                                list="gallery-albums"
                                value={data.album}
                                onChange={(e) => setData('album', e.target.value)}
                                placeholder="e.g. Campus"
                            />
                            <datalist id="gallery-albums">
                                {albums.map((album) => (
                                    <option key={album} value={album} />
                                ))}
                            </datalist>
                            <InputError message={errors.album} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gallery-sort">Sort order</Label>
                            <Input
                                id="gallery-sort"
                                type="number"
                                min={0}
                                value={data.sort_order}
                                onChange={(e) => setData('sort_order', e.target.value)}
                            />
                            <InputError message={errors.sort_order} />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="gallery-published"
                            checked={data.is_published}
                            onCheckedChange={(checked) => setData('is_published', checked === true)}
                        />
                        <Label htmlFor="gallery-published">Show in the public gallery</Label>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {item ? 'Update Image' : 'Upload Image'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
