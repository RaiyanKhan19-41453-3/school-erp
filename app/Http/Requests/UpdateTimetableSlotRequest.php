<?php

namespace App\Http\Requests;

use App\Models\Period;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTimetableSlotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('timetable_slot'));
    }

    public function rules(): array
    {
        $period = Period::where('school_id', $this->user()->school_id)
            ->find($this->integer('period_id'));

        $subjectRule = $period?->is_break ? ['nullable', 'exists:subjects,id'] : ['required', 'exists:subjects,id'];
        $staffRule = $period?->is_break ? ['nullable', 'exists:staff,id'] : ['required', 'exists:staff,id'];

        return [
            'period_id' => ['required', 'integer', 'exists:periods,id'],
            'day_of_week' => ['required', Rule::in(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])],
            'subject_id' => $subjectRule,
            'staff_id' => $staffRule,
            'room' => ['nullable', 'string', 'max:255'],
            'force' => ['sometimes', 'boolean'],
        ];
    }
}
