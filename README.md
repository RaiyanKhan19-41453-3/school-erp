# School ERP - School Management System

A comprehensive School ERP (Enterprise Resource Planning) system built for Bangladeshi educational institutions. Manage students, teachers, attendance, exams, fees, timetables, and report cards — all in one place.

## Features

### Student Management
- Student registration and profiles
- Admission number tracking
- Parent/guardian linkage
- Class and section assignment

### Teacher & Staff Management
- Teacher profiles with employee IDs
- Class teacher assignments
- Subject teacher mapping
- Designation and joining date tracking

### Academic Management
- **Classes & Sections** — Create classes (Class 1–5) with multiple sections
- **Subjects** — Assign subjects per class (Bangla, English, Mathematics, Science, ICT, etc.)
- **Academic Years** — Manage academic sessions with current year activation
- **Teacher Assignments** — Assign teachers to sections with class teacher designation

### Attendance
- Daily attendance marking (Present, Absent, Late, Leave)
- Per-section attendance view
- Student attendance history
- Attendance statistics

### Examination & Grading
- **Exams** — Create exams (1st Term, 2nd Term, Final) with date ranges
- **Exam Subjects** — Configure full marks and pass marks per subject
- **Grading Scales** — Custom grading scales (Standard A–F, Honors, GPA-based)
- **Grade Bands** — Define grade labels, min/max percentages, grade points, and remarks
- **Mark Entry** — Enter marks per student per exam subject
- **Report Cards** — View and generate PDF report cards

### Timetable
- **Period Management** — Define school periods with time slots
- **Timetable Builder** — Create weekly timetables per section (admin)
- **Section Timetable** — Read-only view for students and parents
- **My Timetable** — Personal timetable view for teachers

### Fee & Invoice Management
- **Fee Categories** — Tuition, Session, Library, Lab fees
- **Fee Structures** — Per-class fee configuration with frequency (monthly/annual/one-time)
- **Invoice Generation** — Bulk invoice creation for students
- **Payment Recording** — Track payments with method and status
- **My Invoices** — Parent/student invoice view

### Dashboard
- Overview with key statistics
- Role-based sidebar navigation

### User Roles
| Role | Access |
|------|--------|
| Super Admin | Full access to all modules |
| Admin | Academic management, timetable builder, reports |
| Teacher | Attendance, mark entry, my timetable, report cards |
| Student | View own attendance, timetable, report cards |
| Parent | View child's attendance, invoices, report cards |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Laravel 12, PHP 8.2 |
| Frontend | React 19, Inertia.js 2 |
| UI | Tailwind CSS 4, Radix UI, Lucide Icons |
| Database | SQLite (default), MySQL/PostgreSQL supported |
| PDF | DomPDF |
| Permissions | Spatie Laravel Permission |
| Testing | Pest 3 |

## Installation

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- npm

### Setup

```bash
# Clone the repository
git clone https://github.com/RaiyanKhan19-41453-3/school-erp.git
cd school-erp

# Install PHP dependencies
composer install

# Install JS dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run migrations and seed demo data
php artisan migrate:fresh --seed

# Build frontend assets
npm run build

# Start the development server
composer run dev
```

The app will be available at `http://localhost:8000`.

### Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@school-erp.test | password |
| Teacher | fatema@school-erp.test | password |
| Parent | parent@school-erp.test | password |
| Student | student@school-erp.test | password |

## Demo Data

The seeder includes realistic Bangladeshi demo data:

- **School**: Dhaka Ideal School & College, Dhanmondi, Dhaka
- **Teachers**: 8 Bangladeshi names (Fatema Begum, Abdul Karim Chowdhury, etc.)
- **Students**: 48 students with Bengali names
- **Guardians**: 30 guardians with Bangladeshi occupations
- **Subjects**: Bangla, English, Mathematics, General Science, ICT, Islam & Moral Education, Bangladesh & Global Studies
- **Fees**: BDT amounts (Tuition 5,000/month, Session 2,000/year, Lab 800/month)
- **Exams**: 3 exams with marks and grading

## Development

```bash
# Run all checks (formatting, tests)
vendor/bin/pint --dirty --format agent
php artisan test --compact

# Lint frontend
npm run lint

# Format frontend
npm run format
```

## License

MIT License.
