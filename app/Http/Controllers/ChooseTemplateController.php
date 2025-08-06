<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ChooseTemplateController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Check if user has pending payment proofs (only restrict on pending, not rejected)
        $pendingResumes = $user->resumes()
            ->whereHas('paymentProofs', function($query) {
                $query->where('status', 'pending');
            })
            ->count();
        
        $hasPendingPayments = $pendingResumes > 0;
        
        if ($hasPendingPayments) {
            // Redirect back to dashboard with error message
            return redirect()->route('dashboard')->with('error', 'Please wait for admin approval of your pending payments before creating a new resume.');
        }
        
        return Inertia::render('ChooseTemplate', [
            'hasPendingPayments' => $hasPendingPayments,
            'pendingResumesCount' => $pendingResumes
        ]);
    }
} 