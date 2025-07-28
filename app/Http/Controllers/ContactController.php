<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class ContactController extends Controller
{
    function contactPost(Request $request)
    {
        // Rate limiting - prevent spam
        $key = 'contact-form:' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 3)) {
            throw ValidationException::withMessages([
                'email' => 'Too many contact attempts. Please try again later.',
            ]);
        }

        // Enhanced validation with security rules
        $validated = $request->validate([
            'name' => 'required|string|max:255|regex:/^[a-zA-Z\s]+$/',
            'email' => 'required|email:rfc,dns|max:255',
            'message' => 'required|string|max:2000|min:10',
        ]);

        RateLimiter::hit($key, 300); // 5 minute cooldown

        // Sanitize inputs
        $sanitizedData = [
            'name' => strip_tags(trim($validated['name'])),
            'email' => filter_var($validated['email'], FILTER_SANITIZE_EMAIL),
            'message' => strip_tags(trim($validated['message'])),
        ];

        // Send email with proper templates and security
        try {
            Mail::send('emails.contact', $sanitizedData, function ($message) use ($sanitizedData) {
                $message->to(config('mail.admin_email', 'admin@cveezy.com'))
                    ->subject('Contact Form: ' . $sanitizedData['name'])
                    ->replyTo($sanitizedData['email'], $sanitizedData['name']);
            });

            RateLimiter::clear($key);
            return redirect()->back()->with('success', 'Your message has been sent successfully!');
            
        } catch (\Exception $e) {
            \Log::error('Contact form email failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to send message. Please try again later.');
        }
    }
}
