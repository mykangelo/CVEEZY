#!/usr/bin/env bash
set -euo pipefail
APP_DIR="/home/u850020960/cveezy"

cd "$APP_DIR"

composer install --no-dev --optimize-autoloader

[ -f .env ] || cp .env.example .env
php artisan key:generate --force

php artisan migrate --force || true
php artisan storage:link || true

# Build Vite only if Node exists; otherwise keep public/build committed
if command -v npm >/dev/null 2>&1; then
  npm ci
  npm run build
fi

php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

chmod -R 775 storage bootstrap/cache
find storage -type d -exec chmod 775 {} \;
find storage -type f -exec chmod 664 {} \;

echo "Deploy complete" 