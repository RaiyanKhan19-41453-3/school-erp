import { Toaster } from '@/components/ui/sonner';
import { initializeTheme } from '@/hooks/use-appearance';
import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';
import { useEffect } from 'react';

export default function AuthLayout({ children, title, description, ...props }: { children: React.ReactNode; title: string; description: string }) {
    // Auth pages are portal UI: restore the stored theme when arriving from
    // the always-light public website.
    useEffect(() => {
        document.documentElement.classList.remove('public-site');
        initializeTheme();
    }, []);

    return (
        <AuthLayoutTemplate title={title} description={description} {...props}>
            {children}
            <Toaster />
        </AuthLayoutTemplate>
    );
}
