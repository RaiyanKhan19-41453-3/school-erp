<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNoticeRequest;
use App\Http\Requests\UpdateNoticeRequest;
use App\Models\Notice;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class NoticeController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', Notice::class);

        $perPage = max(1, min(request()->integer('per_page', 10), 100));
        $page = max(1, request()->integer('page', 1));
        $sort = request()->string('sort', 'created_at')->value();
        $direction = request()->string('direction', 'desc')->value();
        $search = request()->string('search')->value();

        $allowedSorts = ['title', 'category', 'published_at', 'created_at'];
        if (! in_array($sort, $allowedSorts, true)) {
            $sort = 'created_at';
        }
        $direction = in_array(strtolower($direction), ['asc', 'desc'], true) ? $direction : 'desc';

        $notices = Notice::query()
            ->where('school_id', auth()->user()->school_id)
            ->when($search, fn ($query) => $query->where(fn ($q) => $q
                ->where('title', 'like', "%{$search}%")
                ->orWhere('body', 'like', "%{$search}%")))
            ->orderBy($sort, $direction)
            ->paginate($perPage, ['*'], 'page', $page);

        return Inertia::render('website/notices/Index', [
            'notices' => $notices,
            'categories' => Notice::categories(),
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(StoreNoticeRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $isPublished = $request->boolean('is_published');

        Notice::create([
            'school_id' => $request->user()->school_id,
            'title' => $data['title'],
            'body' => $data['body'],
            'category' => $data['category'],
            'is_published' => $isPublished,
            'published_at' => $isPublished && empty($data['published_at']) ? now() : ($data['published_at'] ?? null),
            'expires_at' => $data['expires_at'] ?? null,
            'created_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Notice created successfully.');
    }

    public function update(UpdateNoticeRequest $request, Notice $notice): RedirectResponse
    {
        $data = $request->validated();
        $isPublished = $request->boolean('is_published');

        $notice->update([
            'title' => $data['title'],
            'body' => $data['body'],
            'category' => $data['category'],
            'is_published' => $isPublished,
            'published_at' => $isPublished && empty($data['published_at']) ? ($notice->published_at ?? now()) : ($data['published_at'] ?? null),
            'expires_at' => $data['expires_at'] ?? null,
        ]);

        return back()->with('success', 'Notice updated successfully.');
    }

    public function destroy(Notice $notice): RedirectResponse
    {
        $this->authorize('delete', $notice);

        $notice->delete();

        return back()->with('success', 'Notice deleted successfully.');
    }
}
