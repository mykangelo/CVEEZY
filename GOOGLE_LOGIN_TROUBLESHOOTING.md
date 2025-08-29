# Google Login Troubleshooting Guide for Hostinger Deployment

## Common Issues and Solutions

### 1. Environment Variables Configuration

Ensure these environment variables are properly set in your Hostinger environment:

```bash
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback
APP_URL=https://yourdomain.com
SESSION_SECURE_COOKIE=true
SESSION_DOMAIN=yourdomain.com
```

### 2. Google OAuth Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Edit your OAuth 2.0 Client ID
4. Update "Authorized redirect URIs":
    - **Add:** `https://yourdomain.com/auth/google/callback`
    - **Remove:** Any localhost URLs
5. Save changes

### 3. SSL/HTTPS Requirements

-   Google OAuth requires HTTPS in production
-   Ensure your Hostinger domain has SSL enabled
-   Check that your domain redirects from HTTP to HTTPS

### 4. Session Configuration

The following session settings are optimized for Hostinger:

```php
// config/session.php
'secure' => env('SESSION_SECURE_COOKIE', true),
'http_only' => true,
'same_site' => 'lax',
'domain' => env('SESSION_DOMAIN'),
```

### 5. Route Verification

Ensure your routes are accessible:

-   `/auth/google/redirect` - Should redirect to Google
-   `/auth/google/callback` - Should handle Google's response

### 6. Debugging Steps

#### Check Laravel Logs

```bash
tail -f storage/logs/laravel.log
```

#### Test Google OAuth Endpoint

```bash
curl -I "https://yourdomain.com/auth/google/redirect"
```

#### Verify Session Storage

Check if sessions are being created in:

-   `storage/framework/sessions/` (file driver)
-   Database (if using database driver)

### 7. Hostinger-Specific Issues

#### File Permissions

```bash
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/
```

#### PHP Version

Ensure PHP 8.2+ is enabled in Hostinger control panel

#### Extensions

Required PHP extensions:

-   `openssl`
-   `curl`
-   `json`
-   `mbstring`

### 8. Testing Checklist

-   [ ] Environment variables are set correctly
-   [ ] Google OAuth console has correct redirect URI
-   [ ] SSL certificate is active
-   [ ] Routes are accessible
-   [ ] Session storage is writable
-   [ ] Laravel logs show no errors
-   [ ] Google OAuth redirect works
-   [ ] Callback URL is reachable

### 9. Common Error Messages

#### "Invalid redirect_uri"

-   Check Google OAuth console configuration
-   Ensure exact match with `GOOGLE_REDIRECT_URI`

#### "Session not found"

-   Check session storage permissions
-   Verify session driver configuration

#### "SSL certificate error"

-   Ensure SSL is enabled on Hostinger
-   Check for mixed content issues

### 10. Emergency Fallback

If Google login continues to fail:

1. Temporarily disable Google login
2. Use email/password authentication
3. Check Hostinger support for SSL issues
4. Verify domain DNS settings

### 11. Contact Information

For additional support:

-   Check Laravel logs: `storage/logs/laravel.log`
-   Review Google OAuth console for errors
-   Contact Hostinger support for SSL/domain issues

## Quick Fix Commands

```bash
# Clear all caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Regenerate application key
php artisan key:generate

# Check route list
php artisan route:list | grep google

# Test environment
php artisan env
```
