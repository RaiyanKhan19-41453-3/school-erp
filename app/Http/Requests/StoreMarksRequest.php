<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMarksRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['super-admin', 'admin', 'teacher']);
    }

    public function rules(): array
    {
        return [
            'section_id' => ['required', 'integer', 'exists:sections,id'],
            'exam_subject_id' => ['required', 'integer', 'exists:exam_subjects,id'],
            'records' => ['required', 'array', 'min:1'],
            'records.*.student_id' => ['required', 'integer', 'exists:students,id'],
            'records.*.marks_obtained' => ['required', 'numeric', 'min:0'],
            'records.*.remarks' => ['nullable', 'string', 'max:255'],
        ];
    }
}
