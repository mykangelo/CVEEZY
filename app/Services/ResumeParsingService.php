<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\Settings;
use Smalot\PdfParser\Parser as PdfParser;
use App\Services\GeminiService;

class ResumeParsingService
{
    private $extractedData = [];
    private $rawText = '';
    private $knownSectionHeadings = [];
    private $gemini;

    public function __construct(GeminiService $geminiService = null)
    {
        $this->gemini = $geminiService;
        // Known section labels (lowercase)
        $this->knownSectionHeadings = array_unique(array_map('strtolower', [
            // Core
            'contact', 'contact information', 'personal information', 'profile', 'summary', 'objective', 'about', 'overview', 'professional summary', 'career objective',
            'experience', 'work experience', 'employment', 'professional experience', 'work history', 'career', 'projects', 'project experience',
            'education', 'academic background', 'qualifications', 'degrees', 'academic qualifications',
            'skills', 'technical skills', 'core competencies', 'expertise', 'technologies', 'proficiencies',
            'languages', 'language skills', 'linguistic skills',
            'certifications', 'certificates', 'professional certifications', 'licenses', 'credentials',
            'awards', 'achievements', 'honors', 'recognition', 'accolades',
            'websites', 'links', 'social', 'social links', 'profiles',
            'references', 'hobbies', 'interests'
        ]));
    }
    
    /**
     * Parse an uploaded resume file and extract structured data
     */
    public function parseResume(UploadedFile $file): array
    {
        try {
            // Store file temporarily
            $filePath = $this->storeTemporaryFile($file);
            
            // Extract text based on file type
            $this->rawText = $this->extractTextFromFile($filePath, $file->getClientOriginalExtension());
            // Ensure UTF-8 safe string to avoid JSON encoding issues
            $this->rawText = $this->sanitizeUtf8($this->rawText);
            
            // Parse the extracted text
            $this->extractedData = $this->parseTextToStructuredData($this->rawText);
            
            // Clean up temporary file
            Storage::disk('local')->delete($filePath);
            
            return [
                'success' => true,
                'data' => $this->extractedData,
                'raw_text' => $this->rawText
            ];
            
        } catch (\Exception $e) {
            Log::error('Resume parsing failed: ' . $e->getMessage(), [
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'data' => []
            ];
        }
    }
    
    /**
     * Store uploaded file temporarily
     */
    private function storeTemporaryFile(UploadedFile $file): string
    {
        // Ensure temp directory exists
        $tempDir = 'temp/resumes';
        if (!Storage::disk('local')->exists($tempDir)) {
            Storage::disk('local')->makeDirectory($tempDir);
        }
        
        // Create unique filename to prevent conflicts
        $extension = $file->getClientOriginalExtension();
        $filename = 'temp_resume_' . time() . '_' . uniqid() . '.' . $extension;
        
        return $file->storeAs($tempDir, $filename, 'local');
    }
    
    /**
     * Extract text from file based on its type
     */
    private function extractTextFromFile(string $filePath, string $extension): string
    {
        $fullPath = Storage::disk('local')->path($filePath);
        
        switch (strtolower($extension)) {
            case 'pdf':
                return $this->extractFromPdf($fullPath);
            case 'docx':
                return $this->extractFromDocx($fullPath);
            case 'doc':
                return $this->extractFromDoc($fullPath);
            case 'txt':
                return $this->extractFromTxt($fullPath);
            case 'html':
            case 'htm':
                return $this->extractFromHtml($fullPath);
            default:
                throw new \Exception('Unsupported file format: ' . $extension);
        }
    }
    
    /**
     * Extract text from PDF file
     */
    private function extractFromPdf(string $filePath): string
    {
        try {
            $parser = new PdfParser();
            $pdf = $parser->parseFile($filePath);
            return $pdf->getText();
        } catch (\Exception $e) {
            Log::error('PDF parsing failed: ' . $e->getMessage());
            throw new \Exception('Failed to parse PDF file: ' . $e->getMessage());
        }
    }
    
    /**
     * Extract text from DOCX file
     */
    private function extractFromDocx(string $filePath): string
    {
        try {
            $phpWord = IOFactory::load($filePath);
            $text = '';
            
            foreach ($phpWord->getSections() as $section) {
                foreach ($section->getElements() as $element) {
                    if (method_exists($element, 'getText')) {
                        $text .= $element->getText() . "\n";
                    } elseif (method_exists($element, 'getElements')) {
                        foreach ($element->getElements() as $childElement) {
                            if (method_exists($childElement, 'getText')) {
                                $text .= $childElement->getText() . "\n";
                            }
                        }
                    }
                }
            }
            
            return $text;
        } catch (\Exception $e) {
            Log::error('DOCX parsing failed: ' . $e->getMessage());
            throw new \Exception('Failed to parse DOCX file: ' . $e->getMessage());
        }
    }
    
    /**
     * Extract text from DOC file (fallback method)
     */
    private function extractFromDoc(string $filePath): string
    {
        try {
            $phpWord = IOFactory::load($filePath);
            return $this->extractFromDocx($filePath); // Use same method as DOCX
        } catch (\Exception $e) {
            Log::error('DOC parsing failed: ' . $e->getMessage());
            throw new \Exception('Failed to parse DOC file: ' . $e->getMessage());
        }
    }
    
    /**
     * Extract text from TXT file
     */
    private function extractFromTxt(string $filePath): string
    {
        return file_get_contents($filePath);
    }
    
    /**
     * Extract text from HTML file
     */
    private function extractFromHtml(string $filePath): string
    {
        $html = file_get_contents($filePath);
        return strip_tags($html);
    }
    
    /**
     * Parse extracted text into structured resume data
     */
    private function parseTextToStructuredData(string $text): array
    {
        $data = [
            'contact' => [
                'firstName' => '',
                'lastName' => '',
                'desiredJobTitle' => '',
                'phone' => '',
                'email' => '',
                'country' => '',
                'city' => '',
                'address' => '',
                'postCode' => ''
            ],
            'experiences' => [],
            'education' => [],
            'skills' => [],
            'summary' => '',
            'languages' => [],
            'certifications' => [],
            'awards' => [],
            'websites' => [],
            'references' => [],
            'hobbies' => []
        ];
        
        // Clean and normalize text
        $text = $this->cleanText($text);
        $lines = explode("\n", $text);
        
        // Extract contact information
        $data['contact'] = $this->extractContactInfo($text);
        
        // Extract work experience
        $data['experiences'] = $this->extractWorkExperience($text);
        
        // Extract education
        $data['education'] = $this->extractEducation($text);
        
        // Extract skills
        $data['skills'] = $this->extractSkills($text);
        
        // Extract summary/objective
        $data['summary'] = $this->extractSummary($text);
        
        // Extract additional sections
        $data['languages'] = $this->extractLanguages($text);
        $data['certifications'] = $this->extractCertifications($text);
        $data['awards'] = $this->extractAwards($text);
        $data['websites'] = $this->extractWebsites($text);
        $data['references'] = $this->extractReferences($text);
        $data['hobbies'] = $this->extractHobbies($text);

        // Prefer AI-structured parse if available; otherwise heuristics only
        $llmData = $this->tryLlmParse($text, $data);
        if (!empty($llmData)) {
            // Merge both ways: prefer AI fields, backfill from heuristics
            $data = $this->mergePreferAi($data, $llmData);
        } elseif ($this->shouldUseLlmFallback($data)) {
            // Already tried above; this branch kept for clarity
        }

        // Drop hallucinated/unsupported info and deep-clean strings
        $data = $this->applyEvidenceFilter($data, $text);
        $data = $this->deepCleanStrings($data);

        return $data;
    }
    
    /**
     * Clean and normalize text
     */
    private function cleanText(string $text): string
    {
        // Normalize line endings and preserve structure
        $text = str_replace(["\r\n", "\r"], "\n", $text);
        // Trim trailing spaces at end of lines
        $text = preg_replace('/[ \t]+\n/', "\n", $text);
        // Collapse multiple blank lines to a maximum of two
        $text = preg_replace('/\n{3,}/', "\n\n", $text);
        // Collapse multiple spaces/tabs within lines but keep newlines intact
        $text = preg_replace('/[ \t]{2,}/', ' ', $text);
        return trim($text);
    }
    
    /**
     * Extract contact information
     */
    private function extractContactInfo(string $text): array
    {
        $contact = [
            'firstName' => '',
            'lastName' => '',
            'desiredJobTitle' => '',
            'phone' => '',
            'email' => '',
            'country' => '',
            'city' => '',
            'address' => '',
            'postCode' => ''
        ];
        
        // Extract email
        if (preg_match('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', $text, $matches)) {
            $contact['email'] = $matches[0];
        }
        
        // Extract phone number (intl-friendly)
        if (preg_match('/\+?\d[\d\s().-]{7,}\d/', $text, $matches)) {
            $contact['phone'] = trim($matches[0]);
        }
        
        // Extract name from first few lines (common pattern)
        $lines = explode("\n", $text);
        $firstLine = trim($lines[0] ?? '');
        
        // Look for name in first few lines
        for ($i = 0; $i < min(3, count($lines)); $i++) {
            $line = trim($lines[$i]);
            if ($this->isLikelyName($line)) {
                $nameParts = explode(' ', $line);
                $contact['firstName'] = $nameParts[0] ?? '';
                $contact['lastName'] = implode(' ', array_slice($nameParts, 1));
                break;
            }
        }
        
        // Extract address components
        $this->extractAddressInfo($text, $contact);
        
        return $contact;
    }
    
    /**
     * Check if a line is likely to be a person's name
     */
    private function isLikelyName(string $line): bool
    {
        // Basic heuristics for name detection
        if (strlen($line) < 2 || strlen($line) > 50) return false;
        if (preg_match('/[0-9@]/', $line)) return false;
        if (preg_match('/^[A-Z][a-z]+\s+[A-Z][a-z]+/', $line)) return true;
        
        return false;
    }
    
    /**
     * Extract address information
     */
    private function extractAddressInfo(string $text, array &$contact): void
    {
        // Look for postal codes
        if (preg_match('/\b\d{5}(-\d{4})?\b/', $text, $matches)) {
            $contact['postCode'] = $matches[0];
        }
        
        // Look for common city patterns
        if (preg_match('/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2})\s*\d{5}/', $text, $matches)) {
            $contact['city'] = $matches[1];
        }
    }
    
    /**
     * Extract work experience
     */
    private function extractWorkExperience(string $text): array
    {
        $experiences = [];
        
        // Look for experience section
        $experienceSection = $this->extractSection($text, [
            'experience', 'work experience', 'employment', 'professional experience', 
            'work history', 'career'
        ]);
        
        if (!$experienceSection) return $experiences;
        
        // Parse individual experience entries
        $entries = $this->parseExperienceEntries($experienceSection);
        
        foreach ($entries as $index => $entry) {
            $experiences[] = [
                'id' => $index + 1,
                'jobTitle' => $entry['title'] ?? '',
                'company' => $entry['company'] ?? '',
                'location' => $entry['location'] ?? '',
                'startDate' => $entry['startDate'] ?? '',
                'endDate' => $entry['endDate'] ?? '',
                'description' => $entry['description'] ?? ''
            ];
        }
        
        return $experiences;
    }
    
    /**
     * Extract education information
     */
    private function extractEducation(string $text): array
    {
        $education = [];
        
        // Look for education section
        $educationSection = $this->extractSection($text, [
            'education', 'academic background', 'qualifications', 'degrees'
        ]);
        
        if (!$educationSection) return $education;
        
        // Parse individual education entries
        $entries = $this->parseEducationEntries($educationSection);
        
        foreach ($entries as $index => $entry) {
            $education[] = [
                'id' => $index + 1,
                'school' => $entry['school'] ?? '',
                'location' => $entry['location'] ?? '',
                'degree' => $entry['degree'] ?? '',
                'startDate' => $entry['startDate'] ?? '',
                'endDate' => $entry['endDate'] ?? '',
                'description' => $entry['description'] ?? ''
            ];
        }
        
        return $education;
    }
    
    /**
     * Extract skills
     */
    private function extractSkills(string $text): array
    {
        $skills = [];
        
        // Look for skills section
        $skillsSection = $this->extractSection($text, [
            'skills', 'technical skills', 'core competencies', 'expertise', 
            'technologies', 'proficiencies'
        ]);
        
        if (!$skillsSection) return $skills;
        
        // Parse skills
        $skillList = $this->parseSkillsList($skillsSection);
        
        foreach ($skillList as $index => $skill) {
            $skills[] = [
                'id' => $index + 1,
                'name' => trim($skill),
                'level' => '' // Default level
            ];
        }
        
        return $skills;
    }
    
    /**
     * Extract summary/objective
     */
    private function extractSummary(string $text): string
    {
        $summarySection = $this->extractSection($text, [
            'summary', 'profile', 'objective', 'about', 'overview', 
            'professional summary', 'career objective'
        ]);
        if ($summarySection) {
            return trim($summarySection);
        }

        // Fallback: detect an unlabeled opening paragraph that looks like a summary
        return $this->extractUnlabeledSummaryFromText($text);
    }

    /**
     * Try to extract a summary paragraph from unlabeled resume text (first narrative block)
     */
    private function extractUnlabeledSummaryFromText(string $text): string
    {
        $paragraphs = $this->splitIntoParagraphs($text);
        foreach ($paragraphs as $p) {
            $pTrim = trim($p);
            if ($pTrim === '') continue;
            // Skip contact-like lines
            if (preg_match('/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i', $pTrim)) continue;
            if (preg_match('/\+?\d[\d\s().-]{7,}\d/', $pTrim)) continue;
            if (stripos($pTrim, 'linkedin.com') !== false || stripos($pTrim, 'github.com') !== false) continue;
            // Skip if it looks like a heading or list
            if (preg_match('/^(education|experience|work experience|skills|projects|certifications|awards|languages|references)\b/i', $pTrim)) continue;
            if (preg_match('/^[•\-\*\x{2022}]/u', $pTrim)) continue;
            $len = mb_strlen($pTrim);
            if ($len >= 80 && $len <= 900) {
                // Looks like a narrative sentence/paragraph
                return $pTrim;
            }
        }
        return '';
    }

    private function splitIntoParagraphs(string $text): array
    {
        $text = str_replace(["\r\n", "\r"], "\n", $text);
        // Split by blank lines while keeping moderate length lines joined
        $parts = preg_split('/\n{2,}/', $text) ?: [];
        // Further combine short line sequences into one paragraph
        $paragraphs = [];
        foreach ($parts as $part) {
            $lines = array_values(array_filter(array_map('trim', explode("\n", $part))));
            if (empty($lines)) continue;
            // join lines with space unless they end with punctuation
            $buf = '';
            foreach ($lines as $ln) {
                $buf .= (preg_match('/[\.!?]$/', $buf) ? ' ' : ' ') . $ln;
            }
            $paragraphs[] = trim($buf);
        }
        return $paragraphs;
    }

    private function findBestMatchingParagraph(string $text, string $candidate): ?string
    {
        $paragraphs = $this->splitIntoParagraphs($text);
        $candTokens = array_values(array_filter(preg_split('/\W+/u', mb_strtolower($candidate))));
        if (empty($candTokens)) return null;
        $candSet = array_unique($candTokens);
        $best = null;
        $bestScore = 0.0;
        foreach ($paragraphs as $p) {
            $pTokens = array_values(array_filter(preg_split('/\W+/u', mb_strtolower($p))));
            if (empty($pTokens)) continue;
            $pSet = array_unique($pTokens);
            $inter = count(array_intersect($candSet, $pSet));
            $union = max(1, count(array_unique(array_merge($candSet, $pSet))));
            $jaccard = $inter / $union;
            if ($jaccard > $bestScore) {
                $bestScore = $jaccard;
                $best = $p;
            }
        }
        return $bestScore >= 0.6 ? $best : null;
    }
    
    /**
     * Extract languages
     */
    private function extractLanguages(string $text): array
    {
        $languages = [];
        
        $languageSection = $this->extractSection($text, [
            'languages', 'language skills', 'linguistic skills'
        ]);
        
        if (!$languageSection) return $languages;
        
        // Parse languages
        $languageList = $this->parseLanguagesList($languageSection);
        
        foreach ($languageList as $index => $language) {
            $languages[] = [
                'id' => $index + 1,
                'name' => $language['name'],
                'proficiency' => $language['proficiency'] ?? ''
            ];
        }
        
        return $languages;
    }
    
    /**
     * Extract certifications
     */
    private function extractCertifications(string $text): array
    {
        $certifications = [];
        
        $certSection = $this->extractSection($text, [
            'certifications', 'certificates', 'professional certifications', 
            'licenses', 'credentials'
        ]);
        
        if (!$certSection) return $certifications;
        
        $certList = $this->parseCertificationsList($certSection);
        
        foreach ($certList as $index => $cert) {
            $certifications[] = [
                'id' => $index + 1,
                'title' => trim($cert)
            ];
        }
        
        return $certifications;
    }
    
    /**
     * Extract awards
     */
    private function extractAwards(string $text): array
    {
        $awards = [];
        
        $awardSection = $this->extractSection($text, [
            'awards', 'achievements', 'honors', 'recognition', 'accolades'
        ]);
        
        if (!$awardSection) return $awards;
        
        $awardList = $this->parseAwardsList($awardSection);
        
        foreach ($awardList as $index => $award) {
            $awards[] = [
                'id' => $index + 1,
                'title' => trim($award)
            ];
        }
        
        return $awards;
    }
    
    /**
     * Extract websites/social links
     */
    private function extractWebsites(string $text): array
    {
        $websites = [];
        
        // Look for URLs
        if (preg_match_all('/https?:\/\/[^\s]+/', $text, $matches)) {
            foreach ($matches[0] as $index => $url) {
                $label = $this->identifyWebsiteType($url);
                $websites[] = [
                    'id' => $index + 1,
                    'label' => $label,
                    'url' => $url
                ];
            }
        }
        
        // Look for LinkedIn profile
        if (preg_match('/linkedin\.com\/in\/[^\s]+/', $text, $matches)) {
            $websites[] = [
                'id' => count($websites) + 1,
                'label' => 'LinkedIn',
                'url' => 'https://' . $matches[0]
            ];
        }
        
        return $websites;
    }

    /**
     * Extract references
     */
    private function extractReferences(string $text): array
    {
        $references = [];
        $refSection = $this->extractSection($text, [
            'references', 'referees', 'professional references'
        ]);
        if (!$refSection) return $references;

        $lines = array_values(array_filter(array_map('trim', explode("\n", $refSection))));
        $buffer = [];
        foreach ($lines as $line) {
            if (empty($buffer)) {
                $buffer = ['name' => $line, 'relationship' => '', 'contactInfo' => ''];
            } else {
                if (stripos($line, '@') !== false || preg_match('/\+?\d[\d\s().-]{7,}\d/', $line) || stripos($line, 'linkedin') !== false) {
                    $buffer['contactInfo'] = trim($buffer['contactInfo'] . ' ' . $line);
                } else {
                    $buffer['relationship'] = trim($buffer['relationship'] . ' ' . $line);
                }
            }
            // Heuristic: blank line handled by trim/filter; commit on next probable name
        }
        if (!empty($buffer)) {
            $references[] = ['id' => 1, 'name' => $buffer['name'], 'relationship' => $buffer['relationship'], 'contactInfo' => $buffer['contactInfo']];
        }
        // Split multiple references if separated by semicolons or bullets
        if (count($references) === 0) {
            $parts = preg_split('/[•\x{2022};]+\s*/u', $refSection);
            $id = 1;
            foreach ($parts as $part) {
                $p = trim($part);
                if (strlen($p) < 3) continue;
                $references[] = ['id' => $id++, 'name' => $p, 'relationship' => '', 'contactInfo' => ''];
            }
        }
        return $references;
    }

    /**
     * Extract hobbies/interests
     */
    private function extractHobbies(string $text): array
    {
        $hobbies = [];
        $hobSection = $this->extractSection($text, [
            'hobbies', 'interests'
        ]);
        if (!$hobSection) return $hobbies;
        $items = preg_split('/[,•\n\|;]/', $hobSection);
        foreach ($items as $idx => $item) {
            $val = trim($item);
            if ($val !== '' && strlen($val) > 1) {
                $hobbies[] = $val;
            }
        }
        return $hobbies;
    }
    
    // Helper methods for parsing specific sections
    
    /**
     * Extract a specific section from text
     */
    private function extractSection(string $text, array $sectionNames): ?string
    {
        // Find all heading-like lines and index them
        if (!preg_match_all('/(^|\n)\s*([A-Za-z][A-Za-z&\/\-\s]{2,60})\s*:?[ \t]*?(\n|$)/u', $text, $matches, PREG_OFFSET_CAPTURE)) {
            return null;
        }

        $allNames = array_unique(array_map('strtolower', array_merge($this->knownSectionHeadings, $sectionNames)));
        $targetNames = array_map('strtolower', $sectionNames);

        $headings = [];
        for ($i = 0; $i < count($matches[2]); $i++) {
            $label = strtolower(trim($matches[2][$i][0]));
            if (in_array($label, $allNames, true)) {
                $headings[] = [
                    'label' => $label,
                    'offset' => $matches[2][$i][1],
                ];
            }
        }

        if (empty($headings)) {
            return null;
        }

        $target = null;
        foreach ($headings as $h) {
            if (in_array($h['label'], $targetNames, true)) {
                $target = $h;
                break;
            }
        }

        if (!$target) {
            return null;
        }

        // Start after the end of the heading line
        $start = strpos($text, "\n", $target['offset']);
        if ($start === false) {
            return null;
        }
        $start += 1;

        // Find next heading after target to bound the section
        $end = strlen($text);
        foreach ($headings as $h) {
            if ($h['offset'] > $target['offset']) {
                $end = $h['offset'];
                break;
            }
        }

        $section = substr($text, $start, max(0, $end - $start));
        return trim($section);
    }
    
    /**
     * Parse experience entries
     */
    private function parseExperienceEntries(string $text): array
    {
        $entries = [];
        
        // Split by job entries (basic heuristic)
        $lines = explode("\n", $text);
        $currentEntry = [];
        
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;
            
            // Check if this looks like a job title or company
            if ($this->isLikelyJobTitle($line)) {
                if (!empty($currentEntry)) {
                    $entries[] = $currentEntry;
                }
                $currentEntry = ['title' => $line];
            } elseif (isset($currentEntry['title']) && !isset($currentEntry['company'])) {
                $currentEntry['company'] = $line;
            } elseif (isset($currentEntry['company']) && $this->isLikelyDate($line)) {
                $dates = $this->parseDateRange($line);
                $currentEntry['startDate'] = $dates['start'];
                $currentEntry['endDate'] = $dates['end'];
            } else {
                $currentEntry['description'] = ($currentEntry['description'] ?? '') . ' ' . $line;
            }
        }
        
        if (!empty($currentEntry)) {
            $entries[] = $currentEntry;
        }
        
        return $entries;
    }
    
    /**
     * Parse education entries
     */
    private function parseEducationEntries(string $text): array
    {
        $entries = [];
        
        // Similar to experience parsing but for education
        $lines = explode("\n", $text);
        $currentEntry = [];
        
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;
            
            if ($this->isLikelyDegree($line)) {
                if (!empty($currentEntry)) {
                    $entries[] = $currentEntry;
                }
                $currentEntry = ['degree' => $line];
            } elseif (isset($currentEntry['degree']) && !isset($currentEntry['school'])) {
                $currentEntry['school'] = $line;
            } elseif (isset($currentEntry['school']) && $this->isLikelyDate($line)) {
                $dates = $this->parseDateRange($line);
                $currentEntry['startDate'] = $dates['start'];
                $currentEntry['endDate'] = $dates['end'];
            }
        }
        
        if (!empty($currentEntry)) {
            $entries[] = $currentEntry;
        }
        
        return $entries;
    }
    
    /**
     * Parse skills list
     */
    private function parseSkillsList(string $text): array
    {
        // Split by common delimiters
        $skills = preg_split('/[,•·\n\|;]/', $text);
        
        return array_filter(array_map('trim', $skills), function($skill) {
            return !empty($skill) && strlen($skill) > 2;
        });
    }
    
    /**
     * Parse languages list
     */
    private function parseLanguagesList(string $text): array
    {
        $languages = [];
        $lines = explode("\n", $text);
        
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;
            
            // Look for pattern like "English (Native)" or "Spanish - Fluent"
            if (preg_match('/([^(\-]+)[\(\-]\s*([^)\-]+)/', $line, $matches)) {
                $languages[] = [
                    'name' => trim($matches[1]),
                    'proficiency' => trim($matches[2])
                ];
            } else {
                $languages[] = ['name' => $line, 'proficiency' => ''];
            }
        }
        
        return $languages;
    }
    
    /**
     * Parse certifications list
     */
    private function parseCertificationsList(string $text): array
    {
        return array_filter(explode("\n", $text), function($cert) {
            return !empty(trim($cert));
        });
    }
    
    /**
     * Parse awards list
     */
    private function parseAwardsList(string $text): array
    {
        return array_filter(explode("\n", $text), function($award) {
            return !empty(trim($award));
        });
    }
    
    // Helper utility methods
    
    private function isLikelyJobTitle(string $line): bool
    {
        // Basic heuristics for job titles
        return preg_match('/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/', $line) && 
               !$this->isLikelyDate($line);
    }
    
    private function isLikelyDegree(string $line): bool
    {
        $degreeKeywords = ['bachelor', 'master', 'phd', 'mba', 'bs', 'ba', 'ms', 'ma', 'degree'];
        $line = strtolower($line);
        
        foreach ($degreeKeywords as $keyword) {
            if (strpos($line, $keyword) !== false) {
                return true;
            }
        }
        
        return false;
    }
    
    private function isLikelyDate(string $line): bool
    {
        return preg_match('/\d{4}|\d{1,2}\/\d{4}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i', $line);
    }
    
    private function parseDateRange(string $dateString): array
    {
        $dates = ['start' => '', 'end' => ''];
        
        // Look for date patterns
        if (preg_match('/(\d{1,2}\/\d{4}|\w+\s+\d{4}|\d{4})\s*[-–]\s*(\d{1,2}\/\d{4}|\w+\s+\d{4}|\d{4}|present|current)/i', $dateString, $matches)) {
            $dates['start'] = $matches[1];
            $dates['end'] = strtolower($matches[2]) === 'present' || strtolower($matches[2]) === 'current' ? '' : $matches[2];
        }
        
        return $dates;
    }
    
    private function identifyWebsiteType(string $url): string
    {
        if (strpos($url, 'linkedin.com') !== false) return 'LinkedIn';
        if (strpos($url, 'github.com') !== false) return 'GitHub';
        if (strpos($url, 'twitter.com') !== false) return 'Twitter';
        if (strpos($url, 'instagram.com') !== false) return 'Instagram';
        
        return 'Website';
    }

    /**
     * Normalize to valid UTF-8 and strip invalid bytes/control chars
     */
    private function sanitizeUtf8(string $text): string
    {
        // Attempt conversion keeping best effort
        $converted = @iconv('UTF-8', 'UTF-8//IGNORE', $text);
        if ($converted === false) {
            $converted = @mb_convert_encoding($text, 'UTF-8', 'auto');
        }
        if (!is_string($converted)) {
            $converted = $text;
        }
        // Remove non-printable control characters except tab/newline
        $converted = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $converted);
        return $converted ?? '';
    }

    // ---------- LLM fallback helpers ----------

    private function shouldUseLlmFallback(array $data): bool
    {
        $score = 0;
        if (!empty($data['contact']['email']) || !empty($data['contact']['phone'])) $score++;
        if (!empty($data['experiences'])) $score++;
        if (!empty($data['education'])) $score++;
        if (!empty($data['skills'])) $score++;
        if (!empty($data['summary'])) $score++;
        return $score <= 2; // Weak coverage
    }

    private function tryLlmParse(string $cleanText, array $heuristics = []): array
    {
        if (!$this->gemini) {
            return [];
        }
        // Deep scanning: process the full text in chunks with overlap and merge
                    $chunks = $this->chunkText($cleanText, config('resume.parsing.ai_parsing.chunk_size', 10000), config('resume.parsing.ai_parsing.overlap', 800));
        $accumulated = [];

        try {
            $model = config('services.gemini.parser_model', 'gemini-2.5-flash');
            $schema = '{contact:{firstName,lastName,desiredJobTitle,phone,email,country,city,address,postCode},experiences:[{jobTitle,company,location,startDate,endDate,description}],education:[{school,location,degree,startDate,endDate,description}],skills:[{name,level}],summary,languages:[{name,proficiency}],certifications:[{title}],awards:[{title}],websites:[{label,url}],references:[{name,relationship,contactInfo}],hobbies:[string]}';

            // Build heuristics hint once
            $heuristicsHint = [];
            if (!empty($heuristics)) {
                $heuristicsHint = [
                    'contact' => $heuristics['contact'] ?? new \stdClass(),
                    'experiences' => $heuristics['experiences'] ?? [],
                    'education' => $heuristics['education'] ?? [],
                    'skills' => $heuristics['skills'] ?? [],
                    'summary' => $heuristics['summary'] ?? '',
                    'languages' => $heuristics['languages'] ?? [],
                    'certifications' => $heuristics['certifications'] ?? [],
                    'awards' => $heuristics['awards'] ?? [],
                    'websites' => $heuristics['websites'] ?? [],
                    'references' => $heuristics['references'] ?? [],
                    'hobbies' => $heuristics['hobbies'] ?? []
                ];
            }

            foreach ($chunks as $idx => $chunk) {
                $prompt = "You are a strict resume-to-JSON converter.\n\nChunked extraction rules:\n- You may receive only a PART of the resume text. Extract ONLY what is present in this chunk.\n- Output ONLY minified JSON, no prose, no code fences.\n- Conform exactly to this schema: $schema\n- Do not invent data. If a field is unknown, use an empty string or omit that list item field.\n- Dates: keep the original text format (e.g. 'Jan 2020', '2021', '03/2019').\n- If you see an unlabeled profile paragraph (long sentence describing the person), place it in 'summary'.\n- Do NOT place organizations/memberships under skills.\n\nHeuristic hints (may be incomplete or wrong; correct them):\n" . json_encode($heuristicsHint, JSON_UNESCAPED_UNICODE) . "\n\nResume text (chunk " . ($idx+1) . "/" . count($chunks) . "):\n\n" . $chunk;

                $response = $this->gemini->generateText($prompt, $model, [
                    'response_mime_type' => 'application/json',
                                'maxOutputTokens' => config('resume.parsing.ai_parsing.max_output_tokens', 2048),
            'temperature' => config('resume.parsing.ai_parsing.temperature', 0.1),
                    'topP' => config('resume.parsing.ai_parsing.top_p', 0.1),
                ]);
                if (!is_array($response)) continue;
                $jsonText = $this->extractJsonFromGeminiResponse($response);
                if (!$jsonText) continue;
                $decoded = json_decode($jsonText, true);
                if (!is_array($decoded)) continue;
                $normalized = $this->normalizeAiSchema($decoded);
                $accumulated = empty($accumulated) ? $normalized : $this->mergeAndDedupe($accumulated, $normalized);
            }

            return $accumulated;
        } catch (\Exception $e) {
            Log::warning('LLM resume parsing failed: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Split text into overlapping chunks for deeper scanning
     */
    private function chunkText(string $text, int $chunkSize, int $overlap): array
    {
        $len = mb_strlen($text);
        if ($len <= $chunkSize) return [$text];
        $chunks = [];
        $start = 0;
        while ($start < $len) {
            $end = min($len, $start + $chunkSize);
            $chunk = mb_substr($text, $start, $end - $start);
            $chunks[] = $chunk;
            if ($end === $len) break;
            $start = max(0, $end - $overlap);
            if (count($chunks) >= 5) break; // safety cap to avoid excessive API calls
        }
        return $chunks;
    }

    /**
     * Merge two AI-parsed data arrays with basic de-duplication logic
     */
    private function mergeAndDedupe(array $base, array $add): array
    {
        $merged = $this->mergePreferAi($base, $add);
        // Deduplicate by keys
        $dedupeList = function(array $items, callable $keyFn) {
            $seen = [];
            $out = [];
            foreach ($items as $item) {
                $key = $keyFn($item);
                if ($key === '') continue;
                if (isset($seen[$key])) continue;
                $seen[$key] = true;
                $out[] = $item;
            }
            // Reindex ids
            foreach ($out as $i => &$it) { if (is_array($it)) { $it['id'] = $i + 1; } }
            return $out;
        };

        if (!empty($merged['experiences'])) {
            $merged['experiences'] = $dedupeList($merged['experiences'], function($e) {
                $title = strtolower(trim($e['jobTitle'] ?? ''));
                $company = strtolower(trim($e['company'] ?? ''));
                return $title . '|' . $company;
            });
        }
        if (!empty($merged['education'])) {
            $merged['education'] = $dedupeList($merged['education'], function($e) {
                $school = strtolower(trim($e['school'] ?? ''));
                $degree = strtolower(trim($e['degree'] ?? ''));
                return $school . '|' . $degree;
            });
        }
        if (!empty($merged['skills'])) {
            $merged['skills'] = $dedupeList($merged['skills'], function($s) {
                $name = is_array($s) ? ($s['name'] ?? '') : (string)$s;
                return strtolower(trim($name));
            });
        }
        if (!empty($merged['websites'])) {
            $merged['websites'] = $dedupeList($merged['websites'], function($w) {
                return strtolower(trim($w['url'] ?? ''));
            });
        }
        return $merged;
    }

    private function extractJsonFromGeminiResponse(array $resp): ?string
    {
        // Gemini typical path
        $text = $resp['candidates'][0]['content']['parts'][0]['text'] ?? null;
        if (!$text) return null;
        // Strip code fences if present
        $text = preg_replace('/^```(?:json)?/i', '', trim($text));
        $text = preg_replace('/```$/', '', trim($text));
        // Extract JSON object
        if (preg_match('/\{[\s\S]*\}/', $text, $m)) {
            return $m[0];
        }
        return null;
    }

    private function mergeParsedData(array $base, array $ai): array
    {
        $merged = $base;
        // Simple deep merge preferring existing non-empty values
        $merged['contact'] = array_replace($ai['contact'] ?? [], $merged['contact']);
        foreach (['experiences','education','skills','languages','certifications','awards','websites','references','hobbies'] as $listKey) {
            if (empty($merged[$listKey]) && !empty($ai[$listKey]) && is_array($ai[$listKey])) {
                // Normalize items to expected shape with ids
                $items = [];
                foreach ($ai[$listKey] as $idx => $item) {
                    if (is_string($item)) {
                        $items[] = ['id' => $idx + 1, 'name' => $item];
                    } elseif (is_array($item)) {
                        $item['id'] = $idx + 1;
                        $items[] = $item;
                    }
                }
                $merged[$listKey] = $items;
            }
        }
        if (empty($merged['summary']) && !empty($ai['summary'])) {
            $merged['summary'] = $ai['summary'];
        }
        return $merged;
    }

    private function mergePreferAi(array $heuristic, array $ai): array
    {
        $merged = $heuristic;
        // Prefer AI values when present
        if (!empty($ai['contact'])) {
            $merged['contact'] = array_replace($heuristic['contact'] ?? [], $ai['contact']);
        }
        foreach (['experiences','education','skills','languages','certifications','awards','websites','references','hobbies'] as $key) {
            if (!empty($ai[$key])) {
                // Reindex ids if missing
                $items = [];
                foreach ($ai[$key] as $i => $item) {
                    if (is_array($item)) {
                        $item['id'] = $item['id'] ?? ($i + 1);
                        $items[] = $item;
                    } else {
                        $items[] = ['id' => $i + 1, 'name' => (string)$item];
                    }
                }
                $merged[$key] = $items;
            }
        }
        if (!empty($ai['summary'])) {
            $merged['summary'] = $ai['summary'];
        }
        return $merged;
    }

    /**
     * Normalize AI output to expected schema and types
     */
    private function normalizeAiSchema(array $ai): array
    {
        // Map alternative top-level keys
        $aliases = [
            'experiences' => ['work_experience','workExperience','experience'],
            'education' => ['educations','education_history','academic','academics'],
            'skills' => ['skill','competencies','technical_skills'],
            'languages' => ['language','language_skills'],
            'certifications' => ['certs','licenses','certificates'],
            'awards' => ['achievements','honors','recognition'],
            'websites' => ['links','social','profiles'],
            'references' => ['referees','refs'],
            'hobbies' => ['interests'],
            'contact' => ['contacts','personal_information','personalInfo']
        ];

        foreach ($aliases as $canonical => $alts) {
            if (!array_key_exists($canonical, $ai)) {
                foreach ($alts as $alt) {
                    if (array_key_exists($alt, $ai)) {
                        $ai[$canonical] = $ai[$alt];
                        break;
                    }
                }
            }
        }

        $ai['contact'] = is_array($ai['contact'] ?? null) ? $ai['contact'] : [];
        $ai['contact'] = array_intersect_key($ai['contact'], array_flip(['firstName','lastName','desiredJobTitle','phone','email','country','city','address','postCode'])) + [
            'firstName' => $ai['contact']['firstName'] ?? '',
            'lastName' => $ai['contact']['lastName'] ?? '',
            'desiredJobTitle' => $ai['contact']['desiredJobTitle'] ?? '',
            'phone' => $ai['contact']['phone'] ?? '',
            'email' => $ai['contact']['email'] ?? '',
            'country' => $ai['contact']['country'] ?? '',
            'city' => $ai['contact']['city'] ?? '',
            'address' => $ai['contact']['address'] ?? '',
            'postCode' => $ai['contact']['postCode'] ?? ''
        ];

        // Normalize list-like sections
        $normalizeList = function($items, $type) {
            $out = [];
            if (!is_array($items)) return $out;
            $i = 1;
            foreach ($items as $item) {
                if ($type === 'experiences') {
                    $entry = is_array($item) ? $item : [];
                    // Common key aliases
                    if (!isset($entry['jobTitle']) && isset($entry['title'])) $entry['jobTitle'] = $entry['title'];
                    if (!isset($entry['company']) && isset($entry['companyName'])) $entry['company'] = $entry['companyName'];
                    if (empty($entry['location']) && !empty($entry['city'])) $entry['location'] = $entry['city'];
                    $out[] = [
                        'id' => $i++,
                        'jobTitle' => (string)($entry['jobTitle'] ?? ''),
                        'company' => (string)($entry['company'] ?? ''),
                        'location' => (string)($entry['location'] ?? ''),
                        'startDate' => (string)($entry['startDate'] ?? ''),
                        'endDate' => (string)($entry['endDate'] ?? ''),
                        'description' => trim((string)($entry['description'] ?? ''))
                    ];
                } elseif ($type === 'education') {
                    $entry = is_array($item) ? $item : [];
                    $out[] = [
                        'id' => $i++,
                        'school' => (string)($entry['school'] ?? ''),
                        'location' => (string)($entry['location'] ?? ''),
                        'degree' => (string)($entry['degree'] ?? ''),
                        'startDate' => (string)($entry['startDate'] ?? ''),
                        'endDate' => (string)($entry['endDate'] ?? ''),
                        'description' => trim((string)($entry['description'] ?? ''))
                    ];
                } elseif ($type === 'skills') {
                    if (is_string($item)) {
                        $out[] = ['id' => $i++, 'name' => trim($item), 'level' => ''];
                    } else {
                        $out[] = ['id' => $i++, 'name' => trim((string)($item['name'] ?? '')), 'level' => (string)($item['level'] ?? '')];
                    }
                } elseif ($type === 'languages') {
                    $entry = is_array($item) ? $item : ['name' => (string)$item];
                    $out[] = ['id' => $i++, 'name' => (string)($entry['name'] ?? ''), 'proficiency' => (string)($entry['proficiency'] ?? '')];
                } elseif (in_array($type, ['certifications','awards'])) {
                    if (is_string($item)) {
                        $out[] = ['id' => $i++, 'title' => trim($item)];
                    } else {
                        $out[] = ['id' => $i++, 'title' => (string)($item['title'] ?? '')];
                    }
                } elseif ($type === 'websites') {
                    if (is_string($item)) {
                        $out[] = ['id' => $i++, 'label' => $this->identifyWebsiteType($item), 'url' => (string)$item];
                    } else {
                        $url = (string)($item['url'] ?? '');
                        $label = (string)($item['label'] ?? '') ?: $this->identifyWebsiteType($url);
                        $out[] = ['id' => $i++, 'label' => $label, 'url' => $url];
                    }
                } elseif ($type === 'references') {
                    $entry = is_array($item) ? $item : ['name' => (string)$item];
                    $out[] = [
                        'id' => $i++,
                        'name' => (string)($entry['name'] ?? ''),
                        'relationship' => (string)($entry['relationship'] ?? ''),
                        'contactInfo' => (string)($entry['contactInfo'] ?? '')
                    ];
                } elseif ($type === 'hobbies') {
                    $val = is_string($item) ? $item : (string)($item['name'] ?? '');
                    $val = trim($val);
                    if ($val !== '') $out[] = $val; // hobbies expected as list of strings
                }
            }
            return $out;
        };

        foreach (['experiences','education','skills','languages','certifications','awards','websites','references','hobbies'] as $section) {
            $ai[$section] = $normalizeList($ai[$section] ?? [], $section);
        }

        $ai['summary'] = is_string($ai['summary'] ?? null) ? $this->cleanString(trim($ai['summary'])) : '';

        // Reclassify likely misfiled organization/membership entries from skills (drop them instead of reassigning)
        $ai = $this->reclassifyMisplacedItems($ai);

        return $ai;
    }

    /**
     * Reclassify items that look like organizations/memberships out of skills into a custom section
     */
    private function reclassifyMisplacedItems(array $ai): array
    {
        $keywords = ['member', 'membership', 'organization', 'society', 'association', 'chapter', 'club', 'icpep', 'ieee', 'student', 'edition'];
        $datePattern = '/\b(19|20)\d{2}\b|present|current|\d{1,2}\/\d{4}/i';
        $remainingSkills = [];
        foreach ($ai['skills'] ?? [] as $skill) {
            $name = is_array($skill) ? ($skill['name'] ?? '') : (string)$skill;
            $nameL = strtolower($name);
            $isOrgLike = preg_match($datePattern, $name) || array_reduce($keywords, function($carry, $kw) use ($nameL) { return $carry || strpos($nameL, $kw) !== false; }, false);
            if ($isOrgLike) {
                // drop org-like items from skills
            } else {
                $remainingSkills[] = $skill;
            }
        }
        $ai['skills'] = $remainingSkills;
        return $ai;
    }

    /**
     * Strip bullets, leading list markers and emojis; compress whitespace
     */
    private function cleanString(string $value): string
    {
        // Remove leading bullet/list markers
        $value = preg_replace('/^([\x{2022}\x{25CF}\x{25A0}\x{25E6}\x{2023}\x{25AB}\-\*]+)\s*/u', '', $value);
        // Remove bullet-like characters anywhere
        $value = preg_replace('/[\x{2022}\x{25CF}\x{25A0}\x{25E6}\x{2023}\x{25AB}\x{2219}\x{00B7}•●▪▫◦‣■□·]/u', '', $value);
        // Remove emojis and pictographs
        $value = preg_replace('/[\x{1F300}-\x{1FAFF}\x{1F1E6}-\x{1F1FF}\x{2600}-\x{27BF}]/u', '', $value);
        // Remove dangling punctuation that isn't necessary
        $value = preg_replace('/^[,.;:]+\s*/', '', $value);
        $value = preg_replace('/\s*[,.;:]+$/', '', $value);
        // Normalize whitespace
        $value = preg_replace('/\s{2,}/', ' ', trim($value));
        return $value ?? '';
    }

    /**
     * Deep-clean all strings within structured data
     */
    private function deepCleanStrings($value)
    {
        if (is_array($value)) {
            $cleaned = [];
            foreach ($value as $k => $v) {
                $cleaned[$k] = $this->deepCleanStrings($v);
            }
            return $cleaned;
        }
        if (is_string($value)) {
            return $this->cleanString($value);
        }
        return $value;
    }

    /**
     * Keep only items that have evidence in the original text; drop unfamiliar info
     */
    private function applyEvidenceFilter(array $data, string $text): array
    {
        $haystack = mb_strtolower($text);
        $contains = function(?string $needle) use ($haystack): bool {
            $n = mb_strtolower(trim((string)$needle));
            if ($n === '') return false;
            return mb_strpos($haystack, $n) !== false;
        };

        // Contact: keep email/phone as detected by heuristics already; do not accept AI-only overrides here
        // Experiences: must have jobTitle or company present in text
        $filteredExp = [];
        foreach ($data['experiences'] as $exp) {
            $ok = $contains($exp['jobTitle'] ?? '') || $contains($exp['company'] ?? '');
            if ($ok) { $filteredExp[] = $exp; }
        }
        $data['experiences'] = array_values($filteredExp);

        // Education: must have school or degree present
        $filteredEdu = [];
        foreach ($data['education'] as $edu) {
            $ok = $contains($edu['school'] ?? '') || $contains($edu['degree'] ?? '');
            if ($ok) { $filteredEdu[] = $edu; }
        }
        $data['education'] = array_values($filteredEdu);

        // Skills: keep only short alphanumeric-ish tokens found in text
        $filteredSkills = [];
        foreach ($data['skills'] as $sk) {
            $name = is_array($sk) ? ($sk['name'] ?? '') : (string)$sk;
            $name = trim($name);
            if ($name === '') continue;
            $isValidShape = (mb_strlen($name) <= 50) && preg_match('/[A-Za-z]/', $name) && !preg_match('/\b(19|20)\d{2}\b|present|current/i', $name);
            if ($isValidShape && $contains($name)) {
                $filteredSkills[] = is_array($sk) ? $sk : ['id' => count($filteredSkills)+1, 'name' => $name, 'level' => ''];
            }
        }
        $data['skills'] = array_values($filteredSkills);

        // Languages: name must appear in text, or be from a short list of common languages
        $commonLangs = ['english','spanish','french','german','italian','portuguese','mandarin','chinese','japanese','korean','arabic','hindi','russian','filipino','tagalog'];
        $filteredLangs = [];
        foreach ($data['languages'] as $lang) {
            $n = mb_strtolower($lang['name'] ?? '');
            if ($n && ($contains($n) || in_array($n, $commonLangs, true))) {
                $filteredLangs[] = $lang;
            }
        }
        $data['languages'] = array_values($filteredLangs);

        // Certifications/Awards: title must appear in text
        foreach (['certifications','awards'] as $k) {
            $filtered = [];
            foreach ($data[$k] as $item) {
                $title = $item['title'] ?? '';
                if ($contains($title)) { $filtered[] = $item; }
            }
            $data[$k] = array_values($filtered);
        }

        // Websites: valid URL and appears in text
        $filteredSites = [];
        foreach ($data['websites'] as $site) {
            $url = $site['url'] ?? '';
            if (filter_var($url, FILTER_VALIDATE_URL) && $contains($url)) { $filteredSites[] = $site; }
        }
        $data['websites'] = array_values($filteredSites);

        // References/Hobbies: keep only if appear in text
        $filteredRefs = [];
        foreach ($data['references'] as $ref) {
            if ($contains($ref['name'] ?? '')) { $filteredRefs[] = $ref; }
        }
        $data['references'] = array_values($filteredRefs);

        $filteredHobbies = [];
        foreach ($data['hobbies'] as $hob) {
            $val = is_string($hob) ? $hob : ($hob['name'] ?? '');
            if ($contains($val)) { $filteredHobbies[] = $val; }
        }
        $data['hobbies'] = array_values($filteredHobbies);

        // Summary: if empty or not directly matched, try to find a best-matching paragraph
        if (empty($data['summary'])) {
            $fallback = $this->extractUnlabeledSummaryFromText($text);
            if (!empty($fallback)) { $data['summary'] = $fallback; }
        } else {
            if (!$contains($data['summary'])) {
                $match = $this->findBestMatchingParagraph($text, $data['summary']);
                if (!empty($match)) {
                    $data['summary'] = $match;
                } else {
                    $data['summary'] = '';
                }
            }
        }

        return $data;
    }
}
