<?php

use App\Http\Controllers\AcademicYearController;
use App\Http\Controllers\AchievementController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\ClassController;
use App\Http\Controllers\ClassSubjectController;
use App\Http\Controllers\ContactMessageController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\FeeCategoryController;
use App\Http\Controllers\FeeReportController;
use App\Http\Controllers\FeeStructureController;
use App\Http\Controllers\GalleryItemController;
use App\Http\Controllers\GradingScaleController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\MarkEntryController;
use App\Http\Controllers\NoticeController;
use App\Http\Controllers\PeriodController;
use App\Http\Controllers\PublicSiteController;
use App\Http\Controllers\ReportCardController;
use App\Http\Controllers\SchoolProfileController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\TeacherAssignmentController;
use App\Http\Controllers\TimetableController;
use Illuminate\Support\Facades\Route;

Route::get('/', [PublicSiteController::class, 'home'])->name('home');
Route::get('about', [PublicSiteController::class, 'about'])->name('site.about');
Route::get('notices', [PublicSiteController::class, 'notices'])->name('site.notices');
Route::get('notices/{notice}', [PublicSiteController::class, 'notice'])->name('site.notices.show');
Route::get('events', [PublicSiteController::class, 'events'])->name('site.events');
Route::get('gallery', [PublicSiteController::class, 'gallery'])->name('site.gallery');
Route::get('achievements', [PublicSiteController::class, 'achievements'])->name('site.achievements');
Route::get('admission', [PublicSiteController::class, 'admission'])->name('site.admission');
Route::get('contact', [PublicSiteController::class, 'contact'])->name('site.contact');
Route::post('contact', [PublicSiteController::class, 'submitContact'])
    ->middleware('throttle:5,1')
    ->name('site.contact.store');

Route::get('language/{lang}', [PublicSiteController::class, 'language'])->name('site.language');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('classes', ClassController::class)
        ->only(['index', 'create', 'store', 'update']);

    Route::post('classes/{class}/sections', [SectionController::class, 'store'])->name('classes.sections.store');
    Route::delete('sections/{section}', [SectionController::class, 'destroy'])->name('sections.destroy');
    Route::put('classes/{class}/subjects', [ClassSubjectController::class, 'sync'])->name('classes.subjects.sync');

    Route::resource('subjects', SubjectController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::resource('grading-scales', GradingScaleController::class)
        ->only(['index', 'store', 'update', 'destroy']);
    Route::post('grading-scales/{grading_scale}/bands', [GradingScaleController::class, 'storeBands'])->name('grading-scales.bands.store');

    Route::resource('periods', PeriodController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::get('timetable', [TimetableController::class, 'index'])->name('timetable.index');
    Route::post('timetable/slots', [TimetableController::class, 'store'])->name('timetable.slots.store');
    Route::put('timetable/slots/{timetable_slot}', [TimetableController::class, 'update'])->name('timetable.slots.update');
    Route::delete('timetable/slots/{timetable_slot}', [TimetableController::class, 'destroy'])->name('timetable.slots.destroy');

    Route::get('timetable/section', [TimetableController::class, 'sectionTimetable'])->name('timetable.section');
    Route::get('timetable/my', [TimetableController::class, 'myTimetable'])->name('timetable.my');

    Route::resource('exams', ExamController::class)
        ->only(['index', 'store', 'update', 'destroy']);
    Route::post('exams/{exam}/subjects', [ExamController::class, 'storeSubjects'])->name('exams.subjects.store');

    Route::resource('students', StudentController::class)
        ->only(['index', 'create', 'store', 'edit', 'update', 'show']);

    Route::get('teacher-assignments', [TeacherAssignmentController::class, 'index'])->name('teacher-assignments.index');
    Route::post('teacher-assignments', [TeacherAssignmentController::class, 'store'])->name('teacher-assignments.store');
    Route::delete('teacher-assignments/{section}/{staff}', [TeacherAssignmentController::class, 'destroy'])->name('teacher-assignments.destroy');
    Route::put('teacher-assignments/{section}/{staff}/class-teacher', [TeacherAssignmentController::class, 'setClassTeacher'])->name('teacher-assignments.set-class-teacher');

    Route::get('attendance', [AttendanceController::class, 'index'])->name('attendance.index');
    Route::post('attendance', [AttendanceController::class, 'store'])->name('attendance.store');

    Route::get('marks/entry', [MarkEntryController::class, 'index'])->name('mark-entry.index');
    Route::post('marks/entry', [MarkEntryController::class, 'store'])->name('mark-entry.store');

    Route::get('report-cards', [ReportCardController::class, 'index'])->name('report-cards.index');
    Route::get('report-cards/{exam}/{student}', [ReportCardController::class, 'show'])->name('report-cards.show');
    Route::get('report-cards/{exam}/{student}/pdf', [ReportCardController::class, 'pdf'])->name('report-cards.pdf');

    Route::get('academic-years', [AcademicYearController::class, 'index'])->name('academic-years.index');
    Route::post('academic-years', [AcademicYearController::class, 'store'])->name('academic-years.store');
    Route::put('academic-years/{academicYear}/activate', [AcademicYearController::class, 'activate'])->name('academic-years.activate');

    Route::resource('fee-categories', FeeCategoryController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::resource('fee-structures', FeeStructureController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::get('invoices/generate', [InvoiceController::class, 'generate'])->name('invoices.generate');
    Route::post('invoices/generate', [InvoiceController::class, 'store'])->name('invoices.generate.store');
    Route::get('invoices', [InvoiceController::class, 'index'])->name('invoices.index');
    Route::get('invoices/my', [InvoiceController::class, 'myInvoices'])->name('invoices.my');
    Route::get('invoices/{invoice}', [InvoiceController::class, 'show'])->name('invoices.show');
    Route::post('invoices/{invoice}/payments', [InvoiceController::class, 'recordPayment'])->name('invoices.payments.store');

    Route::get('reports/fee-dues', [FeeReportController::class, 'dues'])->name('reports.fee-dues');
    Route::get('reports/fee-dues/export', [FeeReportController::class, 'exportDues'])->name('reports.fee-dues.export');
    Route::get('reports/fee-collection', [FeeReportController::class, 'collection'])->name('reports.fee-collection');
    Route::get('reports/fee-collection/export', [FeeReportController::class, 'exportCollection'])->name('reports.fee-collection.export');

    Route::prefix('website')->name('website.')->group(function () {
        Route::resource('notices', NoticeController::class)
            ->only(['index', 'store', 'update', 'destroy']);

        Route::resource('events', EventController::class)
            ->only(['index', 'store', 'update', 'destroy']);

        Route::resource('achievements', AchievementController::class)
            ->only(['index', 'store', 'update', 'destroy']);

        Route::resource('gallery-items', GalleryItemController::class)
            ->only(['index', 'store', 'update', 'destroy']);

        Route::get('content', [SchoolProfileController::class, 'edit'])->name('content.edit');
        Route::put('content', [SchoolProfileController::class, 'update'])->name('content.update');

        Route::get('messages', [ContactMessageController::class, 'index'])->name('messages.index');
        Route::put('messages/{contact_message}', [ContactMessageController::class, 'update'])->name('messages.update');
        Route::delete('messages/{contact_message}', [ContactMessageController::class, 'destroy'])->name('messages.destroy');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
