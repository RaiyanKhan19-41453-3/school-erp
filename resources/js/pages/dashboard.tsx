import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Combobox } from '@/components/ui/combobox';
import { Skeleton } from '@/components/ui/skeleton';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { CalendarCheck, CalendarClock, GraduationCap, LayoutGrid, Users, Wallet } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Pie, PieChart, XAxis, YAxis } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface Stat {
    label: string;
    value: number | string;
    suffix?: string;
    prefix?: string;
    icon: string;
}

interface DashboardProps extends SharedData {
    roles: string[];
    stats: Stat[];
    studentsPerClass?: { name: string; count: number }[];
    attendanceTrend?: { date: string; present: number; absent: number; late: number }[];
    feeSummary?: {
        collected: number;
        outstanding: number;
        monthly_collected: number;
        total: number;
        counts: { paid: number; partial: number; unpaid: number };
    };
    recentPayments?: { id: number; student: string; amount: number; method: string; paid_at: string; date: string; month: string }[];
    recentAttendance?: { id: number; student: string; section: string; class: string; status: string; date: string }[];
    attendancePie?: { present: number; absent: number; late: number; leave: number };
    markDistribution?: { name: string; avg_percentage: number }[];
    sections?: { id: number; name: string; class: string; is_class_teacher: boolean }[];
    upcomingExams?: { id: number; name: string; start_date: string; end_date: string }[];
    isParent?: boolean;
    children?: { id: number; name: string; class: string; section: string }[];
    selectedChildId?: number | null;
}

const STAT_ICONS: Record<string, typeof Users> = {
    users: Users,
    'graduation-cap': GraduationCap,
    'layout-grid': LayoutGrid,
    'calendar-check': CalendarCheck,
    wallet: Wallet,
};

const STATUS_BADGE_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    present: 'default',
    late: 'secondary',
    leave: 'outline',
    absent: 'destructive',
};

function methodLabel(method: string): string {
    const labels: Record<string, string> = {
        cash: 'Cash',
        bank_transfer: 'Bank Transfer',
        cheque: 'Cheque',
        online: 'Online',
    };

    return labels[method] ?? method;
}

const classChartConfig = {
    count: {
        label: 'Students',
        color: 'var(--chart-1)',
    },
} satisfies ChartConfig;

const attendanceChartConfig = {
    present: {
        label: 'Present',
        color: '#22c55e',
    },
    late: {
        label: 'Late',
        color: '#f59e0b',
    },
    absent: {
        label: 'Absent',
        color: '#ef4444',
    },
} satisfies ChartConfig;

const marksChartConfig = {
    avg_percentage: {
        label: 'Average %',
        color: 'var(--chart-2)',
    },
} satisfies ChartConfig;

const feeChartConfig = {
    collected: {
        label: 'Collected',
        color: '#22c55e',
    },
    outstanding: {
        label: 'Outstanding',
        color: '#ef4444',
    },
} satisfies ChartConfig;

const attendancePieChartConfig = {
    present: {
        label: 'Present',
        color: '#22c55e',
    },
    absent: {
        label: 'Absent',
        color: '#ef4444',
    },
    late: {
        label: 'Late',
        color: '#f59e0b',
    },
    leave: {
        label: 'Leave',
        color: '#64748b',
    },
} satisfies ChartConfig;

function StatCard({ stat }: { stat: Stat }) {
    const Icon = STAT_ICONS[stat.icon] ?? Users;

    return (
        <Card>
            <CardContent className="flex items-center gap-4 p-6">
                <div className="bg-primary/10 flex size-12 shrink-0 items-center justify-center rounded-lg">
                    <Icon className="text-primary size-6" />
                </div>
                <div>
                    <div className="text-muted-foreground text-sm">{stat.label}</div>
                    <div className="text-2xl font-semibold">
                        {stat.prefix}
                        {stat.value}
                        {stat.suffix}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function LoadingDashboard() {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
            ))}
            <Skeleton className="h-64 w-full md:col-span-2 xl:col-span-2" />
            <Skeleton className="h-64 w-full md:col-span-2 xl:col-span-2" />
        </div>
    );
}

function AdminDashboard({ stats, studentsPerClass, attendanceTrend, feeSummary, recentPayments, recentAttendance }: DashboardProps) {
    const feeData = [
        { name: 'collected', value: feeSummary?.collected ?? 0, fill: 'var(--color-collected)' },
        { name: 'outstanding', value: feeSummary?.outstanding ?? 0, fill: 'var(--color-outstanding)' },
    ];

    const collected = feeSummary?.collected ?? 0;
    const total = collected + (feeSummary?.outstanding ?? 0);
    const feeCollectionPercent = total > 0 ? (collected / total) * 100 : 0;

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
                <StatCard key={stat.label} stat={stat} />
            ))}

            <Card className="md:col-span-2 xl:col-span-2">
                <CardHeader>
                    <CardTitle className="text-base">Students per Class</CardTitle>
                </CardHeader>
                <CardContent>
                    {studentsPerClass && studentsPerClass.length > 0 ? (
                        <ChartContainer config={classChartConfig} className="min-h-[240px] w-full">
                            <BarChart accessibilityLayer data={studentsPerClass}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar dataKey="count" fill="var(--color-count)" radius={[6, 6, 0, 0]} maxBarSize={48} />
                            </BarChart>
                        </ChartContainer>
                    ) : (
                        <p className="text-muted-foreground py-10 text-center text-sm">No students enrolled yet.</p>
                    )}
                </CardContent>
            </Card>

            <Card className="md:col-span-2 xl:col-span-2">
                <CardHeader>
                    <CardTitle className="text-base">Attendance Trend (14 days)</CardTitle>
                </CardHeader>
                <CardContent>
                    {attendanceTrend && attendanceTrend.length > 0 ? (
                        <ChartContainer config={attendanceChartConfig} className="min-h-[240px] w-full">
                            <BarChart accessibilityLayer data={attendanceTrend}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar dataKey="present" fill="var(--color-present)" radius={[4, 4, 0, 0]} maxBarSize={14} />
                                <Bar dataKey="late" fill="var(--color-late)" radius={[4, 4, 0, 0]} maxBarSize={14} />
                                <Bar dataKey="absent" fill="var(--color-absent)" radius={[4, 4, 0, 0]} maxBarSize={14} />
                            </BarChart>
                        </ChartContainer>
                    ) : (
                        <p className="text-muted-foreground py-10 text-center text-sm">No attendance data yet.</p>
                    )}
                </CardContent>
            </Card>

            <Card className="flex flex-col xl:col-span-2">
                <CardHeader className="items-center pb-0">
                    <CardTitle className="text-base">Fee Collection</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col items-center gap-6 pt-4">
                    <div className="relative mx-auto aspect-square max-h-[300px] min-h-[260px] w-full max-w-[300px]">
                        <ChartContainer config={feeChartConfig} className="size-full">
                            <PieChart>
                                <ChartTooltip
                                    cursor={false}
                                    wrapperStyle={{ zIndex: 50 }}
                                    content={<ChartTooltipContent hideLabel className="gap-2 px-4 py-3" />}
                                />
                                <Pie data={feeData} dataKey="value" nameKey="name" innerRadius={75} outerRadius={110} strokeWidth={6} />
                            </PieChart>
                        </ChartContainer>
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-muted-foreground text-sm">Collected</span>
                            <span className="text-2xl font-semibold">{Number(feeCollectionPercent).toFixed(1)}%</span>
                        </div>
                    </div>
                    <div className="grid w-full gap-2.5 text-sm sm:grid-cols-3">
                        <div className="flex items-center gap-2">
                            <span className="size-3 shrink-0 rounded-full bg-green-500" />
                            <span className="text-muted-foreground">Collected</span>
                            <span className="ml-auto font-medium">৳{Number(feeSummary?.collected ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="size-3 shrink-0 rounded-full bg-red-500" />
                            <span className="text-muted-foreground">Outstanding</span>
                            <span className="ml-auto font-medium">৳{Number(feeSummary?.outstanding ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="bg-muted-foreground/60 size-3 shrink-0 rounded-full" />
                            <span className="text-muted-foreground">Total Invoiced</span>
                            <span className="ml-auto font-medium">৳{Number(feeSummary?.total ?? 0).toLocaleString()}</span>
                        </div>
                    </div>
                </CardContent>
                <CardContent className="border-t pt-4">
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-muted/50 rounded-lg px-2 py-2">
                            <div className="text-lg font-semibold">৳{Number(feeSummary?.monthly_collected ?? 0).toLocaleString()}</div>
                            <div className="text-muted-foreground text-xs">This Month</div>
                        </div>
                        <div className="bg-muted/50 rounded-lg px-2 py-2">
                            <div className="text-lg font-semibold">{feeSummary?.counts.paid ?? 0}</div>
                            <div className="text-muted-foreground text-xs">Paid Invoices</div>
                        </div>
                        <div className="bg-muted/50 rounded-lg px-2 py-2">
                            <div className="text-lg font-semibold">{(feeSummary?.counts.unpaid ?? 0) + (feeSummary?.counts.partial ?? 0)}</div>
                            <div className="text-muted-foreground text-xs">Due Invoices</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="flex flex-col xl:col-span-2">
                <CardHeader className="flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base">Recent Payments</CardTitle>
                    {recentPayments && recentPayments.length > 0 && <Badge variant="secondary">{recentPayments.length} recent</Badge>}
                </CardHeader>
                <CardContent className="flex-1">
                    {recentPayments && recentPayments.length > 0 ? (
                        <div className="space-y-2.5">
                            {recentPayments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="hover:bg-muted/50 flex items-center justify-between gap-3 rounded-lg p-2 transition-colors"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="bg-primary/10 flex size-9 shrink-0 flex-col items-center justify-center rounded-lg">
                                            <span className="text-primary leading-none font-semibold">{payment.date}</span>
                                            <span className="text-primary/70 text-[10px] leading-none uppercase">{payment.month}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="truncate text-sm font-medium">{payment.student}</div>
                                            <div className="text-muted-foreground text-xs">{methodLabel(payment.method)}</div>
                                        </div>
                                    </div>
                                    <div className="font-medium whitespace-nowrap text-emerald-600 dark:text-emerald-400">
                                        ৳{payment.amount.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground py-8 text-center text-sm">No payments yet.</p>
                    )}
                </CardContent>
            </Card>

            <Card className="md:col-span-2 xl:col-span-2">
                <CardHeader>
                    <CardTitle className="text-base">Recent Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                    {recentAttendance && recentAttendance.length > 0 ? (
                        <div className="space-y-3">
                            {recentAttendance.map((record) => (
                                <div key={record.id} className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className="truncate text-sm font-medium">
                                            {record.student}
                                            <span className="text-muted-foreground ml-1 text-xs">
                                                ({record.class} {record.section})
                                            </span>
                                        </div>
                                        <div className="text-muted-foreground text-xs">{record.date}</div>
                                    </div>
                                    <Badge variant={STATUS_BADGE_VARIANTS[record.status] ?? 'secondary'}>
                                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground py-6 text-center text-sm">No attendance records yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function TeacherDashboard({ stats, sections, attendancePie, markDistribution }: DashboardProps) {
    const attendanceData = Object.entries(attendancePie ?? {}).map(([status, value]) => ({
        name: status,
        value: value as number,
        fill: `var(--color-${status})`,
    }));

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
                <StatCard key={stat.label} stat={stat} />
            ))}

            <Card className="md:col-span-2 xl:col-span-2">
                <CardHeader>
                    <CardTitle className="text-base">Today's Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={attendancePieChartConfig} className="mx-auto aspect-square max-h-[280px] min-h-[240px]">
                        <PieChart>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Pie data={attendanceData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} strokeWidth={2} />
                        </PieChart>
                    </ChartContainer>
                    <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </CardContent>
            </Card>

            <Card className="md:col-span-2 xl:col-span-2">
                <CardHeader>
                    <CardTitle className="text-base">Average Marks by Subject</CardTitle>
                </CardHeader>
                <CardContent>
                    {markDistribution && markDistribution.length > 0 ? (
                        <ChartContainer config={marksChartConfig} className="min-h-[240px] w-full">
                            <BarChart accessibilityLayer data={markDistribution} layout="vertical">
                                <CartesianGrid horizontal={false} />
                                <XAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis type="category" dataKey="name" width={130} tickLine={false} axisLine={false} tickMargin={8} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar dataKey="avg_percentage" fill="var(--color-avg_percentage)" radius={[0, 6, 6, 0]} maxBarSize={24} />
                            </BarChart>
                        </ChartContainer>
                    ) : (
                        <p className="text-muted-foreground py-10 text-center text-sm">No marks recorded yet.</p>
                    )}
                </CardContent>
            </Card>

            {sections && sections.length > 0 && (
                <Card className="md:col-span-2 xl:col-span-4">
                    <CardHeader>
                        <CardTitle className="text-base">My Sections</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {sections.map((section) => (
                                <div key={section.id} className="flex items-center justify-between rounded-lg border p-3">
                                    <div>
                                        <div className="text-sm font-medium">
                                            {section.class} - {section.name}
                                        </div>
                                        {section.is_class_teacher && (
                                            <Badge variant="secondary" className="mt-1">
                                                Class Teacher
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function StudentDashboard({ stats, attendancePie, upcomingExams, isParent, children, selectedChildId }: DashboardProps) {
    const attendanceData = Object.entries(attendancePie ?? {}).map(([status, value]) => ({
        name: status,
        value: value as number,
        fill: `var(--color-${status})`,
    }));

    function applyChild(childId: string) {
        router.get(route('dashboard'), { child_id: childId }, { preserveState: true, preserveScroll: true });
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {isParent && children && children.length > 1 && (
                <div className="md:col-span-2 xl:col-span-4">
                    <div className="w-72 space-y-2">
                        <label className="text-sm font-medium">Child</label>
                        <Combobox
                            options={children.map((c) => ({ value: String(c.id), label: `${c.name} (${c.class} - ${c.section})` }))}
                            value={selectedChildId ? String(selectedChildId) : ''}
                            onValueChange={applyChild}
                            placeholder="Select a child"
                            searchPlaceholder="Search children..."
                            emptyText="No children found."
                        />
                    </div>
                </div>
            )}
            {stats.map((stat) => (
                <StatCard key={stat.label} stat={stat} />
            ))}

            <Card className="md:col-span-2 xl:col-span-2">
                <CardHeader>
                    <CardTitle className="text-base">My Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={attendancePieChartConfig} className="mx-auto aspect-square max-h-[280px] min-h-[240px]">
                        <PieChart>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Pie data={attendanceData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} strokeWidth={2} />
                        </PieChart>
                    </ChartContainer>
                    <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </CardContent>
            </Card>

            <Card className="md:col-span-2 xl:col-span-2">
                <CardHeader>
                    <CardTitle className="text-base">Upcoming Exams</CardTitle>
                </CardHeader>
                <CardContent>
                    {upcomingExams && upcomingExams.length > 0 ? (
                        <div className="space-y-3">
                            {upcomingExams.map((exam) => (
                                <div key={exam.id} className="flex items-center gap-3 rounded-lg border p-3">
                                    <CalendarClock className="text-muted-foreground size-4 shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate text-sm font-medium">{exam.name}</div>
                                        <div className="text-muted-foreground text-xs">
                                            {exam.start_date} – {exam.end_date}
                                        </div>
                                    </div>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/report-cards`}>Report Card</Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground py-6 text-center text-sm">No upcoming exams.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function Dashboard() {
    const props = usePage<DashboardProps>().props;

    const roles = props.roles ?? [];
    const isLoading = !props.stats;

    const isAdmin = roles.some((r) => ['super-admin', 'admin'].includes(r));
    const isTeacher = roles.includes('teacher');
    const isStudentOrParent = roles.some((r) => ['student', 'parent'].includes(r));

    let content: React.ReactNode;
    if (isLoading) {
        content = <LoadingDashboard />;
    } else if (isAdmin) {
        content = <AdminDashboard {...props} />;
    } else if (isTeacher) {
        content = <TeacherDashboard {...props} />;
    } else if (isStudentOrParent) {
        content = <StudentDashboard {...props} />;
    } else {
        content = <p className="text-muted-foreground">Welcome to the school dashboard.</p>;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-2">
                    <h2 className="text-xl font-semibold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground text-sm">
                        {isAdmin ? 'Overview of your school' : isTeacher ? 'Your classes and student progress' : 'Your academic overview'}
                    </p>
                </div>
                {content}
            </div>
        </AppLayout>
    );
}
