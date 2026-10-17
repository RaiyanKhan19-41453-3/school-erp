import { PageHero } from '@/components/public/page-hero';
import { useT } from '@/i18n/public';
import PublicLayout from '@/layouts/public-layout';
import { type SiteInfo } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { CheckCircle2, Clock, Facebook, Mail, MapPin, Phone, Send, Youtube } from 'lucide-react';
import { type FormEvent, useState } from 'react';

interface ContactProps {
    site: SiteInfo;
}

const inputClass =
    'w-full border border-brand-900/25 bg-white px-3.5 py-2.5 text-sm text-brand-950 placeholder:text-brand-900/40 hover:border-brand-900/50 focus:border-brand-700 transition-colors focus:outline-none';

export default function Contact({ site }: ContactProps) {
    const t = useT();
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

    const infoRow = (icon: typeof MapPin, label: string, value: string, href?: string) => {
        const Icon = icon;

        return (
            <div className="border-brand-900/15 flex gap-4 border-b py-4 first:pt-0 last:border-b-0 last:pb-0">
                <span className="bg-cream-100 text-brand-800 border-brand-900/25 flex h-10 w-10 shrink-0 items-center justify-center border">
                    <Icon className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0">
                    <p className="text-brand-900/50 text-[10px] font-semibold tracking-[0.18em] uppercase">{t(label)}</p>
                    {href ? (
                        <a href={href} className="hover:text-brand-700 mt-0.5 inline-block truncate text-sm font-medium transition-colors">
                            {value}
                        </a>
                    ) : (
                        <p className="text-brand-950 mt-0.5 text-sm leading-snug font-medium">{value}</p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <PublicLayout site={site}>
            <Head title="Contact Us" />

            <PageHero
                title={t('Contact Us')}
                description={t('Questions about admission, fees or academics? Reach out and our office will get back to you shortly.')}
                breadcrumbs={[{ label: t('Home'), href: '/' }, { label: t('Contact Us') }]}
            />

            <section className="py-10 lg:py-12">
                <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
                    <div className="space-y-6">
                        {(site.address || site.phone || site.email) && (
                            <div className="border-brand-900/20 border bg-white px-6 py-7">
                                {site.address && infoRow(MapPin, 'Campus Address', site.address)}
                                {site.phone && infoRow(Phone, 'Phone', site.phone, `tel:${site.phone}`)}
                                {site.email && infoRow(Mail, 'Email', site.email, `mailto:${site.email}`)}
                            </div>
                        )}

                        <div className="bg-brand-950 text-cream-50 px-6 py-6">
                            <div className="flex items-center gap-4">
                                <span className="border-cream-100/25 text-brand-300 flex h-10 w-10 shrink-0 items-center justify-center border">
                                    <Clock className="h-4.5 w-4.5" />
                                </span>
                                <div>
                                    <h2 className="font-display text-lg font-semibold">{t('Office Hours')}</h2>
                                    <p className="text-cream-100/75 mt-0.5 text-sm">{t('Sunday – Thursday, 8:00 AM – 4:00 PM')}</p>
                                </div>
                            </div>
                            <p className="text-cream-100/55 border-cream-50/15 mt-4 border-t pt-4 text-xs">
                                {t('Closed on Fridays, Saturdays and government holidays.')}
                            </p>
                        </div>

                        {(site.facebook_url || site.youtube_url) && (
                            <div className="flex items-center gap-3">
                                {site.facebook_url && (
                                    <a
                                        href={site.facebook_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="border-brand-900/30 text-brand-900 hover:border-brand-950 hover:text-brand-950 flex h-10 w-10 items-center justify-center border transition-colors"
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
                                        className="border-brand-900/30 text-brand-900 hover:border-brand-950 hover:text-brand-950 flex h-10 w-10 items-center justify-center border transition-colors"
                                        aria-label="YouTube"
                                    >
                                        <Youtube className="h-4.5 w-4.5" />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="border-brand-900/20 border bg-white p-7 sm:p-9">
                        {sent ? (
                            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                                <span className="flex h-14 w-14 items-center justify-center border border-emerald-300 bg-emerald-50 text-emerald-700">
                                    <CheckCircle2 className="h-7 w-7" />
                                </span>
                                <h2 className="font-display text-brand-950 mt-5 text-2xl font-semibold">{t('Thank you!')}</h2>
                                <p className="text-brand-900/60 mt-2 max-w-sm text-sm leading-relaxed">
                                    {t('Your message has been received. Our office will contact you soon.')}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setSent(false)}
                                    className="border-brand-950 text-brand-950 hover:bg-brand-950 hover:text-cream-50 mt-6 border px-5 py-2.5 text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors"
                                >
                                    {t('Send another message')}
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="border-brand-950 border-b-2 pb-4">
                                    <h2 className="font-display text-brand-950 text-2xl font-semibold">{t('Send us a message')}</h2>
                                    <p className="text-brand-900/60 mt-2 text-sm">
                                        {t('Fill in the form and we will get back to you as soon as possible.')}
                                    </p>
                                </div>
                                <form onSubmit={submit} className="mt-8 space-y-5">
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="contact-name" className="text-brand-900 mb-1.5 block text-sm font-medium">
                                                {t('Your name')} *
                                            </label>
                                            <input
                                                id="contact-name"
                                                type="text"
                                                value={data.name}
                                                onChange={(event) => setData('name', event.target.value)}
                                                className={inputClass}
                                                placeholder={t('Full name')}
                                            />
                                            {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="contact-email" className="text-brand-900 mb-1.5 block text-sm font-medium">
                                                {t('Email')} *
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
                                                {t('Phone')}
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
                                                {t('Subject')}
                                            </label>
                                            <input
                                                id="contact-subject"
                                                type="text"
                                                value={data.subject}
                                                onChange={(event) => setData('subject', event.target.value)}
                                                className={inputClass}
                                                placeholder={t('e.g. Admission enquiry')}
                                            />
                                            {errors.subject && <p className="mt-1.5 text-xs text-red-600">{errors.subject}</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="contact-message" className="text-brand-900 mb-1.5 block text-sm font-medium">
                                            {t('Message')} *
                                        </label>
                                        <textarea
                                            id="contact-message"
                                            value={data.message}
                                            onChange={(event) => setData('message', event.target.value)}
                                            rows={6}
                                            className={inputClass}
                                            placeholder={t('Write your message here…')}
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
                                        className="bg-brand-800 text-cream-50 hover:bg-brand-950 border-brand-950 inline-flex w-full items-center justify-center gap-2 border px-6 py-3 text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors disabled:opacity-60 sm:w-auto"
                                    >
                                        <Send className="h-4 w-4" />
                                        {processing ? t('Sending…') : t('Send message')}
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
