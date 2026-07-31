<?php

namespace App\Providers;

use App\Models\Section;
use App\Models\User;
use App\Policies\AttendancePolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::define('mark-attendance', function (User $user, Section $section, string $date) {
            return (new AttendancePolicy)->mark($user, $section, $date);
        });
    }
}
