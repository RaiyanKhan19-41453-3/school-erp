import { Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { FormEvent } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Classes', href: '/classes' },
    { title: 'Create', href: '/classes/create' },
];

interface SectionForm {
    [key: string]: string | number;
    name: string;
    capacity: number;
}

export default function CreateClass() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        sections: [{ name: '', capacity: 30 }] as SectionForm[],
    });

    function addSection() {
        setData('sections', [...data.sections, { name: '', capacity: 30 }]);
    }

    function removeSection(index: number) {
        setData(
            'sections',
            data.sections.filter((_, i) => i !== index),
        );
    }

    function setSection(index: number, field: keyof SectionForm, value: string | number) {
        const sections = data.sections.map((section, i) =>
            i === index ? { ...section, [field]: value } : section,
        );
        setData('sections', sections);
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        post(route('classes.store'), {
            onSuccess: () => reset(),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Class" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

            <div className="mb-6">
                <h2 className="text-xl font-semibold tracking-tight">Create Class</h2>
                <p className="text-muted-foreground text-sm">Add a new class with its sections</p>
            </div>

            <form onSubmit={submit} className="max-w-2xl space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Class Name</Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="e.g. Grade 3"
                    />
                    <InputError message={errors.name} />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>Sections</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addSection}>
                            Add Section
                        </Button>
                    </div>
                    <InputError message={errors.sections} />

                    {data.sections.map((section, index) => (
                        <div key={index} className="flex items-end gap-4 rounded-lg border p-4">
                            <div className="flex-1 space-y-2">
                                <Label htmlFor={`section-name-${index}`}>Section Name</Label>
                                <Input
                                    id={`section-name-${index}`}
                                    value={section.name}
                                    onChange={(e) => setSection(index, 'name', e.target.value)}
                                    placeholder="e.g. Section A"
                                />
                                <InputError message={(errors as Record<string, string>)[`sections.${index}.name`]} />
                            </div>
                            <div className="w-24 space-y-2">
                                <Label htmlFor={`section-capacity-${index}`}>Capacity</Label>
                                <Input
                                    id={`section-capacity-${index}`}
                                    type="number"
                                    value={section.capacity}
                                    onChange={(e) => setSection(index, 'capacity', parseInt(e.target.value) || 0)}
                                />
                                <InputError message={(errors as Record<string, string>)[`sections.${index}.capacity`]} />
                            </div>
                            {data.sections.length > 1 && (
                                <Button type="button" variant="destructive" size="sm" onClick={() => removeSection(index)}>
                                    Remove
                                </Button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex gap-4">
                    <Button type="submit" disabled={processing}>
                        Create Class
                    </Button>
                    <Link href={route('classes.index')}>
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </Link>
                </div>
            </form>
            </div>
        </AppLayout>
    );
}
