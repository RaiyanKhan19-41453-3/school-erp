import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { AcademicYearFilter } from '@/components/academic-year-filter';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Mark Entry', href: '/marks/entry' },
];

interface SectionOption {
    id: number;
    name: string;
    class: string;
}

interface ExamOption {
    id: number;
    name: string;
}

interface ExamSubjectOption {
    id: number;
    full_marks: string;
    pass_marks: string;
    subject: string;
    code: string | null;
}

interface StudentRoster {
    id: number;
    name: string;
    admission_number: string;
    marks_obtained: string | null;
    remarks: string | null;
}

export default function MarkEntryIndex({
    academicYears,
    selectedYearId,
    sections,
    selectedSectionId,
    exams,
    selectedExamId,
    examSubjects,
    selectedExamSubjectId,
    canEnter,
    students,
    isAdmin,
}: {
    academicYears: { id: number; name: string; is_current: boolean }[];
    selectedYearId: number | null;
    sections: SectionOption[];
    selectedSectionId: number | null;
    exams: ExamOption[];
    selectedExamId: number | null;
    examSubjects: ExamSubjectOption[];
    selectedExamSubjectId: number | null;
    canEnter: boolean;
    students: StudentRoster[];
    isAdmin: boolean;
}) {
    const [marks, setMarks] = useState<Record<number, string>>(() => {
        const initial: Record<number, string> = {};
        students.forEach((s) => {
            if (s.marks_obtained !== null && s.marks_obtained !== undefined) initial[s.id] = String(s.marks_obtained);
        });
        return initial;
    });

    const [remarks, setRemarks] = useState<Record<number, string>>(() => {
        const initial: Record<number, string> = {};
        students.forEach((s) => {
            if (s.remarks) initial[s.id] = s.remarks;
        });
        return initial;
    });

    const [saving, setSaving] = useState(false);
    const { errors } = usePage<{ errors: Record<string, string> }>().props;

    const selectedSection = sections.find((s) => s.id === selectedSectionId);
    const selectedExam = exams.find((e) => e.id === selectedExamId);
    const selectedSubject = examSubjects.find((s) => s.id === selectedExamSubjectId);

    const fullMarks = selectedSubject ? parseFloat(selectedSubject.full_marks) : 0;
    const passMarks = selectedSubject ? parseFloat(selectedSubject.pass_marks) : 0;

    function applyYear(yearId: string) {
        router.get(route('mark-entry.index'), { year_id: yearId }, { preserveState: true, preserveScroll: true });
    }

    function applySection(sectionId: string) {
        router.get(route('mark-entry.index'), { year_id: selectedYearId || '', section_id: sectionId }, { preserveState: true, preserveScroll: true });
    }

    function applyExam(examId: string) {
        router.get(
            route('mark-entry.index'),
            { year_id: selectedYearId || '', section_id: selectedSectionId || '', exam_id: examId },
            { preserveState: true, preserveScroll: true },
        );
    }

    function applySubject(examSubjectId: string) {
        router.get(
            route('mark-entry.index'),
            {
                year_id: selectedYearId || '',
                section_id: selectedSectionId || '',
                exam_id: selectedExamId || '',
                exam_subject_id: examSubjectId,
            },
            { preserveState: true, preserveScroll: true },
        );
    }

    function saveMarks() {
        if (!selectedSection || !selectedSubject) return;

        const records = students.map((s) => ({
            student_id: s.id,
            marks_obtained: marks[s.id] ?? '',
            remarks: remarks[s.id] ?? '',
        }));

        router.post(
            route('mark-entry.store'),
            {
                section_id: selectedSection.id,
                exam_subject_id: selectedSubject.id,
                records,
            },
            {
                onStart: () => setSaving(true),
                onFinish: () => setSaving(false),
                onSuccess: () => {
                    toast.success('Marks saved');
                },
                onError: () => {
                    toast.error('Failed to save marks');
                },
            },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mark Entry" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold tracking-tight">Mark Entry</h2>
                    <p className="text-muted-foreground text-sm">
                        {isAdmin ? 'Enter marks for any section' : 'Enter marks for your assigned sections'}
                    </p>
                </div>

                <div className="mb-4 flex flex-wrap items-end gap-4">
                    <AcademicYearFilter
                        academicYears={academicYears}
                        value={selectedYearId ? String(selectedYearId) : ''}
                        onValueChange={applyYear}
                    />
                    <div className="min-w-64 space-y-2">
                        <label className="text-sm font-medium">Section</label>
                        <Combobox
                            options={sections.map((s) => ({ value: String(s.id), label: `${s.class} - ${s.name}` }))}
                            value={selectedSectionId ? String(selectedSectionId) : ''}
                            onValueChange={applySection}
                            placeholder="Select a section"
                            searchPlaceholder="Search sections..."
                            emptyText="No section found."
                        />
                    </div>

                    <div className="min-w-64 space-y-2">
                        <label className="text-sm font-medium">Exam</label>
                        <Combobox
                            options={exams.map((e) => ({ value: String(e.id), label: e.name }))}
                            value={selectedExamId ? String(selectedExamId) : ''}
                            onValueChange={applyExam}
                            placeholder="Select an exam"
                            searchPlaceholder="Search exams..."
                            emptyText="No exams for this class."
                        />
                    </div>

                    <div className="min-w-64 space-y-2">
                        <label className="text-sm font-medium">Subject</label>
                        <Combobox
                            options={examSubjects.map((s) => ({
                                value: String(s.id),
                                label: `${s.subject}${s.code ? ` (${s.code})` : ''} — Max ${s.full_marks}`,
                            }))}
                            value={selectedExamSubjectId ? String(selectedExamSubjectId) : ''}
                            onValueChange={applySubject}
                            placeholder="Select a subject"
                            searchPlaceholder="Search subjects..."
                            emptyText="No subjects for this exam."
                        />
                    </div>
                </div>

                {selectedSection && (
                    <div className="rounded-lg border">
                        <div className="flex items-center justify-between border-b px-4 py-3">
                            <div className="text-sm font-medium">
                                {selectedSection.class} - {selectedSection.name} · {selectedExam?.name} · {selectedSubject?.subject}
                            </div>
                            {!canEnter && <Badge variant="secondary">Read-only</Badge>}
                            {selectedSubject && canEnter && (
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">Max {selectedSubject.full_marks}</Badge>
                                    <Badge variant="outline">Pass {selectedSubject.pass_marks}</Badge>
                                </div>
                            )}
                        </div>

                        {!selectedExam && (
                            <p className="px-4 py-8 text-center text-sm text-muted-foreground">No exams for this section's class in the selected year.</p>
                        )}

                        {selectedExam && !selectedSubject && (
                            <p className="px-4 py-8 text-center text-sm text-muted-foreground">No subjects configured for this exam yet.</p>
                        )}

                        {selectedExam && selectedSubject && students.length === 0 && (
                            <p className="px-4 py-8 text-center text-sm text-muted-foreground">No active students in this section.</p>
                        )}

                        {selectedExam && selectedSubject && students.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-muted/50">
                                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Student</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Admission No</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Marks (max {fullMarks})</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((student) => {
                                            const value = marks[student.id] !== undefined ? parseFloat(marks[student.id]) : NaN;
                                            const exceedsMax = !Number.isNaN(value) && value > fullMarks;
                                            const belowPass = !Number.isNaN(value) && value < passMarks;

                                            return (
                                                <tr key={student.id} className="border-t transition-colors hover:bg-muted/30">
                                                    <td className="px-4 py-3 text-sm font-medium">{student.name}</td>
                                                    <td className="px-4 py-3 text-sm text-muted-foreground">{student.admission_number}</td>
                                                    <td className="px-4 py-3">
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={marks[student.id] ?? ''}
                                                            onChange={(e) => setMarks((prev) => ({ ...prev, [student.id]: e.target.value }))}
                                                            disabled={!canEnter}
                                                            className={`w-32 ${exceedsMax ? 'border-destructive' : ''}`}
                                                        />
                                                        {exceedsMax && <span className="text-xs text-destructive">Exceeds max {fullMarks}</span>}
                                                        {!exceedsMax && belowPass && <span className="text-xs text-amber-600">Below pass marks</span>}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Input
                                                            value={remarks[student.id] ?? ''}
                                                            onChange={(e) => setRemarks((prev) => ({ ...prev, [student.id]: e.target.value }))}
                                                            disabled={!canEnter}
                                                            className="w-64"
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {canEnter && students.length > 0 && (
                            <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
                                {errors.records && <span className="text-sm text-destructive">{errors.records}</span>}
                                <Button onClick={saveMarks} disabled={saving}>
                                    <Save className="h-4 w-4" />
                                    Save Marks
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
