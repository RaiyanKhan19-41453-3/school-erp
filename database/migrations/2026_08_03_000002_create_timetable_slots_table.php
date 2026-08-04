<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('timetable_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('section_id')->constrained('sections')->cascadeOnDelete();
            $table->foreignId('academic_year_id')->constrained('academic_years')->cascadeOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->cascadeOnDelete();
            $table->foreignId('staff_id')->nullable()->constrained('staff')->cascadeOnDelete();
            $table->foreignId('period_id')->constrained('periods')->cascadeOnDelete();
            $table->enum('day_of_week', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
            $table->string('room')->nullable();
            $table->timestamps();

            $table->unique(['section_id', 'period_id', 'day_of_week'], 'timetable_slots_section_period_day_unique');

            $table->index('academic_year_id');
            $table->index('subject_id');
            $table->index('staff_id');
            $table->index('period_id');
            $table->index('day_of_week');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('timetable_slots');
    }
};
