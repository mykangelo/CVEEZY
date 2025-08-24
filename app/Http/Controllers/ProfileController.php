<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        
        // Get user statistics
        $user->loadCount(['resumes', 'resumes as completed_resumes_count' => function ($query) {
            $query->where('status', 'completed');
        }]);
        
        // Add computed properties
        $user->total_resumes_count = $user->resumes_count;
        $user->completed_resumes_count = $user->completed_resumes_count;
        $user->has_password = !empty($user->password);
        $user->is_social_user = !empty($user->provider_id);
        
        return Inertia::render('Profile/Edit', [
            'emailVerificationStatus' => [
                'verified' => $user->hasVerifiedEmail(),
                'status' => $user->email_verification_status['status'],
                'message' => $user->email_verification_status['message'],
                'recommended' => $user->email_verification_status['recommended'],
                'userEmail' => $user->email,
            ],
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Send email verification notification.
     */
    public function sendVerificationEmail(Request $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return Redirect::route('profile.edit')->with('status', 'Email already verified.');
        }

        $request->user()->sendEmailVerificationNotification();

        return Redirect::route('profile.edit')->with('status', 'Verification link sent!');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
