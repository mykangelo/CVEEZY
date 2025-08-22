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
            for ($i = 0; $i < config('resume.ai_enhancement.max_retries', 6); $i++) {
                $style = $styles[array_rand($styles)];
                $seed = $variant ? ($variant . '-' . $i) : (string) mt_rand(config('resume.ai_enhancement.random_seed_range.min', 1000), config('resume.ai_enhancement.random_seed_range.max', 9999));
                $prompt = "Create an exceptional, compelling resume summary for the role: {$jobTitle}.\n" .
                    "Write 3–5 powerful, impactful sentences (" . config('resume.ai_enhancement.summary_length.min_words', 60) . "–" . config('resume.ai_enhancement.summary_length.max_words', 90) . " words) that are {$style}.\n\n" .
                    "REQUIREMENTS:\n" .
                    "- Lead with your most impressive achievement or unique value proposition\n" .
                    "- Quantify impact with specific metrics, percentages, and business outcomes\n" .
                    "- Highlight technical expertise, leadership, and industry knowledge\n" .
                    "- Demonstrate problem-solving abilities and strategic thinking\n" .
                    "- Use powerful, industry-specific language that commands attention\n" .
                    "- Avoid generic phrases and placeholders like [field]\n" .
                    "- Make each sentence distinct and memorable\n\n" .
                    "Use the context below to create a summary that makes hiring managers want to interview you immediately. Seed: {$seed}.\n" .
                    "Return ONLY JSON: {\\n  \\\"revised_text\\\": string\\n}.\n\n" .
                    $context;

                $result = $gemini->generateEnhancedContent($prompt, [
                    'response_mime_type' => 'application/json',
                    'maxOutputTokens' => config('resume.ai_enhancement.max_output_tokens.summary_generation', 3072),
                    'temperature' => $variant ? 
                        config('resume.ai_enhancement.temperature_range.max', 1.2) + (mt_rand(0, 100) / 100) * 0.4 : // Higher temp for regeneration
                        min(config('resume.ai_enhancement.temperature_range.min', 0.8) + $i * config('resume.ai_enhancement.temperature_increment', 0.15) + (mt_rand(0, 100) / 100) * 0.3, config('resume.ai_enhancement.temperature_range.max', 1.2)),
                ]);
                if (is_array($result) && !empty($result['candidates'])) {
                    $candidate = $this->extractRevisedText($result, $current ?: $jobTitle);
                    $candidate = $this->sanitizeSummaryText($candidate, $current ?: $jobTitle);
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
            if (empty($revised)) {
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

            $prompt = "Improve this {$promptConfig['focus']} while maintaining the exact same meaning and context:

ORIGINAL TEXT:
{$text}

IMPROVEMENT REQUIREMENTS:
- {$requirements}

IMPORTANT: 
- Keep the SAME meaning and context
- Do NOT add new information not in the original
- Do NOT change the core message
- Only improve clarity, grammar, and professional tone
- Make it more readable and impactful
- Keep the same length or slightly shorter

Return ONLY JSON: {\"improved_text\": string}";

            $result = $gemini->generateEnhancedContent($prompt, [
                'response_mime_type' => 'application/json',
                'maxOutputTokens' => 512, // Moderate limit for improvement
                'temperature' => 0.3, // Low temperature for consistent improvement
            ]);

            $improved = $this->extractImprovedText($result, $text);
            
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
