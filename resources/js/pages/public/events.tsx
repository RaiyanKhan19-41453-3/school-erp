import { EmptyState } from '@/components/public/empty-state';
import { EventRow } from '@/components/public/event-card';
import { PageHero } from '@/components/public/page-hero';
import { SectionHeading } from '@/components/public/section-heading';
import { SiteCta } from '@/components/public/site-cta';
import { useT } from '@/i18n/public';
import PublicLayout from '@/layouts/public-layout';
import { type PublicEvent, type SiteInfo } from '@/types';
import { Head } from '@inertiajs/react';
import { CalendarDays } from 'lucide-react';

interface EventsProps {
    site: SiteInfo;
    upcoming: PublicEvent[];
    past: PublicEvent[];
}

export default function Events({ site, upcoming, past }: EventsProps) {
    const t = useT();

    return (
        <PublicLayout site={site}>
            <Head title={t('Events')} />

            <PageHero
                title={t('Events & Programmes')}
                description={t("Sports meets, science fairs, cultural nights and parent conferences — see what's coming up and what we celebrated.")}
                breadcrumbs={[{ label: t('Home'), href: '/' }, { label: t('Events') }]}
            />

            <section className="py-12 lg:py-14">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading title={t('Upcoming Events')} description={t('Mark your calendar — parents and guardians are always welcome.')} />
                    <div className="border-brand-900/20 mt-9 overflow-hidden border bg-white">
                        {upcoming.length > 0 ? (
                            upcoming.map((event) => <EventRow key={event.id} event={event} />)
                        ) : (
                            <div className="p-5">
                                <EmptyState
                                    icon={CalendarDays}
                                    title={t('No upcoming events')}
                                    description={t('New events are announced on the notice board — check back soon.')}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {past.length > 0 && (
                <section className="border-brand-900/15 border-t bg-white">
                    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                        <SectionHeading title={t('Past Events')} description={t('A look back at the moments our school shared.')} />
                        <div className="border-brand-900/20 divide-brand-900/10 bg-cream-50 mt-9 divide-y border">
                            {past.map((event) => (
                                <EventRow key={event.id} event={event} muted />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <SiteCta site={site} title={t('Want your child to be part of the next event?')} />
        </PublicLayout>
    );
}
