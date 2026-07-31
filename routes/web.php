<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\ClassController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\TeacherAssignmentController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('classes', ClassController::class)
        ->only(['index', 'create', 'store', 'update']);

    Route::post('classes/{class}/sections', [SectionController::class, 'store'])->name('classes.sections.store');
    Route::delete('sections/{section}', [SectionController::class, 'destroy'])->name('sections.destroy');

    Route::resource('students', StudentController::class)
        ->only(['index', 'create', 'store', 'edit', 'update', 'show']);

    Route::get('teacher-assignments', [TeacherAssignmentController::class, 'index'])->name('teacher-assignments.index');
    Route::post('teacher-assignments', [TeacherAssignmentController::class, 'store'])->name('teacher-assignments.store');
    Route::delete('teacher-assignments/{section}/{staff}', [TeacherAssignmentController::class, 'destroy'])->name('teacher-assignments.destroy');
    Route::put('teacher-assignments/{section}/{staff}/class-teacher', [TeacherAssignmentController::class, 'setClassTeacher'])->name('teacher-assignments.set-class-teacher');

    Route::get('attendance', [AttendanceController::class, 'index'])->name('attendance.index');
    Route::post('attendance', [AttendanceController::class, 'store'])->name('attendance.store');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
