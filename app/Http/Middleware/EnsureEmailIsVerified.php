<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmailIsVerified
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        // Email verification is now optional - users can proceed
        // But we'll show a gentle reminder if not verified
        if (!Auth::user()->hasVerifiedEmail()) {
            // Store intended URL for after verification (if they choose to verify later)
            if ($request->isMethod('GET')) {
                session()->put('url.intended', $request->url());
            }

            // Show a gentle reminder instead of blocking access
            if ($request->isMethod('GET')) {
                session()->flash('info', 
                    '💡 Tip: Verify your email address for enhanced security and to receive important notifications. You can verify anytime from your profile page.'
                );
            }
        }

        return $next($request);
    }
}
