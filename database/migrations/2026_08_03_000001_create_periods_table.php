<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('periods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->string('name');
            $table->string('start_time');
            $table->string('end_time');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_break')->default(false);
            $table->timestamps();

            $table->index('school_id');
            $table->index('sort_order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('periods');
    }
};
