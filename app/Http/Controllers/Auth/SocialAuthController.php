<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\AuthenticationAuditService;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use Illuminate\Http\Request;

class SocialAuthController extends Controller
{
    protected $auditService;

    public function __construct(AuthenticationAuditService $auditService)
    {
        $this->auditService = $auditService;
    }

    public function redirectToProvider(Request $request, $provider)
    {
        // Validate provider
        $allowedProviders = ['google'];
        if (!in_array($provider, $allowedProviders)) {
            abort(400, 'Invalid authentication provider');
        }

        // Check if user is already authenticated
        if (Auth::check()) {
            Log::info('User already authenticated, redirecting to dashboard');
            return redirect()->route('dashboard');
        }

        try {
            // Store intended URL in session for post-login redirect
            if ($request->has('redirect')) {
                session(['url.intended' => $request->get('redirect')]);
            }

            // Check if we have a recent successful Google login in this session
            if (session()->has('google_login_successful')) {
                Log::info('Recent Google login detected, redirecting to dashboard');
                return redirect()->route('dashboard');
            }

            // Check if user has a valid Google session cookie and has been redirected back
            if ($request->hasCookie('laravel_session') && session()->has('google_auth_attempted')) {
                Log::info('Google auth already attempted in this session');
                return redirect()->route('login')->withErrors([
                    'social_login' => 'Google authentication already attempted. Please use email/password login or try again later.'
                ]);
            }

            // Mark that we've attempted Google auth in this session
            session(['google_auth_attempted' => true]);

            // Log the redirect attempt for debugging
            Log::info('Initiating Google OAuth redirect', [
                'provider' => $provider,
                'session_id' => session()->getId(),
                'user_agent' => $request->userAgent(),
                'ip' => $request->ip(),
                'environment' => app()->environment()
            ]);

            // Use 'consent' instead of 'select_account' to avoid forcing account selection
            return Socialite::driver($provider)
                ->stateless()
                ->with(['prompt' => 'consent'])
                ->redirect();
        } catch (\Exception $e) {
            Log::error('Social login redirect error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            Log::error('Request details', [
                'provider' => $provider,
                'user_agent' => $request->userAgent(),
                'ip' => $request->ip(),
                'session_id' => session()->getId()
            ]);
            
            return redirect()->route('login')->withErrors([
                'social_login' => 'Unable to connect to ' . ucfirst($provider) . '. Please try again.'
            ]);
        }
    }

    public function handleProviderCallback(Request $request, $provider)
    {
        try {
            // Validate provider again
            $allowedProviders = ['google'];
            if (!in_array($provider, $allowedProviders)) {
                abort(400, 'Invalid authentication provider');
            }

            Log::info('Social login callback started for provider: ' . $provider);
            
            $socialUser = Socialite::driver($provider)->stateless()->user();
            
            if (!$socialUser) {
                throw new \Exception('Failed to retrieve user data from ' . ucfirst($provider));
            }

            Log::info('Social user retrieved: ' . $socialUser->getEmail());

            // Enhanced validation for social user data
            $validator = Validator::make([
                'email' => $socialUser->getEmail(),
                'name' => $socialUser->getName() ?? $socialUser->getNickname(),
                'provider_id' => $socialUser->getId(),
            ], [
                'email' => 'required|email',
                'name' => 'required|string|min:2|max:255',
                'provider_id' => 'required|string',
            ]);

            if ($validator->fails()) {
                throw new \Exception('Invalid user data received: ' . $validator->errors()->first());
            }

            // Check if user exists by email
            $user = User::where('email', $socialUser->getEmail())->first();

            if (!$user) {
                Log::info('Creating new user for email: ' . $socialUser->getEmail());
                
                // Create new user with enhanced data
                $user = User::create([
                    'name' => $socialUser->getName() ?? $socialUser->getNickname(),
                    'email' => $socialUser->getEmail(),
                    'provider_id' => $socialUser->getId(),
                    'provider_name' => $provider,
                    'role' => User::ROLE_USER,
                    'email_verified_at' => now(), // Google accounts are pre-verified
                ]);
                
                Log::info('New user created with ID: ' . $user->id);
                
                // Log user creation
                $this->auditService->logSocialLogin($user, $provider);
            } else {
                Log::info('Updating existing user: ' . $user->id);
                
                // Update existing user's social login info
                $user->update([
                    'provider_id' => $socialUser->getId(),
                    'provider_name' => $provider,
                    'last_login_at' => now(),
                ]);
                
                // Log user update
                $this->auditService->logSocialLogin($user, $provider);
            }

            // Log the successful social login
            $this->auditService->logSocialLogin($user, $provider);

                        // Login the user
            Auth::login($user);
            $user->updateLastLogin();
            
            Log::info('User logged in successfully, redirecting to dashboard');
            Log::info('User ID: ' . $user->id . ', Email: ' . $user->email);
            
            // Mark Google login as successful in this session
            session(['google_login_successful' => true]);
            
            // Redirect to intended URL or dashboard
            $redirectUrl = session('url.intended', route('dashboard'));
            session()->forget('url.intended');
            
            return redirect($redirectUrl)->with('success', 'Welcome back, ' . $user->name . '!');

        } catch (\Exception $e) {
            Log::error('Social login error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            // Log suspicious activity
            if (isset($socialUser) && $socialUser->getEmail()) {
                $this->auditService->logSuspiciousActivity(
                    $socialUser->getEmail(),
                    'Social login failed: ' . $e->getMessage(),
                    ['provider' => $provider, 'error' => $e->getMessage()]
                );
            }
            
            return redirect()->route('login')->withErrors([
                'social_login' => 'Authentication failed. Please try again or use email/password login.'
            ]);
        }
    }
}

