import { EmptyState } from '@/components/public/empty-state';
import { EventCard } from '@/components/public/event-card';
import { PageHero } from '@/components/public/page-hero';
import { SectionHeading } from '@/components/public/section-heading';
import { SiteCta } from '@/components/public/site-cta';
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
    return (
        <PublicLayout site={site}>
            <Head title="Events" />

            <PageHero
                eyebrow="School calendar"
                title="Events & Programmes"
                description="Sports meets, science fairs, cultural nights and parent conferences — see what's coming up and what we celebrated."
            />

            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <SectionHeading eyebrow="Coming up" title="Upcoming events" description="Mark your calendar — everyone is welcome." />
                <div className="mt-10">
                    {upcoming.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {upcoming.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={CalendarDays}
                            title="No upcoming events"
                            description="New events are announced on the notice board — check back soon."
                        />
                    )}
                </div>
            </section>

            {past.length > 0 && (
                <section className="bg-cream-100 py-16 lg:py-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <SectionHeading eyebrow="Archive" title="Past events" description="A look back at the moments our school shared." />
                        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {past.map((event) => (
                                <EventCard key={event.id} event={event} muted />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <SiteCta site={site} title="Want your child to be part of the next event?" />
        </PublicLayout>
    );
}
