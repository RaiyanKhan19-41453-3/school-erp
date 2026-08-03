<?php

namespace App\Http\Requests;

use App\Models\Exam;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Exam::class);
    }

    public function rules(): array
    {
        $schoolId = $this->user()->school_id;

        return [
            'academic_year_id' => [
                'required',
                'integer',
                Rule::exists('academic_years', 'id')->where(fn ($q) => $q->where('school_id', $schoolId)),
            ],
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
}
