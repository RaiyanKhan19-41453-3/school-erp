<?php

namespace App\Http\Requests;

use App\Models\SchoolClass;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateExamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('exam'));
    }

    public function rules(): array
    {
        $schoolId = $this->user()->school_id;

        return [
            'class_id' => [
                'required',
                'integer',
                Rule::exists('classes', 'id')->where(fn ($q) => $q->where('school_id', $schoolId)),
            ],
            'name' => ['required', 'string', 'max:255'],
            'grading_scale_id' => [
                'nullable',
                'integer',
                Rule::exists('grading_scales', 'id')->where(fn ($q) => $q->where('school_id', $schoolId)),
            ],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                $exam = $this->route('exam');
                $class = SchoolClass::find($this->integer('class_id'));

                if ($class && $exam && (int) $class->academic_year_id !== (int) $exam->academic_year_id) {
                    $validator->errors()->add('class_id', 'The selected class does not belong to the exam\'s academic year.');
                }
            },
        ];
    }
}
