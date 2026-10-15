import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle2, Download, XCircle } from 'lucide-react';

const breadcrumbs = (student: { name: string }): BreadcrumbItem[] => [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Report Cards', href: '/report-cards' },
    { title: student.name, href: '/report-cards' },
];

interface SubjectRow {
    subject: string;
    code: string | null;
    full_marks: number;
    pass_marks: number;
    marks_obtained: number | null;
    percentage: number | null;
    grade_label: string | null;
    grade_point: string | null;
    grade_remarks: string | null;
    passed: boolean;
    has_mark: boolean;
    remarks: string | null;
}

interface Totals {
    marks_obtained: number;
    full_marks: number;
    percentage: number;
    grade_label: string | null;
    grade_point: string | null;
    grade_remarks: string | null;
    passed_subjects: number;
    total_subjects: number;
    marked_subjects: number;
    missing_subjects: number;
    is_complete: boolean;
}

export default function ReportCardShow({
    exam,
    student,
    subjects,
    totals,
    canDownload,
}: {
    exam: { id: number; name: string; class: string; academic_year: string | null; grading_scale: string | null };
    student: { id: number; name: string; admission_number: string };
    subjects: SubjectRow[];
    totals: Totals;
    canDownload: boolean;
}) {
    const allPassed = totals.passed_subjects === totals.total_subjects;

    return (
        <AppLayout breadcrumbs={breadcrumbs(student)}>
            <Head title={`Report Card — ${student.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-2 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight">Report Card</h2>
                        <p className="text-muted-foreground text-sm">
                            {exam.name} · {exam.class}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={route('report-cards.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4" /> Back
                            </Button>
                        </Link>
                        {canDownload && (
                            <Button size="sm" onClick={() => (window.location.href = route('report-cards.pdf', { exam: exam.id, student: student.id }))}>
                                <Download className="h-4 w-4" /> Download PDF
                            </Button>
                        )}
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <CardTitle className="text-lg">{student.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Admission: {student.admission_number} · {exam.academic_year}
                                </p>
                            </div>
                            <Badge variant={allPassed && totals.is_complete ? 'default' : 'destructive'}>
                                {totals.is_complete ? (allPassed ? 'Promoted to next class' : 'Needs improvement') : 'Incomplete — marks pending'}
                            </Badge>
                        </div>
                        {!totals.is_complete && (
                            <p className="mt-2 text-sm text-amber-600">
                                {totals.missing_subjects} of {totals.total_subjects} subjects still need marks. Totals below cover the {totals.marked_subjects} marked{' '}
                                {totals.marked_subjects === 1 ? 'subject' : 'subjects'} only.
                            </p>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-muted/50">
                                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Subject</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Marks</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">%</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Grade</th>
                                        <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Result</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subjects.map((subject) => (
                                        <tr key={subject.subject} className="border-t transition-colors hover:bg-muted/30">
                                            <td className="px-4 py-3 text-sm font-medium">
                                                {subject.subject}
                                                {!subject.has_mark && (
                                                    <Badge variant="outline" className="ml-2">
                                                        Pending
                                                    </Badge>
                                                )}
                                                {subject.remarks && <span className="ml-2 text-xs text-muted-foreground">({subject.remarks})</span>}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm">
                                                {subject.has_mark ? `${subject.marks_obtained} / ${subject.full_marks}` : `— / ${subject.full_marks}`}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm">{subject.has_mark ? `${subject.percentage}%` : '—'}</td>
                                            <td className="px-4 py-3 text-right text-sm font-semibold">
                                                {subject.has_mark ? (
                                                    <>
                                                        {subject.grade_label ?? '—'}
                                                        {subject.grade_point !== null && subject.grade_point !== undefined && (
                                                            <span className="ml-1 text-muted-foreground">({subject.grade_point})</span>
                                                        )}
                                                    </>
                                                ) : (
                                                    '—'
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {!subject.has_mark ? (
                                                    <span className="text-xs text-muted-foreground">Awaiting marks</span>
                                                ) : subject.passed ? (
                                                    <CheckCircle2 className="ml-auto h-5 w-5 text-emerald-600" />
                                                ) : (
                                                    <XCircle className="ml-auto h-5 w-5 text-destructive" />
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t bg-muted/50 font-medium">
                                        <td className="px-4 py-3 text-sm">
                                            Total: {totals.marks_obtained} / {totals.full_marks} ({totals.percentage}%)
                                        </td>
                                        <td />
                                        <td />
                                        <td className="px-4 py-3 text-right text-sm font-semibold">
                                            {totals.grade_label ?? '—'}
                                            {totals.grade_point !== null && totals.grade_point !== undefined && (
                                                <span className="ml-1 text-muted-foreground">({totals.grade_point})</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm">
                                            {totals.passed_subjects}/{totals.total_subjects} passed
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
