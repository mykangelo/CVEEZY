<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class StrongPassword implements ValidationRule
{
    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $password = (string) $value;

        // Check minimum length
        if (strlen($password) < 12) {
            $fail('The :attribute must be at least 12 characters long.');
            return;
        }

        // Check for at least one uppercase letter
        if (!preg_match('/[A-Z]/', $password)) {
            $fail('The :attribute must contain at least one uppercase letter.');
            return;
        }

        // Check for at least one special character
        if (!preg_match('/[^A-Za-z0-9]/', $password)) {
            $fail('The :attribute must contain at least one special character.');
            return;
        }
    }
}
