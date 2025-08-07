<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PaymentTermController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $hasPendingPayments = false;
        $pendingResumesCount = 0;

        if ($user) {
            // Check if user has pending payment proofs (only restrict on pending, not rejected)
            $pendingResumes = $user->resumes()
                ->whereHas('paymentProofs', function($query) {
                    $query->where('status', 'pending');
                })
                ->count();
            
            $hasPendingPayments = $pendingResumes > 0;
            $pendingResumesCount = $pendingResumes;
        }

        return Inertia::render('PaymentTerm', [
            'hasPendingPayments' => $hasPendingPayments,
            'pendingResumesCount' => $pendingResumesCount,
        ]);
    }
} 