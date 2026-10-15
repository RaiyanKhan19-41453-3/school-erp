import { PageHero } from '@/components/public/page-hero';
import PublicLayout from '@/layouts/public-layout';
import { type SiteInfo } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { CheckCircle2, Clock, Facebook, Mail, MapPin, Phone, Send, Youtube } from 'lucide-react';
import { type FormEvent, useState } from 'react';

interface ContactProps {
    site: SiteInfo;
}

const inputClass =
    'w-full rounded-xl border border-brand-900/15 bg-cream-50 px-4 py-3 text-sm text-brand-950 placeholder:text-brand-900/40 focus:border-gold-500 focus:outline-none';

export default function Contact({ site }: ContactProps) {
    const [sent, setSent] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        website: '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();

        post(route('site.contact.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setSent(true);
            },
        });
    };

    return (
        <PublicLayout site={site}>
            <Head title="Contact Us" />

            <PageHero
                eyebrow="Contact"
                title="We Would Love to Hear From You"
                description="Questions about admission, fees or academics? Reach out and our office will get back to you shortly."
            />

            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="space-y-6">
                        {site.address && (
                            <div className="border-brand-900/10 flex gap-5 rounded-2xl border bg-white p-6 shadow-sm">
                                <span className="bg-gold-100 text-gold-700 flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
                                    <MapPin className="h-5 w-5" />
                                </span>
                                <div>
                                    <h2 className="font-display text-brand-950 text-lg font-semibold">Visit the campus</h2>
                                    <p className="text-brand-900/70 mt-1.5 text-sm leading-relaxed">{site.address}</p>
                                </div>
                            </div>
                        )}

                        <div className="grid gap-6 sm:grid-cols-2">
                            {site.phone && (
                                <a
                                    href={`tel:${site.phone}`}
                                    className="border-brand-900/10 hover:border-gold-400 flex gap-4 rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5"
                                >
                                    <span className="bg-brand-100 text-brand-800 flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
                                        <Phone className="h-5 w-5" />
                                    </span>
                                    <div className="min-w-0">
                                        <h2 className="font-display text-brand-950 text-base font-semibold">Call us</h2>
                                        <p className="text-brand-900/70 mt-1 truncate text-sm">{site.phone}</p>
                                    </div>
                                </a>
                            )}
                            {site.email && (
                                <a
                                    href={`mailto:${site.email}`}
                                    className="border-brand-900/10 hover:border-gold-400 flex gap-4 rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-0.5"
                                >
                                    <span className="bg-brand-100 text-brand-800 flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
                                        <Mail className="h-5 w-5" />
                                    </span>
                                    <div className="min-w-0">
                                        <h2 className="font-display text-brand-950 text-base font-semibold">Email us</h2>
                                        <p className="text-brand-900/70 mt-1 truncate text-sm">{site.email}</p>
                                    </div>
                                </a>
                            )}
                        </div>

                        <div className="bg-brand-900 text-cream-50 flex gap-5 rounded-2xl p-6">
                            <span className="bg-cream-50/10 text-gold-400 flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
                                <Clock className="h-5 w-5" />
                            </span>
                            <div>
                                <h2 className="font-display text-lg font-semibold">Office hours</h2>
                                <p className="text-cream-100/75 mt-1.5 text-sm leading-relaxed">
                                    Sunday – Thursday
                                    <br />
                                    8:00 AM – 4:00 PM
                                </p>
                                <p className="text-cream-100/50 mt-2 text-xs">Closed on Fridays, Saturdays and government holidays.</p>
                            </div>
                        </div>

                        {(site.facebook_url || site.youtube_url) && (
                            <div className="flex items-center gap-3">
                                {site.facebook_url && (
                                    <a
                                        href={site.facebook_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="border-brand-900/15 text-brand-900 hover:border-gold-500 hover:text-gold-700 flex h-11 w-11 items-center justify-center rounded-full border transition-colors"
                                        aria-label="Facebook"
                                    >
                                        <Facebook className="h-4.5 w-4.5" />
                                    </a>
                                )}
                                {site.youtube_url && (
                                    <a
                                        href={site.youtube_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="border-brand-900/15 text-brand-900 hover:border-gold-500 hover:text-gold-700 flex h-11 w-11 items-center justify-center rounded-full border transition-colors"
                                        aria-label="YouTube"
                                    >
                                        <Youtube className="h-4.5 w-4.5" />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="border-brand-900/10 rounded-3xl border bg-white p-8 shadow-sm sm:p-10">
                        {sent ? (
                            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                    <CheckCircle2 className="h-7 w-7" />
                                </span>
                                <h2 className="font-display text-brand-950 mt-5 text-2xl font-semibold">Thank you!</h2>
                                <p className="text-brand-900/65 mt-2 max-w-sm text-sm leading-relaxed">
                                    Your message has been received. Our office will contact you soon.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setSent(false)}
                                    className="border-brand-900/20 text-brand-900 hover:border-gold-500 hover:text-gold-700 mt-6 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <>
                                <h2 className="font-display text-brand-950 text-2xl font-semibold">Send us a message</h2>
                                <p className="text-brand-900/65 mt-2 text-sm">Fill in the form and we will get back to you as soon as possible.</p>
                                <form onSubmit={submit} className="mt-8 space-y-5">
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="contact-name" className="text-brand-900 mb-1.5 block text-sm font-medium">
                                                Your name *
                                            </label>
                                            <input
                                                id="contact-name"
                                                type="text"
                                                value={data.name}
                                                onChange={(event) => setData('name', event.target.value)}
                                                className={inputClass}
                                                placeholder="Full name"
                                            />
                                            {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="contact-email" className="text-brand-900 mb-1.5 block text-sm font-medium">
                                                Email *
                                            </label>
                                            <input
                                                id="contact-email"
                                                type="email"
                                                value={data.email}
                                                onChange={(event) => setData('email', event.target.value)}
                                                className={inputClass}
                                                placeholder="you@example.com"
                                            />
                                            {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>}
                                        </div>
                                    </div>
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="contact-phone" className="text-brand-900 mb-1.5 block text-sm font-medium">
                                                Phone
                                            </label>
                                            <input
                                                id="contact-phone"
                                                type="tel"
                                                value={data.phone}
                                                onChange={(event) => setData('phone', event.target.value)}
                                                className={inputClass}
                                                placeholder="+880 1XXX XXXXXX"
                                            />
                                            {errors.phone && <p className="mt-1.5 text-xs text-red-600">{errors.phone}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="contact-subject" className="text-brand-900 mb-1.5 block text-sm font-medium">
                                                Subject
                                            </label>
                                            <input
                                                id="contact-subject"
                                                type="text"
                                                value={data.subject}
                                                onChange={(event) => setData('subject', event.target.value)}
                                                className={inputClass}
                                                placeholder="e.g. Admission enquiry"
                                            />
                                            {errors.subject && <p className="mt-1.5 text-xs text-red-600">{errors.subject}</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="contact-message" className="text-brand-900 mb-1.5 block text-sm font-medium">
                                            Message *
                                        </label>
                                        <textarea
                                            id="contact-message"
                                            value={data.message}
                                            onChange={(event) => setData('message', event.target.value)}
                                            rows={6}
                                            className={inputClass}
                                            placeholder="Write your message here…"
                                        />
                                        {errors.message && <p className="mt-1.5 text-xs text-red-600">{errors.message}</p>}
                                    </div>
                                    <input
                                        type="text"
                                        value={data.website}
                                        onChange={(event) => setData('website', event.target.value)}
                                        tabIndex={-1}
                                        autoComplete="off"
                                        aria-hidden="true"
                                        className="hidden"
                                    />
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-brand-900 text-cream-50 hover:bg-brand-800 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-colors disabled:opacity-60 sm:w-auto"
                                    >
                                        <Send className="h-4 w-4" />
                                        {processing ? 'Sending…' : 'Send message'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
