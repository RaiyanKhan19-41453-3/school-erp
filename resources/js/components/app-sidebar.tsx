import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Award,
    BookOpen,
    CalendarCheck,
    CalendarCheck2,
    CalendarClock,
    ClipboardList,
    Clock,
    FileText,
    Folder,
    GraduationCap,
    LayoutGrid,
    ListChecks,
    PencilLine,
    ReceiptText,
    UserCog,
    Users,
    Wallet,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Classes',
        url: '/classes',
        icon: GraduationCap,
    },
    {
        title: 'Students',
        url: '/students',
        icon: Users,
    },
    {
        title: 'Attendance',
        url: '/attendance',
        icon: CalendarCheck,
    },
];

const staffNavItems: NavItem[] = [
    {
        title: 'Mark Entry',
        url: '/marks/entry',
        icon: PencilLine,
    },
    {
        title: 'Report Cards',
        url: '/report-cards',
        icon: Award,
    },
];

const teacherNavItems: NavItem[] = [
    {
        title: 'My Timetable',
        url: '/timetable/my',
        icon: CalendarClock,
    },
];

const adminNavItems: NavItem[] = [
    {
        title: 'Teacher Assignments',
        url: '/teacher-assignments',
        icon: UserCog,
    },
    {
        title: 'Academic Years',
        url: '/academic-years',
        icon: CalendarCheck2,
    },
    {
        title: 'Subjects',
        url: '/subjects',
        icon: BookOpen,
    },
    {
        title: 'Grading Scales',
        url: '/grading-scales',
        icon: ListChecks,
    },
    {
        title: 'Periods',
        url: '/periods',
        icon: Clock,
    },
    {
        title: 'Timetable',
        url: '/timetable',
        icon: CalendarClock,
    },
    {
        title: 'Exams',
        url: '/exams',
        icon: ClipboardList,
    },
    {
        title: 'Fee Categories',
        url: '/fee-categories',
        icon: Wallet,
    },
    {
        title: 'Fee Structures',
        url: '/fee-structures',
        icon: ReceiptText,
    },
    {
        title: 'Invoices',
        url: '/invoices',
        icon: FileText,
    },
];

const studentParentNavItems: NavItem[] = [
    {
        title: 'My Invoices',
        url: '/invoices/my',
        icon: FileText,
    },
    {
        title: 'Report Cards',
        url: '/report-cards',
        icon: Award,
    },
    {
        title: 'Timetable',
        url: '/timetable/section',
        icon: CalendarClock,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        url: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        url: 'https://laravel.com/docs/starter-kits',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const roles = usePage<{ auth: { roles?: string[] } }>().props.auth.roles ?? [];
    const isAdmin = roles.some((r) => ['super-admin', 'admin'].includes(r));
    const isStudentOrParent = roles.some((r) => ['student', 'parent'].includes(r));
    const isStaff = roles.some((r) => ['super-admin', 'admin', 'teacher'].includes(r));
    const isTeacher = roles.some((r) => r === 'teacher');

    const extraNav = isAdmin ? adminNavItems : isStudentOrParent ? studentParentNavItems : [];
    const staffNav = isStaff ? staffNavItems : [];
    const teacherNav = isTeacher ? teacherNavItems : [];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={[...mainNavItems, ...staffNav, ...teacherNav, ...extraNav]} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
