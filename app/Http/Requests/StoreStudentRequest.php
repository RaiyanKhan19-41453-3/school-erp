<?php

namespace App\Http\Requests;

use App\Models\Section;
use App\Models\Student;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Student::class);
    }

    public function rules(): array
    {
        $schoolId = $this->user()->school_id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'admission_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('students', 'admission_number')->where('school_id', $schoolId),
            ],
            'date_of_birth' => ['required', 'date', 'before_or_equal:today'],
            'gender' => ['required', 'string', 'in:male,female,other'],
            'admission_date' => ['required', 'date'],
            'section_id' => ['required', 'integer', 'exists:sections,id'],
            'guardians' => ['required', 'array', 'min:1'],
            'guardians.*.guardian_id' => ['nullable', 'integer', 'exists:guardians,id'],
            'guardians.*.name' => ['required_without:guardians.*.guardian_id', 'nullable', 'string', 'max:255'],
            'guardians.*.phone' => ['nullable', 'string', 'max:20'],
            'guardians.*.email' => ['nullable', 'email', 'max:255'],
            'guardians.*.occupation' => ['nullable', 'string', 'max:255'],
            'guardians.*.relationship' => ['required', 'string', 'max:255'],
            'guardians.*.is_primary' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'guardians.*.name.required_without' => 'Provide a guardian name or select an existing guardian.',
            'guardians.*.relationship.required' => 'Each guardian must have a relationship.',
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if (! $this->integer('section_id')) {
                    return;
                }

                $section = Section::with('class')->find($this->integer('section_id'));

                if ($section && $section->class?->school_id !== $this->user()->school_id) {
                    $validator->errors()->add('section_id', 'The selected section is invalid.');
                }
            },
        ];
    }
}
