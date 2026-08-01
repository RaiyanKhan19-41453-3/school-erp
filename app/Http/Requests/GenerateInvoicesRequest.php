<?php

namespace App\Http\Requests;

use App\Models\Invoice;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GenerateInvoicesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('generate', Invoice::class);
    }

    public function rules(): array
    {
        $schoolId = $this->user()->school_id;

        return [
            'class_id' => ['required', 'integer', Rule::exists('classes', 'id')->where(fn ($q) => $q->where('school_id', $schoolId))],
            'year_id' => ['required', 'integer', Rule::exists('academic_years', 'id')->where(fn ($q) => $q->where('school_id', $schoolId))],
        ];
    }
}
