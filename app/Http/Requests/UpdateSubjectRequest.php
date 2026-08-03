<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSubjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('subject'));
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('subjects')->ignore($this->route('subject')->id)->where(fn ($q) => $q->where('school_id', $this->user()->school_id))],
            'code' => ['nullable', 'string', 'max:20', Rule::unique('subjects')->ignore($this->route('subject')->id)->where(fn ($q) => $q->where('school_id', $this->user()->school_id))],
        ];
    }
}
