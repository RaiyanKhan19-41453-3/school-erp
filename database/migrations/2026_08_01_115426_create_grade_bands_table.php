<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grade_bands', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grading_scale_id')->constrained('grading_scales')->cascadeOnDelete();
            $table->string('label');
            $table->decimal('min_percentage', 5, 2);
            $table->decimal('max_percentage', 5, 2);
            $table->decimal('grade_point', 3, 2)->nullable();
            $table->string('remarks')->nullable();
            $table->timestamps();

            $table->index('grading_scale_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grade_bands');
    }
};
