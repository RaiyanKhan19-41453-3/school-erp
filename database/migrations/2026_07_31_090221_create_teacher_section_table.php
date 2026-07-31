<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teacher_section', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->constrained('staff')->cascadeOnDelete();
            $table->foreignId('section_id')->constrained('sections')->cascadeOnDelete();
            $table->foreignId('academic_year_id')->constrained('academic_years')->cascadeOnDelete();
            $table->boolean('is_class_teacher')->default(false);
            $table->timestamps();

            $table->index('staff_id');
            $table->index('section_id');
            $table->index('academic_year_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_section');
    }
};
