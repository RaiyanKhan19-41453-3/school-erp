<?php

namespace App\Http\Requests;

use App\Models\Period;
use App\Models\TimetableSlot;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTimetableSlotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', TimetableSlot::class);
    }

    public function rules(): array
    {
        $period = Period::where('school_id', $this->user()->school_id)
            ->find($this->integer('period_id'));

        $subjectRule = $period?->is_break ? ['nullable', 'exists:subjects,id'] : ['required', 'exists:subjects,id'];
        $staffRule = $period?->is_break ? ['nullable', 'exists:staff,id'] : ['required', 'exists:staff,id'];

        return [
            'section_id' => ['required', 'integer', 'exists:sections,id'],
            'academic_year_id' => ['required', 'integer', 'exists:academic_years,id'],
            'period_id' => ['required', 'integer', 'exists:periods,id'],
            'day_of_week' => ['required', Rule::in(TimetableSlot::days())],
            'subject_id' => $subjectRule,
            'staff_id' => $staffRule,
            'room' => ['nullable', 'string', 'max:255'],
            'force' => ['sometimes', 'boolean'],
        ];
    }
}
