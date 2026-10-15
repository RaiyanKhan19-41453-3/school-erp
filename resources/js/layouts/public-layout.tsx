import { cn } from '@/lib/utils';
import { type SiteInfo } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Facebook, GraduationCap, LogIn, Mail, MapPin, Menu, Phone, X, Youtube } from 'lucide-react';
import { type ReactNode, useState } from 'react';

const navLinks = [
    { title: 'Home', routeName: 'home' },
    { title: 'About', routeName: 'site.about' },
    { title: 'Admission', routeName: 'site.admission' },
    { title: 'Notices', routeName: 'site.notices' },
    { title: 'Events', routeName: 'site.events' },
    { title: 'Gallery', routeName: 'site.gallery' },
    { title: 'Achievements', routeName: 'site.achievements' },
    { title: 'Contact', routeName: 'site.contact' },
];

function relativeUrl(routeName: string): string {
    return (route(routeName) as string).replace(/^https?:\/\/[^/]+/, '');
}

export default function PublicLayout({ site, children }: { site: SiteInfo; children: ReactNode }) {
    const url = usePage().url.split('?')[0];
    const [menuOpen, setMenuOpen] = useState(false);

    const isActive = (routeName: string) => {
        const path = relativeUrl(routeName);

        return path === '/' ? url === '/' : url.startsWith(path);
    };

    const initials = site.name
        .split(/\s+/)
        .filter((word) => /^[A-Za-z]/.test(word))
        .slice(0, 2)
        .map((word) => word.charAt(0).toUpperCase())
        .join('');

    return (
        <div className="bg-cream-50 text-brand-950 flex min-h-screen flex-col font-sans antialiased">
            <div className="bg-brand-950 text-cream-100">
                <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-4 px-4 text-xs sm:px-6 lg:px-8">
                    <div className="flex min-w-0 items-center gap-5">
                        {site.address && (
                            <span className="hidden items-center gap-1.5 truncate md:flex">
                                <MapPin className="text-gold-400 h-3.5 w-3.5 shrink-0" />
                                {site.address}
                            </span>
                        )}
                        {site.phone && (
                            <a href={`tel:${site.phone}`} className="hover:text-gold-300 flex items-center gap-1.5">
                                <Phone className="text-gold-400 h-3.5 w-3.5" />
                                {site.phone}
                            </a>
                        )}
                        {site.email && (
                            <a href={`mailto:${site.email}`} className="hover:text-gold-300 hidden items-center gap-1.5 sm:flex">
                                <Mail className="text-gold-400 h-3.5 w-3.5" />
                                {site.email}
                            </a>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {site.facebook_url && (
                            <a href={site.facebook_url} target="_blank" rel="noreferrer" className="hover:text-gold-300" aria-label="Facebook">
                                <Facebook className="h-3.5 w-3.5" />
                            </a>
                        )}
                        {site.youtube_url && (
                            <a href={site.youtube_url} target="_blank" rel="noreferrer" className="hover:text-gold-300" aria-label="YouTube">
                                <Youtube className="h-3.5 w-3.5" />
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <header className="border-brand-900/10 bg-cream-50/95 sticky top-0 z-40 border-b backdrop-blur">
                <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                    <Link href={relativeUrl('home')} className="flex min-w-0 items-center gap-3">
                        <span className="bg-brand-900 font-display text-gold-300 ring-gold-500 ring-offset-cream-50 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-semibold ring-2 ring-offset-2">
                            {initials || <GraduationCap className="h-5 w-5" />}
                        </span>
                        <span className="min-w-0">
                            <span className="font-display text-brand-950 block truncate text-lg leading-tight font-semibold">{site.name}</span>
                            <span className="text-gold-600 block truncate text-[11px] tracking-[0.22em] uppercase">
                                {site.tagline ?? 'Est. 1998'}
                            </span>
                        </span>
                    </Link>

                    <nav className="hidden items-center gap-1 lg:flex">
                        {navLinks.map((link) => (
                            <Link
                                key={link.routeName}
                                href={relativeUrl(link.routeName)}
                                className={cn(
                                    'rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                                    isActive(link.routeName)
                                        ? 'bg-brand-900 text-cream-50'
                                        : 'text-brand-900/70 hover:bg-brand-900/5 hover:text-brand-950',
                                )}
                            >
                                {link.title}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2">
                        <Link
                            href={route('login')}
                            className="border-brand-900/20 text-brand-900 hover:bg-brand-900 hover:text-cream-50 hidden items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors sm:flex"
                        >
                            <LogIn className="h-4 w-4" />
                            Portal Login
                        </Link>
                        <button
                            type="button"
                            onClick={() => setMenuOpen((open) => !open)}
                            className="text-brand-900 hover:bg-brand-900/5 rounded-md p-2 lg:hidden"
                            aria-label="Toggle navigation"
                        >
                            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {menuOpen && (
                    <nav className="border-brand-900/10 bg-cream-50 border-t lg:hidden">
                        <div className="mx-auto grid max-w-7xl gap-1 px-4 py-4 sm:px-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.routeName}
                                    href={relativeUrl(link.routeName)}
                                    onClick={() => setMenuOpen(false)}
                                    className={cn(
                                        'rounded-lg px-4 py-2.5 text-sm font-medium',
                                        isActive(link.routeName) ? 'bg-brand-900 text-cream-50' : 'text-brand-900/80 hover:bg-brand-900/5',
                                    )}
                                >
                                    {link.title}
                                </Link>
                            ))}
                            <Link
                                href={route('login')}
                                className="border-brand-900/20 text-brand-900 mt-2 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium"
                            >
                                <LogIn className="h-4 w-4" />
                                Portal Login
                            </Link>
                        </div>
                    </nav>
                )}
            </header>

            <main className="flex-1">{children}</main>

            <footer className="bg-brand-950 text-cream-100">
                <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3">
                            <span className="bg-cream-50 font-display text-brand-900 ring-gold-500 flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold ring-2">
                                {initials || <GraduationCap className="h-5 w-5" />}
                            </span>
                            <div>
                                <p className="font-display text-xl font-semibold">{site.name}</p>
                                <p className="text-gold-400 text-xs tracking-[0.22em] uppercase">{site.tagline ?? 'Est. 1998'}</p>
                            </div>
                        </div>
                        <p className="text-cream-100/70 mt-5 max-w-md text-sm leading-relaxed">
                            Committed to academic excellence, moral values and the holistic development of every child since our founding in 1998.
                        </p>
                        <div className="mt-6 flex items-center gap-3">
                            {site.facebook_url && (
                                <a
                                    href={site.facebook_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="border-cream-100/20 hover:border-gold-400 hover:text-gold-300 flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
                                    aria-label="Facebook"
                                >
                                    <Facebook className="h-4 w-4" />
                                </a>
                            )}
                            {site.youtube_url && (
                                <a
                                    href={site.youtube_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="border-cream-100/20 hover:border-gold-400 hover:text-gold-300 flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
                                    aria-label="YouTube"
                                >
                                    <Youtube className="h-4 w-4" />
                                </a>
                            )}
                        </div>
                    </div>

                    <div>
                        <p className="text-gold-400 text-xs font-semibold tracking-[0.25em] uppercase">Explore</p>
                        <ul className="mt-5 grid gap-2.5 text-sm">
                            {navLinks.slice(1).map((link) => (
                                <li key={link.routeName}>
                                    <Link href={relativeUrl(link.routeName)} className="text-cream-100/75 hover:text-gold-300 transition-colors">
                                        {link.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <p className="text-gold-400 text-xs font-semibold tracking-[0.25em] uppercase">Get in touch</p>
                        <ul className="text-cream-100/75 mt-5 grid gap-3 text-sm">
                            {site.address && (
                                <li className="flex items-start gap-2.5">
                                    <MapPin className="text-gold-400 mt-0.5 h-4 w-4 shrink-0" />
                                    {site.address}
                                </li>
                            )}
                            {site.phone && (
                                <li>
                                    <a href={`tel:${site.phone}`} className="hover:text-gold-300 flex items-center gap-2.5">
                                        <Phone className="text-gold-400 h-4 w-4 shrink-0" />
                                        {site.phone}
                                    </a>
                                </li>
                            )}
                            {site.email && (
                                <li>
                                    <a href={`mailto:${site.email}`} className="hover:text-gold-300 flex items-center gap-2.5">
                                        <Mail className="text-gold-400 h-4 w-4 shrink-0" />
                                        {site.email}
                                    </a>
                                </li>
                            )}
                            <li>
                                <Link
                                    href={relativeUrl('site.contact')}
                                    className="text-gold-300 hover:text-gold-200 flex items-center gap-2.5 font-medium"
                                >
                                    Send us a message →
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-cream-100/10 border-t">
                    <div className="text-cream-100/55 mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs sm:flex-row sm:px-6 lg:px-8">
                        <p>
                            © {new Date().getFullYear()} {site.name}. All rights reserved.
                        </p>
                        <Link href={route('login')} className="hover:text-gold-300 transition-colors">
                            School Portal Login
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
