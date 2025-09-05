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

        // Enhanced text extraction for accurate server-side spell checking
        // Clean and normalize text for better spell checking
        $cleanText = function($text) {
            if (empty($text)) return '';
            return trim(preg_replace('/\s+/', ' ', preg_replace('/[^\w\s\-.,!?]/', '', $text)));
        };

        // Extract and clean text from different sections
        $textParts = [];

        // Summary
        $summary = $cleanText($resumeData['summary'] ?? '');
        if (!empty($summary)) {
            $textParts[] = $summary;
        }

        // Desired job title (non-sensitive)
        $desiredJobTitle = $cleanText($resumeData['contact']['desiredJobTitle'] ?? '');
        if (!empty($desiredJobTitle)) {
            $textParts[] = $desiredJobTitle;
        }

        // Experiences: include jobTitle, employer/company, and description
        $experienceTexts = array_map(function ($exp) use ($cleanText) {
            $parts = array_filter([
                $exp['jobTitle'] ?? '',
                $exp['employer'] ?? ($exp['company'] ?? ''),
                $exp['description'] ?? '',
            ]);
            
            return implode(' ', array_map($cleanText, $parts));
        }, $resumeData['experiences'] ?? []);
        
        $textParts = array_merge($textParts, array_filter($experienceTexts));

        // Educations: include degree, school, and description
        $educationTexts = array_map(function ($edu) use ($cleanText) {
            $parts = array_filter([
                $edu['degree'] ?? '',
                $edu['school'] ?? '',
                $edu['description'] ?? '',
            ]);
            
            return implode(' ', array_map($cleanText, $parts));
        }, $resumeData['educations'] ?? []);
        
        $textParts = array_merge($textParts, array_filter($educationTexts));

        // Skills: names only (handle both 'name' and 'skill' keys)
        $skills = array_map(function($skill) {
            return $skill['name'] ?? $skill['skill'] ?? '';
        }, $resumeData['skills'] ?? []);
        
        $skillsText = implode(', ', array_filter(array_map($cleanText, $skills)));
        if (!empty($skillsText)) {
            $textParts[] = $skillsText;
        }

        $textToCheck = implode("\n", array_filter($textParts));
        
        \Log::info('Server-side text extraction completed', [
            'summary_length' => strlen($summary),
            'experience_count' => count($resumeData['experiences'] ?? []),
            'education_count' => count($resumeData['educations'] ?? []),
            'skills_count' => count($resumeData['skills'] ?? []),
            'total_length' => strlen($textToCheck),
            'text_preview' => substr($textToCheck, 0, 200) . '...'
        ]);

        // Spell & grammar check via LanguageTool API
        $spellcheckMatches = [];
        if (!empty($textToCheck)) {
            \Log::info('Starting server-side spell check', [
                'text_length' => strlen($textToCheck),
                'text_preview' => substr($textToCheck, 0, 100) . '...'
            ]);
            
            try {
                                                // Cap payload size and avoid ellipsis which would skew offsets
                    $textToCheck = Str::limit($textToCheck, config('resume.final_check.max_text_length', 20000), '');

                // Derive language from app locale (e.g., en-US)
                $language = str_replace('_', '-', app()->getLocale() ?? 'en-US');

                // Use the configured LanguageTool endpoint (now includes full path)
                $endpoint = config('services.languagetool.endpoint', 'https://api.languagetool.org/v2/check');

                // Configure SSL verification based on environment
                $verifySsl = config('services.languagetool.verify_ssl', true);
                $caBundle = config('services.languagetool.ca_bundle');
                
                $clientConfig = [
                    'timeout' => config('services.languagetool.timeout', 10.0),
                    'connect_timeout' => 5.0,
                    'headers' => [
                        'User-Agent' => config('app.name', 'CVeezy') . '/1.0',
                        'Accept' => 'application/json',
                    ],
                    'http_errors' => false, // Don't throw exceptions on HTTP errors
                ];
                
                // Handle SSL verification
                if ($verifySsl) {
                    if ($caBundle && file_exists($caBundle)) {
                        $clientConfig['verify'] = $caBundle; // Use custom CA bundle
                    } else {
                        $clientConfig['verify'] = true; // Use system default
                    }
                } else {
                    $clientConfig['verify'] = false; // Disable SSL verification (development only)
                }
                
                $client = new Client($clientConfig);

                $response = $client->post($endpoint, [
                    'form_params' => [
                        'text'         => substr($textToCheck, 0, 20000), // Limit text length
                        'language'     => $language,
                        'enabledOnly'  => 'false', // Enable all rules
                        'enabledRules' => 'MORFOLOGIK_RULE_EN_US,SPELLING_RULE', // Focus on spelling rules
                        'disabledRules' => 'WHITESPACE_RULE,COMMA_PARENTHESIS_WHITESPACE', // Disable formatting rules
                    ],
                ]);
                
                // Check if the request was successful
                if ($response->getStatusCode() !== 200) {
                    \Log::warning('LanguageTool API returned non-200 status', [
                        'status' => $response->getStatusCode(),
                        'body' => $response->getBody()->getContents()
                    ]);
                    throw new \Exception('API returned status: ' . $response->getStatusCode());
                }
                
                $responseBody = $response->getBody()->getContents();
                $spellcheckData = json_decode($responseBody, true);
                
                if (json_last_error() !== JSON_ERROR_NONE) {
                    \Log::error('Failed to parse LanguageTool API response', [
                        'json_error' => json_last_error_msg(),
                        'response_body' => $responseBody
                    ]);
                    throw new \Exception('Invalid JSON response from API');
                }
                
                $allMatches = $spellcheckData['matches'] ?? [];
                
                // Enhanced filtering for more accurate spell check results
                $spellcheckMatches = array_filter($allMatches, function($match) {
                    if (empty($match) || empty($match['rule'])) {
                        return false;
                    }
                    
                    $category = strtolower($match['rule']['category']['name'] ?? '');
                    $ruleId = strtolower($match['rule']['id'] ?? '');
                    $message = strtolower($match['message'] ?? '');
                    $shortMessage = strtolower($match['rule']['description'] ?? '');

                    // Spelling-related keywords (expanded list)
                    $spellingKeywords = [
                        'spelling', 'typos', 'typo', 'morfologik', 'morfo', 
                        'misspelling', 'misspell', 'spell', 'word', 'unknown word',
                        'not found', 'unrecognized', 'incorrect'
                    ];
                    
                    // Grammar/style keywords to exclude
                    $excludeKeywords = [
                        'grammar', 'style', 'punctuation', 'capitalization', 
                        'whitespace', 'comma', 'period', 'semicolon', 'colon',
                        'apostrophe', 'quotation', 'bracket', 'parenthesis',
                        'sentence', 'paragraph', 'formatting', 'layout'
                    ];
                    
                    // Check if it's a spelling issue
                    $isSpellingIssue = false;
                    foreach ($spellingKeywords as $keyword) {
                        if (strpos($category, $keyword) !== false || 
                            strpos($ruleId, $keyword) !== false || 
                            strpos($message, $keyword) !== false ||
                            strpos($shortMessage, $keyword) !== false) {
                            $isSpellingIssue = true;
                            break;
                        }
                    }
                    
                    // Check if it should be excluded
                    $shouldExclude = false;
                    foreach ($excludeKeywords as $keyword) {
                        if (strpos($category, $keyword) !== false || 
                            strpos($ruleId, $keyword) !== false || 
                            strpos($message, $keyword) !== false ||
                            strpos($shortMessage, $keyword) !== false) {
                            $shouldExclude = true;
                            break;
                        }
                    }
                    
                    // Additional checks for better accuracy
                    $hasValidOffset = isset($match['offset']) && is_numeric($match['offset']) && $match['offset'] >= 0;
                    $hasValidLength = isset($match['length']) && is_numeric($match['length']) && $match['length'] > 0;
                    $hasSuggestions = !empty($match['replacements']) && is_array($match['replacements']);
                    
                    return $isSpellingIssue && !$shouldExclude && $hasValidOffset && $hasValidLength && $hasSuggestions;
                });
                
                // Re-index the array
                $spellcheckMatches = array_values($spellcheckMatches);
                
                \Log::info('Server-side spell check completed successfully', [
                    'total_matches' => count($allMatches),
                    'filtered_matches' => count($spellcheckMatches),
                    'language' => $language,
                    'text_length' => strlen($textToCheck),
                    'filtering_accuracy' => count($allMatches) > 0 ? round((count($spellcheckMatches) / count($allMatches)) * 100, 2) . '%' : 'N/A'
                ]);
            } catch (\Exception $e) {
                \Log::error('Spell check failed', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'text_length' => strlen($textToCheck),
                    'language' => $language,
                    'endpoint' => $endpoint
                ]);
                
                // Set empty array on error so client-side can take over
                $spellcheckMatches = [];
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
