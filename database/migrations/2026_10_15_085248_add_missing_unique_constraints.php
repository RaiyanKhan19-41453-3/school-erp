<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // admission_number must be unique per school, not globally.
        Schema::table('students', function (Blueprint $table) {
            $table->dropUnique(['admission_number']);
        });
        Schema::table('students', function (Blueprint $table) {
            $table->unique(['school_id', 'admission_number'], 'students_school_admission_unique');
        });

        // Prevent double-charging the same category twice.
        Schema::table('fee_structures', function (Blueprint $table) {
            $table->unique(['class_id', 'fee_category_id', 'academic_year_id'], 'fee_structures_class_category_year_unique');
        });

        // employee_id unique per school.
        Schema::table('staff', function (Blueprint $table) {
            $table->dropUnique(['employee_id']);
        });
        Schema::table('staff', function (Blueprint $table) {
            $table->unique(['school_id', 'employee_id'], 'staff_school_employee_unique');
        });

        // Academic year name unique per school.
        Schema::table('academic_years', function (Blueprint $table) {
            $table->unique(['school_id', 'name'], 'academic_years_school_name_unique');
        });

        // Class name unique per school+year.
        Schema::table('classes', function (Blueprint $table) {
            $table->unique(['school_id', 'academic_year_id', 'name'], 'classes_school_year_name_unique');
        });

        // marks.entered_by should not wipe history when a user is deleted.
        if (DB::getDriverName() !== 'sqlite') {
            Schema::table('marks', function (Blueprint $table) {
                $table->unsignedBigInteger('entered_by')->nullable()->change();
                $table->dropForeign(['entered_by']);
            });
            Schema::table('marks', function (Blueprint $table) {
                $table->foreign('entered_by')->references('id')->on('users')->nullOnDelete();
            });

            // Timetable history should survive subject/staff deletion.
            Schema::table('timetable_slots', function (Blueprint $table) {
                $table->dropForeign(['subject_id']);
                $table->dropForeign(['staff_id']);
            });
            Schema::table('timetable_slots', function (Blueprint $table) {
                $table->foreign('subject_id')->references('id')->on('subjects')->nullOnDelete();
                $table->foreign('staff_id')->references('id')->on('staff')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropUnique('students_school_admission_unique');
        });
        Schema::table('students', function (Blueprint $table) {
            $table->unique('admission_number');
        });

        Schema::table('fee_structures', function (Blueprint $table) {
            $table->dropUnique('fee_structures_class_category_year_unique');
        });

        Schema::table('staff', function (Blueprint $table) {
            $table->dropUnique('staff_school_employee_unique');
        });
        Schema::table('staff', function (Blueprint $table) {
            $table->unique('employee_id');
        });

        Schema::table('academic_years', function (Blueprint $table) {
            $table->dropUnique('academic_years_school_name_unique');
        });

        Schema::table('classes', function (Blueprint $table) {
            $table->dropUnique('classes_school_year_name_unique');
        });
    }
};
