<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class SocialAuthController extends Controller
{
    public function redirectToProvider($provider)
    {
        return Socialite::driver($provider)->stateless()->redirect();
    }

    public function handleProviderCallback($provider)
    {
        try {
            \Log::info('Social login callback started for provider: ' . $provider);
            \Log::info('Request URL: ' . request()->url());
            \Log::info('Request method: ' . request()->method());
            \Log::info('All request parameters: ' . json_encode(request()->all()));
            
            $socialUser = Socialite::driver($provider)->stateless()->user();
            \Log::info('Social user retrieved: ' . $socialUser->getEmail());

            // Check if user exists by email
            $user = User::where('email', $socialUser->getEmail())->first();

            if (!$user) {
                \Log::info('Creating new user for email: ' . $socialUser->getEmail());
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
            return redirect('/login')->withErrors(['social_login' => 'Something went wrong with social login: ' . $e->getMessage()]);
        }
    }
}

