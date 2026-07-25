<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->string('employee_id')->unique();
            $table->string('designation');
            $table->date('joining_date');
            $table->timestamps();
            $table->softDeletes();

            $table->index('school_id');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff');
    }
};
