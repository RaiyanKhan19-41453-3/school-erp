import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
    roles?: string[];
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface SiteInfo {
    name: string;
    tagline: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    facebook_url: string | null;
    youtube_url: string | null;
}

export interface SiteStats {
    students?: string;
    teachers?: string;
    years?: string;
    pass_rate?: string;
}

export interface PublicNotice {
    id: number;
    title: string;
    body: string;
    category: string;
    published_at: string | null;
}

export interface PublicEvent {
    id: number;
    title: string;
    description: string | null;
    location: string | null;
    starts_at: string;
    ends_at: string | null;
    image_url: string | null;
}

export interface PublicAchievement {
    id: number;
    title: string;
    description: string | null;
    student_name: string | null;
    category: string;
    achieved_on: string | null;
    is_featured: boolean;
}

export interface PublicGalleryItem {
    id: number;
    title: string | null;
    album: string;
    image_url: string | null;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}
