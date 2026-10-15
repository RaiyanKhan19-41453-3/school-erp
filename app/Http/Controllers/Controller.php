<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

abstract class Controller
{
    use AuthorizesRequests;

    /**
     * Safely read a query-string value as a length-limited string.
     *
     * Array-style input (e.g. ?search[]=x) falls back to the default
     * instead of raising an array-to-string conversion error.
     */
    protected function queryString(string $key, string $default = '', int $maxLength = 100): string
    {
        $value = request()->query($key);

        if (! is_string($value)) {
            return $default;
        }

        return mb_substr($value, 0, $maxLength);
    }
}
