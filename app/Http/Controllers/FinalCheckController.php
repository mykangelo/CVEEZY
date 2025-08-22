<?php

namespace App\Http\Controllers;

use App\Models\Resume;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use GuzzleHttp\Client;
use Illuminate\Support\Str;

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
        // Combine non-sensitive text fields for spell checking (avoid PII)
        // Exclude contact PII (first/last name, phone, email, address, city, country, postCode)
        // Keep only: summary, desiredJobTitle, experience (jobTitle/employer/company/description),
        // education (degree/school/description), and skills names
        $textParts = [
            // Summary
            $resumeData['summary'] ?? '',

            // Optional desired job title (non-sensitive)
            $resumeData['contact']['desiredJobTitle'] ?? '',

            // Experiences: include jobTitle, employer/company, and description
            ...array_map(function ($exp) {
                return implode(' ', array_filter([
                    $exp['jobTitle'] ?? '',
                    $exp['employer'] ?? ($exp['company'] ?? ''),
                    $exp['description'] ?? '',
                ]));
            }, $resumeData['experiences'] ?? []),

            // Educations: include degree, school, and description
            ...array_map(function ($edu) {
                return implode(' ', array_filter([
                    $edu['degree'] ?? '',
                    $edu['school'] ?? '',
                    $edu['description'] ?? '',
                ]));
            }, $resumeData['educations'] ?? []),

            // Skills: names only
            implode(', ', array_column($resumeData['skills'] ?? [], 'name')),
        ];

        $textToCheck = implode("\n", array_filter($textParts));

        // Spell & grammar check via LanguageTool API
        $spellcheckMatches = [];
        if (!empty($textToCheck)) {
            try {
                                                // Cap payload size and avoid ellipsis which would skew offsets
                    $textToCheck = Str::limit($textToCheck, config('resume.final_check.max_text_length', 20000), '');

                // Derive language from app locale (e.g., en-US)
                $language = str_replace('_', '-', app()->getLocale() ?? 'en-US');

                // Allow custom/self-hosted LanguageTool endpoint via config
                $baseEndpoint = rtrim(config('services.languagetool.endpoint', 'https://api.languagetool.org'), '/');
                $endpoint = $baseEndpoint . '/v2/check';

                $client = new Client([
                    'timeout' => 5.0,
                    'connect_timeout' => 2.0,
                    'headers' => [
                        'User-Agent' => config('app.name', 'CVeezy') . '/1.0',
                    ],
                ]);

                $response = $client->post($endpoint, [
                    'form_params' => [
                        'text'     => $textToCheck,
                        'language' => $language,
                    ],
                ]);
                $spellcheckData = json_decode($response->getBody(), true);
                $allMatches = $spellcheckData['matches'] ?? [];
                
                // Filter to only include actual spelling mistakes, not grammar/style issues
                $spellcheckMatches = array_filter($allMatches, function($match) {
                    $category = strtolower($match['rule']['category']['name'] ?? '');
                    $ruleId   = strtolower($match['rule']['id'] ?? '');
                    $message  = strtolower($match['message'] ?? '');

                    // Allowlist of known spelling-related markers
                    $keywords = ['spelling', 'typos', 'typo', 'morfologik', 'morfo'];

                    $categoryMatches = false;
                    foreach ($keywords as $kw) {
                        if (strpos($category, $kw) !== false) { $categoryMatches = true; break; }
                    }

                    $ruleOrMessageMatches = false;
                    foreach ($keywords as $kw) {
                        if (strpos($ruleId, $kw) !== false || strpos($message, $kw) !== false) {
                            $ruleOrMessageMatches = true; break;
                        }
                    }

                    // Only include items that clearly indicate spelling/typo issues
                    return $categoryMatches || $ruleOrMessageMatches;
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
