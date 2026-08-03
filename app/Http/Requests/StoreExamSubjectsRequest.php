<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreExamSubjectsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('exam'));
    }

    public function rules(): array
    {
        $schoolId = $this->user()->school_id;

        return [
            'subjects' => ['array'],
            'subjects.*.subject_id' => [
                'required',
                'integer',
                Rule::exists('subjects', 'id')->where(fn ($q) => $q->where('school_id', $schoolId)),
            ],
            'subjects.*.full_marks' => ['required', 'numeric', 'gt:0'],
            'subjects.*.pass_marks' => ['required', 'numeric', 'gte:0'],
            'subjects.*.exam_date' => ['nullable', 'date'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                $exam = $this->route('exam');
                $assignedSubjectIds = $exam->class->subjects()->pluck('subjects.id');

                foreach ($this->input('subjects') as $index => $subject) {
                    if (! $assignedSubjectIds->contains($subject['subject_id'])) {
                        $validator->errors()->add(
                            "subjects.{$index}.subject_id",
                            'The selected subject is not assigned to this class.',
                        );
                    }

                    if ((float) $subject['pass_marks'] > (float) $subject['full_marks']) {
                        $validator->errors()->add(
                            "subjects.{$index}.pass_marks",
                            'Pass marks must not exceed full marks.',
                        );
                    }
                }
            },
        ];
    }
}
