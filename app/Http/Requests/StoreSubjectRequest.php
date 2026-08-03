<?php

namespace App\Http\Requests;

use App\Models\Subject;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSubjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Subject::class);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('subjects')->where(fn ($q) => $q->where('school_id', $this->user()->school_id))],
            'code' => ['nullable', 'string', 'max:20', Rule::unique('subjects')->where(fn ($q) => $q->where('school_id', $this->user()->school_id))],
        ];
    }
}
