<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Socialite\Facades\Socialite;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

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
        // Configure Socialite for Google authentication
        $this->configureGoogleSocialite();
    }

    /**
     * Configure Google Socialite driver with enhanced settings
     */
    private function configureGoogleSocialite(): void
    {
        try {
            // Configure the HTTP client for Google driver
            if ($this->app->environment('local')) {
                $httpClient = new Client([
                    'verify' => false, // Disable SSL verification for local development
                    'timeout' => 30, // Increase timeout for better reliability
                    'connect_timeout' => 10,
                ]);
                
                Socialite::driver('google')->setHttpClient($httpClient);
            }

            // Configure Google driver with additional options
            Socialite::driver('google')->setScopes([
                'openid',
                'profile',
                'email'
            ]);

            // Set additional parameters for better user experience
            Socialite::driver('google')->with([
                'access_type' => 'offline',
                'prompt' => 'consent'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to configure Google Socialite driver: ' . $e->getMessage());
            
            // Don't break the application if Socialite configuration fails
            if ($this->app->environment('production')) {
                Log::critical('Google authentication may not work properly due to configuration failure');
            }
        }
    }
} 