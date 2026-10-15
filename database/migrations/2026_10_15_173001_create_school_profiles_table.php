<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('school_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('tagline')->nullable();
            $table->string('hero_title')->nullable();
            $table->string('hero_subtitle')->nullable();
            $table->text('about')->nullable();
            $table->text('history')->nullable();
            $table->text('mission')->nullable();
            $table->text('vision')->nullable();
            $table->string('principal_name')->nullable();
            $table->text('principal_message')->nullable();
            $table->text('admission_info')->nullable();
            $table->json('admission_requirements')->nullable();
            $table->json('admission_steps')->nullable();
            $table->json('stats')->nullable();
            $table->string('facebook_url')->nullable();
            $table->string('youtube_url')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('school_profiles');
    }
};
