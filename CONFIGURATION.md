# CVeezy Configuration Guide

This document explains all the configuration options available in CVeezy.

## Environment Variables

### Core Application

```bash
APP_NAME=CVeezy
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost
```

### Database

```bash
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cveezy
DB_USERNAME=root
DB_PASSWORD=
```

### Mail Configuration

```bash
MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"
```

## Third-Party Services

### Social Authentication

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost/auth/google/callback

# Apple OAuth
APPLE_CLIENT_ID=your_apple_client_id
APPLE_CLIENT_SECRET=your_apple_client_secret
APPLE_REDIRECT_URI=http://localhost/auth/apple/callback
```

### Gemini AI

```bash
GEMINI_API_KEY=your_gemini_api_key
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models
GEMINI_DEFAULT_MODEL=gemini-1.5-flash
GEMINI_PARSER_MODEL=gemini-1.5-pro
```

### LanguageTool

```bash
LANGUAGETOOL_ENDPOINT=https://api.languagetool.org/v2/check
```

## Resume-Specific Configuration

### AI Enhancement

```bash
AI_ENHANCEMENT_ENABLED=true
AI_PARSING_ENABLED=true
RESUME_PARSING_ENABLED=true
```

### Payment Settings

```bash
PAYMENT_AUTO_APPROVAL=false
PAYMENT_APPROVAL_TIMEOUT=24
PAYMENT_PROOF_RETENTION=365
```

### Cleanup Settings

```bash
CLEANUP_TEMP_FILES=true
TEMP_FILES_MAX_AGE=24
CLEANUP_UNFINISHED_RESUMES=true
UNFINISHED_RESUMES_MAX_AGE=30
```

### HTTP Client (Local Development)

```bash
HTTP_CLIENT_VERIFY_SSL=true
```

## Configuration Files

### config/services.php

Contains configuration for third-party services like Gemini AI, Google OAuth, and LanguageTool.

### config/resume.php

Centralized configuration for all resume-related functionality including:

-   Template definitions
-   File upload limits
-   AI enhancement settings
-   PDF generation options
-   Payment processing
-   Cleanup policies

## Usage Examples

### In Controllers

```php
// Get template information
$templates = config('resume.templates');

// Check if AI enhancement is enabled
if (config('resume.ai_enhancement.enabled')) {
    // Enable AI features
}

// Get file upload limits
$maxSize = config('resume.uploads.max_file_size');
```

### In Models

```php
// Get available statuses
$statuses = Resume::getStatuses();

// Check progress weights
$contactWeight = config('resume.progress_weights.contact');
```

### In Commands

```php
// Check if cleanup is enabled
if (config('resume.cleanup.temp_files.enabled')) {
    // Perform cleanup
}
```

## Best Practices

1. **Environment-Specific Settings**: Use environment variables for sensitive information and environment-specific settings.

2. **Configuration Caching**: In production, cache your configuration files for better performance:

    ```bash
    php artisan config:cache
    ```

3. **Validation**: Always validate configuration values in your application code.

4. **Documentation**: Keep this file updated when adding new configuration options.

5. **Security**: Never commit sensitive configuration values to version control.

## Troubleshooting

### Common Issues

1. **Configuration Not Loading**: Ensure you've cleared the configuration cache:

    ```bash
    php artisan config:clear
    ```

2. **Environment Variables Not Working**: Check that your `.env` file is properly formatted and located in the project root.

3. **Service Configuration Errors**: Verify that all required environment variables are set for the services you're using.

### Debugging

To debug configuration issues, you can use:

```php
// In your code
dd(config('resume.templates'));

// Or in tinker
php artisan tinker
>>> config('resume.templates')
```
