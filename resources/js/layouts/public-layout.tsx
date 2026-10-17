import { syncAppearance } from '@/hooks/use-appearance';
import { publicLocales, usePublicLocale, useT } from '@/i18n/public';
import { cn } from '@/lib/utils';
import { type SiteInfo } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Facebook, GraduationCap, LogIn, Mail, MapPin, Menu, Phone, X, Youtube } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';

const quickLinks = [
    { title: 'Home', routeName: 'home' },
    { title: 'About Us', routeName: 'site.about' },
    { title: 'Admission', routeName: 'site.admission' },
    { title: 'Contact Us', routeName: 'site.contact' },
];

const informationLinks = [
    { title: 'Notice Board', routeName: 'site.notices' },
    { title: 'Events', routeName: 'site.events' },
    { title: 'Photo Gallery', routeName: 'site.gallery' },
    { title: 'Achievements', routeName: 'site.achievements' },
];

function path(routeName: string): string {
    return route(routeName, {}, false);
}

/**
 * School seal: a double-ringed roundel with the school initials — the
 * heritage mark used in the masthead and footer.
 */
function Seal({ site, size = 'lg' }: { site: SiteInfo; size?: 'lg' | 'sm' }) {
    const initials = site.name
        .split(/\s+/)
        .filter((word) => /^[A-Za-z]/.test(word))
        .slice(0, 2)
        .map((word) => word.charAt(0).toUpperCase())
        .join('');

    const sizing = size === 'lg' ? 'h-16 w-16 text-2xl' : 'h-11 w-11 text-base';

    return (
        <span
            className={cn(
                'border-brand-950 text-brand-950 bg-cream-50 ring-cream-50 font-display ring-brand-950/15 relative flex shrink-0 items-center justify-center rounded-full border-2 font-semibold ring-2 ring-inset',
                sizing,
            )}
            aria-hidden
        >
            <span className="border-brand-950/30 pointer-events-none absolute inset-[4px] rounded-full border" />
            {initials || <GraduationCap className="h-5 w-5" />}
        </span>
    );
}

export default function PublicLayout({ site, children }: { site: SiteInfo; children: ReactNode }) {
    const url = usePage().url.split('?')[0];
    const [menuOpen, setMenuOpen] = useState(false);
    const t = useT();
    const locale = usePublicLocale();

    // This website always runs in light mode; the marker class also keeps the
    // admin theme (dark mode, shadcn variables) from leaking in.
    useEffect(() => {
        const root = document.documentElement;
        root.classList.add('public-site');
        root.classList.remove('dark');

        return () => {
            root.classList.remove('public-site');
            syncAppearance();
        };
    }, []);

    const isActive = (routeName: string) => {
        const pathName = path(routeName);

        return pathName === '/' ? url === '/' : url.startsWith(pathName);
    };

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

    const sessionYear = new Date().getFullYear();

    return (
        <div className="bg-cream-50 text-brand-950 font-public flex min-h-screen flex-col antialiased">
            {/* ── Correspondence strip ─────────────────────────────── */}
            <div className="bg-brand-950 text-cream-100">
                <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-4 px-4 text-[11px] sm:px-6 lg:px-8">
                    <div className="flex min-w-0 items-center gap-4">
                        {site.phone && (
                            <a href={`tel:${site.phone}`} className="hover:text-cream-50 inline-flex items-center gap-1.5">
                                <Phone className="text-brand-300 h-3.5 w-3.5" />
                                {site.phone}
                            </a>
                        )}
                        {site.email && (
                            <a href={`mailto:${site.email}`} className="hover:text-cream-50 hidden items-center gap-1.5 sm:inline-flex">
                                <Mail className="text-brand-300 h-3.5 w-3.5" />
                                {site.email}
                            </a>
                        )}
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                        <span className="flex items-center" role="group" aria-label="Language">
                            {publicLocales.map((item) => (
                                <a
                                    key={item.value}
                                    href={route('site.language', item.value)}
                                    aria-current={locale === item.value ? 'true' : undefined}
                                    className={cn(
                                        'px-2 leading-[18px] transition-colors',
                                        item.value === locale ? 'text-cream-50 bg-brand-800 font-semibold' : 'text-cream-100/60 hover:text-cream-100',
                                        item.value === 'bn' && 'border-cream-100/20 border-l',
                                    )}
                                >
                                    {item.label}
                                </a>
                            ))}
                        </span>
                        <Link href={path('login')} className="hover:text-cream-50 inline-flex items-center gap-1.5">
                            <LogIn className="text-brand-300 h-3.5 w-3.5" />
                            {t('Portal Login')}
                        </Link>
                        {site.facebook_url && (
                            <a href={site.facebook_url} target="_blank" rel="noreferrer" className="hover:text-cream-50" aria-label="Facebook">
                                <Facebook className="h-3.5 w-3.5" />
                            </a>
                        )}
                        {site.youtube_url && (
                            <a href={site.youtube_url} target="_blank" rel="noreferrer" className="hover:text-cream-50" aria-label="YouTube">
                                <Youtube className="h-3.5 w-3.5" />
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Masthead ─────────────────────────────────────────── */}
            <div className="bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-6 sm:px-6 lg:px-8">
                    <Link href={path('home')} className="flex min-w-0 items-center gap-4">
                        <Seal site={site} />
                        <span className="min-w-0">
                            <span className="font-display text-brand-950 block truncate text-xl leading-none font-semibold tracking-tight sm:text-3xl">
                                {site.name}
                            </span>
                            <span className="text-brand-700 mt-2.5 block truncate text-[10px] font-semibold tracking-[0.24em] uppercase">
                                {site.address ?? site.tagline ?? t('Knowledge · Discipline · Character')}
                            </span>
                        </span>
                    </Link>
                    <div className="hidden shrink-0 flex-col items-end gap-2.5 sm:flex">
                        <span className="text-brand-900/60 text-[10px] font-semibold tracking-[0.22em] uppercase">
                            {t('Session {from}–{to}', { from: sessionYear, to: sessionYear + 1 })}
                        </span>
                        <Link
                            href={path('site.admission')}
                            className="bg-brand-800 text-cream-50 hover:bg-brand-950 border-brand-950 border px-5 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors"
                        >
                            {t('Apply for Admission')}
                        </Link>
                    </div>
                </div>

                {/* Thick–thin rule */}
                <div className="border-brand-950 border-b-[3px]" />
                <div className="border-brand-950 mt-[3px] border-b" />
            </div>

            {/* ── Navigation ───────────────────────────────────────── */}
            <div className="border-brand-900/15 sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <nav className="hidden flex-1 items-center justify-center gap-7 lg:flex">
                        {navLinks.map((link) => (
                            <Link
                                key={link.routeName}
                                href={path(link.routeName)}
                                className={cn(
                                    'border-b-2 py-3.5 text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors',
                                    isActive(link.routeName)
                                        ? 'border-brand-700 text-brand-800'
                                        : 'text-brand-900/70 hover:border-brand-900/30 hover:text-brand-950 border-transparent',
                                )}
                            >
                                {t(link.title)}
                            </Link>
                        ))}
                    </nav>

                    <button
                        type="button"
                        onClick={() => setMenuOpen((open) => !open)}
                        className="text-brand-900 hover:text-brand-700 my-2 flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] uppercase lg:hidden"
                        aria-label="Toggle navigation"
                        aria-expanded={menuOpen}
                    >
                        {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        {t('Menu')}
                    </button>
                </div>

                {menuOpen && (
                    <nav className="border-brand-900/15 border-t lg:hidden">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.routeName}
                                    href={path(link.routeName)}
                                    onClick={() => setMenuOpen(false)}
                                    className={cn(
                                        'border-brand-900/10 block border-b px-3 py-3.5 text-sm last:border-b-0',
                                        isActive(link.routeName) ? 'text-brand-800 bg-cream-100 font-semibold' : 'text-brand-900 hover:bg-cream-100',
                                    )}
                                >
                                    {t(link.title)}
                                </Link>
                            ))}
                            <Link
                                href={path('login')}
                                className="border-brand-800 text-brand-800 mx-3 my-3 flex items-center justify-center gap-2 border px-4 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase"
                            >
                                <LogIn className="h-4 w-4" />
                                {t('Portal Login')}
                            </Link>
                        </div>
                    </nav>
                )}
            </div>

            <main className="flex-1">{children}</main>

            {/* ── Footer ───────────────────────────────────────────── */}
            <footer className="bg-brand-950 text-cream-100">
                <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
                    <div>
                        <div className="flex items-center gap-3.5">
                            <span className="border-cream-100/70 text-cream-50 ring-cream-100/20 font-display relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 text-lg font-semibold ring-2 ring-inset">
                                <span className="border-cream-100/25 pointer-events-none absolute inset-[3px] rounded-full border" />
                                <span className="sr-only">{site.name}</span>
                                {site.name
                                    .split(/\s+/)
                                    .filter((word) => /^[A-Za-z]/.test(word))
                                    .slice(0, 2)
                                    .map((word) => word.charAt(0).toUpperCase())
                                    .join('') || <GraduationCap className="h-5 w-5" />}
                            </span>
                            <p className="font-display pr-2 text-lg leading-snug font-semibold">{site.name}</p>
                        </div>
                        {(site.address || site.tagline) && (
                            <p className="text-cream-100/65 mt-4 text-sm leading-relaxed">{site.address ?? site.tagline}</p>
                        )}
                        {(site.facebook_url || site.youtube_url) && (
                            <div className="mt-4 flex items-center gap-2.5">
                                {site.facebook_url && (
                                    <a
                                        href={site.facebook_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="border-cream-100/25 text-cream-100/80 hover:border-cream-50 hover:text-cream-50 flex h-9 w-9 items-center justify-center border transition-colors"
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
                                        className="border-cream-100/25 text-cream-100/80 hover:border-cream-50 hover:text-cream-50 flex h-9 w-9 items-center justify-center border transition-colors"
                                        aria-label="YouTube"
                                    >
                                        <Youtube className="h-4 w-4" />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="border-cream-100/20 text-brand-300 border-b pb-2.5 text-[10px] font-semibold tracking-[0.26em] uppercase">
                            {t('Quick Links')}
                        </h3>
                        <ul className="mt-4 grid gap-3 text-sm">
                            {quickLinks.map((link) => (
                                <li key={link.routeName}>
                                    <Link href={path(link.routeName)} className="text-cream-100/75 hover:text-cream-50 transition-colors">
                                        {t(link.title)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="border-cream-100/20 text-brand-300 border-b pb-2.5 text-[10px] font-semibold tracking-[0.26em] uppercase">
                            {t('Information')}
                        </h3>
                        <ul className="mt-4 grid gap-3 text-sm">
                            {informationLinks.map((link) => (
                                <li key={link.routeName}>
                                    <Link href={path(link.routeName)} className="text-cream-100/75 hover:text-cream-50 transition-colors">
                                        {t(link.title)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="border-cream-100/20 text-brand-300 border-b pb-2.5 text-[10px] font-semibold tracking-[0.26em] uppercase">
                            {t('Get in Touch')}
                        </h3>
                        <ul className="text-cream-100/75 mt-4 grid gap-3 text-sm">
                            {site.address && (
                                <li className="flex items-start gap-2.5">
                                    <MapPin className="text-brand-300 mt-0.5 h-4 w-4 shrink-0" />
                                    {site.address}
                                </li>
                            )}
                            {site.phone && (
                                <li>
                                    <a href={`tel:${site.phone}`} className="hover:text-cream-50 flex items-center gap-2.5">
                                        <Phone className="text-brand-300 h-4 w-4 shrink-0" />
                                        {site.phone}
                                    </a>
                                </li>
                            )}
                            {site.email && (
                                <li>
                                    <a href={`mailto:${site.email}`} className="hover:text-cream-50 flex items-center gap-2.5">
                                        <Mail className="text-brand-300 h-4 w-4 shrink-0" />
                                        {site.email}
                                    </a>
                                </li>
                            )}
                            <li className="border-cream-100/15 text-cream-100/55 border-t pt-3 text-xs italic">
                                {t('Sunday – Thursday, 8:00 AM – 4:00 PM')}
                            </li>
                        </ul>
                        <Link
                            href={path('login')}
                            className="border-cream-100/30 text-cream-100 hover:border-cream-50 hover:text-cream-50 mt-4 inline-flex items-center gap-2 border px-4 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors"
                        >
                            <LogIn className="h-3.5 w-3.5" />
                            {t('School Portal Login')}
                        </Link>
                    </div>
                </div>

                <div className="border-cream-100/15 border-t">
                    <div className="text-cream-100/55 mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs sm:flex-row sm:px-6 lg:px-8">
                        <p>
                            © {new Date().getFullYear()} {site.name}. {t('All rights reserved.')}
                        </p>
                        <p className="font-display italic">{site.tagline ?? t('Knowledge · Discipline · Character')}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
