<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Resume;
use App\Models\PaymentProof;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;


class ResumeController extends Controller
{
    /**
     * Store the resume data submitted from the React form.
     */
    public function store(Request $request)
    {
        try {
            Log::info('ResumeController store method called');
            Log::info('Request method:', ['method' => $request->method()]);
            Log::info('Request headers:', $request->headers->all());
            Log::info('Request data:', $request->all());
            
            $data = $request->all();
            
            Log::info('Resume request payload:', $data);

            // Extract template from the data
            $template = $data['template'] ?? 'classic';
            
            // Remove template from resume_data to avoid storing it twice
            unset($data['template']);
            
            $resume = Resume::create([
                'user_id' => Auth::id(),
                'name' => 'My Resume', // Default name
                'template_name' => $template,
                'status' => Resume::STATUS_DRAFT,
                'resume_data' => $data,
                'is_paid' => false,
            ]);

            Log::info('Resume created successfully with ID: ' . $resume->id);

            return response()->json([
                'resumeId' => $resume->id,
                'message' => 'Resume saved successfully'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error creating resume: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'error' => 'Failed to save resume: ' . $e->getMessage()
            ], 500);
        }
    }


    /**
     * Fetch the current user's resume and payment status for dashboard display.
     */
    public function status()
    {
        $user = Auth::user();

        // Get latest resume
        $resume = Resume::where('user_id', $user->id)->latest()->first();

        if (!$resume) {
            return response()->json([
                'status' => 'none',
                'resumeId' => null,
            ]);
        }

        // Get latest payment proof tied to the resume
        $proof = PaymentProof::where('resume_id', $resume->id)->latest()->first();

        return response()->json([
            'status' => $proof?->status ?? 'none',
            'resumeId' => $resume->id,
        ]);
    }

    /**
     * Show the selected resume using the correct template.
     */
    public function show($id)
    {
        $resumeModel = Resume::findOrFail($id);
        
        // Use resume_data column and it's already an array due to casting
        $resume = $resumeModel->resume_data;

        // Default to "classic" if template_name is null
        $template = $resumeModel->template_name ?? 'classic';

        return view("resume.$template", compact('resume'));
    }

    /**
     * Download the resume as PDF using the correct template.
     * THIS IS THE NEW METHOD YOU NEED TO ADD
     */
    
    public function download($id)
    {
        Log::info("Download attempt for resume ID: $id by user: " . Auth::id());
        
        try {
            // Get the resume and check ownership
            $resumeModel = Resume::where('id', $id)
                                ->where('user_id', Auth::id())
                                ->first();
            
            if (!$resumeModel) {
                Log::warning("Access denied for resume $id - resume not found or not owned by user");
                abort(403, 'Resume not found or you do not have permission to download it.');
            }
            
            // Check if user has approved payment proof for this resume
            $approvedPayment = PaymentProof::where('resume_id', $id)
                                          ->where('user_id', Auth::id())
                                          ->where('status', 'approved')
                                          ->first();
            
            if (!$approvedPayment) {
                Log::warning("Access denied for resume $id - no approved payment found");
                abort(403, 'Payment required to download PDF. Please complete payment and wait for admin approval.');
            }
            
            Log::info("Resume found and user has permission to download");
            
            // Use resume_data column and it's already an array due to casting
            $resume = $resumeModel->resume_data;
            
            // Get template name from your store method - you're saving it as 'template_name'
            // But I notice your Resume model fillable doesn't include 'template_name'
            // Let's check if it exists, otherwise default to 'classic'
            $template = $resumeModel->template_name ?? 'classic';
            Log::info("Using template: $template");
            
            // Validate that the template view exists
            $viewPath = "resume.$template";
            if (!view()->exists($viewPath)) {
                Log::warning("Template view not found: $viewPath, falling back to classic");
                $template = 'classic';
                $viewPath = "resume.classic";
            }
            
            Log::info("Loading view: $viewPath");
            
            // Generate PDF with the specific template
            $pdf = PDF::loadView($viewPath, compact('resume'));
            $pdf->setPaper('A4', 'portrait');
            
            // Generate filename using the contact info from your template structure
            $firstName = $resume['contact']['firstName'] ?? 'Resume';
            $lastName = $resume['contact']['lastName'] ?? '';
            $fileName = "resume_{$firstName}_{$lastName}_{$template}.pdf";
            
            Log::info("Generated resume PDF: $fileName for user " . Auth::id());
            
            return $pdf->download($fileName);
            
        } catch (\Exception $e) {
            Log::error('Resume download error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'error' => 'Failed to generate resume PDF: ' . $e->getMessage()
            ], 500);
        }
    }
    
}