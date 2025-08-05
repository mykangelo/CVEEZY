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
                return [
                    'id' => $resume->id,
                    'name' => $resume->name,
                    'creation_date' => $resume->formatted_creation_date,
                    'updated_at' => $resume->updated_at->toISOString(),
                    'status' => $resume->status,
                    'template_id' => $resume->template_id,
                    'user_id' => $resume->user_id,
                    'progress' => $resume->getProgressPercentage(),
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

        return Inertia::render('Dashboard', [
            'resumes' => $resumes,
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
        $request->validate([
            'name' => 'required|string|max:255',
            'template_id' => 'integer|min:1|max:10',
            'resume_data' => 'array',
        ]);

        $user = Auth::user();

        $resume = $user->resumes()->create([
            'name' => $request->name,
            'template_id' => $request->template_id ?? 1,
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

        return response()->json([
            'message' => 'Resume created successfully',
            'resume' => $resume,
            'redirect' => route('builder', ['resume' => $resume->id])
        ]);
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

        $resume->update($updateData);

        return response()->json([
            'message' => 'Resume updated successfully',
            'resume' => $resume
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

        // Check if there's an approved payment proof for this resume
        $approvedPayment = $resume->paymentProofs()
            ->where('status', 'approved')
            ->first();

        if (!$approvedPayment) {
            return response()->json([
                'error' => 'Payment required to download PDF',
                'message' => 'Please complete payment and wait for admin approval to download your resume as PDF.'
            ], 403);
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
            'experiences' => array_map(function($exp) {
                return [
                    'jobTitle' => $exp['jobTitle'] ?? '',
                    'company' => $exp['employer'] ?? '',
                    'location' => $exp['company'] ?? '',
                    'startDate' => $exp['startDate'] ?? '',
                    'endDate' => $exp['endDate'] ?? '',
                    'description' => $exp['description'] ?? '',
                ];
            }, $resumeData['experiences'] ?? []),
            'education' => array_map(function($edu) {
                return [
                    'degree' => $edu['degree'] ?? '',
                    'school' => $edu['school'] ?? '',
                    'location' => $edu['location'] ?? '',
                    'startDate' => $edu['startDate'] ?? '',
                    'endDate' => $edu['endDate'] ?? '',
                    'description' => $edu['description'] ?? '',
                ];
            }, $resumeData['educations'] ?? []),
        ];

        // Generate PDF
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('resume.pdf', ['resume' => $pdfData]);
        
        return $pdf->download($resume->name . '_resume.pdf');
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
} 