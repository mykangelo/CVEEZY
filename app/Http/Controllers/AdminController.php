<?php

namespace App\Http\Controllers;

use App\Models\PaymentProof;
use App\Models\Resume;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function index()
    {
        // Load all payment proofs with their user and resume
        $proofs = PaymentProof::with('user', 'resume')->latest()->get();
        return response()->json($proofs);
    }

    public function dashboard()
    {
        $stats = [
            'total_users' => User::count(),
            'total_resumes' => Resume::count(),
            'total_payments' => PaymentProof::count(),
            'pending_payments' => PaymentProof::where('status', 'pending')->count(),
            'approved_payments' => PaymentProof::where('status', 'approved')->count(),
            'rejected_payments' => PaymentProof::where('status', 'rejected')->count(),
        ];

        $users = User::withCount('resumes')->latest()->get();
        $resumes = Resume::with('user')->latest()->get();
        $paymentProofs = PaymentProof::with('user', 'resume')->latest()->get();

        return Inertia::render('AdminDashboard', [
            'stats' => $stats,
            'users' => $users,
            'resumes' => $resumes,
            'paymentProofs' => $paymentProofs,
        ]);
    }

    public function users()
    {
        $users = User::withCount('resumes')->latest()->get();
        return response()->json($users);
    }

    public function resumes()
    {
        $resumes = Resume::with('user')->latest()->get();
        return response()->json($resumes);
    }

    public function statistics()
    {
        $stats = [
            'total_users' => User::count(),
            'total_resumes' => Resume::count(),
            'total_payments' => PaymentProof::count(),
            'pending_payments' => PaymentProof::where('status', 'pending')->count(),
            'approved_payments' => PaymentProof::where('status', 'approved')->count(),
            'rejected_payments' => PaymentProof::where('status', 'rejected')->count(),
            'paid_resumes' => Resume::where('is_paid', true)->count(),
            'unpaid_resumes' => Resume::where('is_paid', false)->count(),
        ];

        return response()->json($stats);
    }

    /**
     * View user details with their resumes and payment proofs
     */
    public function viewUser($id)
    {
        $user = User::with(['resumes', 'paymentProofs.resume'])->findOrFail($id);
        
        return Inertia::render('AdminUserDetails', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'created_at' => $user->created_at->toISOString(),
                'is_admin' => $user->is_admin,
                'resumes' => $user->resumes->map(function ($resume) {
                    return [
                        'id' => $resume->id,
                        'name' => $resume->name,
                        'status' => $resume->status,
                        'is_paid' => $resume->is_paid,
                        'created_at' => $resume->created_at->toISOString(),
                        'updated_at' => $resume->updated_at->toISOString(),
                    ];
                }),
                'payment_proofs' => $user->paymentProofs->map(function ($proof) {
                    return [
                        'id' => $proof->id,
                        'status' => $proof->status,
                        'file_path' => $proof->file_path,
                        'created_at' => $proof->created_at->toISOString(),
                        'resume' => $proof->resume ? [
                            'id' => $proof->resume->id,
                            'name' => $proof->resume->name,
                        ] : null,
                    ];
                }),
            ],
        ]);
    }

    /**
     * View resume details
     */
    public function viewResume($id)
    {
        $resume = Resume::with(['user', 'paymentProofs'])->findOrFail($id);
        
        return Inertia::render('AdminResumeDetails', [
            'resume' => [
                'id' => $resume->id,
                'name' => $resume->name,
                'status' => $resume->status,
                'is_paid' => $resume->is_paid,
                'template_id' => $resume->template_id,
                'created_at' => $resume->created_at->toISOString(),
                'updated_at' => $resume->updated_at->toISOString(),
                'user' => [
                    'id' => $resume->user->id,
                    'name' => $resume->user->name,
                    'email' => $resume->user->email,
                ],
                'payment_proofs' => $resume->paymentProofs->map(function ($proof) {
                    return [
                        'id' => $proof->id,
                        'status' => $proof->status,
                        'file_path' => $proof->file_path,
                        'created_at' => $proof->created_at->toISOString(),
                    ];
                }),
            ],
        ]);
    }

    /**
     * Download resume PDF
     */
    public function downloadResume($id)
    {
        $resume = Resume::with('user')->findOrFail($id);
        
        // Check if resume is paid
        if (!$resume->is_paid) {
            return response()->json(['message' => 'Resume is not paid. Cannot download.'], 403);
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

        // Generate PDF using the same logic as DashboardController
        try {
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('resume.pdf', ['resume' => $pdfData]);
            return $pdf->download($resume->name . '_resume.pdf');
        } catch (\Exception $e) {
            \Log::error('Error generating PDF for resume', [
                'resume_id' => $resume->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['message' => 'Error generating PDF: ' . $e->getMessage()], 500);
        }
    }

    public function approve($id)
    {
        try {
            \Log::info('Admin approving payment proof', ['payment_id' => $id]);
            
            $proof = PaymentProof::with('user', 'resume')->findOrFail($id);
            
            // Check if payment is already approved
            if ($proof->status === 'approved') {
                return response()->json(['message' => 'Payment is already approved.'], 400);
            }
            
            // Update payment proof status
            $proof->status = 'approved';
            $proof->save();
            
            // Update resume payment status
            if ($proof->resume) {
                $proof->resume->is_paid = true;
                $proof->resume->save();
            }
            
            \Log::info('Payment proof approved successfully', [
                'payment_id' => $proof->id,
                'user_id' => $proof->user_id,
                'resume_id' => $proof->resume_id
            ]);
            
            return response()->json([
                'message' => 'Payment approved successfully.',
                'payment_id' => $proof->id,
                'user_id' => $proof->user_id,
                'resume_id' => $proof->resume_id
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error approving payment proof', [
                'payment_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['message' => 'Error approving payment: ' . $e->getMessage()], 500);
        }
    }

    public function reject($id)
    {
        try {
            \Log::info('Admin rejecting payment proof', ['payment_id' => $id]);
            
            $proof = PaymentProof::with('user', 'resume')->findOrFail($id);
            
            // Check if payment is already rejected
            if ($proof->status === 'rejected') {
                return response()->json(['message' => 'Payment is already rejected.'], 400);
            }
            
            // Update payment proof status
            $proof->status = 'rejected';
            $proof->save();
            
            // Reset resume payment status if it was previously approved
            if ($proof->resume && $proof->resume->is_paid) {
                $proof->resume->is_paid = false;
                $proof->resume->save();
            }
            
            \Log::info('Payment proof rejected successfully', [
                'payment_id' => $proof->id,
                'user_id' => $proof->user_id,
                'resume_id' => $proof->resume_id
            ]);
            
            return response()->json([
                'message' => 'Payment rejected successfully.',
                'payment_id' => $proof->id,
                'user_id' => $proof->user_id,
                'resume_id' => $proof->resume_id
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error rejecting payment proof', [
                'payment_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['message' => 'Error rejecting payment: ' . $e->getMessage()], 500);
        }
    }

    /**
     * View/download payment proof file
     */
    public function viewPaymentProof($id)
    {
        try {
            $proof = PaymentProof::with('user', 'resume')->findOrFail($id);
            
            // Check if file exists
            if (!Storage::disk('public')->exists($proof->file_path)) {
                abort(404, 'Payment proof file not found.');
            }
            
            // Get file path
            $filePath = Storage::disk('public')->path($proof->file_path);
            
            // Get file info
            $fileName = basename($proof->file_path);
            $mimeType = Storage::disk('public')->mimeType($proof->file_path);
            
            // Return file for viewing/downloading
            return response()->file($filePath, [
                'Content-Type' => $mimeType,
                'Content-Disposition' => 'inline; filename="' . $fileName . '"'
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error viewing payment proof', [
                'payment_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            abort(404, 'Payment proof not found.');
        }
    }

    /**
     * Delete a resume
     */
    public function deleteResume($id)
    {
        try {
            $resume = Resume::findOrFail($id);
            
            // Log the deletion
            \Log::info('Resume deleted by admin', [
                'resume_id' => $resume->id,
                'resume_name' => $resume->name,
                'user_id' => $resume->user_id,
                'user_email' => $resume->user->email,
                'admin_id' => auth()->id(),
            ]);
            
            // Delete associated payment proofs first
            $resume->paymentProofs()->delete();
            
            // Delete the resume
            $resume->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Resume deleted successfully.',
                'deleted_resume' => [
                    'id' => $resume->id,
                    'name' => $resume->name,
                    'user_email' => $resume->user->email,
                ]
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error deleting resume', [
                'resume_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete resume. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dashboard data for polling
     */
    public function dashboardData()
    {
        // Get updated stats
        $stats = [
            'total_users' => User::count(),
            'total_resumes' => Resume::count(),
            'total_payments' => PaymentProof::count(),
            'pending_payments' => PaymentProof::where('status', 'pending')->count(),
            'approved_payments' => PaymentProof::where('status', 'approved')->count(),
            'rejected_payments' => PaymentProof::where('status', 'rejected')->count(),
        ];

        // Get updated users
        $users = User::withCount('resumes')->latest()->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'created_at' => $user->created_at->toISOString(),
                'resumes_count' => $user->resumes_count,
                'is_admin' => $user->is_admin,
            ];
        });

        // Get updated resumes
        $resumes = Resume::with('user')->latest()->get()->map(function ($resume) {
            return [
                'id' => $resume->id,
                'name' => $resume->name,
                'user' => [
                    'name' => $resume->user->name,
                    'email' => $resume->user->email,
                ],
                'status' => $resume->status,
                'is_paid' => $resume->is_paid,
                'created_at' => $resume->created_at->toISOString(),
            ];
        });

        // Get updated payment proofs
        $paymentProofs = PaymentProof::with('user', 'resume')->latest()->get()->map(function ($proof) {
            return [
                'id' => $proof->id,
                'user' => [
                    'id' => $proof->user->id,
                    'name' => $proof->user->name,
                    'email' => $proof->user->email,
                ],
                'resume' => [
                    'id' => $proof->resume->id,
                    'name' => $proof->resume->name,
                    'is_paid' => $proof->resume->is_paid,
                ],
                'file_path' => $proof->file_path,
                'status' => $proof->status,
                'created_at' => $proof->created_at->toISOString(),
            ];
        });

        return response()->json([
            'stats' => $stats,
            'users' => $users,
            'resumes' => $resumes,
            'paymentProofs' => $paymentProofs,
        ]);
    }
}
