<?php

namespace App\Http\Requests;

use App\Models\FeeCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFeeCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', FeeCategory::class);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('fee_categories')->where(fn ($q) => $q->where('school_id', $this->user()->school_id))],
        ];
    }
}
