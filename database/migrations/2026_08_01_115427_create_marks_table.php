<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('marks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_subject_id')->constrained('exam_subjects')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->decimal('marks_obtained', 7, 2);
            $table->foreignId('entered_by')->constrained('users')->cascadeOnDelete();
            $table->string('remarks')->nullable();
            $table->timestamps();

            $table->unique(['exam_subject_id', 'student_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marks');
    }
};
