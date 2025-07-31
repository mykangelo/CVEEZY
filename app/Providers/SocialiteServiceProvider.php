<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Socialite\Facades\Socialite;
use GuzzleHttp\Client;

class SocialiteServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Configure Socialite to handle SSL certificates in local development
        if ($this->app->environment('local')) {
            $httpClient = new Client([
                'verify' => false, // Disable SSL verification for local development
            ]);
            
            // Configure the HTTP client for Google driver only
            try {
                Socialite::driver('google')->setHttpClient($httpClient);
            } catch (\Exception $e) {
                // Log error but don't break the application
                \Log::warning('Could not configure Google Socialite driver: ' . $e->getMessage());
            }
        }
    }
} 