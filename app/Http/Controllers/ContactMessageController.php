<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ContactMessageController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', ContactMessage::class);

        $perPage = max(1, min(request()->integer('per_page', 10), 100));
        $page = max(1, request()->integer('page', 1));
        $search = request()->string('search')->value();

        $messages = ContactMessage::query()
            ->where('school_id', auth()->user()->school_id)
            ->when($search, fn ($query) => $query->where(fn ($q) => $q
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('subject', 'like', "%{$search}%")))
            ->orderByDesc('created_at')
            ->paginate($perPage, ['*'], 'page', $page);

        $unreadCount = ContactMessage::query()
            ->where('school_id', auth()->user()->school_id)
            ->where('is_read', false)
            ->count();

        return Inertia::render('website/messages/Index', [
            'messages' => $messages,
            'unreadCount' => $unreadCount,
            'filters' => [
                'search' => $search,
                'sort' => 'created_at',
                'direction' => 'desc',
                'per_page' => $perPage,
            ],
        ]);
    }

    public function update(ContactMessage $contactMessage): RedirectResponse
    {
        $this->authorize('update', $contactMessage);

        $contactMessage->update(['is_read' => ! $contactMessage->is_read]);

        return back()->with('success', $contactMessage->is_read ? 'Message marked as read.' : 'Message marked as unread.');
    }

    public function destroy(ContactMessage $contactMessage): RedirectResponse
    {
        $this->authorize('delete', $contactMessage);

        $contactMessage->delete();

        return back()->with('success', 'Message deleted successfully.');
    }
}
