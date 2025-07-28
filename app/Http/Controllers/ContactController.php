<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    function contactPost(Request $request)
    {
        // Validate the input
        $request->validate([
            'name' => 'required',
            'email' => 'required|email',
            'message' => 'required',
        ]);

        // Send email
        Mail::raw($request->message, function ($message) use ($request) {
            $message->to('admin@cveezy.com') // recipient
                ->from(env('MAIL_FROM_ADDRESS'), 'Contact Form') // your app sender
                ->replyTo($request->email, $request->name) // user input as reply-to
                ->subject('Contact Form Message from ' . $request->name);
        });

        // Redirect back with success message
        return redirect()->back()->with('success', 'Your message has been sent!');
    }
}
