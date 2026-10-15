<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('teacher_section', function (Blueprint $table) {
            $table->unique(['staff_id', 'section_id', 'academic_year_id'], 'teacher_section_staff_section_year_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teacher_section', function (Blueprint $table) {
            $table->dropUnique('teacher_section_staff_section_year_unique');
        });
    }
};
