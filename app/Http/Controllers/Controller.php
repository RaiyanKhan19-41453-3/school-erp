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

    /**
     * Safely read a query-string value as a Y-m-d date string.
     *
     * Non-string or malformed input falls back to null.
     */
    protected function queryDate(string $key): ?string
    {
        $value = $this->queryString($key, '', 10);

        return preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) === 1 ? $value : null;
    }
}
