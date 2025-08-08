#!/bin/bash

# Exit on any error
set -e

echo "Starting deployment..."

# Navigate to the project directory
cd /home/u850020960/lime-hare-378630.hostingersite.com

# Install/update Composer dependencies
echo "Installing Composer dependencies..."
~/composer install --no-dev --optimize-autoloader

# Install/update Node.js dependencies and build assets
echo "Installing Node.js dependencies..."
npm install

echo "Building frontend assets..."
npm run build

# Run Laravel commands
echo "Running Laravel setup commands..."

# Generate application key if not exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
fi

# Generate app key
php artisan key:generate

# Run database migrations
echo "Running database migrations..."
php artisan migrate --force

# Create storage link
echo "Creating storage link..."
php artisan storage:link

# Clear and cache configurations
echo "Optimizing Laravel..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set proper permissions
echo "Setting file permissions..."
chmod -R 755 storage bootstrap/cache
chmod -R 755 public/build

echo "Deployment completed successfully!" 