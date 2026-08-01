<?php

namespace App\Http\Requests;

use App\Models\Payment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $invoice = $this->route('invoice');

        return $this->user()->can('recordPayment', $invoice);
    }

    public function rules(): array
    {
        $invoice = $this->route('invoice');
        $balanceDue = (float) $invoice->balanceDue();

        return [
            'amount' => ['required', 'numeric', 'gt:0', 'max:'.$balanceDue],
            'payment_method' => ['required', Rule::in(Payment::methods())],
            'remarks' => ['nullable', 'string', 'max:255'],
            'paid_at' => ['nullable', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'amount.max' => 'The payment amount cannot exceed the remaining balance due.',
        ];
    }
}
