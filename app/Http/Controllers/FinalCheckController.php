<?php

namespace App\Http\Controllers;

use App\Models\Resume;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use GuzzleHttp\Client;

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

        // Combine all text fields into one string for spell checking
        $textToCheck = implode("\n", [
            // Contact information - ALL fields including job title
            $resumeData['contact']['firstName'] ?? '',
            $resumeData['contact']['lastName'] ?? '',
            $resumeData['contact']['desiredJobTitle'] ?? '',
            $resumeData['contact']['phone'] ?? '',
            $resumeData['contact']['email'] ?? '',
            $resumeData['contact']['address'] ?? '',
            $resumeData['contact']['city'] ?? '',
            $resumeData['contact']['country'] ?? '',
            $resumeData['contact']['postCode'] ?? '',
            
            // Summary
            $resumeData['summary'] ?? '',
            
            // Experiences - ALL fields including job titles, company names, etc.
            ...array_map(function($exp) {
                return implode(' ', [
                    $exp['jobTitle'] ?? '',
                    $exp['employer'] ?? '',
                    $exp['company'] ?? '',
                    $exp['location'] ?? '',
                    $exp['description'] ?? ''
                ]);
            }, $resumeData['experiences'] ?? []),
            
            // Educations - ALL fields including school names, degrees, etc.
            ...array_map(function($edu) {
                return implode(' ', [
                    $edu['school'] ?? '',
                    $edu['location'] ?? '',
                    $edu['degree'] ?? '',
                    $edu['description'] ?? ''
                ]);
            }, $resumeData['educations'] ?? []),
            
            // Skills
            implode(', ', array_column($resumeData['skills'] ?? [], 'name')),
        ]);

        // Spell & grammar check via LanguageTool API
        $spellcheckMatches = [];
        if (!empty($textToCheck)) {
            try {
                $client = new Client();
                $response = $client->post('https://api.languagetool.org/v2/check', [
                    'form_params' => [
                        'text'     => $textToCheck,
                        'language' => 'en-US',
                    ],
                ]);
                $spellcheckData = json_decode($response->getBody(), true);
                $allMatches = $spellcheckData['matches'] ?? [];
                
                // Filter to only include actual spelling mistakes, not grammar/style issues
                $spellcheckMatches = array_filter($allMatches, function($match) {
                    $category = $match['rule']['category']['name'] ?? '';
                    $ruleId = $match['rule']['id'] ?? '';
                    $message = $match['message'] ?? '';
                    
                    // Only include actual spelling mistakes, not grammar, style, or formatting issues
                    return strtolower($category) === 'spelling' || 
                           strpos(strtolower($ruleId), 'spell') !== false ||
                           strpos(strtolower($message), 'spell') !== false;
                });
                
                // Re-index the array
                $spellcheckMatches = array_values($spellcheckMatches);
            } catch (\Exception $e) {
                \Log::error('Spell check failed: ' . $e->getMessage());
            }
        }

        return Inertia::render('FinalCheck', [
            'resumeId' => $resume?->id,
            'templateName' => $resume?->template_name ?? 'classic',
            'contact' => $resumeData['contact'] ?? [],
            'experiences' => $resumeData['experiences'] ?? [],
            'educations' => $resumeData['educations'] ?? [],
            'skills' => $resumeData['skills'] ?? [],
            'summary' => $resumeData['summary'] ?? '',
            'spellcheck' => $spellcheckMatches, // Pass spell check results to React
        ]);
    }
}
