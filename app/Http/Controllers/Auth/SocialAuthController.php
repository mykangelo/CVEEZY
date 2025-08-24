<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\AuthenticationAuditService;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\User;

class SocialAuthController extends Controller
{
    protected $auditService;

    public function __construct(AuthenticationAuditService $auditService)
    {
        $this->auditService = $auditService;
    }

    public function redirectToProvider($provider)
    {
        // Validate provider
        $allowedProviders = ['google', 'github', 'facebook'];
        if (!in_array($provider, $allowedProviders)) {
            abort(400, 'Invalid authentication provider');
        }

        return Socialite::driver($provider)->stateless()->redirect();
    }

    public function handleProviderCallback($provider)
    {
        try {
            // Validate provider again
            $allowedProviders = ['google', 'github', 'facebook'];
            if (!in_array($provider, $allowedProviders)) {
                abort(400, 'Invalid authentication provider');
            }

            \Log::info('Social login callback started for provider: ' . $provider);
            \Log::info('Request URL: ' . request()->url());
            \Log::info('Request method: ' . request()->method());
            \Log::info('All request parameters: ' . json_encode(request()->all()));
            
            $socialUser = Socialite::driver($provider)->stateless()->user();
            \Log::info('Social user retrieved: ' . $socialUser->getEmail());

            // Validate social user data
            if (!$socialUser->getEmail()) {
                throw new \Exception('Social provider did not return email address');
            }

            // Check if user exists by email
            $user = User::where('email', $socialUser->getEmail())->first();

            if (!$user) {
                \Log::info('Creating new user for email: ' . $socialUser->getEmail());
                
                // Additional validation for new social users
                if (!$socialUser->getName() && !$socialUser->getNickname()) {
                    throw new \Exception('Social provider did not return user name');
                }

                // Create new user
                $user = User::create([
                    'name' => $socialUser->getName() ?? $socialUser->getNickname(),
                    'email' => $socialUser->getEmail(),
                    'provider_id' => $socialUser->getId(),
                    'provider_name' => $provider,
                    'role' => User::ROLE_USER,
                ]);
                \Log::info('New user created with ID: ' . $user->id);
            } else {
                \Log::info('Updating existing user: ' . $user->id);
                
                // Update existing user's social login info
                $user->update([
                    'provider_id' => $socialUser->getId(),
                    'provider_name' => $provider,
                ]);
            }

            // Log the social login attempt
            $this->auditService->logSocialLogin($user, $provider);

            Auth::login($user);
            $user->updateLastLogin();
            \Log::info('User logged in successfully, redirecting to dashboard');
            \Log::info('User ID: ' . $user->id . ', Email: ' . $user->email);
            \Log::info('Auth check: ' . (Auth::check() ? 'true' : 'false'));
            \Log::info('Session ID: ' . session()->getId());

            // Regenerate session ID for security
            session()->regenerate();
            \Log::info('Session regenerated, new ID: ' . session()->getId());
            \Log::info('Auth check after regenerate: ' . (Auth::check() ? 'true' : 'false'));

            // Use route() helper instead of direct redirect
            return redirect()->route('dashboard');

        } catch (\Exception $e) {
            \Log::error('Social login error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            // Log suspicious activity
            $this->auditService->logSuspiciousActivity(
                $socialUser->getEmail() ?? 'unknown',
                'Social login failed: ' . $e->getMessage(),
                ['provider' => $provider, 'error' => $e->getMessage()]
            );
            
            return redirect('/login')->withErrors(['social_login' => 'Something went wrong with social login: ' . $e->getMessage()]);
        }
    }
}

