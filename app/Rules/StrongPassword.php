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

        // Check for at least one lowercase letter
        if (!preg_match('/[a-z]/', $password)) {
            $fail('The :attribute must contain at least one lowercase letter.');
            return;
        }

        // Check for at least one number
        if (!preg_match('/[0-9]/', $password)) {
            $fail('The :attribute must contain at least one number.');
            return;
        }

        // Check for at least one special character
        if (!preg_match('/[^A-Za-z0-9]/', $password)) {
            $fail('The :attribute must contain at least one special character.');
            return;
        }

        // Check for common weak passwords
        $weakPasswords = [
            'password', '123456', 'qwerty', 'admin', 'welcome',
            'letmein', 'monkey', 'dragon', 'master', 'football'
        ];

        if (in_array(strtolower($password), $weakPasswords)) {
            $fail('The :attribute is too common. Please choose a more unique password.');
            return;
        }

        // Check for sequential characters
        if (preg_match('/(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789|012)/i', $password)) {
            $fail('The :attribute contains sequential characters which are not allowed.');
            return;
        }

        // Check for repeated characters
        if (preg_match('/(.)\1{2,}/', $password)) {
            $fail('The :attribute contains too many repeated characters.');
            return;
        }
    }
}
