<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Services\ResumeParsingService;
use App\Models\Resume;

class ResumeParsingController extends Controller
{
    private $parsingService;
    
    public function __construct(ResumeParsingService $parsingService)
    {
        $this->parsingService = $parsingService;
    }
    
    /**
     * Handle resume file upload and parsing
     */
    public function parseResume(Request $request)
    {
        try {
            // Validate request
            $validator = Validator::make($request->all(), [
                'resume_file' => 'required|file|mimes:pdf,doc,docx,txt,html,htm|max:10240', // 10MB max
                'template_name' => 'required|string|in:classic,creative,elegant,minimal,modern,professional'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Validation failed',
                    'details' => $validator->errors()
                ], 422);
            }
            
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'error' => 'Authentication required'
                ], 401);
            }
            
            // Check for pending payments
            $hasPendingPayments = $this->checkPendingPayments($user);
            if ($hasPendingPayments) {
                return response()->json([
                    'success' => false,
                    'error' => 'Cannot upload resume while payment is pending approval'
                ], 403);
            }
            
            $file = $request->file('resume_file');
            $templateName = $request->input('template_name', 'classic');
            
            Log::info('Resume parsing started', [
                'user_id' => $user->id,
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'template' => $templateName
            ]);
            
            // Parse the resume
            $parsingResult = $this->parsingService->parseResume($file);
            
            if (!$parsingResult['success']) {
                return response()->json([
                    'success' => false,
                    'error' => 'Failed to parse resume: ' . $parsingResult['error']
                ], 400);
            }
            
            // Create resume record with parsed data
            $resume = $this->createResumeFromParsedData(
                $user, 
                $parsingResult['data'], 
                $templateName,
                $file->getClientOriginalName()
            );
            
            Log::info('Resume parsing completed successfully', [
                'user_id' => $user->id,
                'resume_id' => $resume->id,
                'sections_extracted' => array_keys($parsingResult['data'])
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Resume parsed and created successfully',
                'resume_id' => $resume->id,
                'parsed_data' => $parsingResult['data'],
                'redirect_url' => route('builder', ['resume' => $resume->id])
            ], 200, [], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_IGNORE);
            
        } catch (\Exception $e) {
            Log::error('Resume parsing error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id(),
                'request_data' => $request->except(['resume_file'])
            ]);
            
            return response()->json([
                'success' => false,
                'error' => 'An unexpected error occurred while processing your resume'
            ], 500);
        }
    }
    
    /**
     * Get parsing status and preview data
     */
    public function getParsingPreview(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'resume_file' => 'required|file|mimes:pdf,doc,docx,txt,html,htm|max:10240'
            ]);
            
            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Invalid file',
                    'details' => $validator->errors()
                ], 422);
            }
            
            $file = $request->file('resume_file');
            
            // Parse without creating resume record
            $parsingResult = $this->parsingService->parseResume($file);
            
            if (!$parsingResult['success']) {
                return response()->json([
                    'success' => false,
                    'error' => 'Failed to preview resume: ' . $parsingResult['error']
                ], 400);
            }
            
            // Return preview data with parsing quality assessment
            $qualityAssessment = $this->assessParsingQuality($parsingResult['data']);
            
            return response()->json([
                'success' => true,
                'preview_data' => $parsingResult['data'],
                'quality_assessment' => $qualityAssessment,
                'raw_text_preview' => mb_substr($parsingResult['raw_text'] ?? '', 0, 500) . '...'
            ], 200, [], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_IGNORE);
            
        } catch (\Exception $e) {
            Log::error('Resume preview error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to preview resume'
            ], 500);
        }
    }
    
    /**
     * Check if user has pending payments
     */
    private function checkPendingPayments($user): bool
    {
        return $user->resumes()
            ->whereHas('paymentProofs', function($query) {
                $query->where('status', 'pending');
            })
            ->exists();
    }
    
    /**
     * Create resume record from parsed data
     */
    private function createResumeFromParsedData($user, array $parsedData, string $templateName, string $originalFileName): Resume
    {
        // Clean and validate parsed data
        $resumeData = $this->cleanParsedData($parsedData);
        
        // Generate resume name from original filename or contact info
        $resumeName = $this->generateResumeName($parsedData, $originalFileName);
        
        return Resume::create([
            'user_id' => $user->id,
            'name' => $resumeName,
            'template_name' => $templateName,
            'status' => Resume::STATUS_DRAFT,
            'resume_data' => $resumeData,
            'settings' => [
                'theme' => 'default',
                'font_size' => 'medium',
                'layout' => 'standard',
                'parsed_from_file' => true,
                'original_filename' => $originalFileName
            ],
            'is_paid' => false
        ]);
    }
    
    /**
     * Clean and validate parsed data
     */
    private function cleanParsedData(array $data): array
    {
        // Ensure all required fields exist with proper structure
        $cleanData = [
            'contact' => [
                'firstName' => $data['contact']['firstName'] ?? '',
                'lastName' => $data['contact']['lastName'] ?? '',
                'desiredJobTitle' => $data['contact']['desiredJobTitle'] ?? '',
                'phone' => $data['contact']['phone'] ?? '',
                'email' => $data['contact']['email'] ?? '',
                'country' => $data['contact']['country'] ?? '',
                'city' => $data['contact']['city'] ?? '',
                'address' => $data['contact']['address'] ?? '',
                'postCode' => $data['contact']['postCode'] ?? ''
            ],
            'experiences' => $this->cleanExperiences($data['experiences'] ?? []),
            'educations' => $this->cleanEducation($data['education'] ?? []),
            'skills' => $this->cleanSkills($data['skills'] ?? []),
            'summary' => $data['summary'] ?? '',
            'languages' => $data['languages'] ?? [],
            'certifications' => $data['certifications'] ?? [],
            'awards' => $data['awards'] ?? [],
            'websites' => $data['websites'] ?? [],
            'references' => $data['references'] ?? [],
            'hobbies' => $data['hobbies'] ?? []
        ];

        // Deep sanitize to valid UTF-8 to avoid JSON encoding issues
        $cleanData = $this->sanitizeDeep($cleanData);

        return $cleanData;
    }
    
    /**
     * Clean experience data
     */
    private function cleanExperiences(array $experiences): array
    {
        $cleaned = [];
        
        foreach ($experiences as $exp) {
            $cleaned[] = [
                'id' => $exp['id'] ?? count($cleaned) + 1,
                'jobTitle' => trim($exp['jobTitle'] ?? ''),
                'company' => trim($exp['company'] ?? ''),
                'location' => trim($exp['location'] ?? ''),
                'startDate' => $this->cleanDate($exp['startDate'] ?? ''),
                'endDate' => $this->cleanDate($exp['endDate'] ?? ''),
                'description' => trim($exp['description'] ?? '')
            ];
        }
        
        return $cleaned;
    }
    
    /**
     * Clean education data
     */
    private function cleanEducation(array $education): array
    {
        $cleaned = [];
        
        foreach ($education as $edu) {
            $cleaned[] = [
                'id' => $edu['id'] ?? count($cleaned) + 1,
                'school' => trim($edu['school'] ?? ''),
                'location' => trim($edu['location'] ?? ''),
                'degree' => trim($edu['degree'] ?? ''),
                'startDate' => $this->cleanDate($edu['startDate'] ?? ''),
                'endDate' => $this->cleanDate($edu['endDate'] ?? ''),
                'description' => trim($edu['description'] ?? '')
            ];
        }
        
        return $cleaned;
    }
    
    /**
     * Clean skills data
     */
    private function cleanSkills(array $skills): array
    {
        $cleaned = [];
        
        foreach ($skills as $skill) {
            if (is_string($skill)) {
                $cleaned[] = [
                    'id' => count($cleaned) + 1,
                    'name' => trim($skill),
                    'level' => ''
                ];
            } else {
                $cleaned[] = [
                    'id' => $skill['id'] ?? count($cleaned) + 1,
                    'name' => trim($skill['name'] ?? ''),
                    'level' => $skill['level'] ?? ''
                ];
            }
        }
        
        return $cleaned;
    }

    /**
     * Recursively sanitize all strings in an array to valid UTF-8
     */
    private function sanitizeDeep($value)
    {
        if (is_array($value)) {
            $sanitized = [];
            foreach ($value as $k => $v) {
                $sanitized[$k] = $this->sanitizeDeep($v);
            }
            return $sanitized;
        }
        if (is_string($value)) {
            $converted = @iconv('UTF-8', 'UTF-8//IGNORE', $value);
            if ($converted === false) {
                $converted = @mb_convert_encoding($value, 'UTF-8', 'auto');
            }
            if (!is_string($converted)) {
                $converted = $value;
            }
            // Strip non-printable control characters (keep tabs/newlines)
            $converted = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $converted);
            return $converted ?? '';
        }
        return $value;
    }
    
    /**
     * Clean date string
     */
    private function cleanDate(string $date): string
    {
        // Basic date cleaning - can be enhanced
        return trim($date);
    }
    
    /**
     * Generate resume name from parsed data
     */
    private function generateResumeName(array $parsedData, string $originalFileName): string
    {
        $contact = $parsedData['contact'] ?? [];
        
        // Try to use contact name
        if (!empty($contact['firstName']) || !empty($contact['lastName'])) {
            $name = trim(($contact['firstName'] ?? '') . ' ' . ($contact['lastName'] ?? ''));
            return $name . ' Resume';
        }
        
        // Fallback to cleaned filename
        $cleanName = pathinfo($originalFileName, PATHINFO_FILENAME);
        return $cleanName ?: 'Imported Resume';
    }
    
    /**
     * Assess parsing quality
     */
    private function assessParsingQuality(array $data): array
    {
        $quality = [
            'overall_score' => 0,
            'sections_found' => [],
            'missing_sections' => [],
            'confidence' => 'low',
            'suggestions' => []
        ];
        
        $sectionsToCheck = [
            'contact' => ['firstName', 'lastName', 'email'],
            'experiences' => [],
            'education' => [],
            'skills' => [],
            'summary' => []
        ];
        
        $score = 0;
        $maxScore = count($sectionsToCheck);
        
        foreach ($sectionsToCheck as $section => $requiredFields) {
            if ($section === 'summary') {
                if (!empty($data['summary'])) {
                    $quality['sections_found'][] = $section;
                    $score++;
                } else {
                    $quality['missing_sections'][] = $section;
                }
            } elseif (isset($data[$section]) && !empty($data[$section])) {
                if ($section === 'contact') {
                    $hasRequiredContact = false;
                    foreach ($requiredFields as $field) {
                        if (!empty($data['contact'][$field])) {
                            $hasRequiredContact = true;
                            break;
                        }
                    }
                    if ($hasRequiredContact) {
                        $quality['sections_found'][] = $section;
                        $score++;
                    } else {
                        $quality['missing_sections'][] = $section;
                    }
                } else {
                    $quality['sections_found'][] = $section;
                    $score++;
                }
            } else {
                $quality['missing_sections'][] = $section;
            }
        }
        
        $quality['overall_score'] = round(($score / $maxScore) * 100);
        
        // Determine confidence level
        if ($quality['overall_score'] >= 80) {
            $quality['confidence'] = 'high';
        } elseif ($quality['overall_score'] >= 60) {
            $quality['confidence'] = 'medium';
        } else {
            $quality['confidence'] = 'low';
        }
        
        // Generate suggestions
        if (in_array('contact', $quality['missing_sections'])) {
            $quality['suggestions'][] = 'Contact information could not be extracted. Please verify your name and email.';
        }
        if (in_array('experiences', $quality['missing_sections'])) {
            $quality['suggestions'][] = 'Work experience section not found. You may need to add this manually.';
        }
        if (in_array('education', $quality['missing_sections'])) {
            $quality['suggestions'][] = 'Education section not found. Please add your educational background.';
        }
        
        return $quality;
    }
}
