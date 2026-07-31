<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTeacherAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['super-admin', 'admin']);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'section_id' => ['required', 'integer', 'exists:sections,id'],
            'staff_id' => ['required', 'integer', 'exists:staff,id'],
            'is_class_teacher' => ['sometimes', 'boolean'],
        ];
    }
}
