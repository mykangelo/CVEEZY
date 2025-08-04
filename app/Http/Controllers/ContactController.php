<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class ContactController extends Controller
{
    public function contactPost(Request $request)
    {
        // Rate limiting - prevent spam
        $key = 'contact-form:' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 3)) {
            throw ValidationException::withMessages([
                'email' => 'Too many contact attempts. Please try again later.',
            ]);
        }

        // Validation
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
            'body' => strip_tags(trim($validated['message'])), // renamed to avoid $message conflict
        ];

        // Send email
        try {
            Mail::send('emails.contact', $sanitizedData, function ($message) use ($sanitizedData) {
                $message->to('cveezyad@gmail.com') // ✅ correct recipient
                        ->subject('Contact Form: ' . $sanitizedData['name'])
                        ->replyTo($sanitizedData['email'], $sanitizedData['name']);
            });

            Mail::send('emails.auto_reply', ['name' => $sanitizedData['name']], function ($message) use ($sanitizedData) {
                $message->to($sanitizedData['email'], $sanitizedData['name'])
                        ->subject('We received your message');
            });

            RateLimiter::clear($key);
            return redirect()->back()->with('success', 'Your message has been sent successfully!');

        } catch (\Exception $e) {
            \Log::error('Contact form email failed: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to send message. Please try again later.');
        }
    }
}
