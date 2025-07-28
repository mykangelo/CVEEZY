<?php

namespace App\Http\Controllers;

use App\Models\Resume;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the user dashboard.
     */
    public function index(): Response
    {
        $user = Auth::user();
        
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

        return Inertia::render('Dashboard', [
            'resumes' => $resumes,
            'stats' => [
                'total_resumes' => $user->total_resumes_count,
                'completed_resumes' => $user->completed_resumes_count,
                'draft_resumes' => $user->resumes()->where('status', Resume::STATUS_DRAFT)->count(),
            ]
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
        ]);

        $user = Auth::user();

        $resume = $user->resumes()->create([
            'name' => $request->name,
            'template_id' => $request->template_id ?? 1,
            'status' => Resume::STATUS_DRAFT,
            'resume_data' => [
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

        // TODO: Implement PDF generation
        // For now, return a placeholder response
        return response()->json([
            'message' => 'PDF download feature coming soon!',
            'resume_id' => $resume->id,
            'resume_name' => $resume->name
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
} 