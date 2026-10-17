import { useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

const applyTheme = (appearance: Appearance) => {
    const root = document.documentElement;

    // The public website always runs in light mode; never let the portal's
    // stored or system dark preference leak into it.
    if (root.classList.contains('public-site')) {
        root.classList.remove('dark');

        return;
    }

    const isDark = appearance === 'dark' || (appearance === 'system' && prefersDark());

    root.classList.toggle('dark', isDark);
};

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

const handleSystemThemeChange = () => {
    const currentAppearance = localStorage.getItem('appearance') as Appearance;
    applyTheme(currentAppearance || 'system');
};

let listening = false;

export function initializeTheme() {
    const savedAppearance = (localStorage.getItem('appearance') as Appearance) || 'system';

    applyTheme(savedAppearance);

    if (listening) {
        return;
    }

    listening = true;
    mediaQuery.addEventListener('change', handleSystemThemeChange);
}

/**
 * Re-apply the visitor's stored theme. Used when leaving the public website
 * (which always runs in light mode) and entering the portal or auth pages.
 */
export function syncAppearance() {
    const savedAppearance = (localStorage.getItem('appearance') as Appearance) || 'system';

    applyTheme(savedAppearance);
}

export function useAppearance() {
    const [appearance, setAppearance] = useState<Appearance>('system');

    const updateAppearance = (mode: Appearance) => {
        setAppearance(mode);
        localStorage.setItem('appearance', mode);
        applyTheme(mode);
    };

    useEffect(() => {
        const savedAppearance = localStorage.getItem('appearance') as Appearance | null;
        updateAppearance(savedAppearance || 'system');

        return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }, []);

    return { appearance, updateAppearance };
}
