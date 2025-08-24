<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Authentication Security Settings
    |--------------------------------------------------------------------------
    |
    | This file contains all security-related configuration for your application.
    | These settings help protect against various security threats.
    |
    */

    'password' => [
        'min_length' => env('PASSWORD_MIN_LENGTH', 12),
        'require_uppercase' => env('PASSWORD_REQUIRE_UPPERCASE', true),
        'require_lowercase' => env('PASSWORD_REQUIRE_LOWERCASE', true),
        'require_numbers' => env('PASSWORD_REQUIRE_NUMBERS', true),
        'require_symbols' => env('PASSWORD_REQUIRE_SYMBOLS', true),
        'prevent_common' => env('PASSWORD_PREVENT_COMMON', true),
        'prevent_sequential' => env('PASSWORD_PREVENT_SEQUENTIAL', true),
        'prevent_repeated' => env('PASSWORD_PREVENT_REPEATED', true),
    ],

    'login' => [
        'max_attempts' => env('LOGIN_MAX_ATTEMPTS', 5),
        'lockout_duration' => env('LOGIN_LOCKOUT_DURATION', 60), // seconds
        'lockout_window' => env('LOGIN_LOCKOUT_WINDOW', 300), // seconds
        'require_email_verification' => env('LOGIN_REQUIRE_EMAIL_VERIFICATION', false), // Changed to false
    ],

    'session' => [
        'lifetime' => env('SESSION_LIFETIME', 60), // minutes
        'expire_on_close' => env('SESSION_EXPIRE_ON_CLOSE', true),
        'secure_cookies' => env('SESSION_SECURE_COOKIE', true),
        'http_only' => env('SESSION_HTTP_ONLY', true),
        'same_site' => env('SESSION_SAME_SITE', 'strict'),
        'regenerate_on_login' => env('SESSION_REGENERATE_ON_LOGIN', true),
        'regenerate_on_logout' => env('SESSION_REGENERATE_ON_LOGOUT', true),
    ],

    'rate_limiting' => [
        'enabled' => env('RATE_LIMITING_ENABLED', true),
        'default_max_attempts' => env('RATE_LIMIT_DEFAULT_MAX', 60),
        'default_decay_minutes' => env('RATE_LIMIT_DEFAULT_DECAY', 1),
        'login_max_attempts' => env('RATE_LIMIT_LOGIN_MAX', 5),
        'login_decay_minutes' => env('RATE_LIMIT_LOGIN_DECAY', 1),
        'api_max_attempts' => env('RATE_LIMIT_API_MAX', 100),
        'api_decay_minutes' => env('RATE_LIMIT_API_DECAY', 1),
    ],

    'email_verification' => [
        'required' => env('EMAIL_VERIFICATION_REQUIRED', false), // Changed to false
        'expiry_hours' => env('EMAIL_VERIFICATION_EXPIRY', 24),
        'throttle_attempts' => env('EMAIL_VERIFICATION_THROTTLE', 6),
        'throttle_decay_minutes' => env('EMAIL_VERIFICATION_THROTTLE_DECAY', 1),
    ],

    'password_reset' => [
        'expiry_minutes' => env('PASSWORD_RESET_EXPIRY', 60),
        'throttle_seconds' => env('PASSWORD_RESET_THROTTLE', 60),
        'require_old_password' => env('PASSWORD_RESET_REQUIRE_OLD', false),
    ],

    'social_login' => [
        'enabled' => env('SOCIAL_LOGIN_ENABLED', true),
        'providers' => [
            'google' => env('SOCIAL_LOGIN_GOOGLE', true),
            'github' => env('SOCIAL_LOGIN_GITHUB', false),
            'facebook' => env('SOCIAL_LOGIN_FACEBOOK', false),
        ],
        'require_email_verification' => env('SOCIAL_LOGIN_REQUIRE_VERIFICATION', false), // Changed to false
        'auto_create_accounts' => env('SOCIAL_LOGIN_AUTO_CREATE', true),
    ],

    'audit_logging' => [
        'enabled' => env('AUDIT_LOGGING_ENABLED', true),
        'log_level' => env('AUDIT_LOG_LEVEL', 'info'),
        'log_failed_logins' => env('AUDIT_LOG_FAILED_LOGINS', true),
        'log_successful_logins' => env('AUDIT_LOG_SUCCESSFUL_LOGINS', true),
        'log_password_resets' => env('AUDIT_LOG_PASSWORD_RESETS', true),
        'log_email_verifications' => env('AUDIT_LOG_EMAIL_VERIFICATIONS', true),
        'log_social_logins' => env('AUDIT_LOG_SOCIAL_LOGINS', true),
        'log_suspicious_activity' => env('AUDIT_LOG_SUSPICIOUS_ACTIVITY', true),
    ],

    'headers' => [
        'x_frame_options' => env('SECURITY_X_FRAME_OPTIONS', 'DENY'),
        'x_content_type_options' => env('SECURITY_X_CONTENT_TYPE_OPTIONS', 'nosniff'),
        'x_xss_protection' => env('SECURITY_X_XSS_PROTECTION', '1; mode=block'),
        'referrer_policy' => env('SECURITY_REFERRER_POLICY', 'strict-origin-when-cross-origin'),
        'permissions_policy' => env('SECURITY_PERMISSIONS_POLICY', ''),
    ],

    'csrf' => [
        'enabled' => env('CSRF_PROTECTION_ENABLED', true),
        'exclude_routes' => env('CSRF_EXCLUDE_ROUTES', []),
        'exclude_uris' => env('CSRF_EXCLUDE_URIS', []),
    ],

    'two_factor' => [
        'enabled' => env('TWO_FACTOR_ENABLED', false),
        'providers' => [
            'totp' => env('TWO_FACTOR_TOTP_ENABLED', true),
            'sms' => env('TWO_FACTOR_SMS_ENABLED', false),
            'email' => env('TWO_FACTOR_EMAIL_ENABLED', false),
        ],
        'remember_device_days' => env('TWO_FACTOR_REMEMBER_DEVICE_DAYS', 30),
    ],

];
