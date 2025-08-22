<?php

namespace App\Http\Controllers;

use App\Services\GeminiService;
use Illuminate\Http\Request;
use App\Models\Resume;
use Illuminate\Support\Facades\Auth;

class AIController extends Controller
{
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
            
            $prompt = "Create a focused, professional education description (25-40 words) that {$randomApproach}. 

CRITICAL REQUIREMENTS:
- Write 2-3 concise, focused sentences
- Focus ONLY on the specific degree, school, and relevant achievements
- Include ONLY technical skills and tools that are directly relevant
- Use professional language that matches the original context
- Keep it concise and to the point
- Do NOT add generic achievements or skills not mentioned in the original

This should be a focused description that enhances the original text without being overly verbose. Seed: {$randomSeed}. Return ONLY JSON: {\\\"revised_text\\\": string}.\\n\\nTEXT:\\n" . $request->text;
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
            
            $prompt = "Create a concise, professional experience description (25-35 words) that {$randomFocus}. 

CRITICAL REQUIREMENTS:
- Write 2-3 short, focused sentences
- Focus ONLY on the specific role and key responsibilities
- Use simple, clear language that is easy to read
- Keep it concise and to the point
- Do NOT add generic achievements or skills not mentioned in the original
- Do NOT invent specific metrics or numbers
- Do NOT use overly complex or powerful language
- Make it readable and contextually appropriate

This should be a simple, clear description that enhances the original text without being verbose or overly complex. Seed: {$randomSeed}. Return ONLY JSON: {\\\"revised_text\\\": string}.\\n\\nTEXT:\\n" . $request->text;
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
            
            $prompt = "Create a COMPLETELY DIFFERENT, concise experience description (25-35 words) that {$randomFocus}. 

CRITICAL REQUIREMENTS:
- Write a COMPLETELY DIFFERENT approach from the original text
- Write 2-3 short, focused sentences
- Focus ONLY on the specific role and key responsibilities
- Use simple, clear language that is easy to read
- Keep it concise and to the point
- Do NOT add generic achievements or skills not mentioned in the original
- Do NOT invent specific metrics or numbers
- Do NOT use overly complex or powerful language
- Make it readable and contextually appropriate
- This MUST be completely different from any previous generation

Force regeneration seed: {$forceSeed}. Return ONLY JSON: {\\\"revised_text\\\": string}.\\n\\nTEXT:\\n" . $request->text;
            
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
                        
                        $prompt = "{$openingLine}\n" .
                            "Write 3–5 powerful, impactful sentences (" . config('resume.ai_enhancement.summary_length.min_words', 60) . "–" . config('resume.ai_enhancement.summary_length.max_words', 90) . " words) that are {$style}.\n\n" .
                            "FORCE REGENERATION REQUIREMENTS:\n" .
                            "- This MUST be COMPLETELY DIFFERENT from any previous summary\n" .
                            "- Use the EXACT structure: {$forceStructure}\n" .
                            "- Start with a COMPLETELY DIFFERENT opening sentence\n" .
                            "- Use DIFFERENT examples and achievements\n" .
                            "- Employ ALTERNATIVE vocabulary and phrasing\n" .
                            "- Lead with your most impressive achievement or unique value proposition\n" .
                            "- Quantify impact with specific metrics, percentages, and business outcomes\n" .
                            "- Highlight technical expertise, leadership, and industry knowledge\n" .
                            "- Demonstrate problem-solving abilities and strategic thinking\n" .
                            "- Use powerful, industry-specific language that commands attention\n" .
                            "- Avoid generic phrases and placeholders like [field]\n" .
                            "- Make each sentence distinct and memorable\n\n" .
                            "IMPORTANT: This MUST be completely different from any previous summary. Use the comprehensive context below to create a unique summary that makes hiring managers want to interview you immediately. Seed: {$seed}.\n" .
                            "Return ONLY JSON: {\\n  \\\"revised_text\\\": string\\n}.\n\n" .
                            $context;
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
                        
                        $prompt = "{$openingLine}\n" .
                            "Write 3–5 powerful, impactful sentences (" . config('resume.ai_enhancement.summary_length.min_words', 60) . "–" . config('resume.ai_enhancement.summary_length.max_words', 90) . " words) that are {$style}.\n\n" .
                            "CRITICAL REQUIREMENTS FOR REGENERATION:\n" .
                            "- Use a COMPLETELY DIFFERENT approach and structure from any previous summary\n" .
                            "- Start with a different opening sentence and perspective\n" .
                            "- Use different examples and achievements\n" .
                            "- Employ alternative vocabulary and phrasing\n" .
                            "- Lead with your most impressive achievement or unique value proposition\n" .
                            "- Quantify impact with specific metrics, percentages, and business outcomes\n" .
                            "- Highlight technical expertise, leadership, and industry knowledge\n" .
                            "- Demonstrate problem-solving abilities and strategic thinking\n" .
                            "- Use powerful, industry-specific language that commands attention\n" .
                            "- Avoid generic phrases and placeholders like [field]\n" .
                            "- Make each sentence distinct and memorable\n\n" .
                            "CONTENT FOCUS: {$contentFocus}\n\n" .
                            "CONTENT STRUCTURE VARIATION:\n" .
                            "- If previous summary started with experience, start with skills or achievements\n" .
                            "- If previous summary focused on technical skills, focus on leadership or business impact\n" .
                            "- If previous summary was achievement-focused, make this skills-focused\n" .
                            "- Use different sentence patterns and transitions\n\n" .
                            "IMPORTANT: This MUST be completely different from any previous summary. Use the comprehensive context below to create a unique summary that makes hiring managers want to interview you immediately. Seed: {$seed}.\n" .
                            "Return ONLY JSON: {\\n  \\\"revised_text\\\": string\\n}.\n\n" .
                            $context;
                    }
                } else {
                    $prompt = "Create an exceptional, compelling resume summary for the role: {$jobTitle}.\n" .
                        "Write 3–5 powerful, impactful sentences (" . config('resume.ai_enhancement.summary_length.min_words', 60) . "–" . config('resume.ai_enhancement.summary_length.max_words', 90) . " words) that are {$style}.\n\n" .
                        "CRITICAL REQUIREMENTS:\n" .
                        "- Lead with your most impressive achievement or unique value proposition\n" .
                        "- Quantify impact with specific metrics, percentages, and business outcomes\n" .
                        "- Highlight technical expertise, leadership, and industry knowledge\n" .
                        "- Demonstrate problem-solving abilities and strategic thinking\n" .
                        "- Use powerful, industry-specific language that commands attention\n" .
                        "- Avoid generic phrases and placeholders like [field]\n" .
                        "- Make each sentence distinct and memorable\n" .
                        "- Reference specific skills, experience level, and industry focus from context\n" .
                        "- Tailor language to match the career progression level\n\n" .
                        "Use the comprehensive context below to create a summary that makes hiring managers want to interview you immediately. Seed: {$seed}.\n" .
                        "Return ONLY JSON: {\\n  \\\"revised_text\\\": string\\n}.\n\n" .
                        $context;
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
                $revised = $this->buildLocalSummary($jobTitle, $years, $skills, $industry);
            }

            // Ensure it references the job title in some way
            if (mb_stripos($revised, $jobTitle) === false) {
                $revised = $this->localTidy($revised . ' Focused on the ' . $jobTitle . ' role.');
                $revised = $this->sanitizeSummaryText($revised, $current ?: $jobTitle);
            }

            // If result is too short or looks like just the job title, build locally
            $bareJobTitle = $this->localTidy($jobTitle);
            if (mb_strlen($revised) < config('resume.ai_enhancement.summary_length.min_words', 40) || $this->isTooSimilar($revised, $bareJobTitle)) {
                $revised = $this->buildLocalSummary($jobTitle, $years, $skills, $industry);
            }

            return response()->json([
                'revised_text' => $revised
            ], 200, [], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_IGNORE);
        } catch (\Throwable $e) {
            // Local fallback template
            $prefix = $years ? "{$years}+ years" : "Proven";
            $skillsPhrase = !empty($skills) ? (' in ' . implode(', ', array_slice($skills, 0, config('resume.ai_enhancement.max_skills_display', 5)))) : '';
            $industryText = $industry ? $industry : 'fast-paced environments';
            $fallback = "$prefix of experience as a {$jobTitle}, delivering measurable outcomes through strong execution{$skillsPhrase}. " .
                "Committed to driving impact, collaborating across teams, and advancing business goals in {$industryText}.";
            $fallback = $this->sanitizeSummaryText($fallback, $current ?: $jobTitle);
            return response()->json([
                'revised_text' => $fallback
            ], 200, [], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_IGNORE);
        }
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
        $minLength = config("resume.ai_enhancement.validation.min_text_length.{$type}", 10);
        if (strlen($text) < $minLength) {
            return response()->json([
                'error' => 'Text too short',
                'message' => "Please provide at least {$minLength} characters for AI improvement.",
                'min_length' => $minLength
            ], 400);
        }

        try {
            $improvementPrompts = [
                'experience' => [
                    'focus' => 'professional experience description',
                    'requirements' => [
                        'Improve clarity and readability',
                        'Enhance professional tone',
                        'Fix grammar and punctuation',
                        'Make it more concise and impactful',
                        'Keep the same meaning and context',
                        'Use active voice where appropriate'
                    ]
                ],
                'education' => [
                    'focus' => 'education description',
                    'requirements' => [
                        'Improve clarity and readability',
                        'Enhance academic tone',
                        'Fix grammar and punctuation',
                        'Make it more concise and impactful',
                        'Keep the same meaning and context',
                        'Highlight relevant skills and achievements'
                    ]
                ],
                'summary' => [
                    'focus' => 'professional summary',
                    'requirements' => [
                        'Improve clarity and readability',
                        'Enhance professional tone',
                        'Fix grammar and punctuation',
                        'Make it more concise and impactful',
                        'Keep the same meaning and context',
                        'Strengthen key value propositions'
                    ]
                ]
            ];

            $promptConfig = $improvementPrompts[$type];
            $requirements = implode("\n- ", $promptConfig['requirements']);

            $prompt = "Transform this {$promptConfig['focus']} into professional, impactful language:

ORIGINAL TEXT:
{$text}

IMPROVEMENT REQUIREMENTS:
- {$requirements}

SPECIFIC TRANSFORMATIONS:
- Replace basic verbs: 'worked' → 'developed', 'did' → 'executed', 'made' → 'delivered'
- Use industry terminology: 'wrote code' → 'engineered solutions', 'helped' → 'collaborated with'
- Add quantifiable impact: 'projects' → 'strategic initiatives', 'results' → 'measurable outcomes'
- Professional language: 'I was responsible for' → 'Managed and executed', 'I used' → 'Leveraged'
- Technical depth: 'web applications' → 'scalable web applications', 'programming' → 'software development'

OUTPUT REQUIREMENTS:
- Maximum 2-3 sentences
- 25-40 words total
- Professional, confident tone
- Industry-specific vocabulary
- Results-oriented language
- No generic phrases
- Maintain original meaning

CRITICAL: Return ONLY JSON: {\"improved_text\": string}";

            $result = $gemini->generateEnhancedContent($prompt, [
                'response_mime_type' => 'application/json',
                'maxOutputTokens' => 256, // Strict limit for focused improvement
                'temperature' => 0.5, // Balanced temperature for consistent improvement
            ]);

            $improved = $this->extractImprovedText($result, $text);
            
            // If AI doesn't improve the text (too similar), use local improvement
            $similarity = 0;
            similar_text($text, $improved, $similarity);
            if ($similarity > 90) {
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

    private function buildLocalSummary(string $jobTitle, ?int $years, array $skills, ?string $industry): string
    {
        $yearsText = $years !== null ? $years . "+ years " : '';
        $industryText = $industry ? $industry : 'fast-paced environments';
        $topSkills = array_slice(array_values(array_filter(array_map('trim', $skills))), 0, config('resume.ai_enhancement.max_skills_display', 5));
        $skillsText = !empty($topSkills) ? (' in ' . implode(', ', $topSkills)) : '';

        $s1 = sprintf('%sprofessional specializing as a %s, delivering measurable outcomes through strong execution%s.',
            $yearsText ? ucfirst($yearsText) : '', $jobTitle, $skillsText);
        $s2 = sprintf('Known for collaboration, adaptability, and continuous improvement, with a focus on driving impact in %s.', $industryText);
        return $this->localTidy($s1 . ' ' . $s2);
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
