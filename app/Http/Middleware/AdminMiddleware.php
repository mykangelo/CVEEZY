<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            Log::warning('Unauthorized admin access attempt from IP: ' . $request->ip());
            return redirect()->route('login')->with('error', 'Please login to access this area.');
        }

        $user = Auth::user();
        
        // Check if user has admin role
        if ($user->role !== 'admin') {
            Log::warning('Non-admin user attempted admin access', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip(),
                'route' => $request->route()->getName()
            ]);
            
            abort(403, 'Access denied. Admin privileges required.');
        }

        // Log successful admin access for security auditing
        Log::info('Admin access granted', [
            'user_id' => $user->id,
            'email' => $user->email,
            'route' => $request->route()->getName()
        ]);

        return $next($request);
    }
}

