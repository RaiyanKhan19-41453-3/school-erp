<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateGradingScaleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('grading_scale'));
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('grading_scales')->ignore($this->route('grading_scale')->id)->where(fn ($q) => $q->where('school_id', $this->user()->school_id))],
        ];
    }
}
