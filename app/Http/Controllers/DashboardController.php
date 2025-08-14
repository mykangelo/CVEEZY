<?php

namespace App\Http\Controllers;

use App\Models\Resume;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the user dashboard.
     */
    public function index(): Response|RedirectResponse
    {
        $user = Auth::user();
        
        // Redirect admin users to admin dashboard
        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }
        
        // Get user's resumes with latest first
        $resumes = $user->resumes()
            ->latest()
            ->get()
            ->map(function ($resume) {
                $progress = $resume->getProgressPercentage();
                
                // Determine accurate status based on progress and payment
                $actualStatus = $this->determineResumeStatus($resume, $progress);
                
                return [
                    'id' => $resume->id,
                    'name' => $resume->name,
                    'creation_date' => $resume->formatted_creation_date,
                    'updated_at' => $resume->updated_at->toISOString(),
                    'status' => $actualStatus,
                    'template_id' => $resume->template_id,
                    'template_name' => $resume->template_name,
                    'user_id' => $resume->user_id,
                    'progress' => $progress,
                    'is_paid' => $resume->is_paid,
                    'needs_payment' => $resume->needsPayment(),
                    'is_downloadable' => $resume->isDownloadable(),
                    'can_be_edited' => $resume->canBeEdited(),
                    'payment_status_detailed' => $resume->getPaymentStatus(),
                    'last_paid_at' => $resume->last_paid_at?->toISOString(),
                    'last_modified_at' => $resume->last_modified_at?->toISOString(),
                ];
            });

        // Get user's payment proofs - get the latest proof for each resume (including pending and rejected)
        $paymentProofs = $user->paymentProofs()
            ->whereIn('id', function($query) use ($user) {
                $query->selectRaw('MAX(id)')
                    ->from('payment_proofs')
                    ->where('user_id', $user->id)
                    ->groupBy('resume_id');
            })
            ->get()
            ->map(function ($proof) {
                return [
                    'id' => $proof->id,
                    'resume_id' => $proof->resume_id,
                    'status' => $proof->status,
                    'created_at' => $proof->created_at->toISOString(),
                    'updated_at' => $proof->updated_at->toISOString(),
                ];
            });

        // Add payment status to each resume using the detailed status
        $resumesWithPaymentStatus = $resumes->map(function ($resume) {
            // Use the detailed payment status from the Resume model
            $resume['payment_status'] = $resume['payment_status_detailed'];
            return $resume;
        });

        return Inertia::render('Dashboard', [
            'resumes' => $resumesWithPaymentStatus,
            'paymentProofs' => $paymentProofs,
            'stats' => [
                'total_resumes' => $user->total_resumes_count,
                'completed_resumes' => $user->completed_resumes_count,
                'draft_resumes' => $user->resumes()->where('status', Resume::STATUS_DRAFT)->count(),
            ],
            'error' => session('error'),
            'success' => session('success'),
        ]);
    }

    /**
     * Create a new resume.
     */
    public function store(Request $request)
    {
        try {
            \Log::info('Resume store request received', [
                'method' => $request->method(),
                'headers' => $request->headers->all(),
                'data' => $request->all(),
                'user' => Auth::id()
            ]);

            $request->validate([
                'name' => 'required|string|max:255',
                'template_name' => 'string|max:255',
                'template_id' => 'integer|min:1|max:10', // Keep for backward compatibility
                'templateId' => 'integer|min:1|max:10', // Keep for backward compatibility
                'resume_data' => 'array',
            ]);

            $user = Auth::user();

            if (!$user) {
                \Log::error('No authenticated user found');
                return response()->json(['error' => 'Authentication required'], 401);
            }

            // Check if user has pending payment proofs (only restrict on pending, not rejected)
            $pendingResumes = $user->resumes()
                ->whereHas('paymentProofs', function($query) {
                    $query->where('status', 'pending');
                })
                ->count();
            
            if ($pendingResumes > 0) {
                \Log::info('Resume creation blocked due to pending payments', [
                    'user_id' => $user->id,
                    'pending_count' => $pendingResumes
                ]);
                return response()->json([
                    'error' => 'Cannot create new resume while payment is pending. Please wait for admin approval.',
                    'message' => 'You have resumes with pending payment reviews. Please wait for admin approval before creating new resumes.'
                ], 403);
            }

            // Handle template name (preferred) or fallback to template_id
            $templateName = $request->template_name ?? 'classic';
            $templateId = $request->template_id ?? $request->templateId ?? 1;

            $resume = $user->resumes()->create([
                'name' => $request->name,
                'template_id' => $templateId,
                'template_name' => $templateName,
                'status' => Resume::STATUS_DRAFT,
                'resume_data' => $request->resume_data ?? [
                    'contact' => [
                        'firstName' => '',
                        'lastName' => '',
                        'email' => $user->email,
                        'phone' => '',
                        'address' => '',
                        'websites' => [],
                    ],
                    'experiences' => [],
                    'educations' => [],
                    'skills' => [],
                    'summary' => '',
                ],
                'settings' => [
                    'theme' => 'default',
                    'font_size' => 'medium',
                    'layout' => 'standard',
                ],
            ]);

            \Log::info('Resume created successfully', ['resume_id' => $resume->id]);

            return response()->json([
                'message' => 'Resume created successfully',
                'resume' => $resume,
                'redirect' => route('builder', ['resume' => $resume->id])
            ]);
        } catch (\Exception $e) {
            \Log::error('Error creating resume: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            
            return response()->json([
                'error' => 'Failed to create resume: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get resume data by ID.
     */
    public function show(Resume $resume)
    {
        // Check if the resume belongs to the authenticated user
        if ($resume->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'resume' => [
                'id' => $resume->id,
                'name' => $resume->name,
                'template_id' => $resume->template_id,
                'template_name' => $resume->template_name,
                'resume_data' => $resume->resume_data,
                'status' => $resume->status,
                'created_at' => $resume->created_at,
                'updated_at' => $resume->updated_at,
            ]
        ]);
    }

    /**
     * Update a resume.
     */
    public function update(Request $request, Resume $resume)
    {
        // Ensure the resume belongs to the authenticated user
        if ($resume->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'resume_data' => 'array',
            'name' => 'string|max:255',
            'template_id' => 'integer|min:1|max:10',
            'template_name' => 'string|max:255',
        ]);

        $updateData = [];
        
        if ($request->has('resume_data')) {
            $updateData['resume_data'] = $request->resume_data;
        }
        
        if ($request->has('name')) {
            $updateData['name'] = $request->name;
        }
        
        if ($request->has('template_id')) {
            $updateData['template_id'] = $request->template_id;
        }
        
        if ($request->has('template_name')) {
            $updateData['template_name'] = $request->template_name;
        }

        $resume->update($updateData);
        
        // Mark resume as modified (this will handle payment status logic)
        $resume->markAsModified();

        return response()->json([
            'message' => 'Resume updated successfully',
            'resume' => $resume,
            'needs_payment' => $resume->needsPayment(),
            'payment_status' => $resume->getPaymentStatus()
        ]);
    }

    /**
     * Delete selected resumes.
     */
    public function destroyMultiple(Request $request)
    {
        $request->validate([
            'resume_ids' => 'required|array',
            'resume_ids.*' => 'integer|exists:resumes,id',
        ]);

        $user = Auth::user();
        
        // Only allow users to delete their own resumes
        $resumesToDelete = $user->resumes()
            ->whereIn('id', $request->resume_ids)
            ->get();

        if ($resumesToDelete->count() !== count($request->resume_ids)) {
            return response()->json([
                'error' => 'Some resumes were not found or you do not have permission to delete them.'
            ], 403);
        }

        // Soft delete the resumes
        $user->resumes()->whereIn('id', $request->resume_ids)->delete();

        return response()->json([
            'message' => 'Resumes deleted successfully',
            'deleted_count' => count($request->resume_ids)
        ]);
    }

    /**
     * Download resume as PDF.
     */
    public function download(Request $request, Resume $resume)
    {
        // Ensure user owns the resume
        if ($resume->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access to resume.');
        }

        // Check if resume is downloadable (paid and not modified)
        if (!$resume->isDownloadable()) {
            if ($resume->needsPayment()) {
                return response()->json([
                    'error' => 'Resume was modified after payment. Please make a new payment to download the updated version.',
                ], 403);
            } else {
                return response()->json([
                    'error' => 'Payment required to download PDF',
                    'message' => 'Please complete payment and wait for admin approval to download your resume as PDF.'
                ], 403);
            }
        }

        // Get resume data
        $resumeData = $resume->resume_data;
        if (is_string($resumeData)) {
            $resumeData = json_decode($resumeData, true);
        }

        // Map the data to the format expected by the PDF template
        $pdfData = [
            'contact' => [
                'firstName' => $resumeData['contact']['firstName'] ?? '',
                'lastName' => $resumeData['contact']['lastName'] ?? '',
                'desiredJobTitle' => $resumeData['contact']['desiredJobTitle'] ?? '',
                'email' => $resumeData['contact']['email'] ?? '',
                'phone' => $resumeData['contact']['phone'] ?? '',
                'address' => $resumeData['contact']['address'] ?? '',
                'city' => $resumeData['contact']['city'] ?? '',
                'country' => $resumeData['contact']['country'] ?? '',
                'postCode' => $resumeData['contact']['postCode'] ?? '',
            ],
            'summary' => $resumeData['summary'] ?? '',
            'skills' => $resumeData['skills'] ?? [],
            'showExperienceLevel' => $resumeData['showExperienceLevel'] ?? false,
            'languages' => $resumeData['languages'] ?? [],
            'certifications' => $resumeData['certifications'] ?? [],
            'awards' => $resumeData['awards'] ?? [],
            'websites' => $resumeData['websites'] ?? [],
            'references' => $resumeData['references'] ?? [],
            'hobbies' => $resumeData['hobbies'] ?? [],
            'customSections' => $resumeData['customSections'] ?? [],
            'experiences' => array_map(function($exp) {
                // Ensure we have all required fields with proper fallbacks
                $jobTitle = $exp['jobTitle'] ?? '';
                $company = $exp['company'] ?? $exp['employer'] ?? '';
                $location = $exp['location'] ?? $exp['employer'] ?? $exp['company'] ?? '';
                $startDate = $exp['startDate'] ?? '';
                $endDate = $exp['endDate'] ?? '';
                $description = $exp['description'] ?? '';
                
                return [
                    'jobTitle' => $jobTitle,
                    'company' => $company,
                    'location' => $location,
                    'startDate' => $startDate,
                    'endDate' => $endDate,
                    'description' => $description,
                ];
            }, $resumeData['experiences'] ?? []),
            'education' => array_map(function($edu) {
                // Ensure we have all required fields with proper fallbacks
                $degree = $edu['degree'] ?? '';
                $school = $edu['school'] ?? '';
                $location = $edu['location'] ?? '';
                $startDate = $edu['startDate'] ?? '';
                $endDate = $edu['endDate'] ?? '';
                $description = $edu['description'] ?? '';
                
                return [
                    'degree' => $degree,
                    'school' => $school,
                    'location' => $location,
                    'startDate' => $startDate,
                    'endDate' => $endDate,
                    'description' => $description,
                ];
            }, $resumeData['educations'] ?? []),
        ];

        // Generate PDF using the correct template
        $templateName = $resume->template_name ?? 'classic';
        $viewName = 'resume.' . $templateName;
        
        // Log the data for debugging
        \Log::info('PDF Data being passed to template', [
            'resume_id' => $resume->id,
            'template_name' => $templateName,
            'pdf_data' => $pdfData,
            'original_resume_data' => $resumeData,
            'experiences_count' => count($pdfData['experiences']),
            'first_experience' => $pdfData['experiences'][0] ?? 'No experiences',
            'original_experiences' => $resumeData['experiences'] ?? [],
            'education_count' => count($pdfData['education']),
            'first_education' => $pdfData['education'][0] ?? 'No education',
            'languages_count' => count($pdfData['languages'] ?? []),
            'certifications_count' => count($pdfData['certifications'] ?? []),
            'awards_count' => count($pdfData['awards'] ?? []),
            'websites_count' => count($pdfData['websites'] ?? []),
            'references_count' => count($pdfData['references'] ?? []),
            'hobbies_count' => count($pdfData['hobbies'] ?? []),
            'customSections_count' => count($pdfData['customSections'] ?? [])
        ]);
        
        // Fallback to classic if template view doesn't exist
        if (!view()->exists($viewName)) {
            $viewName = 'resume.classic';
        }
        
        try {
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView($viewName, ['resume' => $pdfData]);
            return $pdf->download($resume->name . '_resume.pdf');
        } catch (\Exception $e) {
            \Log::error('PDF Generation Error', [
                'resume_id' => $resume->id,
                'template_name' => $templateName,
                'view_name' => $viewName,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'pdf_data' => $pdfData
            ]);
            
            return response()->json([
                'error' => 'Failed to generate resume PDF: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dashboard data as JSON for AJAX requests.
     */
    public function getDashboardData()
    {
        $user = Auth::user();
        
        // Get user's resumes with latest first
        $resumes = $user->resumes()
            ->latest()
            ->get()
            ->map(function ($resume) {
                $progress = $resume->getProgressPercentage();
                
                // Determine accurate status based on progress and payment
                $actualStatus = $this->determineResumeStatus($resume, $progress);
                
                return [
                    'id' => $resume->id,
                    'name' => $resume->name,
                    'creation_date' => $resume->formatted_creation_date,
                    'updated_at' => $resume->updated_at->toISOString(),
                    'status' => $actualStatus,
                    'template_id' => $resume->template_id,
                    'template_name' => $resume->template_name,
                    'user_id' => $resume->user_id,
                    'progress' => $progress,
                    'is_paid' => $resume->is_paid,
                    'needs_payment' => $resume->needsPayment(),
                    'is_downloadable' => $resume->isDownloadable(),
                    'can_be_edited' => $resume->canBeEdited(),
                    'payment_status_detailed' => $resume->getPaymentStatus(),
                    'last_paid_at' => $resume->last_paid_at?->toISOString(),
                    'last_modified_at' => $resume->last_modified_at?->toISOString(),
                ];
            });

        // Get user's payment proofs - get the latest proof for each resume (including pending and rejected)
        $paymentProofs = $user->paymentProofs()
            ->whereIn('id', function($query) use ($user) {
                $query->selectRaw('MAX(id)')
                    ->from('payment_proofs')
                    ->where('user_id', $user->id)
                    ->groupBy('resume_id');
            })
            ->get()
            ->map(function ($proof) {
                return [
                    'id' => $proof->id,
                    'resume_id' => $proof->resume_id,
                    'status' => $proof->status,
                    'created_at' => $proof->created_at->toISOString(),
                    'updated_at' => $proof->updated_at->toISOString(),
                ];
            });

        // Add payment status to each resume using the detailed status
        $resumesWithPaymentStatus = $resumes->map(function ($resume) {
            // Use the detailed payment status from the Resume model
            $resume['payment_status'] = $resume['payment_status_detailed'];
            return $resume;
        });

        return response()->json([
            'resumes' => $resumesWithPaymentStatus,
            'paymentProofs' => $paymentProofs,
            'stats' => [
                'total_resumes' => $user->total_resumes_count,
                'completed_resumes' => $user->completed_resumes_count,
                'draft_resumes' => $user->resumes()->where('status', Resume::STATUS_DRAFT)->count(),
            ],
        ]);
    }

    /**
     * Mark a paid resume as needing payment due to upcoming edit.
     */
    public function markAsModifiedForEdit(Request $request, Resume $resume)
    {
        // Ensure user owns the resume
        if ($resume->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access to resume.');
        }

        // Only mark as modified if it was previously paid
        if ($resume->is_paid && $resume->last_paid_at) {
            $resume->markAsModified();
            
            return response()->json([
                'message' => 'Resume marked as needing payment',
                'resume' => [
                    'id' => $resume->id,
                    'name' => $resume->name,
                    'is_paid' => $resume->is_paid,
                    'needs_payment' => $resume->needsPayment(),
                    'is_downloadable' => $resume->isDownloadable(),
                    'payment_status_detailed' => $resume->getPaymentStatus(),
                    'updated_at' => $resume->updated_at->toISOString(),
                ]
            ]);
        }

        return response()->json([
            'message' => 'Resume was not previously paid',
            'resume' => [
                'id' => $resume->id,
                'name' => $resume->name,
                'is_paid' => $resume->is_paid,
                'needs_payment' => $resume->needsPayment(),
                'is_downloadable' => $resume->isDownloadable(),
                'payment_status_detailed' => $resume->getPaymentStatus(),
            ]
        ]);
    }

    /**
     * Rename a resume.
     */
    public function rename(Request $request, Resume $resume)
    {
        // Ensure user owns the resume
        if ($resume->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access to resume.');
        }

        $request->validate([
            'name' => 'required|string|max:255|min:1',
        ]);

        $newName = trim($request->input('name'));
        
        // Check if name actually changed
        if ($newName === $resume->name) {
            return response()->json([
                'message' => 'Resume name unchanged',
                'resume' => $resume
            ]);
        }

        $resume->update(['name' => $newName]);

        return response()->json([
            'message' => 'Resume renamed successfully',
            'resume' => [
                'id' => $resume->id,
                'name' => $resume->name,
                'updated_at' => $resume->updated_at->toISOString(),
            ]
        ]);
    }

    /**
     * Duplicate a resume.
     */
    public function duplicate(Resume $resume)
    {
        // Ensure user owns the resume
        if ($resume->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access to resume.');
        }

        $duplicatedResume = $resume->replicate();
        $duplicatedResume->name = $resume->name . ' (Copy)';
        $duplicatedResume->status = Resume::STATUS_DRAFT;
        $duplicatedResume->save();

        return response()->json([
            'message' => 'Resume duplicated successfully',
            'resume' => $duplicatedResume
        ]);
    }

    /**
     * Determine the actual status of a resume based on its progress and payment status.
     */
    private function determineResumeStatus($resume, $progress)
    {
        // Get payment status for this resume
        $latestPaymentProof = $resume->paymentProofs()->latest()->first();
        $paymentStatus = $latestPaymentProof?->status;
        
        // If resume has been paid and approved, it's published
        if ($paymentStatus === 'approved') {
            return Resume::STATUS_PUBLISHED;
        }
        
        // If resume has substantial content (80%+ complete), consider it completed
        if ($progress >= 80) {
            return Resume::STATUS_COMPLETED;
        }
        
        // If resume has some content (20%+ complete), it's in progress
        if ($progress >= 20) {
            return Resume::STATUS_IN_PROGRESS;
        }
        
        // Otherwise, it's still a draft
        return Resume::STATUS_DRAFT;
    }

    /**
     * Return authoritative payment status for a specific resume
     */
    public function paymentStatus(Resume $resume)
    {
        // Ensure the resume belongs to the authenticated user
        if ($resume->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'resume_id' => $resume->id,
            'status_effective' => $resume->getPaymentStatus(),
            'is_paid' => (bool) $resume->is_paid,
            'needs_payment' => $resume->needsPayment(),
            'is_downloadable' => $resume->isDownloadable(),
            'last_paid_at' => $resume->last_paid_at?->toISOString(),
            'last_modified_at' => $resume->last_modified_at?->toISOString(),
            'updated_at' => $resume->updated_at->toISOString(),
        ]);
    }
} 