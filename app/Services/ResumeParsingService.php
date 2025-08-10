<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\Settings;
use Smalot\PdfParser\Parser as PdfParser;

class ResumeParsingService
{
    private $extractedData = [];
    private $rawText = '';
    
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
        
        return $data;
    }
    
    /**
     * Clean and normalize text
     */
    private function cleanText(string $text): string
    {
        // Remove extra whitespace and normalize line breaks
        $text = preg_replace('/\s+/', ' ', $text);
        $text = preg_replace('/\n\s*\n/', "\n\n", $text);
        
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
        
        // Extract phone number
        if (preg_match('/(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/', $text, $matches)) {
            $contact['phone'] = $matches[0];
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
        
        return $summarySection ? trim($summarySection) : '';
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
    
    // Helper methods for parsing specific sections
    
    /**
     * Extract a specific section from text
     */
    private function extractSection(string $text, array $sectionNames): ?string
    {
        $pattern = '/(?:^|\n)\s*(?:' . implode('|', array_map('preg_quote', $sectionNames)) . ')\s*:?\s*\n(.*?)(?=\n\s*(?:[A-Z][A-Z\s]+|$))/is';
        
        if (preg_match($pattern, $text, $matches)) {
            return trim($matches[1]);
        }
        
        return null;
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
        $skills = preg_split('/[,•·\n]/', $text);
        
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
}
