import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/date-picker';
import { GuardiansEditor, type GuardianForm } from '@/components/guardians-editor';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Students', href: '/students' },
    { title: 'Create', href: '/students/create' },
];

interface Section {
    id: number;
    name: string;
}

interface SchoolClass {
    id: number;
    name: string;
    sections: Section[];
}

interface ExistingGuardian {
    id: number;
    name: string;
    phone: string;
}

const emptyGuardian = (): GuardianForm => ({
    guardian_id: null,
    relationship: '',
    is_primary: false,
    name: '',
    phone: '',
    email: '',
    occupation: '',
});

export default function CreateStudent({
    classes,
    guardians,
}: {
    classes: SchoolClass[];
    guardians: ExistingGuardian[];
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        admission_number: '',
        date_of_birth: '',
        gender: '',
        admission_date: '',
        section_id: '',
        guardians: [emptyGuardian()] as GuardianForm[],
    });

    const [selectedClass, setSelectedClass] = useState<string>('');
    const activeClass = classes.find((c) => c.id === parseInt(selectedClass));

    function addGuardian() {
        setData('guardians', [...data.guardians, emptyGuardian()]);
    }

    function removeGuardian(index: number) {
        setData(
            'guardians',
            data.guardians.filter((_, i) => i !== index),
        );
    }

    function setGuardian(index: number, field: keyof GuardianForm, value: string | number | boolean | null) {
        const guardians = data.guardians.map((g, i) => (i === index ? { ...g, [field]: value } : g));
        setData('guardians', guardians);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(route('students.store'), {
            onSuccess: () => {
                reset();
                toast.success('Student created successfully');
            },
            onError: () => {
                toast.error('Failed to create student');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Student" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold tracking-tight">Create Student</h2>
                    <p className="text-muted-foreground text-sm">Add a new student and their guardians</p>
                </div>

                <form onSubmit={submit} className="max-w-3xl space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="e.g. John Doe" />
                            <InputError message={errors.name} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="admission_number">Admission Number</Label>
                            <Input
                                id="admission_number"
                                value={data.admission_number}
                                onChange={(e) => setData('admission_number', e.target.value)}
                                placeholder="e.g. ADM-2026-001"
                            />
                            <InputError message={errors.admission_number} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date_of_birth">Date of Birth</Label>
                            <DatePicker
                                id="date_of_birth"
                                value={data.date_of_birth}
                                onChange={(v) => setData('date_of_birth', v)}
                                placeholder="DD/MM/YYYY"
                            />
                            <InputError message={errors.date_of_birth} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gender">Gender</Label>
                            <Select value={data.gender} onValueChange={(v) => setData('gender', v)}>
                                <SelectTrigger id="gender" className="w-full">
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.gender} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="admission_date">Admission Date</Label>
                            <DatePicker
                                id="admission_date"
                                value={data.admission_date}
                                onChange={(v) => setData('admission_date', v)}
                                placeholder="DD/MM/YYYY"
                            />
                            <InputError message={errors.admission_date} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="class_id">Class</Label>
                            <Select value={selectedClass} onValueChange={(v) => setSelectedClass(v)}>
                                <SelectTrigger id="class_id" className="w-full">
                                    <SelectValue placeholder="Select class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="section_id">Section</Label>
                            <Select value={data.section_id} onValueChange={(v) => setData('section_id', v)} disabled={!activeClass}>
                                <SelectTrigger id="section_id" className="w-full">
                                    <SelectValue placeholder={activeClass ? 'Select section' : 'Select a class first'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {activeClass?.sections.map((s) => (
                                        <SelectItem key={s.id} value={String(s.id)}>
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.section_id} />
                        </div>
                    </div>

                    <GuardiansEditor
                        guardians={data.guardians}
                        existingGuardians={guardians}
                        errors={errors}
                        onAdd={addGuardian}
                        onRemove={removeGuardian}
                        onFieldChange={setGuardian}
                    />

                    <div className="flex gap-4">
                        <Button type="submit" disabled={processing}>
                            Create Student
                        </Button>
                        <Link href={route('students.index')}>
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
