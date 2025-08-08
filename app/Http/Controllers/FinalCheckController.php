<?php

namespace App\Http\Controllers;

use App\Models\Resume;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class FinalCheckController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $resumeId = $request->get('resume');
        
        \Log::info('FinalCheck page accessed', [
            'user_id' => $user->id,
            'resume_id' => $resumeId,
            'all_params' => $request->all()
        ]);
        
        $resume = null;
        if ($resumeId) {
            $resume = $user->resumes()->find($resumeId);
            \Log::info('Resume lookup result', [
                'resume_id' => $resumeId,
                'found' => $resume ? 'yes' : 'no',
                'resume_name' => $resume?->name
            ]);
        }

        // Get resume data for display
        $resumeData = $resume ? $resume->resume_data : [];
        if (is_string($resumeData)) {
            $resumeData = json_decode($resumeData, true);
        }

        // Normalize legacy fields
        $experiences = $resumeData['experiences'] ?? [];
        if (is_array($experiences)) {
            $experiences = array_map(function ($exp) {
                if (is_array($exp)) {
                    // Map legacy 'company' to new 'location' if needed
                    if (!isset($exp['location']) && isset($exp['company'])) {
                        $exp['location'] = $exp['company'];
                    }
                }
                return $exp;
            }, $experiences);
        }

        return Inertia::render('FinalCheck', [
            'resumeId' => $resume?->id,
            'contact' => $resumeData['contact'] ?? [],
            'experiences' => $experiences,
            'educations' => $resumeData['educations'] ?? [],
            'skills' => $resumeData['skills'] ?? [],
            'summary' => $resumeData['summary'] ?? '',
            // Additional sections for Finalize step
            'languages' => $resumeData['languages'] ?? [],
            'certifications' => $resumeData['certifications'] ?? [],
            'awards' => $resumeData['awards'] ?? [],
            'websites' => $resumeData['websites'] ?? [],
            'showReferences' => $resumeData['showReferences'] ?? [],
            'hobbies' => $resumeData['hobbies'] ?? [],
            'customSections' => $resumeData['customSections'] ?? [],
        ]);
    }
} 