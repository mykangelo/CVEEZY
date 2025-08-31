<?php

namespace App\Http\Controllers;

use App\Services\GeminiService;
use Illuminate\Http\Request;
use App\Models\Resume;
use Illuminate\Support\Facades\Auth;

class AIController extends Controller
{
    /**
     * Get regeneration parameters based on content type and user preferences
     */
    private function getRegenerationParameters($contentType = 'summary', $preset = null, $userParams = [])
    {
        $config = config('ai_enhancement.regeneration_parameters');
        
        // Get default preset for content type
        $defaultPreset = $config['content_type_adjustments'][$contentType]['default_preset'] ?? 'balanced';
        $presetToUse = $preset ?: $defaultPreset;
        
        // Get base parameters from preset
        $baseParams = $config['presets'][$presetToUse] ?? $config['presets']['balanced'];
        
        // Apply content type adjustments
        $contentAdjustments = $config['content_type_adjustments'][$contentType] ?? [];
        $adjustedParams = [
            'temperature' => $baseParams['temperature'] + ($contentAdjustments['temperature_boost'] ?? 0),
            'topP' => $baseParams['topP'],
            'topK' => $baseParams['topK'],
            'max_tokens' => $baseParams['max_tokens'] + ($contentAdjustments['max_tokens_boost'] ?? 0)
        ];
        
        // Apply user parameter overrides if allowed
        if (config('ai_enhancement.user_preferences.allow_parameter_override', true)) {
            foreach ($userParams as $param => $value) {
                if (isset($adjustedParams[$param])) {
                    $adjustedParams[$param] = $value;
                }
            }
        }
        
        // Apply constraints
        $constraints = config('ai_enhancement.user_preferences.parameter_constraints', []);
        foreach ($constraints as $param => $constraint) {
            if (isset($adjustedParams[$param])) {
                $adjustedParams[$param] = max($constraint['min'], min($constraint['max'], $adjustedParams[$param]));
            }
        }
        
        \Log::info('Regeneration parameters calculated', [
            'content_type' => $contentType,
            'preset' => $presetToUse,
            'base_params' => $baseParams,
            'adjusted_params' => $adjustedParams,
            'user_params' => $userParams
        ]);
        
        return $adjustedParams;
    }

    public function ask(GeminiService $gemini)
    {
        $prompt = "Can you give the full 'Lorem Ipsum?'";
        $result = $gemini->generateText($prompt);

        return response()->json($result);
    }

    // Removed reviseText endpoint in favor of generateSummary-only flow

    // Prompt handler for the education descriptions
    public function reviseEducationDescription(Request $request, GeminiService $gemini)
    {
        $request->validate([
            'text' => 'required|string',
            'variant' => 'nullable|string', // Add variant for different styles
            'degree' => 'required|string|min:2', // Required degree field
            'school' => 'required|string|min:2'  // Required school field
        ]);

        // Check if required fields have meaningful content
        if (empty(trim($request->degree)) || empty(trim($request->school))) {
            return response()->json([
                'error' => 'Missing required fields',
                'message' => 'Degree and School are required for AI generation. Please fill in these fields first.',
                'required_fields' => ['degree', 'school']
            ], 400);
        }

        // Check if the text is too short or generic
        $minLength = config('resume.ai_enhancement.validation.min_text_length.education', 10);
        if (strlen(trim($request->text)) < $minLength) {
            return response()->json([
                'error' => 'Insufficient content',
                'message' => "Please provide more details about your education before using AI generation (minimum {$minLength} characters).",
                'min_length' => $minLength
            ], 400);
        }

        // Check for generic content if enabled
        if (config('resume.ai_enhancement.validation.prevent_generic_content', true)) {
            $genericPhrases = config('resume.ai_enhancement.validation.generic_phrases', []);
            $text = strtolower(trim($request->text));
            foreach ($genericPhrases as $phrase) {
                if (strpos($text, strtolower($phrase)) !== false && strlen(trim($request->text)) < 30) {
                    return response()->json([
                        'error' => 'Generic content detected',
                        'message' => 'Please provide more specific details about your education before using AI generation.',
                        'suggestion' => 'Include specific courses, projects, achievements, or skills learned.'
                    ], 400);
                }
            }
        }

        try {
            $approaches = config('resume.ai_enhancement.content_variations.approaches', [
                "highlight academic achievements and relevant coursework",
                "emphasize practical skills gained and projects completed", 
                "focus on honors, awards, and standout accomplishments"
            ]);
            
            $randomApproach = $approaches[array_rand($approaches)];
            $variant = $request->input('variant');
            
            // Enhanced randomization for regeneration
            if ($variant) {
                $randomSeed = $variant . '-' . mt_rand(1000, 9999);
                $randomApproach = $approaches[array_rand($approaches)]; // Re-randomize approach
                $additionalRandom = mt_rand(1, 1000);
            } else {
                $randomSeed = mt_rand(config('resume.ai_enhancement.random_seed_range.min', 1000), config('resume.ai_enhancement.random_seed_range.max', 9999));
                $additionalRandom = 0;
            }
            
            $prompt = \App\Services\AIConfigService::getConsolidatedPrompt('education', [
                'count' => 1,
                'approach_requirements' => "1. First variation that {$randomApproach}",
                'regeneration_note' => \App\Services\AIConfigService::generateRegenerationNote($variant),
                'text' => $request->text
            ]);
            $result = $gemini->generateEnhancedContent($prompt, [
                'response_mime_type' => 'application/json',
                'maxOutputTokens' => 256, // Reduced for more focused output
                'temperature' => $variant ? 
                    0.9 + (mt_rand(0, 100) / 100) * 0.2 : // Moderate temp for regeneration
                    0.6 + (mt_rand(0, 100) / 100) * 0.2, // Lower temp for more focused output
            ]);
            $revised = $this->extractRevisedText($result, $request->text);
            
            // Quality check: If AI produces poor/generic content, use local variation
            $isPoorContent = $this->isPoorQualityContent($revised);
            $isSimilarContent = $variant && !empty($request->text) && $this->isTooSimilar($request->text, $revised);
            
            if ($isPoorContent || $isSimilarContent) {
                \Log::info("AI producing poor or similar content for education, using local variation");
                $revised = $this->generateLocalEducationVariation($request->text, $request->degree, $request->school);
            }
        } catch (\Throwable $e) {
            $revised = $this->localTidy($request->text);
        }

        return response()->json([
            'revised_text' => $revised
        ], 200, [], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_IGNORE);
    }

    /**
     * Generate multiple AI suggestions for education descriptions
     */
    public function generateEducationSuggestions(Request $request, GeminiService $gemini)
    {
        $request->validate([
            'text' => 'required|string',
            'degree' => 'required|string|min:2',
            'school' => 'required|string|min:2'
        ]);

        // Check if required fields have meaningful content
        if (empty(trim($request->degree)) || empty(trim($request->school))) {
            return response()->json([
                'error' => 'Missing required fields',
                'message' => 'Degree and School are required for AI generation. Please fill in these fields first.',
                'required_fields' => ['degree', 'school']
            ], 400);
        }

        // Check if the text is too short
        $minLength = \App\Services\AIConfigService::config('validation.min_text_length.education');
        if (strlen(trim($request->text)) < $minLength) {
            return response()->json([
                'error' => 'Insufficient content',
                'message' => "Please provide more details about your education before using AI generation (minimum {$minLength} characters).",
                'min_length' => $minLength
            ], 400);
        }

        try {
            $approaches = \App\Services\AIConfigService::getContentVariations('education');
            $suggestions = [];
            
            foreach ($approaches as $approach) {
                $randomSeed = \App\Services\AIConfigService::generateRandomSeed();
                
                $prompt = \App\Services\AIConfigService::getConsolidatedPrompt('education', [
                    'count' => 3,
                    'approach_requirements' => \App\Services\AIConfigService::generateEducationApproachRequirements(3),
                    'regeneration_note' => \App\Services\AIConfigService::generateRegenerationNote(false),
                    'text' => $request->text
                ]);
                
                $result = $gemini->generateEnhancedContent($prompt, array_merge([
                    'response_mime_type' => 'application/json',
                ], \App\Services\AIConfigService::getModelParameters('suggestions')));
                
                $suggestion = $this->extractRevisedText($result, $request->text);
                
                // Quality check and fallback
                if ($this->isPoorQualityContent($suggestion)) {
                    $suggestion = $this->generateLocalEducationVariation($request->text, $request->degree, $request->school);
                }
                
                $suggestions[] = $suggestion;
            }
            
            // Ensure we have exactly 3 unique suggestions
            $suggestions = array_unique($suggestions);
            while (count($suggestions) < 3) {
                $suggestions[] = $this->generateLocalEducationVariation($request->text, $request->degree, $request->school);
            }
            $suggestions = array_slice($suggestions, 0, 3);
            
        } catch (\Throwable $e) {
            \Log::error('Error generating education suggestions: ' . $e->getMessage());
            // Fallback to local variations
            $suggestions = [
                $this->generateLocalEducationVariation($request->text, $request->degree, $request->school),
                $this->generateLocalEducationVariation($request->text, $request->degree, $request->school),
                $this->generateLocalEducationVariation($request->text, $request->degree, $request->school)
            ];
        }

        return response()->json([
            'suggestions' => $suggestions
        ], 200, [], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_IGNORE);
    }

    public function reviseExperienceDescription(Request $request, GeminiService $gemini)
    {
        $request->validate([
            'text' => 'required|string',
            'variant' => 'nullable|string', // Add variant for different styles
            'jobTitle' => 'required|string|min:2', // Required job title field
            'company' => 'required|string|min:2'   // Required company field
        ]);

        // Check if required fields have meaningful content
        if (empty(trim($request->jobTitle)) || empty(trim($request->company))) {
            return response()->json([
                'error' => 'Missing required fields',
                'message' => 'Job Title and Company are required for AI generation. Please fill in these fields first.',
                'required_fields' => ['jobTitle', 'company']
            ], 400);
        }

        // Check if the text is too short or generic
        $minLength = config('resume.ai_enhancement.validation.min_text_length.experience', 10);
        if (strlen(trim($request->text)) < $minLength) {
            return response()->json([
                'error' => 'Insufficient content',
                'message' => "Please provide more details about your experience before using AI generation (minimum {$minLength} characters).",
                'min_length' => $minLength
            ], 400);
        }

        // Check for generic content if enabled
        if (config('resume.ai_enhancement.validation.prevent_generic_content', true)) {
            $genericPhrases = config('resume.ai_enhancement.validation.generic_phrases', []);
            $text = strtolower(trim($request->text));
            foreach ($genericPhrases as $phrase) {
                if (strpos($text, strtolower($phrase)) !== false && strlen(trim($request->text)) < 40) {
                    return response()->json([
                        'error' => 'Generic content detected',
                        'message' => 'Please provide more specific details about your experience before using AI generation.',
                        'suggestion' => 'Include specific achievements, projects, technologies used, or measurable outcomes.'
                    ], 400);
                }
            }
        }

        try {
            $focuses = config('resume.ai_enhancement.content_variations.focuses', [
                "quantify achievements and measurable outcomes",
                "emphasize leadership, collaboration, and team impact",
                "highlight technical skills and problem-solving abilities", 
                "showcase innovation, efficiency improvements, and process optimization"
            ]);
            
            $randomFocus = $focuses[array_rand($focuses)];
            $variant = $request->input('variant');
            
            // Enhanced randomization for regeneration
            if ($variant) {
                $randomSeed = $variant . '-' . mt_rand(1000, 9999);
                $randomFocus = $focuses[array_rand($focuses)]; // Re-randomize focus
                $additionalRandom = mt_rand(1, 1000);
            } else {
                $randomSeed = mt_rand(config('resume.ai_enhancement.random_seed_range.min', 1000), config('resume.ai_enhancement.random_seed_range.max', 9999));
                $additionalRandom = 0;
            }
            
            $prompt = \App\Services\AIConfigService::getConsolidatedPrompt('experience', [
                'count' => 1,
                'focus_requirements' => "1. First variation that {$randomFocus}",
                'regeneration_note' => \App\Services\AIConfigService::generateRegenerationNote($variant),
                'text' => $request->text
            ]);
            $result = $gemini->generateEnhancedContent($prompt, [
                'response_mime_type' => 'application/json',
                'maxOutputTokens' => 256, // Further reduced for concise output
                'temperature' => $variant ? 
                    0.9 + (mt_rand(0, 100) / 100) * 0.2 : // Moderate temp for regeneration
                    0.6 + (mt_rand(0, 100) / 100) * 0.2, // Lower temp for more focused output
            ]);
            $revised = $this->extractRevisedText($result, $request->text);
            
            // Quality check: If AI produces poor/generic content, use local variation
            $isPoorContent = $this->isPoorQualityContent($revised);
            $isSimilarContent = $variant && !empty($request->text) && $this->isTooSimilar($request->text, $revised);
            
            if ($isPoorContent || $isSimilarContent) {
                \Log::info("AI producing poor or similar content for experience, using local variation");
                $revised = $this->generateLocalExperienceVariation($request->text, $request->jobTitle, $request->company);
            }
        } catch (\Throwable $e) {
            $revised = $this->localTidy($request->text);
        }

        return response()->json([
            'revised_text' => $revised
        ], 200, [], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_IGNORE);
    }

    // Force regeneration with maximum creativity and variation
    public function forceRegenerateExperience(Request $request, GeminiService $gemini)
    {
        $request->validate([
            'text' => 'required|string',
            'jobTitle' => 'required|string|min:2', // Required job title field
            'company' => 'required|string|min:2'   // Required company field
        ]);

        // Check if required fields have meaningful content
        if (empty(trim($request->jobTitle)) || empty(trim($request->company))) {
            return response()->json([
                'error' => 'Missing required fields',
                'message' => 'Job Title and Company are required for AI generation. Please fill in these fields first.',
                'required_fields' => ['jobTitle', 'company']
            ], 400);
        }

        // Check if the text is too short or generic
        if (strlen(trim($request->text)) < 10) {
            return response()->json([
                'error' => 'Insufficient content',
                'message' => 'Please provide more details about your experience before using AI generation.',
                'min_length' => 10
            ], 400);
        }

        try {
            $focuses = config('resume.ai_enhancement.content_variations.focuses', []);
            $randomFocus = $focuses[array_rand($focuses)];
            $forceSeed = 'FORCE-REGEN-' . mt_rand(10000, 99999) . '-' . time();
            
            $prompt = \App\Services\AIConfigService::getConsolidatedPrompt('experience', [
                'count' => 1,
                'focus_requirements' => "1. First variation that {$randomFocus}",
                'regeneration_note' => \App\Services\AIConfigService::generateRegenerationNote(true),
                'text' => $request->text
            ]);
            
            $result = $gemini->generateEnhancedContent($prompt, [
                'response_mime_type' => 'application/json',
                'maxOutputTokens' => 256, // Reduced for concise output
                'temperature' => 0.8, // Moderate creativity for better focus
            ]);
            
            $revised = $this->extractRevisedText($result, $request->text);
            
            // Force regeneration should always use local variation for diversity
            if ($this->isTooSimilar($request->text, $revised)) {
                \Log::info("Force regeneration producing similar content, using local variation");
                $revised = $this->generateLocalExperienceVariation($request->text, $request->jobTitle, $request->company);
            }
        } catch (\Throwable $e) {
            $revised = $this->localTidy($request->text);
        }

        return response()->json([
            'revised_text' => $revised
        ], 200, [], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_IGNORE);
    }

    /**
     * Generate multiple AI suggestions for experience descriptions
     */
    public function generateExperienceSuggestions(Request $request, GeminiService $gemini)
    {
        $request->validate([
            'text' => 'required|string',
            'jobTitle' => 'required|string|min:2',
            'company' => 'required|string|min:2'
        ]);

        // Check if required fields have meaningful content
        if (empty(trim($request->jobTitle)) || empty(trim($request->company))) {
            return response()->json([
                'error' => 'Missing required fields',
                'message' => 'Job Title and Company are required for AI generation. Please fill in these fields first.',
                'required_fields' => ['jobTitle', 'company']
            ], 400);
        }

        // Check if the text is too short
        $minLength = \App\Services\AIConfigService::config('validation.min_text_length.experience');
        if (strlen(trim($request->text)) < $minLength) {
            return response()->json([
                'error' => 'Insufficient content',
                'message' => "Please provide more details about your experience before using AI generation (minimum {$minLength} characters).",
                'min_length' => $minLength
            ], 400);
        }

        try {
            $focuses = \App\Services\AIConfigService::getContentVariations('experience');
            $suggestions = [];
            
            foreach ($focuses as $focus) {
                $randomSeed = \App\Services\AIConfigService::generateRandomSeed();
                
                $prompt = \App\Services\AIConfigService::getConsolidatedPrompt('experience', [
                    'count' => 3,
                    'focus_requirements' => \App\Services\AIConfigService::generateExperienceFocusRequirements(3),
                    'regeneration_note' => \App\Services\AIConfigService::generateRegenerationNote(false),
                    'text' => $request->text
                ]);
                
                $result = $gemini->generateEnhancedContent($prompt, array_merge([
                    'response_mime_type' => 'application/json',
                ], \App\Services\AIConfigService::getModelParameters('suggestions')));
                
                $suggestion = $this->extractRevisedText($result, $request->text);
                
                // Quality check and fallback
                if ($this->isPoorQualityContent($suggestion)) {
                    $suggestion = $this->generateLocalExperienceVariation($request->text, $request->jobTitle, $request->company);
                }
                
                $suggestions[] = $suggestion;
            }
            
            // Ensure we have exactly 3 unique suggestions
            $suggestions = array_unique($suggestions);
            while (count($suggestions) < 3) {
                $suggestions[] = $this->generateLocalExperienceVariation($request->text, $request->jobTitle, $request->company);
            }
            $suggestions = array_slice($suggestions, 0, 3);
            
        } catch (\Throwable $e) {
            \Log::error('Error generating experience suggestions: ' . $e->getMessage());
            // Fallback to local variations
            $suggestions = [
                $this->generateLocalExperienceVariation($request->text, $request->jobTitle, $request->company),
                $this->generateLocalExperienceVariation($request->text, $request->jobTitle, $request->company),
                $this->generateLocalExperienceVariation($request->text, $request->jobTitle, $request->company)
            ];
        }

        return response()->json([
            'suggestions' => $suggestions
        ], 200, [], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_IGNORE);
    }

    // Generate a brand new summary aligned to a specific job title
    public function generateSummary(Request $request, GeminiService $gemini)
    {
        $validated = $request->validate([
            'job_title' => 'required|string',
            'years_experience' => 'nullable|integer|min:0|max:' . config('resume.ai_enhancement.summary_context_limits.max_years_experience', 60),
            'skills' => 'nullable|array',
            'skills.*' => 'string',
            'industry' => 'nullable|string',
            'current_summary' => 'nullable|string',
            'resume_id' => 'nullable|integer|exists:resumes,id',
            'avoid' => 'nullable|array',
            'avoid[*]' => 'string',
            'variant' => 'nullable|string',
            'experiences' => 'nullable|array',
            'experiences.*.jobTitle' => 'nullable|string',
            'experiences.*.company' => 'nullable|string',
            'experiences.*.startDate' => 'nullable|string',
            'experiences.*.endDate' => 'nullable|string',
            'education' => 'nullable|array',
            'education.*.degree' => 'nullable|string',
            'education.*.school' => 'nullable|string',
        ]);

        $jobTitle = trim($validated['job_title']);
        $years = $validated['years_experience'] ?? null;
        $skills = $validated['skills'] ?? [];
        $industry = $validated['industry'] ?? null;
        $current = $validated['current_summary'] ?? '';
        $experiences = $validated['experiences'] ?? [];
        $education = $validated['education'] ?? [];
        $avoid = $validated['avoid'] ?? [];
        $variant = $validated['variant'] ?? null;

        // If resume_id provided, enrich context from stored resume
        if (!empty($validated['resume_id'])) {
            $resume = Resume::find($validated['resume_id']);
            if ($resume && is_array($resume->resume_data)) {
                $rd = $resume->resume_data;
                // Merge skills
                if (empty($skills) && !empty($rd['skills'])) {
                    foreach ($rd['skills'] as $sk) {
                        $name = is_array($sk) ? ($sk['name'] ?? '') : (string)$sk;
                        if ($name) $skills[] = $name;
                    }
                }
                // Merge experiences
                if (empty($experiences) && !empty($rd['experiences'])) {
                    foreach ($rd['experiences'] as $exp) {
                        $experiences[] = [
                            'jobTitle' => $exp['jobTitle'] ?? '',
                            'company' => $exp['company'] ?? '',
                            'startDate' => $exp['startDate'] ?? '',
                            'endDate' => $exp['endDate'] ?? '',
                        ];
                    }
                }
                // Merge education
                if (empty($education) && !empty($rd['educations'])) {
                    foreach ($rd['educations'] as $edu) {
                        $education[] = [
                            'degree' => $edu['degree'] ?? '',
                            'school' => $edu['school'] ?? '',
                        ];
                    }
                }
                // Use current summary from resume if not provided
                if (empty($current) && !empty($rd['summary'])) {
                    $current = (string)$rd['summary'];
                }
            }
        }

        // Derive years from experiences if not provided
        if ($years === null && !empty($experiences)) {
            $years = $this->estimateYearsFromExperiences($experiences);
        }

        $skillsList = '';
        if (!empty($skills)) {
            $skillsList = "Skills: " . implode(', ', array_map('trim', $skills)) . "\n";
        }

        $yearsLine = $years !== null ? "YearsExperience: {$years}\n" : '';
        $industryLine = $industry ? "Industry: {$industry}\n" : '';
        $currentLine = $current ? "ExistingSummary: {$current}\n" : '';

        try {
            // Multi-style retries for diversity
            $styles = config('resume.ai_enhancement.content_variations.styles', [
                'achievement-focused and quantitative',
                'skills-forward and technical',
                'leadership-oriented and strategic',
                'results-driven and action-oriented',
                'client-impact oriented',
                'efficiency-focused'
            ]);
            $context = "Context\n" .
                "JobTitle: {$jobTitle}\n" .
                $yearsLine . $industryLine . $skillsList . $currentLine .
                $this->summarizeExperiencesForPrompt($experiences) .
                $this->summarizeEducationForPrompt($education);

            $revised = '';
            $maxAttempts = config('resume.ai_enhancement.max_retries', 6);
            $attempts = [];
            
            for ($i = 0; $i < $maxAttempts; $i++) {
                // Force different style for regeneration
                if ($variant) {
                    $style = $styles[($i + mt_rand(0, count($styles) - 1)) % count($styles)];
                    // Add random modifiers for regeneration to force diversity
                    $styleModifiers = ['with emphasis on', 'focusing on', 'highlighting', 'emphasizing', 'prioritizing', 'specializing in', 'concentrating on'];
                    $style = $styleModifiers[array_rand($styleModifiers)] . ' ' . $style;
                } else {
                    $style = $styles[array_rand($styles)];
                }
                
                // Generate unique seed for each attempt
                $seed = $variant ? 
                    ($variant . '-' . $i . '-' . mt_rand(1000, 9999) . '-' . uniqid()) : 
                    (string) mt_rand(config('resume.ai_enhancement.random_seed_range.min', 1000), config('resume.ai_enhancement.random_seed_range.max', 9999));
                
                // Enhanced prompt for regeneration with COMPLETELY different approaches
                if ($variant) {
                    // Check if this is a force regeneration
                    $isForceRegeneration = strpos($variant, 'force-regenerate') !== false;
                    
                    if ($isForceRegeneration) {
                        // Force regeneration with completely different approaches
                        $forceApproaches = [
                            "Create a COMPLETELY DIFFERENT resume summary for {$jobTitle} with a LEADERSHIP focus.",
                            "Generate a NEW resume summary for {$jobTitle} emphasizing TECHNICAL EXPERTISE.",
                            "Write a FRESH resume summary for {$jobTitle} highlighting BUSINESS IMPACT.",
                            "Create an ALTERNATIVE resume summary for {$jobTitle} focusing on PROBLEM-SOLVING.",
                            "Generate a DIFFERENT resume summary for {$jobTitle} emphasizing PROJECT DELIVERY."
                        ];
                        
                        $openingLine = $forceApproaches[array_rand($forceApproaches)];
                        
                        // Force completely different content structure
                        $forceStructures = [
                            "Start with TECHNICAL SKILLS, then LEADERSHIP, then ACHIEVEMENTS",
                            "Begin with ACHIEVEMENTS, then SKILLS, then LEADERSHIP",
                            "Lead with LEADERSHIP, then TECHNICAL EXPERTISE, then BUSINESS IMPACT",
                            "Start with PROBLEM-SOLVING, then SKILLS, then ACHIEVEMENTS",
                            "Begin with PROJECT DELIVERY, then LEADERSHIP, then TECHNICAL SKILLS"
                        ];
                        
                        $forceStructure = $forceStructures[array_rand($forceStructures)];
                        
                        $prompt = \App\Services\AIConfigService::getConsolidatedPrompt('summary', [
                            'count' => 1,
                            'style_requirements' => "1. First summary that is {$style}",
                            'regeneration_note' => \App\Services\AIConfigService::generateRegenerationNote(true),
                            'min_words' => config('resume.ai_enhancement.summary_length.min_words', 60),
                            'max_words' => config('resume.ai_enhancement.summary_length.max_words', 90),
                            'seed' => $seed,
                            'context' => $context
                        ]);
                    } else {
                        // Regular regeneration
                        $regenerationApproaches = [
                            "Create a COMPLETELY DIFFERENT resume summary for the role: {$jobTitle}.",
                            "Generate an alternative resume summary for {$jobTitle} with a different perspective.",
                            "Write a new resume summary for {$jobTitle} using a completely different approach.",
                            "Create a fresh resume summary for {$jobTitle} with alternative structure and content.",
                            "Generate a different resume summary for {$jobTitle} with unique presentation style."
                        ];
                        
                        $openingLine = $regenerationApproaches[array_rand($regenerationApproaches)];
                        
                        // Force different content focus for each attempt
                        $contentFocuses = [
                            "Focus on LEADERSHIP and TEAM MANAGEMENT achievements",
                            "Emphasize TECHNICAL SKILLS and TECHNICAL EXPERTISE",
                            "Highlight BUSINESS IMPACT and METRICS",
                            "Concentrate on PROBLEM-SOLVING and INNOVATION",
                            "Prioritize CLIENT RELATIONSHIPS and PROJECT DELIVERY"
                        ];
                        
                        $contentFocus = $contentFocuses[array_rand($contentFocuses)];
                        
                        $prompt = \App\Services\AIConfigService::getConsolidatedPrompt('summary', [
                            'count' => 1,
                            'style_requirements' => "1. First summary that is {$style}",
                            'regeneration_note' => \App\Services\AIConfigService::generateRegenerationNote(true),
                            'min_words' => config('resume.ai_enhancement.summary_length.min_words', 60),
                            'max_words' => config('resume.ai_enhancement.summary_length.max_words', 90),
                            'seed' => $seed,
                            'context' => $context
                        ]);
                    }
                } else {
                    $prompt = \App\Services\AIConfigService::getConsolidatedPrompt('summary', [
                        'count' => 1,
                        'style_requirements' => "1. First summary that is {$style}",
                        'regeneration_note' => \App\Services\AIConfigService::generateRegenerationNote($variant),
                        'min_words' => config('resume.ai_enhancement.summary_length.min_words', 60),
                        'max_words' => config('resume.ai_enhancement.summary_length.max_words', 90),
                        'seed' => $seed,
                        'context' => $context
                    ]);
                }

                // Enhanced temperature and parameter variation for regeneration
                $baseTemp = $variant ? 
                    config('resume.ai_enhancement.temperature_range.max', 1.2) : 
                    config('resume.ai_enhancement.temperature_range.min', 0.8);
                
                $tempVariation = $variant ? 
                    (mt_rand(0, 100) / 100) * 1.0 : // Much higher variation for regeneration
                    (mt_rand(0, 100) / 100) * 0.3; // Lower variation for initial generation
                
                $finalTemp = min($baseTemp + $tempVariation, config('resume.ai_enhancement.temperature_range.max', 1.2));
                
                // Force much higher temperature for regeneration to ensure diversity
                if ($variant) {
                    $finalTemp = 1.2 + (mt_rand(0, 100) / 100) * 0.5; // Force high temperature for regeneration
                }
                
                $result = $gemini->generateEnhancedContent($prompt, [
                    'response_mime_type' => 'application/json',
                    'maxOutputTokens' => config('resume.ai_enhancement.max_output_tokens.summary_generation', 3072),
                    'temperature' => $finalTemp,
                    'topP' => $variant ? 0.9 : 0.8, // Higher topP for regeneration
                    'topK' => $variant ? 40 : 30, // Higher topK for regeneration
                ]);
                if (is_array($result) && !empty($result['candidates'])) {
                    $candidate = $this->extractRevisedText($result, $current ?: $jobTitle);
                    $candidate = $this->sanitizeSummaryText($candidate, $current ?: $jobTitle);
                    
                    // Quality check: If AI produces poor content, use local variation
                    $isPoorContent = $this->isPoorQualityContent($candidate);
                    
                    // Store all attempts for regeneration
                    if ($variant) {
                        $attempts[] = $candidate;
                    } else {
                        // For initial generation, check quality and use local variation if needed
                        if ($isPoorContent) {
                            \Log::info("AI producing poor quality content for initial summary, using local variation");
                            $revised = $this->generateLocalVariation($current ?: '', $jobTitle, $years, $skills, $industry);
                            break;
                        }
                        
                        $reject = false;
                        if (!empty($current) && $this->isTooSimilar($current, $candidate)) {
                            $reject = true;
                        }
                        if (!$reject && !empty($avoid)) {
                            foreach ($avoid as $prev) {
                                if ($this->isTooSimilar((string)$prev, $candidate)) { $reject = true; break; }
                            }
                        }
                        if (!$reject) {
                            $revised = $candidate;
                            break;
                        }
                    }
                }
            }
            // For regeneration, select the most different summary from all attempts
            if ($variant && !empty($attempts)) {
                if (!empty($current)) {
                    // Find the summary most different from current
                    $mostDifferent = $attempts[0];
                    $lowestSimilarity = 100;
                    
                    foreach ($attempts as $attempt) {
                        $similarity = 0;
                        similar_text($current, $attempt, $similarity);
                        if ($similarity < $lowestSimilarity) {
                            $lowestSimilarity = $similarity;
                            $mostDifferent = $attempt;
                        }
                    }
                    
                    // If AI is still producing similar content, use local variation
                    if ($lowestSimilarity > 85) {
                        \Log::info("AI producing similar content ({$lowestSimilarity}% similar), using local variation");
                        $revised = $this->generateLocalVariation($current, $jobTitle, $years, $skills, $industry);
                    } else {
                        $revised = $mostDifferent;
                        \Log::info("Selected most different summary with similarity: {$lowestSimilarity}%");
                    }
                } else {
                    // If no current summary, pick random from attempts
                    $revised = $attempts[array_rand($attempts)];
                }
            } elseif (empty($revised)) {
                $revised = $this->buildLocalSummary($jobTitle, $skills, $experiences, $education);
            }

            // Ensure it references the job title in some way
            if (mb_stripos($revised, $jobTitle) === false) {
                $revised = $this->localTidy($revised . ' Focused on the ' . $jobTitle . ' role.');
                $revised = $this->sanitizeSummaryText($revised, $current ?: $jobTitle);
            }

            // If result is too short or looks like just the job title, build locally
            $bareJobTitle = $this->localTidy($jobTitle);
            if (mb_strlen($revised) < config('resume.ai_enhancement.summary_length.min_words', 40) || $this->isTooSimilar($revised, $bareJobTitle)) {
                $revised = $this->buildLocalSummary($jobTitle, $skills, $experiences, $education);
            }

            return response()->json([
                'revised_text' => $revised
            ], 200, [], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_IGNORE);
        } catch (\Throwable $e) {
            // Local fallback template
            $prefix = $years ? "{$years}+ years" : "Proven";
            $skillsPhrase = !empty($skills) ? (' in ' . implode(', ', array_slice($skills, 0, config('resume.ai_enhancement.max_skills_display', 5)))) : '';
            $industryText = $industry ? $industry : 'fast-paced environments';
            
            if ($jobTitle) {
                $fallback = "$prefix of experience as a {$jobTitle}, delivering measurable outcomes through strong execution{$skillsPhrase}. " .
                    "Committed to driving impact, collaborating across teams, and advancing business goals in {$industryText}.";
            } else {
                $professionalFocus = $this->determineProfessionalFocus($jobTitle, $skills, $experiences, $education);
                $fallback = "$prefix of experience in {$professionalFocus}, delivering measurable outcomes through strong execution{$skillsPhrase}. " .
                    "Committed to driving impact, collaborating across teams, and advancing business goals in {$industryText}.";
            }
            
            $fallback = $this->sanitizeSummaryText($fallback, $current ?: ($jobTitle ?: 'professional'));
            return response()->json([
                'revised_text' => $fallback
            ], 200, [], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_IGNORE);
        }
    }

    /**
     * Generate multiple AI suggestions for summary
     */
    public function generateSummarySuggestions(Request $request, GeminiService $gemini)
    {
        try {
            $validated = $request->validate([
                'job_title' => 'nullable|string',
                'skills' => 'nullable|array',
                'skills.*' => 'nullable|string',
                'current_summary' => 'nullable|string',
                'experiences' => 'nullable|array',
                'experiences.*.jobTitle' => 'nullable|string',
                'experiences.*.company' => 'nullable|string',
                'experiences.*.description' => 'nullable|string',
                'education' => 'nullable|array',
                'education.*.degree' => 'nullable|string',
                'education.*.school' => 'nullable|string',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Summary suggestions validation failed: ' . json_encode($e->errors()));
            return response()->json([
                'error' => true,
                'message' => 'Validation failed: ' . json_encode($e->errors()),
                'debug' => [
                    'received_data' => $request->all(),
                    'validation_errors' => $e->errors()
                ]
            ], 422);
        }

        $jobTitle = trim($validated['job_title'] ?? '');
        $skills = $validated['skills'] ?? [];
        $current = $validated['current_summary'] ?? '';
        $experiences = $validated['experiences'] ?? [];
        $education = $validated['education'] ?? [];
        
        // Sanitize arrays to ensure they contain valid data
        $skills = array_filter($skills, function($skill) {
            return is_string($skill) && trim($skill) !== '';
        });
        
        $experiences = array_filter($experiences, function($exp) {
            return is_array($exp) && (
                !empty($exp['jobTitle']) && 
                !empty($exp['company']) && 
                !empty($exp['description'])
            );
        });
        
        $education = array_filter($education, function($edu) {
            return is_array($edu) && (
                !empty($edu['degree']) && 
                !empty($edu['school'])
            );
        });

        // Check if we have enough data to generate meaningful summaries
        $hasSkills = !empty($skills);
        $hasExperiences = !empty($experiences);
        $hasEducation = !empty($education);
        
        // Make all data dependencies nullable - only require some meaningful data
        if (!$hasSkills && !$hasExperiences && !$hasEducation) {
            return response()->json([
                'error' => true,
                'message' => 'Please provide at least some skills, experience, or education information to generate a meaningful summary.'
            ], 400);
        }

        $skillsList = '';
        if (!empty($skills)) {
            $skillsList = "Skills: " . implode(', ', array_map('trim', $skills)) . "\n";
        }

        $currentLine = $current ? "ExistingSummary: {$current}\n" : '';
        $jobTitleLine = $jobTitle ? "JobTitle: {$jobTitle}\n" : '';
        
        // If no job title, infer from available data
        if (empty($jobTitle)) {
            if (!empty($experiences)) {
                $jobTitle = $experiences[0]['jobTitle'] ?? 'Professional';
            } elseif (!empty($skills)) {
                $jobTitle = 'Skilled Professional';
            } elseif (!empty($education)) {
                $jobTitle = 'Educated Professional';
            } else {
                $jobTitle = 'Professional';
            }
        }

        try {
            \Log::info('Starting summary suggestions generation', [
                'jobTitle' => $jobTitle,
                'hasSkills' => $hasSkills,
                'hasExperiences' => $hasExperiences,
                'hasEducation' => $hasEducation,
                'skills' => $skills,
                'experiences' => $experiences,
                'education' => $education
            ]);
            
            // Check if AIConfigService exists and is working
            if (!class_exists('\App\Services\AIConfigService')) {
                \Log::error('AIConfigService class not found');
                throw new \Exception('AIConfigService not available');
            }
            
            $styles = \App\Services\AIConfigService::getContentVariations('summary');
            if (empty($styles)) {
                // Fallback styles if config is missing
                $styles = ['achievement-focused', 'skills-forward', 'leadership-oriented'];
            }
            \Log::info('Using styles for generation', ['styles' => $styles]);
            
            $suggestions = [];
            
            foreach ($styles as $style) {
                try {
                    $seed = \App\Services\AIConfigService::generateRandomSeed();
                    $context = "Context\n" .
                        $jobTitleLine .
                        $skillsList .
                        $currentLine .
                        "Experiences: " . json_encode($experiences) . "\n" .
                        "Education: " . json_encode($education) . "\n" .
                        "Note: Generate summaries that are completely different from each other in structure, vocabulary, and approach.";

                    $prompt = \App\Services\AIConfigService::getConsolidatedPrompt('summary', [
                        'count' => 3,
                        'style_requirements' => \App\Services\AIConfigService::generateSummaryStyleRequirements(3),
                        'regeneration_note' => \App\Services\AIConfigService::generateRegenerationNote(false),
                        'seed' => $seed,
                        'context' => $context,
                        'job_title' => $jobTitle ?: 'Professional'
                    ]);

                    $result = $gemini->generateEnhancedContent($prompt, array_merge([
                        'response_mime_type' => 'application/json',
                    ], \App\Services\AIConfigService::getModelParameters('suggestions')));

                    if (is_array($result) && !empty($result['candidates'])) {
                        $candidate = $this->extractRevisedText($result, $current ?: ($jobTitle ?: 'professional'));
                        $candidate = $this->sanitizeSummaryText($candidate, $current ?: ($jobTitle ?: 'professional'));
                        
                        // Quality check
                        if (!$this->isPoorQualityContent($candidate)) {
                            $suggestions[] = $candidate;
                        }
                    }
                } catch (\Throwable $styleError) {
                    \Log::warning('Failed to generate suggestion for style: ' . $style . ' - ' . $styleError->getMessage());
                    continue; // Continue with next style
                }
            }
            
            // Ensure we have exactly 3 suggestions, retry AI generation if needed
            $retryCount = 0;
            while (count($suggestions) < 3 && $retryCount < 3) {
                $retryCount++;
                try {
                    // Generate additional suggestions with different seeds
                    $seed = \App\Services\AIConfigService::generateRandomSeed();
                    $context = "Context\n" .
                        $jobTitleLine .
                        $skillsList .
                        $currentLine .
                        "Experiences: " . json_encode($experiences) . "\n" .
                        "Education: " . json_encode($education) . "\n" .
                        "Note: Generate summaries that are completely different from each other in structure, vocabulary, and approach.";

                    $prompt = \App\Services\AIConfigService::getConsolidatedPrompt('summary', [
                        'count' => 1,
                        'style_requirements' => \App\Services\AIConfigService::generateSummaryStyleRequirements(1),
                        'regeneration_note' => \App\Services\AIConfigService::generateRegenerationNote(true),
                        'seed' => $seed,
                        'context' => $context,
                        'job_title' => $jobTitle ?: 'Professional'
                    ]);

                    \Log::info('Generated prompt for style: ' . $style, ['prompt' => $prompt]);
                    
                    $result = $gemini->generateEnhancedContent($prompt, array_merge([
                        'response_mime_type' => 'application/json',
                    ], \App\Services\AIConfigService::getModelParameters('suggestions')));

                    \Log::info('AI response received', ['result' => $result]);

                    if (is_array($result) && !empty($result['candidates'])) {
                        $candidate = $this->extractRevisedText($result, $current ?: ($jobTitle ?: 'professional'));
                        $candidate = $this->sanitizeSummaryText($candidate, $current ?: ($jobTitle ?: 'professional'));
                        
                        \Log::info('Extracted candidate', ['candidate' => $candidate]);
                        
                        // Quality check and diversity check
                        if (!$this->isPoorQualityContent($candidate) && !$this->isTooSimilarToExisting($candidate, $suggestions)) {
                            $suggestions[] = $candidate;
                            \Log::info('Added candidate to suggestions', ['total' => count($suggestions)]);
                        } else {
                            \Log::info('Candidate rejected', [
                                'poor_quality' => $this->isPoorQualityContent($candidate),
                                'too_similar' => $this->isTooSimilarToExisting($candidate, $suggestions)
                            ]);
                        }
                    } else {
                        \Log::warning('No candidates in AI response', ['result' => $result]);
                    }
                } catch (\Throwable $retryError) {
                    \Log::warning('Retry attempt ' . $retryCount . ' failed: ' . $retryError->getMessage());
                    continue;
                }
            }
            
            // If we still don't have 3 suggestions, create diverse variations
            while (count($suggestions) < 3) {
                $variation = $this->createDiverseVariation($jobTitle, $skills, $experiences, $education, $suggestions);
                if ($variation) {
                    $suggestions[] = $variation;
                } else {
                    break;
                }
            }
            
            \Log::info('Final suggestions count', ['count' => count($suggestions), 'suggestions' => $suggestions]);
            
        } catch (\Throwable $e) {
            \Log::error('Error generating summary suggestions: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            // Create diverse variations instead of identical local summaries
            $suggestions = [
                $this->createDiverseVariation($jobTitle, $skills, $experiences, $education, []),
                $this->createDiverseVariation($jobTitle, $skills, $experiences, $education, [])
            ];
            
            \Log::info('Fallback suggestions created', ['count' => count($suggestions), 'suggestions' => $suggestions]);
        }
        
        // Ensure we always have at least one suggestion
        if (empty($suggestions)) {
            \Log::warning('No suggestions generated, creating basic fallback');
            $skillsText = !empty($skills) ? implode(', ', array_slice($skills, 0, 3)) : 'professional development';
            $suggestions = [
                "Professional with expertise in {$skillsText}. Committed to delivering high-quality results and continuous improvement.",
                "Experienced professional focused on achieving measurable outcomes. Strong problem-solving skills and collaborative approach to project delivery.",
                "Results-driven professional with a passion for excellence. Skilled in {$skillsText} and committed to continuous growth."
            ];
        }

        return response()->json([
            'suggestions' => $suggestions
        ], 200, [], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_IGNORE);
    }

    /**
     * Improve an existing user-written description using AI
     */
    public function improveDescription(Request $request, GeminiService $gemini)
    {
        $request->validate([
            'text' => 'required|string|min:10',
            'type' => 'required|string|in:experience,education,summary',
            'context' => 'required|array'
        ]);

        $text = trim($request->text);
        $type = $request->type;
        $context = $request->context;

        // Check if the text is too short
        $minLength = \App\Services\AIConfigService::config("validation.min_text_length.{$type}");
        if (strlen($text) < $minLength) {
            return response()->json([
                'error' => 'Text too short',
                'message' => "Please provide at least {$minLength} characters for AI improvement.",
                'min_length' => $minLength
            ], 400);
        }

        try {
            $prompt = \App\Services\AIConfigService::getPrompt('improvement', $type, [
                'text' => $text
            ]);

            $result = $gemini->generateEnhancedContent($prompt, array_merge([
                'response_mime_type' => 'application/json',
            ], \App\Services\AIConfigService::getModelParameters('polish')));

            $improved = $this->extractImprovedText($result, $text);
            
            // If AI doesn't improve the text (too similar), use local improvement
            $similarity = 0;
            similar_text($text, $improved, $similarity);
            $threshold = \App\Services\AIConfigService::config('quality_control.similarity_thresholds.text_similarity');
            if ($similarity > $threshold) {
                \Log::info("AI polish not improving text (${similarity}% similar), using local polish");
                $improved = $this->localPolish($text, $type, $context);
            }
            
            return response()->json([
                'improved_text' => $improved,
                'original_text' => $text,
                'improvement_type' => $type
            ], 200, [], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_IGNORE);

        } catch (\Throwable $e) {
            return response()->json([
                'error' => 'Improvement failed',
                'message' => 'Unable to improve the text. Please try again.',
                'fallback' => $text
            ], 500);
        }
    }

    /**
     * Extract improved_text from Gemini JSON response with fallbacks
     */
    private function extractImprovedText(array $result, string $fallback): string
    {
        if (!is_array($result) || empty($result['candidates'])) {
            return $this->localTidy($fallback);
        }
        
        $text = $result['candidates'][0]['content']['parts'][0]['text'] ?? null;
        if (is_string($text)) {
            // Try JSON first
            $clean = trim($text);
            $clean = preg_replace('/^```(?:json)?/i', '', $clean);
            $clean = preg_replace('/```$/', '', $clean);
            $decoded = json_decode($clean, true);
            
            if (is_array($decoded) && isset($decoded['improved_text'])) {
                return (string) $decoded['improved_text'];
            }
            
            // Fallback: use first paragraph, strip bullets/options
            $firstPara = preg_split('/\n\n+/', $clean)[0] ?? $clean;
            $firstPara = preg_replace('/^\s*([\-*•+]|\d+\.)\s*/m', '', $firstPara);
            return trim($firstPara) ?: $fallback;
        }
        
        return $this->localTidy($fallback);
    }

    /**
     * Extract revised_text from Gemini JSON response with fallbacks
     */
    private function extractRevisedText(array $result, string $fallback): string
    {
        if (!is_array($result) || empty($result['candidates'])) {
            return $this->localTidy($fallback);
        }
        $text = $result['candidates'][0]['content']['parts'][0]['text'] ?? null;
        if (is_string($text)) {
            // Try JSON first
            $clean = trim($text);
            // Strip code fences if present
            $clean = preg_replace('/^```(?:json)?/i', '', $clean);
            $clean = preg_replace('/```$/', '', $clean);
            $decoded = json_decode($clean, true);
            if (is_array($decoded) && isset($decoded['revised_text'])) {
                return (string) $decoded['revised_text'];
            }
            // Fallback: use first paragraph, strip bullets/options
            $firstPara = preg_split('/\n\n+/', $clean)[0] ?? $clean;
            $firstPara = preg_replace('/^\s*([\-*•+]|\d+\.)\s*/m', '', $firstPara);
            return trim($firstPara) ?: $fallback;
        }
        return $this->localTidy($fallback);
    }

    private function localTidy(string $text): string
    {
        // Remove placeholder brackets and extra whitespace; ensure trailing period
        $s = preg_replace('/\[[^\]]*\]/', '', $text);
        $s = preg_replace('/\s+/', ' ', trim($s));
        if ($s !== '' && !preg_match('/[.!?]$/', $s)) {
            $s .= '.';
        }
        return $s;
    }

    private function isTooSimilar(string $a, string $b): bool
    {
        $a = trim($a);
        $b = trim($b);
        if ($a === $b) {
            return true;
        }
        $percent = 0.0;
        similar_text($a, $b, $percent);
        if ($percent >= config('resume.ai_enhancement.similarity_thresholds.text_similarity', 88.0)) { // stricter threshold
            return true;
        }
        // Token overlap (Jaccard)
        $tokensA = $this->tokenize($a);
        $tokensB = $this->tokenize($b);
        if (!empty($tokensA) && !empty($tokensB)) {
            $intersect = array_intersect($tokensA, $tokensB);
            $union = array_unique(array_merge($tokensA, $tokensB));
            $jaccard = count($union) > 0 ? (count($intersect) / count($union)) : 0.0;
            if ($jaccard >= config('resume.ai_enhancement.similarity_thresholds.jaccard_similarity', 0.80)) {
                return true;
            }
        }
        return false;
    }

    private function tokenize(string $s): array
    {
        $s = mb_strtolower($s);
        $s = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $s);
        $parts = preg_split('/\s+/', trim($s)) ?: [];
        // Remove very short tokens
        $parts = array_values(array_filter($parts, function ($t) {
            return mb_strlen($t) >= config('resume.ai_enhancement.summary_context_limits.min_token_length', 3);
        }));
        return $parts;
    }

    private function randomSummaryStyleAndSeed(array $used): array
    {
        $styles = config('resume.ai_enhancement.content_variations.styles', [
            'achievement-focused and quantitative, highlighting measurable results',
            'skills-forward and technical, emphasizing core competencies',
            'leadership-oriented and strategic, showcasing initiative and impact',
            'results-driven and action-oriented, using strong verbs and outcomes',
            'client-impact oriented, showcasing value delivered to stakeholders',
            'efficiency-focused, emphasizing automation, quality and speed improvements'
        ]);
        // pick style not used recently if possible
        $candidates = array_values(array_diff($styles, array_map(function ($s) {
            return explode('#', $s)[0] ?? $s;
        }, $used)));
        $style = $candidates ? $candidates[array_rand($candidates)] : $styles[array_rand($styles)];
        $seed = mt_rand(config('resume.ai_enhancement.random_seed_range.min', 1000), config('resume.ai_enhancement.random_seed_range.max', 9999));
        return [$style, $seed];
    }

    private function localParaphrase(string $text): string
    {
        $s = $this->localTidy($text);
        $replacements = [
            'experienced' => 'seasoned',
            'highly experienced' => 'accomplished',
            'skilled' => 'proficient',
            'proficient' => 'adept',
            'responsible for' => 'led',
            'helped' => 'supported',
            'improved' => 'enhanced',
            'reduced' => 'decreased',
            'increased' => 'boosted',
            'worked with' => 'collaborated with',
            'work with' => 'collaborate with',
            'team player' => 'collaborative professional',
            'results' => 'outcomes',
            'goals' => 'objectives',
        ];
        // Apply phrase replacements first for better effect
        uasort($replacements, function ($a, $b) {
            return strlen($b) <=> strlen($a);
        });
        foreach ($replacements as $from => $to) {
            $pattern = '/\b' . preg_quote($from, '/') . '\b/i';
            $s = preg_replace($pattern, $to, $s);
        }
        return $this->localTidy($s);
    }

    private function sanitizeSummaryText(string $text, string $original): string
    {
        $s = $this->localTidy($text);
        // Collapse repeated words: "the the"
        $s = preg_replace('/\b(\w+)(\s+\1)+\b/i', '$1', $s);

        // Split into sentences
        $sentences = preg_split('/(?<=[.!?])\s+/', $s) ?: [$s];
        $clean = [];

        foreach ($sentences as $sentence) {
            $sentence = trim($sentence);
            if ($sentence === '') {
                continue;
            }
            // Deduplicate phrases within the sentence (comma/semicolon separated)
            $parts = preg_split('/\s*[;,]\s*/', $sentence) ?: [$sentence];
            $uniqueParts = [];
            foreach ($parts as $part) {
                $part = trim($part);
                if ($part === '') {
                    continue;
                }
                $isDup = false;
                foreach ($uniqueParts as $up) {
                    $perc = 0.0;
                    similar_text(mb_strtolower($up), mb_strtolower($part), $perc);
                    if ($perc > config('resume.ai_enhancement.similarity_thresholds.phrase_duplicate', 95.0)) {
                        $isDup = true;
                        break;
                    }
                }
                if (!$isDup) {
                    $uniqueParts[] = $part;
                }
            }
            $sentence = implode(', ', $uniqueParts);

            // Avoid duplicate sentences (near-duplicate)
            $dup = false;
            foreach ($clean as $existing) {
                $perc = 0.0;
                similar_text(mb_strtolower($existing), mb_strtolower($sentence), $perc);
                if ($perc > config('resume.ai_enhancement.similarity_thresholds.sentence_duplicate', 92.0)) {
                    $dup = true;
                    break;
                }
            }
            if (!$dup) {
                // Ensure proper end punctuation
                if (!preg_match('/[.!?]$/', $sentence)) {
                    $sentence .= '.';
                }
                $clean[] = $sentence;
            }
        }

        // Keep sentences within configurable limit
        if (count($clean) > config('resume.ai_enhancement.summary_length.max_sentences', 3)) {
            $clean = array_slice($clean, 0, config('resume.ai_enhancement.summary_length.max_sentences', 3));
        }
        if (count($clean) === 0) {
            $clean = [$s];
        }

        $final = implode(' ', $clean);
        // Enforce target length roughly within configurable limits
        $words = preg_split('/\s+/', trim($final)) ?: [];
        if (count($words) > config('resume.ai_enhancement.summary_length.sanitize_max_words', 90)) {
            $words = array_slice($words, 0, config('resume.ai_enhancement.summary_length.sanitize_max_words', 90));
            $final = rtrim(implode(' ', $words), ',;') . '.';
        }

        // Remove triple punctuation or repeated separators
        $final = preg_replace('/([.!?,;])\1{1,}/', '$1', $final);
        $final = preg_replace('/\s{2,}/', ' ', $final);

        // If still extremely similar, lightly rephrase
        if ($this->isTooSimilar($original, $final)) {
            $final = $this->localParaphrase($final);
        }

        return trim($final);
    }

    private function buildLocalSummary(?string $jobTitle, array $skills, array $experiences = [], array $education = []): string
    {
        $topSkills = array_slice(array_values(array_filter(array_map('trim', $skills))), 0, config('resume.ai_enhancement.summary_generation_limits.context.max_skills_display', 4));
        $skillsText = !empty($topSkills) ? (' in ' . implode(', ', $topSkills)) : '';
        
        // Determine professional focus based on available data
        $professionalFocus = $this->determineProfessionalFocus($jobTitle, $skills, $experiences, $education);
        
        if ($jobTitle) {
            $s1 = sprintf('Professional specializing as a %s, delivering measurable outcomes through strong execution%s.', $jobTitle, $skillsText);
        } else {
            $s1 = sprintf('Professional with expertise in %s, delivering measurable outcomes through strong execution.', $professionalFocus);
        }
        
        $s2 = 'Known for collaboration, adaptability, and continuous improvement, with a focus on driving impact in fast-paced environments.';
        return $this->localTidy($s1 . ' ' . $s2);
    }
    
    private function determineProfessionalFocus(?string $jobTitle, array $skills, array $experiences, array $education): string
    {
        // If we have a job title, use it
        if ($jobTitle) {
            return $jobTitle;
        }
        
        // If we have skills, use the most relevant ones
        if (!empty($skills)) {
            $topSkills = array_slice(array_values(array_filter(array_map('trim', $skills))), 0, 3);
            return implode(', ', $topSkills);
        }
        
        // If we have experiences, infer from job titles
        if (!empty($experiences)) {
            $jobTitles = array_filter(array_column($experiences, 'jobTitle'));
            if (!empty($jobTitles)) {
                return implode(', ', array_unique($jobTitles));
            }
        }
        
        // If we have education, use degree information
        if (!empty($education)) {
            $degrees = array_filter(array_column($education, 'degree'));
            if (!empty($degrees)) {
                return implode(', ', array_unique($degrees));
            }
        }
        
        // Default fallback
        return 'professional development and project delivery';
    }

    private function isTooSimilarToExisting(string $candidate, array $existingSuggestions): bool
    {
        foreach ($existingSuggestions as $existing) {
            $similarity = 0;
            similar_text($candidate, $existing, $similarity);
            if ($similarity > config('resume.ai_enhancement.quality_control.similarity_thresholds.text_similarity', 70)) {
                return true;
            }
        }
        return false;
    }

    private function createDiverseVariation(?string $jobTitle, array $skills, array $experiences, array $education, array $existingSuggestions): ?string
    {
        // If no job title, infer from available data
        if (empty($jobTitle)) {
            if (!empty($experiences)) {
                $jobTitle = $experiences[0]['jobTitle'] ?? 'Professional';
            } elseif (!empty($skills)) {
                $jobTitle = 'Skilled Professional';
            } elseif (!empty($education)) {
                $jobTitle = 'Educated Professional';
            } else {
                $jobTitle = 'Professional';
            }
        }
        
        $variations = [
            // Technical focus variation
            function() use ($jobTitle, $skills) {
                $topSkills = array_slice(array_values(array_filter(array_map('trim', $skills))), 0, 4);
                $skillsText = !empty($topSkills) ? (' specializing in ' . implode(', ', $topSkills)) : '';
                return "Experienced {$jobTitle}{$skillsText} with a proven track record of delivering high-quality solutions. Demonstrated expertise in problem-solving and technical implementation. Committed to continuous learning and staying current with industry best practices.";
            },
            // Achievement focus variation
            function() use ($jobTitle, $skills) {
                $topSkills = array_slice(array_values(array_filter(array_map('trim', $skills))), 0, 3);
                $skillsText = !empty($topSkills) ? (' with strong capabilities in ' . implode(', ', $topSkills)) : '';
                return "Results-driven {$jobTitle}{$skillsText} focused on achieving measurable outcomes and exceeding expectations. Proven ability to work effectively in dynamic environments and deliver projects on time. Strong analytical skills and attention to detail.";
            },
            // Leadership focus variation
            function() use ($jobTitle, $skills) {
                $topSkills = array_slice(array_values(array_filter(array_map('trim', $skills))), 0, 3);
                $skillsText = !empty($topSkills) ? (' with expertise in ' . implode(', ', $topSkills)) : '';
                return "Leadership-oriented {$jobTitle}{$skillsText} with a collaborative approach to project delivery and team development. Skilled in coordinating cross-functional efforts and driving strategic initiatives. Passionate about mentoring and knowledge sharing.";
            }
        ];

        // Try each variation until we find one that's different enough
        foreach ($variations as $variation) {
            $candidate = $variation();
            if (!$this->isTooSimilarToExisting($candidate, $existingSuggestions)) {
                return $this->localTidy($candidate);
            }
        }

        // If all variations are too similar, create a completely different one
        $uniqueSeed = uniqid();
        $uniqueVariation = "Dynamic {$jobTitle} with a unique approach to problem-solving and project delivery. " . 
                          "Combines technical expertise with creative thinking to develop innovative solutions. " . 
                          "Committed to excellence and continuous improvement in all professional endeavors.";
        
        return $this->localTidy($uniqueVariation);
    }

    private function generateLocalVariation($currentSummary, $jobTitle, $years, $skills, $industry) {
        // Multiple different approaches for local variation
        $approaches = [
            // Approach 1: Skills-focused
            function() use ($jobTitle, $years, $skills, $industry) {
                $skillList = implode(', ', array_slice($skills, 0, 4));
                return "Skilled {$jobTitle} with {$years} years of experience in {$industry}. Expertise in {$skillList}. Demonstrated ability to deliver innovative solutions and drive project success.";
            },
            // Approach 2: Achievement-focused
            function() use ($jobTitle, $years, $skills, $industry) {
                $skillList = implode(', ', array_slice($skills, 0, 3));
                return "Results-driven {$jobTitle} with {$years} years in {$industry}. Proven track record in {$skillList}. Committed to excellence and continuous professional development.";
            },
            // Approach 3: Leadership-focused
            function() use ($jobTitle, $years, $skills, $industry) {
                $skillList = implode(', ', array_slice($skills, 0, 4));
                return "Leadership-oriented {$jobTitle} with {$years} years of {$industry} experience. Strong background in {$skillList}. Focused on team collaboration and strategic project delivery.";
            },
            // Approach 4: Technical-focused
            function() use ($jobTitle, $years, $skills, $industry) {
                $skillList = implode(', ', array_slice($skills, 0, 5));
                return "Technical {$jobTitle} with {$years} years specializing in {$industry}. Advanced proficiency in {$skillList}. Dedicated to creating efficient, scalable solutions.";
            },
            // Approach 5: Business-impact focused
            function() use ($jobTitle, $years, $skills, $industry) {
                $skillList = implode(', ', array_slice($skills, 0, 3));
                return "Business-focused {$jobTitle} with {$years} years in {$industry}. Core competencies in {$skillList}. Committed to driving measurable business outcomes.";
            }
        ];
        
        // If this is first generation (no current summary), use a random approach
        if (empty(trim($currentSummary))) {
            $selectedApproach = $approaches[array_rand($approaches)];
            return $selectedApproach();
        }
        
        // For regeneration, select a random approach that's different from current
        $selectedApproach = $approaches[array_rand($approaches)];
        $variation = $selectedApproach();
        
        // If still too similar, force more variation
        $similarity = 0;
        similar_text($currentSummary, $variation, $similarity);
        
        if ($similarity > 70) {
            // Force even more variation by changing structure
            $variation = "Dynamic {$jobTitle} with {$years} years of {$industry} expertise. Specialized in " . implode(', ', array_slice($skills, 0, 2)) . ". Proven ability to lead complex projects and deliver exceptional results.";
        }
        
        return $variation;
    }

    private function generateLocalExperienceVariation($currentText, $jobTitle, $company) {
        // Multiple different approaches for experience variation
        $approaches = [
            // Approach 1: Technical focus
            function() use ($jobTitle, $company) {
                return "Developed and maintained web applications using modern technologies. Collaborated with cross-functional teams to deliver high-quality software solutions at {$company}.";
            },
            // Approach 2: Achievement focus
            function() use ($jobTitle, $company) {
                return "Led development initiatives and delivered successful projects on time. Improved system performance and user experience through innovative solutions at {$company}.";
            },
            // Approach 3: Leadership focus
            function() use ($jobTitle, $company) {
                return "Managed development teams and coordinated project delivery. Implemented best practices and mentored junior developers at {$company}.";
            },
            // Approach 4: Problem-solving focus
            function() use ($jobTitle, $company) {
                return "Solved complex technical challenges and optimized application performance. Worked closely with stakeholders to understand requirements at {$company}.";
            },
            // Approach 5: Innovation focus
            function() use ($jobTitle, $company) {
                return "Innovated new features and enhanced existing systems. Contributed to architectural decisions and technology stack improvements at {$company}.";
            }
        ];
        
        // If this is first generation (no current text), use a random approach
        if (empty(trim($currentText))) {
            $selectedApproach = $approaches[array_rand($approaches)];
            return $selectedApproach();
        }
        
        // For regeneration, select a random approach
        $selectedApproach = $approaches[array_rand($approaches)];
        $variation = $selectedApproach();
        
        // Check similarity and force variation if needed
        $similarity = 0;
        similar_text($currentText, $variation, $similarity);
        
        if ($similarity > 70) {
            // Force different structure
            $variation = "Specialized in {$jobTitle} role at {$company}, focusing on scalable solutions and efficient development practices. Contributed to team success through technical expertise and collaborative problem-solving.";
        }
        
        return $variation;
    }

    private function generateLocalEducationVariation($currentText, $degree, $school) {
        // Multiple different approaches for education variation
        $approaches = [
            // Approach 1: Academic focus
            function() use ($degree, $school) {
                return "Completed {$degree} at {$school} with focus on core computer science principles. Developed strong foundation in algorithms, data structures, and software engineering.";
            },
            // Approach 2: Project focus
            function() use ($degree, $school) {
                return "Earned {$degree} from {$school}, completing hands-on projects in software development. Gained practical experience with modern programming languages and development tools.";
            },
            // Approach 3: Skills focus
            function() use ($degree, $school) {
                return "Graduated with {$degree} from {$school}, acquiring technical skills in programming, database design, and system architecture. Developed analytical and problem-solving abilities.";
            },
            // Approach 4: Achievement focus
            function() use ($degree, $school) {
                return "Achieved {$degree} at {$school}, demonstrating excellence in computer science coursework. Participated in coding competitions and technical workshops.";
            },
            // Approach 5: Innovation focus
            function() use ($degree, $school) {
                return "Completed {$degree} program at {$school}, focusing on innovative software solutions and emerging technologies. Developed creative approaches to complex technical challenges.";
            }
        ];
        
        // If this is first generation (no current text), use a random approach
        if (empty(trim($currentText))) {
            $selectedApproach = $approaches[array_rand($approaches)];
            return $selectedApproach();
        }
        
        // For regeneration, select a random approach
        $selectedApproach = $approaches[array_rand($approaches)];
        $variation = $selectedApproach();
        
        // Check similarity and force variation if needed
        $similarity = 0;
        similar_text($currentText, $variation, $similarity);
        
        if ($similarity > 70) {
            // Force different structure
            $variation = "Successfully completed {$degree} at {$school}, building expertise in software development methodologies and technical problem-solving. Developed strong analytical skills and technical knowledge.";
        }
        
        return $variation;
    }

    private function isPoorQualityContent($text) {
        if (empty($text)) return true;
        
        // Check for very short content
        if (strlen(trim($text)) < 20) return true;
        
        // Check for generic phrases that indicate poor quality
        $genericPhrases = [
            'sample text', 'lorem ipsum', 'placeholder', 'text here', 'description here',
            'enter description', 'add description', 'write here', 'type here',
            'sample description', 'example text', 'test text', 'dummy text',
            'generate a concise', 'generate a professional', 'emphasize achievements',
            'emphasize relevant coursework', 'emphasize impact'
        ];
        
        $textLower = strtolower(trim($text));
        foreach ($genericPhrases as $phrase) {
            if (strpos($textLower, $phrase) !== false) {
                return true;
            }
        }
        
        // Check for repetitive or nonsensical content
        $words = explode(' ', trim($text));
        if (count($words) < 5) return true;
        
        // Check for excessive repetition
        $wordCounts = array_count_values($words);
        foreach ($wordCounts as $word => $count) {
            if (strlen($word) > 3 && $count > 2) return true; // Word repeated more than 2 times
        }
        
        // Check for content that's too similar to input (indicating AI didn't improve it)
        if (strlen($text) < 30 && strpos($textLower, 'software developer') !== false && strpos($textLower, 'wrote code') !== false) {
            return true;
        }
        
        return false;
    }

    private function localPolish($text, $type, $context) {
        $text = trim($text);
        
        // Basic improvements that can be done locally
        switch ($type) {
            case 'experience':
                return $this->polishExperienceText($text, $context);
            case 'education':
                return $this->polishEducationText($text, $context);
            case 'summary':
                return $this->polishSummaryText($text, $context);
            default:
                return $text;
        }
    }

    private function polishExperienceText($text, $context) {
        // Transform basic phrases to professional ones
        $improvements = [
            'i worked as' => 'Developed expertise as',
            'i was responsible for' => 'Managed and executed',
            'i used' => 'Leveraged',
            'i wrote code' => 'Engineered software solutions',
            'i built' => 'Architected and implemented',
            'i created' => 'Designed and developed',
            'i helped' => 'Collaborated with teams to',
            'i worked with' => 'Partnered with',
            'i did' => 'Executed',
            'i made' => 'Delivered',
            'wrote code for' => 'engineered',
            'web applications' => 'scalable web applications',
            'projects' => 'strategic initiatives',
            'team members' => 'cross-functional teams',
            'on time' => 'within scheduled timelines',
            'delivered' => 'successfully delivered',
            'key projects' => 'critical business initiatives',
            'delivered results' => 'achieved measurable outcomes',
            'was responsible for' => 'managed and executed',
            'responsible for' => 'managed and executed'
        ];
        
        $polished = $text;
        foreach ($improvements as $basic => $professional) {
            $polished = str_ireplace($basic, $professional, $polished);
        }
        
        // Ensure proper capitalization
        $polished = ucfirst(trim($polished));
        
        // Add company context if available
        if (isset($context['company']) && !stripos($polished, $context['company'])) {
            $polished = rtrim($polished, '.') . " at {$context['company']}.";
        }
        
        // Limit to 2-3 sentences and 25-40 words
        $sentences = preg_split('/[.!?]+/', $polished);
        $sentences = array_filter(array_map('trim', $sentences));
        $sentences = array_slice($sentences, 0, 3); // Max 3 sentences
        
        $polished = implode('. ', $sentences) . '.';
        
        // Ensure word count is reasonable
        $words = str_word_count($polished);
        if ($words > 40) {
            $words = explode(' ', $polished);
            $polished = implode(' ', array_slice($words, 0, 40)) . '.';
        }
        
        return $polished;
    }

    private function polishEducationText($text, $context) {
        // Transform basic phrases to academic/professional ones
        $improvements = [
            'i studied' => 'Completed',
            'i learned' => 'Acquired expertise in',
            'i took courses' => 'Completed advanced coursework',
            'programming' => 'software development',
            'computer science' => 'Computer Science',
            'algorithms' => 'algorithms and data structures',
            'projects' => 'hands-on projects',
            'coursework' => 'comprehensive coursework',
            'gained' => 'developed',
            'experience' => 'practical experience',
            'relevant subjects' => 'core technical subjects',
            'practical experience' => 'hands-on technical experience',
            'completed coursework' => 'mastered advanced coursework',
            'gained practical experience' => 'developed hands-on technical skills'
        ];
        
        $polished = $text;
        foreach ($improvements as $basic => $professional) {
            $polished = str_ireplace($basic, $professional, $polished);
        }
        
        // Ensure proper capitalization
        $polished = ucfirst(trim($polished));
        
        // Add degree context if available
        if (isset($context['degree']) && isset($context['school'])) {
            if (!stripos($polished, $context['school'])) {
                $polished = rtrim($polished, '.') . " during {$context['degree']} program at {$context['school']}.";
            }
        }
        
        // Limit to 2-3 sentences and 25-40 words
        $sentences = preg_split('/[.!?]+/', $polished);
        $sentences = array_filter(array_map('trim', $sentences));
        $sentences = array_slice($sentences, 0, 3); // Max 3 sentences
        
        $polished = implode('. ', $sentences) . '.';
        
        // Ensure word count is reasonable
        $words = str_word_count($polished);
        if ($words > 40) {
            $words = explode(' ', $polished);
            $polished = implode(' ', array_slice($words, 0, 40)) . '.';
        }
        
        return $polished;
    }

    private function polishSummaryText($text, $context) {
        // Transform basic phrases to professional summary language
        $improvements = [
            'i am' => 'Experienced',
            'i work with' => 'Specialized in',
            'i have' => 'Possess',
            'years of experience' => 'years of professional experience',
            'software engineer' => 'Software Engineer',
            'with experience in' => 'with proven expertise in',
            'i can' => 'Capable of',
            'i know' => 'Proficient in',
            'i work' => 'Specialize in',
            'i use' => 'Leverage',
            'i develop' => 'Engineer',
            'i build' => 'Architect and develop',
            'i create' => 'Design and implement',
            'i help' => 'Collaborate with teams to',
            'i collaborate' => 'Partner with cross-functional teams to'
        ];
        
        $polished = $text;
        foreach ($improvements as $basic => $professional) {
            $polished = str_ireplace($basic, $professional, $polished);
        }
        
        // Ensure proper capitalization
        $polished = ucfirst(trim($polished));
        
        // Make it more results-oriented
        if (!stripos($polished, 'deliver') && !stripos($polished, 'achieve')) {
            $polished = rtrim($polished, '.') . '. Committed to delivering high-quality solutions and driving business impact.';
        }
        
        // Limit to 3-4 sentences and 50-80 words for summary
        $sentences = preg_split('/[.!?]+/', $polished);
        $sentences = array_filter(array_map('trim', $sentences));
        $sentences = array_slice($sentences, 0, 4); // Max 4 sentences
        
        $polished = implode('. ', $sentences) . '.';
        
        // Ensure word count is reasonable for summary
        $words = str_word_count($polished);
        if ($words > 80) {
            $words = explode(' ', $polished);
            $polished = implode(' ', array_slice($words, 0, 80)) . '.';
        }
        
        return $polished;
    }

    private function estimateYearsFromExperiences(array $experiences): int
    {
        $minYear = null;
        foreach ($experiences as $exp) {
            $start = $exp['startDate'] ?? '';
            if (preg_match('/(\d{4})/', $start, $m)) {
                $year = intval($m[1]);
                $minYear = $minYear === null ? $year : min($minYear, $year);
            }
        }
        if ($minYear === null) return 0;
        $years = max(0, intval(date('Y')) - $minYear);
        return min($years, config('resume.ai_enhancement.summary_context_limits.max_years_experience', 60));
    }

    private function summarizeExperiencesForPrompt(array $experiences): string
    {
        if (empty($experiences)) return '';
        $lines = ["Experiences:"];
        foreach (array_slice($experiences, 0, config('resume.ai_enhancement.summary_context_limits.max_experiences', 4)) as $exp) {
            $title = trim($exp['jobTitle'] ?? '');
            $company = trim($exp['company'] ?? '');
            $dates = trim(($exp['startDate'] ?? '') . ' - ' . ($exp['endDate'] ?? 'Present'));
            $parts = array_filter([$title, $company, $dates]);
            if (!empty($parts)) {
                $lines[] = '- ' . implode(' | ', $parts);
            }
        }
        return implode("\n", $lines) . "\n";
    }

    private function summarizeEducationForPrompt(array $education): string
    {
        if (empty($education)) return '';
        $lines = ["Education:"];
        foreach (array_slice($education, 0, config('resume.ai_enhancement.summary_context_limits.max_education', 2)) as $edu) {
            $degree = trim($edu['degree'] ?? '');
            $school = trim($edu['school'] ?? '');
            $parts = array_filter([$degree, $school]);
            if (!empty($parts)) {
                $lines[] = '- ' . implode(' | ', $parts);
            }
        }
        return implode("\n", $lines) . "\n";
    }
}
