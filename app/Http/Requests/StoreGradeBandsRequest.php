<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreGradeBandsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('grading_scale'));
    }

    public function rules(): array
    {
        return [
            'bands' => ['required', 'array', 'min:1'],
            'bands.*.label' => ['required', 'string', 'max:255'],
            'bands.*.min_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
            'bands.*.max_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
            'bands.*.grade_point' => ['nullable', 'numeric', 'min:0', 'max:10'],
            'bands.*.remarks' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                $bands = $this->input('bands');

                foreach ($bands as $index => $band) {
                    if ((float) $band['min_percentage'] > (float) $band['max_percentage']) {
                        $validator->errors()->add("bands.{$index}.max_percentage", 'Max percentage must be greater than or equal to the min percentage.');
                    }
                }

                $sorted = collect($bands)
                    ->sortBy('min_percentage')
                    ->values();

                for ($i = 0; $i < $sorted->count() - 1; $i++) {
                    $current = $sorted[$i];
                    $next = $sorted[$i + 1];

                    if ((float) $next['min_percentage'] <= (float) $current['max_percentage']) {
                        $validator->errors()->add('bands', "The range \"{$current['label']}\" overlaps with \"{$next['label']}\". Ranges within a scale must not overlap.");
                    }
                }
            },
        ];
    }
}
