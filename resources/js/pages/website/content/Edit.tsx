import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { type ReactNode } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Website Content', href: '/website/content' },
];

interface SiteProfileForm {
    tagline: string;
    hero_title: string;
    hero_subtitle: string;
    about: string;
    history: string;
    mission: string;
    vision: string;
    principal_name: string;
    principal_message: string;
    admission_info: string;
    admission_requirements: string;
    admission_steps: string;
    stats_students: string;
    stats_teachers: string;
    stats_years: string;
    stats_pass_rate: string;
    facebook_url: string;
    youtube_url: string;
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
    return (
        <div className="rounded-xl border p-6">
            <h3 className="text-base font-semibold">{title}</h3>
            {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
            <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
        </div>
    );
}

export default function ContentEdit({ profile }: { profile: SiteProfileForm }) {
    const { data, setData, put, processing, errors } = useForm({ ...profile });

    function save() {
        put(route('website.content.update'), {
            preserveScroll: true,
            onSuccess: () => toast.success('Website content updated successfully'),
            onError: () => toast.error('Failed to update website content'),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Website Content" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-2 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">Website Content</h2>
                        <p className="text-muted-foreground text-sm">Everything written here appears on the public school website</p>
                    </div>
                    <Button onClick={save} disabled={processing}>
                        Save Changes
                    </Button>
                </div>

                <Section title="Homepage hero" description="The first thing visitors see on the home page.">
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="tagline">School tagline</Label>
                        <Input
                            id="tagline"
                            value={data.tagline}
                            onChange={(e) => setData('tagline', e.target.value)}
                            placeholder="Knowledge · Discipline · Character"
                        />
                        <InputError message={errors.tagline} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="hero-title">Hero headline</Label>
                        <Input id="hero-title" value={data.hero_title} onChange={(e) => setData('hero_title', e.target.value)} />
                        <InputError message={errors.hero_title} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="hero-subtitle">Hero subtitle</Label>
                        <Textarea id="hero-subtitle" rows={2} value={data.hero_subtitle} onChange={(e) => setData('hero_subtitle', e.target.value)} />
                        <InputError message={errors.hero_subtitle} />
                    </div>
                </Section>

                <Section title="Key numbers" description="Shown in the statistics band across the website.">
                    <div className="space-y-2">
                        <Label htmlFor="stats-students">Students</Label>
                        <Input
                            id="stats-students"
                            value={data.stats_students}
                            onChange={(e) => setData('stats_students', e.target.value)}
                            placeholder="1,450+"
                        />
                        <InputError message={errors.stats_students} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="stats-teachers">Teachers</Label>
                        <Input
                            id="stats-teachers"
                            value={data.stats_teachers}
                            onChange={(e) => setData('stats_teachers', e.target.value)}
                            placeholder="75+"
                        />
                        <InputError message={errors.stats_teachers} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="stats-years">Years of excellence</Label>
                        <Input id="stats-years" value={data.stats_years} onChange={(e) => setData('stats_years', e.target.value)} placeholder="25+" />
                        <InputError message={errors.stats_years} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="stats-pass-rate">SSC pass rate</Label>
                        <Input
                            id="stats-pass-rate"
                            value={data.stats_pass_rate}
                            onChange={(e) => setData('stats_pass_rate', e.target.value)}
                            placeholder="98%"
                        />
                        <InputError message={errors.stats_pass_rate} />
                    </div>
                </Section>

                <Section title="About the school" description="Shown on the About page and summarised on the home page.">
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="about">Introduction</Label>
                        <Textarea id="about" rows={6} value={data.about} onChange={(e) => setData('about', e.target.value)} />
                        <InputError message={errors.about} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="history">Our journey / history</Label>
                        <Textarea id="history" rows={4} value={data.history} onChange={(e) => setData('history', e.target.value)} />
                        <InputError message={errors.history} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="mission">Mission</Label>
                        <Textarea id="mission" rows={3} value={data.mission} onChange={(e) => setData('mission', e.target.value)} />
                        <InputError message={errors.mission} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="vision">Vision</Label>
                        <Textarea id="vision" rows={3} value={data.vision} onChange={(e) => setData('vision', e.target.value)} />
                        <InputError message={errors.vision} />
                    </div>
                </Section>

                <Section title="Principal's message" description="A personal note shown on the About page.">
                    <div className="space-y-2">
                        <Label htmlFor="principal-name">Principal's name</Label>
                        <Input id="principal-name" value={data.principal_name} onChange={(e) => setData('principal_name', e.target.value)} />
                        <InputError message={errors.principal_name} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="principal-message">Message</Label>
                        <Textarea
                            id="principal-message"
                            rows={5}
                            value={data.principal_message}
                            onChange={(e) => setData('principal_message', e.target.value)}
                        />
                        <InputError message={errors.principal_message} />
                    </div>
                </Section>

                <Section title="Admission information" description="Shown on the Admission page.">
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="admission-info">Admission introduction</Label>
                        <Textarea
                            id="admission-info"
                            rows={3}
                            value={data.admission_info}
                            onChange={(e) => setData('admission_info', e.target.value)}
                        />
                        <InputError message={errors.admission_info} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="admission-requirements">Documents required — one per line</Label>
                        <Textarea
                            id="admission-requirements"
                            rows={6}
                            value={data.admission_requirements}
                            onChange={(e) => setData('admission_requirements', e.target.value)}
                            placeholder={'Birth certificate\nPhotographs'}
                        />
                        <InputError message={errors.admission_requirements} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="admission-steps">Application steps — one per line</Label>
                        <Textarea
                            id="admission-steps"
                            rows={6}
                            value={data.admission_steps}
                            onChange={(e) => setData('admission_steps', e.target.value)}
                            placeholder={'Collect the admission form\nSubmit with documents'}
                        />
                        <InputError message={errors.admission_steps} />
                    </div>
                </Section>

                <Section title="Social links" description="Displayed in the website header and footer.">
                    <div className="space-y-2">
                        <Label htmlFor="facebook-url">Facebook page URL</Label>
                        <Input
                            id="facebook-url"
                            value={data.facebook_url}
                            onChange={(e) => setData('facebook_url', e.target.value)}
                            placeholder="https://facebook.com/your-school"
                        />
                        <InputError message={errors.facebook_url} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="youtube-url">YouTube channel URL</Label>
                        <Input
                            id="youtube-url"
                            value={data.youtube_url}
                            onChange={(e) => setData('youtube_url', e.target.value)}
                            placeholder="https://youtube.com/@your-school"
                        />
                        <InputError message={errors.youtube_url} />
                    </div>
                </Section>

                <div className="flex justify-end">
                    <Button onClick={save} disabled={processing}>
                        {processing ? 'Saving…' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
