<?php

namespace App\Http\Requests;

use App\Models\ExamSubject;
use App\Models\Section;
use App\Models\Student;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

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

    public function after(): array
    {
        return [
            function (Validator $validator) {
                $section = Section::with('class')->find($this->integer('section_id'));
                $examSubject = ExamSubject::with('exam')->find($this->integer('exam_subject_id'));

                if ($section && $section->class?->school_id !== $this->user()->school_id) {
                    $validator->errors()->add('section_id', 'The selected section is invalid.');
                }

                if ($examSubject && $examSubject->exam?->school_id !== $this->user()->school_id) {
                    $validator->errors()->add('exam_subject_id', 'The selected exam subject is invalid.');
                }

                if ($section && $examSubject && $examSubject->exam
                    && $section->class_id !== $examSubject->exam->class_id) {
                    $validator->errors()->add('exam_subject_id', 'The exam does not belong to the section\'s class.');
                }

                if (! $section) {
                    return;
                }

                $studentIds = collect($this->input('records', []))->pluck('student_id')->filter()->all();

                if (empty($studentIds)) {
                    return;
                }

                $validCount = Student::where('school_id', $this->user()->school_id)
                    ->where('section_id', $section->id)
                    ->whereIn('id', $studentIds)
                    ->count();

                if ($validCount !== count(array_unique($studentIds))) {
                    $validator->errors()->add('records', 'Each student must belong to the selected section.');
                }
            },
        ];
    }
}
