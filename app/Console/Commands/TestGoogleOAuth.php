<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class TestGoogleOAuth extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'google:test-oauth';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test Google OAuth configuration and diagnose issues';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing Google OAuth Configuration...');
        $this->newLine();

        // Test 1: Environment Variables
        $this->info('1. Checking Environment Variables:');
        $clientId = config('services.google.client_id');
        $clientSecret = config('services.google.client_secret');
        $redirectUri = config('services.google.redirect');

        if ($clientId) {
            $this->info("   ✓ GOOGLE_CLIENT_ID: " . substr($clientId, 0, 10) . '...');
        } else {
            $this->error("   ✗ GOOGLE_CLIENT_ID: Not set");
        }

        if ($clientSecret) {
            $this->info("   ✓ GOOGLE_CLIENT_SECRET: " . substr($clientSecret, 0, 10) . '...');
        } else {
            $this->error("   ✗ GOOGLE_CLIENT_SECRET: Not set");
        }

        if ($redirectUri) {
            $this->info("   ✓ GOOGLE_REDIRECT_URI: {$redirectUri}");
        } else {
            $this->error("   ✗ GOOGLE_REDIRECT_URI: Not set");
        }

        $this->newLine();

        // Test 2: App Configuration
        $this->info('2. Checking App Configuration:');
        $appUrl = config('app.url');
        $appEnv = config('app.env');
        
        $this->info("   ✓ APP_URL: {$appUrl}");
        $this->info("   ✓ APP_ENV: {$appEnv}");

        $this->newLine();

        // Test 3: Session Configuration
        $this->info('3. Checking Session Configuration:');
        $sessionDriver = config('session.driver');
        $sessionSecure = config('session.secure');
        $sessionDomain = config('session.domain');
        
        $this->info("   ✓ Session Driver: {$sessionDriver}");
        $this->info("   ✓ Session Secure: " . ($sessionSecure ? 'Yes' : 'No'));
        $this->info("   ✓ Session Domain: " . ($sessionDomain ?: 'Not set'));

        $this->newLine();

        // Test 4: Socialite Configuration
        $this->info('4. Testing Socialite Configuration:');
        try {
            $driver = Socialite::driver('google');
            $this->info("   ✓ Socialite driver loaded successfully");
            
            // Test if we can get the redirect URL
            try {
                $redirectUrl = $driver->redirectUrl($redirectUri)->redirect()->getTargetUrl();
                $this->info("   ✓ Redirect URL generated: " . substr($redirectUrl, 0, 100) . '...');
            } catch (\Exception $e) {
                $this->error("   ✗ Failed to generate redirect URL: " . $e->getMessage());
            }
            
        } catch (\Exception $e) {
            $this->error("   ✗ Socialite driver failed: " . $e->getMessage());
        }

        $this->newLine();

        // Test 5: SSL Check
        $this->info('5. SSL/HTTPS Check:');
        if (str_starts_with($appUrl, 'https://')) {
            $this->info("   ✓ App URL uses HTTPS");
        } else {
            $this->warn("   ⚠ App URL does not use HTTPS - Google OAuth requires HTTPS in production");
        }

        if (str_starts_with($redirectUri, 'https://')) {
            $this->info("   ✓ Redirect URI uses HTTPS");
        } else {
            $this->error("   ✗ Redirect URI does not use HTTPS - Google OAuth requires HTTPS in production");
        }

        $this->newLine();

        // Test 6: Route Check
        $this->info('6. Route Availability:');
        $routes = [
            'social.redirect' => route('social.redirect', 'google'),
            'social.callback' => route('social.callback', 'google'),
        ];

        foreach ($routes as $name => $url) {
            if ($url) {
                $this->info("   ✓ {$name}: " . $url);
            } else {
                $this->error("   ✗ {$name}: Route not found");
            }
        }

        $this->newLine();

        // Summary
        $this->info('Summary:');
        if ($clientId && $clientSecret && $redirectUri && str_starts_with($redirectUri, 'https://')) {
            $this->info('   ✓ Google OAuth appears to be configured correctly');
            $this->info('   ✓ Check Google Cloud Console for redirect URI configuration');
        } else {
            $this->error('   ✗ Google OAuth configuration is incomplete');
            $this->error('   ✓ Please check the issues above and update your .env file');
        }

        $this->newLine();
        $this->info('For detailed troubleshooting, see: GOOGLE_LOGIN_TROUBLESHOOTING.md');
        
        return 0;
    }
}
