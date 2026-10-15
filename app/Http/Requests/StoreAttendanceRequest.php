<?php

namespace App\Http\Requests;

use App\Models\Attendance;
use App\Models\Section;
use App\Models\Student;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['super-admin', 'admin', 'teacher']);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'section_id' => ['required', 'integer', 'exists:sections,id'],
            'date' => ['required', 'date'],
            'records' => ['required', 'array', 'min:1'],
            'records.*.student_id' => ['required', 'integer', 'exists:students,id'],
            'records.*.status' => ['required', Rule::in(Attendance::statuses())],
            'records.*.remarks' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                $section = Section::with('class')->find($this->integer('section_id'));

                if ($section && $section->class?->school_id !== $this->user()->school_id) {
                    $validator->errors()->add('section_id', 'The selected section is invalid.');
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
