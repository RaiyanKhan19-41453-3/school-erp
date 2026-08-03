<?php

namespace App\Http\Requests;

use App\Models\Subject;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SyncClassSubjectsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('assign', Subject::class);
    }

    public function rules(): array
    {
        return [
            'subject_ids' => ['required', 'array'],
            'subject_ids.*' => [
                'integer',
                Rule::exists('subjects', 'id')->where(fn ($q) => $q->where('school_id', $this->user()->school_id)),
            ],
        ];
    }
}
