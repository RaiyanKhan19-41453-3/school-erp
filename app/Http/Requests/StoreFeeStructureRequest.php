<?php

namespace App\Http\Requests;

use App\Models\AcademicYear;
use App\Models\FeeStructure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFeeStructureRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', FeeStructure::class);
    }

    public function rules(): array
    {
        $schoolId = $this->user()->school_id;
        $academicYearId = AcademicYear::where('school_id', $schoolId)
            ->where('is_current', true)
            ->value('id');

        return [
            'class_id' => ['required', 'integer', Rule::exists('classes', 'id')->where(fn ($q) => $q->where('school_id', $schoolId))],
            'fee_category_id' => ['required', 'integer', Rule::exists('fee_categories', 'id')->where(fn ($q) => $q->where('school_id', $schoolId))],
            'amount' => ['required', 'numeric', 'min:0.01', 'max:9999999.99'],
            'frequency' => ['required', Rule::in(FeeStructure::frequencies())],
            'due_day' => ['nullable', 'integer', 'between:1,31'],
            'academic_year_id' => ['required', 'integer', Rule::exists('academic_years', 'id')->where(fn ($q) => $q->where('school_id', $schoolId))],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'academic_year_id' => AcademicYear::where('school_id', $this->user()->school_id)
                ->where('is_current', true)
                ->value('id'),
        ]);
    }
}
