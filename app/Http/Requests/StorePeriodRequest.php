<?php

namespace App\Http\Requests;

use App\Models\Period;
use Illuminate\Foundation\Http\FormRequest;

class StorePeriodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Period::class);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_break' => ['boolean'],
        ];
    }
}
