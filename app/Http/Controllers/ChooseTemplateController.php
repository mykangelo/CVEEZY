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
        
        // Check if user has unpaid resumes (resumes with pending or rejected payment proofs)
        $unpaidResumes = $user->resumes()
            ->whereHas('paymentProofs', function($query) {
                $query->whereIn('status', ['pending', 'rejected']);
            })
            ->count();
        
        $hasUnpaidResumes = $unpaidResumes > 0;
        
        if ($hasUnpaidResumes) {
            // Redirect back to dashboard with error message
            return redirect()->route('dashboard')->with('error', 'Please complete payment for your existing resumes before creating a new one.');
        }
        
        return Inertia::render('ChooseTemplate', [
            'hasUnpaidResumes' => $hasUnpaidResumes,
            'unpaidResumesCount' => $unpaidResumes
        ]);
    }
} 