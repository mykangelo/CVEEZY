# Hostinger Environment Configuration Template

Copy these settings to your `.env` file on Hostinger:

## Essential Configuration

```bash
APP_NAME="CVeezy"
APP_ENV=production
APP_KEY=your_app_key_here
APP_DEBUG=false
APP_URL=https://yourdomain.com

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback

# Session Configuration for Hostinger
SESSION_DRIVER=file
SESSION_LIFETIME=120
SESSION_SECURE_COOKIE=true
SESSION_DOMAIN=yourdomain.com
SESSION_SAME_SITE=lax
```

## Database Configuration

```bash
DB_CONNECTION=mysql
DB_HOST=your_hostinger_db_host
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password
```

## Security Settings

```bash
SANCTUM_STATEFUL_DOMAINS=yourdomain.com
SESSION_DOMAIN=yourdomain.com
```

## Important Notes

1. **Replace `yourdomain.com`** with your actual domain
2. **Get Google credentials** from [Google Cloud Console](https://console.cloud.google.com/)
3. **Enable SSL** in Hostinger control panel
4. **Set correct redirect URI** in Google OAuth console
5. **Use HTTPS** for all URLs

## Quick Setup Commands

After updating `.env`:

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan key:generate
php artisan google:test-oauth
```
