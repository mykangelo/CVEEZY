<?php

namespace App\Http\Controllers;

use App\Models\Resume;
use App\Models\PaymentProof;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Handle both URL parameters and existing resume parameter
        $resumeId = $request->get('resumeId') ?? $request->get('resume');
        $resumeName = $request->get('resumeName');
        
        \Log::info('Payment page accessed', [
            'user_id' => $user->id,
            'resumeId' => $resumeId,
            'resumeName' => $resumeName,
            'all_params' => $request->all()
        ]);
        
        $resume = null;
        if ($resumeId) {
            $resume = $user->resumes()->find($resumeId);
            \Log::info('Resume lookup result', [
                'resumeId' => $resumeId,
                'found' => $resume ? 'yes' : 'no',
                'resume_name' => $resume?->name
            ]);
        }

        // Get payment proofs for the user
        $paymentProofs = PaymentProof::where('user_id', $user->id)
            ->with('resume')
            ->latest()
            ->get()
            ->map(function ($proof) {
                return [
                    'id' => $proof->id,
                    'status' => $proof->status,
                    'created_at' => $proof->created_at->toDateTimeString(),
                    'resume_id' => $proof->resume_id,
                ];
            });

        return Inertia::render('Payment', [
            'resumeId' => $resume?->id ?? $resumeId,
            'resumeName' => $resume?->name ?? $resumeName,
            'paymentProofs' => $paymentProofs,
        ]);
    }
} 