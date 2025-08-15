<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BuilderController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $hasPendingPayments = false;
        $pendingResumesCount = 0;
        $resumeId = $request->get('resume');
        $templateName = $request->get('template');
        $resume = null;
        $resumeData = null;
        
        if ($user) {
            // Check if user has pending payment proofs (only restrict on pending, not rejected)
            $pendingResumes = $user->resumes()
                ->whereHas('paymentProofs', function($query) {
                    $query->where('status', 'pending');
                })
                ->count();
            
            $hasPendingPayments = $pendingResumes > 0;
            $pendingResumesCount = $pendingResumes;
            
            // If user has pending payments, redirect them to dashboard with a message
            if ($hasPendingPayments) {
                return redirect()->route('dashboard')->with('error', 'Cannot access resume builder while payment is pending. Please wait for admin approval.');
            }
            
            // If resume ID is provided, load the existing resume for editing
            if ($resumeId) {
                $resume = $user->resumes()->find($resumeId);
                if ($resume) {
                    $resumeData = $resume->resume_data;
                    if (is_string($resumeData)) {
                        $resumeData = json_decode($resumeData, true);
                    }
                    
                    \Log::info('Loading existing resume for editing', [
                        'user_id' => $user->id,
                        'resume_id' => $resumeId,
                        'resume_name' => $resume->name
                    ]);
                }
            } elseif (!$templateName) {
                // Only auto-load recent draft if user didn't come from template selection
                // This means they're refreshing an existing editing session
                $latestDraft = $user->resumes()
                    ->where('status', 'draft')
                    ->orderBy('updated_at', 'desc')
                    ->first();
                
                if ($latestDraft) {
                    $resume = $latestDraft;
                    $resumeData = $resume->resume_data;
                    if (is_string($resumeData)) {
                        $resumeData = json_decode($resumeData, true);
                    }
                    
                    \Log::info('Auto-loading most recent draft resume (refresh scenario)', [
                        'user_id' => $user->id,
                        'resume_id' => $latestDraft->id,
                        'resume_name' => $latestDraft->name,
                        'last_updated' => $latestDraft->updated_at
                    ]);
                }
            } else {
                // User came with a template parameter, they want to create a new resume
                \Log::info('User creating new resume with template', [
                    'user_id' => $user->id,
                    'template' => $templateName
                ]);
            }
        }
        
        return Inertia::render('Builder', [
            'hasPendingPayments' => $hasPendingPayments,
            'pendingResumesCount' => $pendingResumesCount,
            'editingResumeId' => $resume?->id,
            'editingResumeName' => $resume?->name,
            'editingResumeData' => $resumeData,
            'editingTemplateName' => $resume?->template_name,
            'skipInitialLoading' => $templateName ? true : false
        ]);
    }
} 