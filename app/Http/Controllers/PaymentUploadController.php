<?php

namespace App\Http\Controllers;

use App\Models\Resume;
use App\Models\PaymentProof;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PaymentUploadController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $resumeId = $request->get('resume');
        
        $resume = null;
        if ($resumeId) {
            $resume = $user->resumes()->find($resumeId);
        }

        $paymentProofs = PaymentProof::with('resume')
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        return Inertia::render('PaymentUpload', [
            'resumeId' => $resume?->id,
            'resumeName' => $resume?->name,
            'paymentProofs' => $paymentProofs,
        ]);
    }
} 