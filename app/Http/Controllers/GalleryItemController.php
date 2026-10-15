<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGalleryItemRequest;
use App\Http\Requests\UpdateGalleryItemRequest;
use App\Models\GalleryItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class GalleryItemController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', GalleryItem::class);

        $perPage = max(1, min(request()->integer('per_page', 10), 100));
        $page = max(1, request()->integer('page', 1));
        $search = $this->queryString('search');
        $album = $this->queryString('album');

        $albums = GalleryItem::query()
            ->where('school_id', auth()->user()->school_id)
            ->select('album')
            ->distinct()
            ->orderBy('album')
            ->pluck('album');

        $items = GalleryItem::query()
            ->where('school_id', auth()->user()->school_id)
            ->when($search, fn ($query) => $query->where('title', 'like', "%{$search}%"))
            ->when($album, fn ($query) => $query->where('album', $album))
            ->orderBy('album')
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->paginate($perPage, ['*'], 'page', $page);

        return Inertia::render('website/gallery/Index', [
            'items' => $items,
            'albums' => $albums,
            'filters' => [
                'search' => $search,
                'album' => $album,
                'sort' => 'created_at',
                'direction' => 'desc',
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(StoreGalleryItemRequest $request): RedirectResponse
    {
        $data = $request->validated();
        unset($data['image']);

        GalleryItem::create([
            'school_id' => $request->user()->school_id,
            ...$data,
            'sort_order' => $data['sort_order'] ?? 0,
            'image_path' => $request->file('image')->store('site/gallery', 'public'),
        ]);

        return back()->with('success', 'Gallery image uploaded successfully.');
    }

    public function update(UpdateGalleryItemRequest $request, GalleryItem $galleryItem): RedirectResponse
    {
        $data = $request->validated();
        unset($data['image']);

        if ($request->hasFile('image')) {
            Storage::disk('public')->delete($galleryItem->image_path);

            $data['image_path'] = $request->file('image')->store('site/gallery', 'public');
        }

        $galleryItem->update($data);

        return back()->with('success', 'Gallery image updated successfully.');
    }

    public function destroy(GalleryItem $galleryItem): RedirectResponse
    {
        $this->authorize('delete', $galleryItem);

        Storage::disk('public')->delete($galleryItem->image_path);

        $galleryItem->delete();

        return back()->with('success', 'Gallery image deleted successfully.');
    }
}
