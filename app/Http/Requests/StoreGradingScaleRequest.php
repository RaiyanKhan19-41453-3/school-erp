<?php

namespace App\Http\Requests;

use App\Models\GradingScale;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreGradingScaleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', GradingScale::class);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('grading_scales')->where(fn ($q) => $q->where('school_id', $this->user()->school_id))],
        ];
    }
}
