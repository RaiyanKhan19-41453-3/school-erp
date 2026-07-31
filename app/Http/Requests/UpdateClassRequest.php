<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateClassRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('class'));
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'sections' => ['required', 'array', 'min:1'],
            'sections.*.id' => ['nullable', 'integer', 'exists:sections,id'],
            'sections.*.name' => ['required', 'string', 'max:255'],
            'sections.*.capacity' => ['required', 'integer', 'min:1', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'sections.required' => 'At least one section is required.',
            'sections.*.name.required' => 'Each section must have a name.',
        ];
    }
}
