<?php

namespace App\Providers;

use App\Models\ExamSubject;
use App\Models\Section;
use App\Models\User;
use App\Policies\AttendancePolicy;
use App\Policies\MarkPolicy;
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

        Gate::define('enter-marks', function (User $user, Section $section, ExamSubject $examSubject) {
            return (new MarkPolicy)->enter($user, $section, $examSubject);
        });
    }
}
