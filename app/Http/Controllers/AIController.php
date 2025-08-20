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
            'text' => 'required|string'
        ]);

        try {
            $approaches = [
                "highlight academic achievements and relevant coursework",
                "emphasize practical skills gained and projects completed", 
                "focus on honors, awards, and standout accomplishments"
            ];
            
            $randomApproach = $approaches[array_rand($approaches)];
            $randomSeed = mt_rand(1000, 9999);
            
            $prompt = "Rewrite the education description into a concise professional paragraph (30–60 words), {$randomApproach}. Preserve key coursework/tools/results if present. Remove placeholders. Seed: {$randomSeed}. Return ONLY JSON: {\\\"revised_text\\\": string}.\\n\\nTEXT:\\n" . $request->text;
            $result = $gemini->generateText($prompt, 'gemini-1.5-flash', [
                'response_mime_type' => 'application/json',
                'maxOutputTokens' => 384,
                'temperature' => 0.7,
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
            'text' => 'required|string'
        ]);

        try {
            $focuses = [
                "quantify achievements and measurable outcomes",
                "emphasize leadership, collaboration, and team impact",
                "highlight technical skills and problem-solving abilities", 
                "showcase innovation, efficiency improvements, and process optimization"
            ];
            
            $randomFocus = $focuses[array_rand($focuses)];
            $randomSeed = mt_rand(1000, 9999);
            
            $prompt = "Rewrite the experience description to a concise, results-focused paragraph (40–70 words), {$randomFocus}. Use active verbs and quantify impact when numbers exist. Remove placeholders. Seed: {$randomSeed}. Return ONLY JSON: {\\\"revised_text\\\": string}.\\n\\nTEXT:\\n" . $request->text;
            $result = $gemini->generateText($prompt, 'gemini-1.5-flash', [
                'response_mime_type' => 'application/json',
                'maxOutputTokens' => 512,
                'temperature' => 0.7,
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
            'years_experience' => 'nullable|integer|min:0|max:60',
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
            $styles = [
                'achievement-focused and quantitative',
                'skills-forward and technical',
                'leadership-oriented and strategic',
                'results-driven and action-oriented',
                'client-impact oriented',
                'efficiency-focused'
            ];
            $context = "Context\n" .
                "JobTitle: {$jobTitle}\n" .
                $yearsLine . $industryLine . $skillsList . $currentLine .
                $this->summarizeExperiencesForPrompt($experiences) .
                $this->summarizeEducationForPrompt($education);

            $revised = '';
            for ($i = 0; $i < 6; $i++) {
                $style = $styles[array_rand($styles)];
                $seed = $variant ? ($variant . '-' . $i) : (string) mt_rand(1000, 9999);
                $prompt = "Generate a professional resume summary tailored to the role: {$jobTitle}.\n" .
                    "Write 2–3 complete sentences (60–90 words), formal and {$style}.\n" .
                    "Use the context below. Quantify achievements when possible. Avoid placeholders like [field]. No bullets or headings.\n" .
                    "Seed: {$seed}.\n" .
                    "Return ONLY JSON: {\\n  \\\"revised_text\\\": string\\n}.\n\n" .
                    $context;

                $result = $gemini->generateText($prompt, 'gemini-1.5-flash', [
                    'response_mime_type' => 'application/json',
                    'maxOutputTokens' => 640,
                    'temperature' => min(0.85 + $i * 0.05, 1.0),
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
            if (mb_strlen($revised) < 40 || $this->isTooSimilar($revised, $bareJobTitle)) {
                $revised = $this->buildLocalSummary($jobTitle, $years, $skills, $industry);
            }

            return response()->json([
                'revised_text' => $revised
            ], 200, [], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_IGNORE);
        } catch (\Throwable $e) {
            // Local fallback template
            $prefix = $years ? "{$years}+ years" : "Proven";
            $skillsPhrase = !empty($skills) ? (' in ' . implode(', ', array_slice($skills, 0, 5))) : '';
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
        if ($percent >= 88.0) { // stricter threshold
            return true;
        }
        // Token overlap (Jaccard)
        $tokensA = $this->tokenize($a);
        $tokensB = $this->tokenize($b);
        if (!empty($tokensA) && !empty($tokensB)) {
            $intersect = array_intersect($tokensA, $tokensB);
            $union = array_unique(array_merge($tokensA, $tokensB));
            $jaccard = count($union) > 0 ? (count($intersect) / count($union)) : 0.0;
            if ($jaccard >= 0.80) {
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
            return mb_strlen($t) >= 3;
        }));
        return $parts;
    }

    private function randomSummaryStyleAndSeed(array $used): array
    {
        $styles = [
            'achievement-focused and quantitative, highlighting measurable results',
            'skills-forward and technical, emphasizing core competencies',
            'leadership-oriented and strategic, showcasing initiative and impact',
            'results-driven and action-oriented, using strong verbs and outcomes',
            'client-impact oriented, showcasing value delivered to stakeholders',
            'efficiency-focused, emphasizing automation, quality and speed improvements'
        ];
        // pick style not used recently if possible
        $candidates = array_values(array_diff($styles, array_map(function ($s) {
            return explode('#', $s)[0] ?? $s;
        }, $used)));
        $style = $candidates ? $candidates[array_rand($candidates)] : $styles[array_rand($styles)];
        $seed = mt_rand(1000, 9999);
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
                    if ($perc > 95.0) {
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
                if ($perc > 92.0) {
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

        // Keep 2–3 sentences max
        if (count($clean) > 3) {
            $clean = array_slice($clean, 0, 3);
        }
        if (count($clean) === 0) {
            $clean = [$s];
        }

        $final = implode(' ', $clean);
        // Enforce target length roughly 50–90 words
        $words = preg_split('/\s+/', trim($final)) ?: [];
        if (count($words) > 90) {
            $words = array_slice($words, 0, 90);
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
        $topSkills = array_slice(array_values(array_filter(array_map('trim', $skills))), 0, 5);
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
        return min($years, 60);
    }

    private function summarizeExperiencesForPrompt(array $experiences): string
    {
        if (empty($experiences)) return '';
        $lines = ["Experiences:"];
        foreach (array_slice($experiences, 0, 4) as $exp) {
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
        foreach (array_slice($education, 0, 2) as $edu) {
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
