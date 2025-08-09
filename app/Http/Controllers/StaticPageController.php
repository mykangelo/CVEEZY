<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StaticPageController extends Controller
{
    public function renderPage(Request $request, string $pageName)
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

        return Inertia::render($pageName, [
            'hasPendingPayments' => $hasPendingPayments,
            'pendingResumesCount' => $pendingResumesCount,
        ]);
    }
} 