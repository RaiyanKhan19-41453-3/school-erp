import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Combobox } from '@/components/ui/combobox';
import { AcademicYearFilter } from '@/components/academic-year-filter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, ClipboardList } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Report Cards', href: '/report-cards' },
];

interface Exam {
    id: number;
    name: string;
    class: { id: number; name: string };
    grading_scale: { id: number; name: string } | null;
}

export default function ReportCardsIndex({
    academicYears,
    selectedYearId,
    isStaff,
    classes,
    selectedClassId,
    sections,
    selectedSectionId,
    students,
    selectedStudentId,
    exams,
}: {
    academicYears: { id: number; name: string; is_current: boolean }[];
    selectedYearId: number | null;
    isStaff: boolean;
    classes: { id: number; name: string }[];
    selectedClassId: number | null;
    sections: { id: number; name: string }[];
    selectedSectionId: number | null;
    students: { id: number; name: string; admission_number: string }[];
    selectedStudentId: number | null;
    exams: Exam[];
}) {
    const [selectedClass, setSelectedClass] = useState<string>(selectedClassId ? String(selectedClassId) : '');
    const [selectedSection, setSelectedSection] = useState<string>(selectedSectionId ? String(selectedSectionId) : '');
    const [selectedStudent, setSelectedStudent] = useState<string>(selectedStudentId ? String(selectedStudentId) : '');

    function applyYear(yearId: string) {
        setSelectedClass('');
        setSelectedSection('');
        setSelectedStudent('');
        router.get(route('report-cards.index'), { year_id: yearId }, { preserveState: true, preserveScroll: true });
    }

    function applyClass(classId: string) {
        setSelectedClass(classId);
        setSelectedSection('');
        setSelectedStudent('');
        router.get(
            route('report-cards.index'),
            { year_id: selectedYearId || '', class_id: classId },
            { preserveState: true, preserveScroll: true },
        );
    }

    function applySection(sectionId: string) {
        setSelectedSection(sectionId);
        setSelectedStudent('');
        router.get(
            route('report-cards.index'),
            { year_id: selectedYearId || '', class_id: selectedClass, section_id: sectionId },
            { preserveState: true, preserveScroll: true },
        );
    }

    function applyStudent(studentId: string) {
        setSelectedStudent(studentId);
        router.get(
            route('report-cards.index'),
            { year_id: selectedYearId || '', class_id: selectedClass, section_id: selectedSection, student_id: studentId },
            { preserveState: true, preserveScroll: true },
        );
    }

    const filtersEmpty = isStaff && !selectedClassId && !selectedSectionId && !selectedStudentId;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Report Cards" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold tracking-tight">Report Cards</h2>
                    <p className="text-muted-foreground text-sm">
                        {isStaff ? 'View report cards for any student' : 'View your report cards'}
                    </p>
                </div>

                <div className="mb-4 flex flex-wrap items-end gap-4">
                    <AcademicYearFilter
                        academicYears={academicYears}
                        value={selectedYearId ? String(selectedYearId) : ''}
                        onValueChange={applyYear}
                    />
                    {isStaff && (
                        <>
                            <div className="w-64 space-y-2">
                                <label className="text-sm font-medium">Class</label>
                                <Combobox
                                    options={classes.map((c) => ({ value: String(c.id), label: c.name }))}
                                    value={selectedClass}
                                    onValueChange={applyClass}
                                    placeholder="Select a class"
                                    searchPlaceholder="Search classes..."
                                    emptyText="No classes found."
                                />
                            </div>
                            <div className="w-64 space-y-2">
                                <label className="text-sm font-medium">Section</label>
                                <Combobox
                                    options={sections.map((s) => ({ value: String(s.id), label: s.name }))}
                                    value={selectedSection}
                                    onValueChange={applySection}
                                    placeholder="Select a section"
                                    searchPlaceholder="Search sections..."
                                    emptyText="No sections found."
                                />
                            </div>
                            <div className="w-72 space-y-2">
                                <label className="text-sm font-medium">Student</label>
                                <Combobox
                                    options={students.map((s) => ({ value: String(s.id), label: `${s.name} (${s.admission_number})` }))}
                                    value={selectedStudent}
                                    onValueChange={applyStudent}
                                    placeholder="Select a student"
                                    searchPlaceholder="Search students..."
                                    emptyText="No students found."
                                />
                            </div>
                        </>
                    )}
                </div>

                {exams.length === 0 ? (
                    <div className="rounded-lg border">
                        <p className="px-4 py-12 text-center text-sm text-muted-foreground">
                            {isStaff && !selectedStudentId
                                ? filtersEmpty
                                    ? 'Select a class and section to narrow down students, then pick a student.'
                                    : 'Select a student to see their exams.'
                                : 'No exams with recorded marks found for this academic year.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {exams.map((exam) => (
                            <Card key={exam.id} className="transition-shadow hover:shadow-md">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <ClipboardList className="h-4 w-4" />
                                        {exam.name}
                                    </CardTitle>
                                    <Badge variant="secondary">{exam.class?.name}</Badge>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-3 text-xs text-muted-foreground">
                                        {exam.grading_scale ? `Graded with "${exam.grading_scale.name}"` : 'Percentages only'}
                                    </div>
                                    <Link href={route('report-cards.show', { exam: exam.id, student: selectedStudentId ?? '' })}>
                                        <Button size="sm" className="w-full">
                                            View Report Card <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
