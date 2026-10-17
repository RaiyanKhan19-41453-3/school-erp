import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';
import { initializeTheme } from './hooks/use-appearance';

declare global {
    const route: typeof routeFn;
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // The admin toast host (sonner) is mounted by the portal and auth
        // layouts themselves — never here, so it cannot leak onto the public
        // website, and everything stays inside the Inertia context.
        root.render(<App {...props} />);
    },
    progress: {
        color: '#305442',
    },
});

// Apply the portal theme on load — never on the public website, which is
// always light (the root template marks it with the `public-site` class).
if (!document.documentElement.classList.contains('public-site')) {
    initializeTheme();
}
