<?php

namespace App\Http\Requests;

use App\Models\AcademicYear;
use App\Models\SchoolClass;
use Illuminate\Foundation\Http\FormRequest;

class StoreClassRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', SchoolClass::class);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'sections' => ['required', 'array', 'min:1'],
            'sections.*.name' => ['required', 'string', 'max:255'],
            'sections.*.capacity' => ['required', 'integer', 'min:1', 'max:100'],
            'academic_year_id' => ['required', 'integer', 'exists:academic_years,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'sections.required' => 'At least one section is required.',
            'sections.*.name.required' => 'Each section must have a name.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'school_id' => $this->user()->school_id,
            'academic_year_id' => $this->getCurrentAcademicYearId(),
        ]);
    }

    private function getCurrentAcademicYearId(): ?int
    {
        return AcademicYear::where('school_id', $this->user()->school_id)
            ->where('is_current', true)
            ->value('id');
    }
}
