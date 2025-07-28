# CVeezy Deployment Guide

## Environment Configuration

Create a `.env` file with the following configuration:

```env
APP_NAME=CVeezy
APP_ENV=production
APP_KEY=base64:YOUR_32_CHARACTER_KEY_HERE
APP_DEBUG=false
APP_TIMEZONE=UTC
APP_URL=https://your-domain.com

# Database Configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cveezy_production
DB_USERNAME=your_db_user
DB_PASSWORD=your_secure_password

# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=your_smtp_host
MAIL_PORT=587
MAIL_USERNAME=your_mail_username
MAIL_PASSWORD=your_mail_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@cveezy.com"
MAIL_FROM_NAME="CVeezy"
MAIL_ADMIN_EMAIL="admin@cveezy.com"

# Security Settings
SESSION_DRIVER=database
CACHE_STORE=redis
QUEUE_CONNECTION=redis
```

## Pre-Deployment Checklist

### ✅ Security

-   [ ] Run `php artisan key:generate`
-   [ ] Set `APP_DEBUG=false` in production
-   [ ] Configure proper HTTPS
-   [ ] Set up firewall rules
-   [ ] Configure rate limiting

### ✅ Database

-   [ ] Run migrations: `php artisan migrate`
-   [ ] Create admin user
-   [ ] Set up database backups

### ✅ Performance

-   [ ] Run `php artisan config:cache`
-   [ ] Run `php artisan route:cache`
-   [ ] Run `php artisan view:cache`
-   [ ] Run `npm run build`
-   [ ] Configure Redis cache
-   [ ] Set up queue workers

### ✅ Monitoring

-   [ ] Configure error logging
-   [ ] Set up uptime monitoring
-   [ ] Configure email notifications
-   [ ] Set up log rotation

## Production Commands

```bash
# Install dependencies
composer install --optimize-autoloader --no-dev
npm ci && npm run build

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
php artisan migrate --force

# Start queue workers
php artisan queue:work --daemon
```

## Security Recommendations

1. **SSL/TLS Certificate**: Use Let's Encrypt or purchase SSL
2. **Web Server**: Configure Nginx/Apache with security headers
3. **Database**: Use strong passwords and restrict access
4. **Backups**: Daily automated backups
5. **Updates**: Regular security updates
