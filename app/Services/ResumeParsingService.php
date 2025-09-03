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
    private $knownSectionHeadings = [];
    private $gemini;
    private $sectionMappings = [];
    private $fieldMappings = [];

    public function __construct(?GeminiService $geminiService)
    {
        $this->gemini = $geminiService;
        
        // Load configuration from config file
        $this->sectionMappings = config('resumeparser.section_mappings', []);
        $this->fieldMappings = config('resumeparser.field_mappings', []);
        $this->knownSectionHeadings = config('resumeparser.known_section_headings', []);
            // Debug logging to see what's being loaded
        Log::info('ResumeParsingService configuration loaded', [
            'sectionMappings_count' => count($this->sectionMappings),
            'fieldMappings_count' => count($this->fieldMappings),
            'knownSectionHeadings_count' => count($this->knownSectionHeadings),
            'knownSectionHeadings_keys' => array_keys($this->knownSectionHeadings)
        ]);
        
        // Safety check: ensure we have fallback values if configuration is empty
        if (empty($this->knownSectionHeadings)) {
            Log::warning('ResumeParsingService: knownSectionHeadings is empty, using fallback values');
            $this->knownSectionHeadings = [
                'contact' => ['contact', 'personal', 'personal information', 'details', 'info', 'profile', 'header'],
                'summary' => [
                    'summary', 'profile', 'objective', 'overview', 'about', 'introduction', 'executive summary',
                    'profile summary', 'resume summary', 'professional summary', 'career summary', 'personal summary',
                    'career objective', 'professional objective', 'personal objective', 'job objective',
                    'career profile', 'professional profile', 'personal profile', 'candidate profile',
                    'career overview', 'professional overview', 'personal overview', 'candidate overview',
                    'about me', 'about myself', 'personal statement', 'professional statement',
                    'career statement', 'mission statement', 'value proposition', 'elevator pitch',
                    'bio', 'biography', 'professional bio', 'personal bio', 'career bio',
                    'background', 'professional background', 'career background', 'personal background',
                    'experience summary', 'work summary', 'employment summary', 'career highlights',
                    'key qualifications', 'core competencies', 'professional highlights', 'career achievements',
                    'summary of qualifications', 'qualifications summary', 'professional qualifications',
                    'career focus', 'professional focus', 'areas of expertise', 'expertise summary'
                ],
                'experience' => ['experience', 'work experience', 'employment', 'professional experience', 'career', 'work history', 'positions'],
                'education' => ['education', 'academic', 'academics', 'qualifications', 'degrees', 'schooling', 'academic background'],
                'skills' => ['skills', 'technical skills', 'competencies', 'expertise', 'capabilities', 'proficiencies'],
                'languages' => ['languages', 'language skills', 'bilingual', 'multilingual'],
                'certifications' => ['certifications', 'certificates', 'credentials', 'accreditations', 'licenses'],
                'awards' => ['awards', 'honors', 'achievements', 'recognition', 'accolades'],
                'projects' => ['projects', 'portfolio', 'work samples', 'case studies'],
                'references' => ['references', 'referees', 'testimonials'],
                'activities' => ['activities', 'involvement', 'extracurricular', 'volunteer', 'community'],
                'interests' => ['interests', 'hobbies', 'personal interests']
            ];
        }
        
        if (empty($this->sectionMappings)) {
            Log::warning('ResumeParsingService: sectionMappings is empty, using fallback values');
            $this->sectionMappings = [
                'contact' => ['aliases' => ['contact', 'personal', 'details'], 'priority' => 1],
                'summary' => [
                    'aliases' => [
                        'summary', 'profile', 'objective', 'overview', 'about', 'introduction', 'executive summary',
                        'profile summary', 'resume summary', 'professional summary', 'career summary', 'personal summary',
                        'career objective', 'professional objective', 'personal objective', 'job objective',
                        'career profile', 'professional profile', 'personal profile', 'candidate profile',
                        'career overview', 'professional overview', 'personal overview', 'candidate overview',
                        'about me', 'about myself', 'personal statement', 'professional statement',
                        'career statement', 'mission statement', 'value proposition', 'elevator pitch',
                        'bio', 'biography', 'professional bio', 'personal bio', 'career bio',
                        'background', 'professional background', 'career background', 'personal background',
                        'experience summary', 'work summary', 'employment summary', 'career highlights',
                        'key qualifications', 'core competencies', 'professional highlights', 'career achievements',
                        'summary of qualifications', 'qualifications summary', 'professional qualifications',
                        'career focus', 'professional focus', 'areas of expertise', 'expertise summary'
                    ], 
                    'priority' => 2
                ],
                'experiences' => ['aliases' => ['experience', 'work experience'], 'priority' => 3],
                'education' => ['aliases' => ['education', 'academic'], 'priority' => 4],
                'skills' => ['aliases' => ['skills', 'competencies'], 'priority' => 5]
            ];
        }
        
        if (empty($this->fieldMappings)) {
            Log::warning('ResumeParsingService: fieldMappings is empty, using fallback values');
            $this->fieldMappings = [
                'experiences' => [
                    'jobTitle' => ['jobTitle', 'title', 'position'],
                    'company' => ['company', 'employer', 'organization']
                ],
                'education' => [
                    'school' => ['school', 'university', 'college'],
                    'degree' => ['degree', 'qualification', 'certificate']
                ],
                'skills' => [
                    'name' => ['name', 'skill', 'technology']
                ]
            ];
        }
        
        // Final validation
        Log::info('ResumeParsingService configuration validation', [
            'final_sectionMappings_count' => count($this->sectionMappings),
            'final_fieldMappings_count' => count($this->fieldMappings),
            'final_knownSectionHeadings_count' => count($this->knownSectionHeadings)
        ]);
    }
    
    /**
     * Parse an uploaded resume file and extract structured data
     */
    public function parseResume(UploadedFile $file): array
    {
        try {
            // Increase execution time limit for multi-page resume processing
            $timeout = config('resume.parsing.ai_parsing.timeout', 120);
            set_time_limit($timeout + 30); // Add 30 seconds buffer
            
            $filePath = $this->storeTemporaryFile($file);
            $parsedData = [];
            $rawText = '';
            $source = 'heuristic'; // Default source
            
            // Check file size and use appropriate strategy
            $fileSize = $file->getSize();
            $isLargeFile = $fileSize > 500000; // 500KB threshold
            
            // For PDF files, check if it's multi-page
            $isMultiPage = false;
            if (strtolower($file->getClientOriginalExtension()) === 'pdf') {
                try {
                    $parser = new PdfParser();
                    $pdf = $parser->parseFile(Storage::disk('local')->path($filePath));
                    $details = $pdf->getDetails();
                    $pageCount = $details['Pages'] ?? 1;
                    $isMultiPage = $pageCount > 1;
                    
                    Log::info('PDF page count detection', [
                        'page_count' => $pageCount,
                        'is_multi_page' => $isMultiPage
                    ]);
                } catch (\Exception $e) {
                    Log::warning('Could not detect PDF page count', ['error' => $e->getMessage()]);
                }
            }
            
            // Use appropriate strategy based on file characteristics
            if ($this->gemini && !$isLargeFile && !$isMultiPage) {
                Log::info('Starting AI parsing with extended timeout', [
                    'timeout' => $timeout,
                    'file_size' => $fileSize,
                    'file_name' => $file->getClientOriginalName()
                ]);
                
                $geminiResult = $this->parseWithGeminiMultimodal($file, $filePath);
                if ($geminiResult['success']) {
                    $parsedData = $geminiResult['data'];
                    $rawText = $geminiResult['raw_text'] ?? '';
                    $source = 'gemini';
                    Log::info('AI parsing completed successfully', [
                        'sections_found' => array_keys($parsedData)
                    ]);
                } else {
                    Log::warning('AI parsing failed, falling back to text extraction', [
                        'error' => $geminiResult['error'] ?? 'Unknown error'
                    ]);
                }
            } elseif ($isLargeFile || $isMultiPage) {
                Log::info('Large multi-page document detected, using text extraction first strategy', [
                    'file_size' => $fileSize,
                    'is_large_file' => $isLargeFile,
                    'is_multi_page' => $isMultiPage
                ]);
            }

            // Fallback to traditional text extraction if Gemini parsing fails or is unavailable
            if (empty($parsedData)) {
                Log::info('AI parsing failed or unavailable, using basic text extraction fallback');
                try {
                    $rawText = $this->extractTextFromFile($filePath, $file->getClientOriginalExtension());
                    $rawText = $this->sanitizeUtf8($rawText);
                    $parsedData = $this->parseTextToStructuredData($rawText);
                    Log::info('Basic text extraction completed', ['sections_found' => array_keys($parsedData)]);
                } catch (\Exception $e) {
                    Log::error('Text extraction failed: ' . $e->getMessage(), [
                        'file_path' => $filePath,
                        'extension' => $file->getClientOriginalExtension()
                    ]);
                    throw $e; // Re-throw to be caught by outer try-catch
                }
            }

                    // A single, unified post-processing and cleanup stage
        $parsedData = $this->organizeDataForTemplate($parsedData);
        
        // Enhanced content validation and filtering
        $parsedData['experiences'] = $this->validateAndFilterExperiences($parsedData['experiences'] ?? []);
        $parsedData['education'] = $this->validateAndFilterEducation($parsedData['education'] ?? []);
        $parsedData['skills'] = $this->validateAndFilterSkills($parsedData['skills'] ?? []);
        
        $parsedData = $this->normalizeDataForStorage($parsedData);
        $confidence = $this->calculateEnhancedParsingConfidence($parsedData);
            
            // Clean up temporary file
            Storage::disk('local')->delete($filePath);
            
            return [
                'success' => true,
                'data' => $parsedData,
                'raw_text' => $rawText,
                'confidence' => $confidence,
                'source' => $source
            ];
            
        } catch (\Exception $e) {
            // Check if it's a timeout error
            $isTimeoutError = strpos($e->getMessage(), 'Maximum execution time') !== false || 
                             strpos($e->getMessage(), 'timeout') !== false ||
                             strpos($e->getMessage(), 'Connection timed out') !== false;
            
            Log::error('Resume parsing failed: ' . $e->getMessage(), [
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'is_timeout_error' => $isTimeoutError,
                'trace' => $e->getTraceAsString()
            ]);
            
            $errorMessage = $e->getMessage();
            $suggestions = ['Resume parsing failed. Please check the file format and try again.'];
            
            if ($isTimeoutError) {
                $errorMessage = 'Resume parsing timed out. The file may be too large or complex. Please try with a smaller file or contact support.';
                $suggestions = [
                    'Try uploading a smaller resume file',
                    'Ensure the resume is not password protected',
                    'Try converting to PDF format if using Word documents',
                    'Contact support if the issue persists'
                ];
            }
            
            return [
                'success' => false,
                'error' => $errorMessage,
                'data' => [],
                'confidence' => [
                    'overall_score' => 0,
                    'sections_found' => [],
                    'missing_sections' => ['Contact', 'Experiences', 'Education', 'Skills', 'Summary'],
                    'suggestions' => $suggestions,
                    'quality_metrics' => [
                        'completeness' => 0,
                        'accuracy' => 0,
                        'structure' => 0
                    ]
                ]
            ];
        } catch (\Error $e) {
            Log::error('Resume parsing error: ' . $e->getMessage(), [
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return [
                'success' => false,
                'error' => 'Resume parsing error: ' . $e->getMessage(),
                'data' => [],
                'confidence' => [
                    'overall_score' => 0,
                    'sections_found' => [],
                    'missing_sections' => ['Contact', 'Experiences', 'Education', 'Skills', 'Summary'],
                    'suggestions' => ['Resume parsing error occurred. Please check the file format and try again.'],
                    'quality_metrics' => [
                        'completeness' => 0,
                        'accuracy' => 0,
                        'structure' => 0
                    ]
                ]
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
     * Extract text from PDF file with enhanced multi-page support
     */
    private function extractFromPdf(string $filePath): string
    {
        try {
            $parser = new PdfParser();
            $pdf = $parser->parseFile($filePath);
            
            // Get detailed information about the PDF
            $details = $pdf->getDetails();
            $pageCount = $details['Pages'] ?? 1;
            
            Log::info('PDF extraction started', [
                'file_path' => $filePath,
                'page_count' => $pageCount,
                'title' => $details['Title'] ?? 'Unknown',
                'author' => $details['Author'] ?? 'Unknown'
            ]);
            
            // Extract text with page awareness
            $fullText = $pdf->getText();
            
            // If we have multiple pages, try to get page-by-page text for better organization
            if ($pageCount > 1) {
                $pages = $pdf->getPages();
                $pageTexts = [];
                
                foreach ($pages as $pageIndex => $page) {
                    $pageText = $page->getText();
                    if (!empty(trim($pageText))) {
                        $pageTexts[] = "=== PAGE " . ($pageIndex + 1) . " ===\n" . $pageText;
                    }
                }
                
                if (!empty($pageTexts)) {
                    $fullText = implode("\n\n", $pageTexts);
                    Log::info('Multi-page PDF extracted with page separation', [
                        'total_pages' => count($pageTexts),
                        'total_text_length' => strlen($fullText)
                    ]);
                }
            }
            
            // Clean up the extracted text
            $fullText = $this->cleanExtractedText($fullText);
            
            Log::info('PDF extraction completed', [
                'text_length' => strlen($fullText),
                'page_count' => $pageCount
            ]);
            
            return $fullText;
            
        } catch (\Exception $e) {
            Log::error('PDF parsing failed: ' . $e->getMessage(), [
                'file_path' => $filePath,
                'trace' => $e->getTraceAsString()
            ]);
            throw new \Exception('Failed to parse PDF file: ' . $e->getMessage());
        }
    }
    
    /**
     * Clean and normalize extracted text for better parsing
     */
    private function cleanExtractedText(string $text): string
    {
        // Remove excessive whitespace and normalize line breaks
        $text = preg_replace('/\s+/', ' ', $text);
        $text = preg_replace('/\n\s*\n/', "\n\n", $text);
        
        // Remove page numbers that might interfere with parsing
        $text = preg_replace('/^\s*\d+\s*$/m', '', $text);
        
        // Clean up common PDF extraction artifacts
        $text = preg_replace('/\f/', "\n", $text); // Form feed to newline
        $text = preg_replace('/\r\n/', "\n", $text); // Windows line endings
        $text = preg_replace('/\r/', "\n", $text); // Mac line endings
        
        // Remove excessive blank lines
        $text = preg_replace('/\n{3,}/', "\n\n", $text);
        
        return trim($text);
    }
    
    /**
     * Extract text from DOCX file with enhanced multi-page support
     */
    private function extractFromDocx(string $filePath): string
    {
        try {
            $phpWord = IOFactory::load($filePath);
            $text = '';
            $pageCount = 0;
            
            Log::info('DOCX extraction started', [
                'file_path' => $filePath
            ]);
            
            foreach ($phpWord->getSections() as $sectionIndex => $section) {
                $sectionText = '';
                
                foreach ($section->getElements() as $element) {
                    if (method_exists($element, 'getText')) {
                        $elementText = $element->getText();
                        if (!empty(trim($elementText))) {
                            $sectionText .= $elementText . "\n";
                        }
                    } elseif (method_exists($element, 'getElements')) {
                        foreach ($element->getElements() as $childElement) {
                            if (method_exists($childElement, 'getText')) {
                                $childText = $childElement->getText();
                                if (!empty(trim($childText))) {
                                    $sectionText .= $childText . "\n";
                                }
                            }
                        }
                    }
                }
                
                if (!empty(trim($sectionText))) {
                    $pageCount++;
                    $text .= "=== SECTION " . $pageCount . " ===\n" . $sectionText . "\n\n";
                }
            }
            
            // Clean up the extracted text
            $text = $this->cleanExtractedText($text);
            
            Log::info('DOCX extraction completed', [
                'text_length' => strlen($text),
                'section_count' => $pageCount
            ]);
            
            return $text;
            
        } catch (\Exception $e) {
            Log::error('DOCX parsing failed: ' . $e->getMessage(), [
                'file_path' => $filePath,
                'trace' => $e->getTraceAsString()
            ]);
            throw new \Exception('Failed to parse DOCX file: ' . $e->getMessage());
        }
    }
    
    /**
     * Extract text from DOC file (fallback method)
     * 
     * Note: This method relies on PhpOffice\PhpWord's compatibility layer to handle
     * older .doc formats by treating them as .docx files. Success depends on the
     * library's ability to parse the specific .doc file format and may fail for:
     * - Very old Word formats (pre-97)
     * - Complex .doc files with embedded objects
     * - Corrupted or password-protected files
     * - Files with custom formatting that doesn't translate well
     * 
     * For more reliable .doc parsing, consider converting files to .docx format
     * before upload or implementing a dedicated .doc parser.
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
     * Parse extracted text into structured resume data with enhanced mapping
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
        
        // Enhanced multi-page text processing
        $text = $this->cleanText($text);
        $lines = explode("\n", $text);
        
        // Detect if this is a multi-page document
        $isMultiPage = $this->isMultiPageDocument($text);
        $pageContext = $this->buildPageContext($text);
        
        Log::info('Starting structured data parsing', [
            'is_multi_page' => $isMultiPage,
            'total_lines' => count($lines),
            'page_count' => count($pageContext),
            'text_length' => strlen($text)
        ]);
        
        // Enhanced section detection with page-aware approach
        $sections = $this->detectSectionsWithPriority($text);
        
        // Extract data from each detected section with page context
        foreach ($sections as $sectionName => $sectionData) {
            $data = $this->processSectionDataWithPageContext($data, $sectionName, $sectionData, $text, $pageContext);
        }
        
        // Enhanced fallback extraction with page awareness
        $data = $this->extractFallbackDataWithPageContext($data, $text, $pageContext);

        // Prefer AI-structured parse if available; otherwise heuristics only
        $llmData = $this->tryLlmParse($text, $data);
        if (!empty($llmData)) {
            // Merge both ways: prefer AI fields, backfill from heuristics
            $data = $this->mergePreferAi($data, $llmData);
        }

        // Enhanced evidence filtering with page context
        $data = $this->applyEvidenceFilterWithPageContext($data, $text, $pageContext);
        $data = $this->deepCleanStrings($data);
        
        // Post-process and organize data for better template mapping
        $data = $this->organizeDataForTemplate($data);
        
        // Apply field mapping normalization
        $data = $this->normalizeFieldMappings($data);
        
        // Enhanced data validation and cleaning with page awareness
        $data = $this->validateAndCleanDataWithPageContext($data, $pageContext);

        Log::info('Structured data parsing completed', [
            'sections_found' => array_keys($sections),
            'contact_complete' => !empty($data['contact']['email']),
            'experiences_count' => count($data['experiences']),
            'education_count' => count($data['education']),
            'skills_count' => count($data['skills'])
        ]);

        return $data;
    }
    
    /**
     * Check if the document is multi-page
     */
    private function isMultiPageDocument(string $text): bool
    {
        $pageMarkers = [
            '=== PAGE',
            '=== SECTION',
            'Page ',
            'page '
        ];
        
        foreach ($pageMarkers as $marker) {
            if (strpos($text, $marker) !== false) {
                return true;
            }
        }
        
        // Check for multiple page numbers
        $pageNumbers = preg_match_all('/^\s*\d+\s*$/m', $text);
        return $pageNumbers > 1;
    }
    
    /**
     * Build page context for multi-page documents
     */
    private function buildPageContext(string $text): array
    {
        $pageContext = [];
        $lines = explode("\n", $text);
        $currentPage = 1;
        $currentPageContent = [];
        
        foreach ($lines as $lineNum => $line) {
            $trimmedLine = trim($line);
            
            // Check for page boundary markers
            if (preg_match('/=== (?:PAGE|SECTION) (\d+) ===/', $trimmedLine, $matches)) {
                // Save previous page content
                if (!empty($currentPageContent)) {
                    $pageContext[$currentPage] = [
                        'content' => implode("\n", $currentPageContent),
                        'line_start' => $lineNum - count($currentPageContent),
                        'line_end' => $lineNum - 1
                    ];
                }
                
                $currentPage = (int)$matches[1];
                $currentPageContent = [];
            } elseif (preg_match('/^\d+$/', $trimmedLine) && $lineNum > 0 && $lineNum < count($lines) - 1) {
                // Standalone page number
                if (!empty($currentPageContent)) {
                    $pageContext[$currentPage] = [
                        'content' => implode("\n", $currentPageContent),
                        'line_start' => $lineNum - count($currentPageContent),
                        'line_end' => $lineNum - 1
                    ];
                }
                
                $currentPage++;
                $currentPageContent = [];
            } else {
                $currentPageContent[] = $line;
            }
        }
        
        // Save last page
        if (!empty($currentPageContent)) {
            $pageContext[$currentPage] = [
                'content' => implode("\n", $currentPageContent),
                'line_start' => count($lines) - count($currentPageContent),
                'line_end' => count($lines) - 1
            ];
        }
        
        return $pageContext;
    }
    
    /**
     * Process section data with page context awareness
     */
    private function processSectionDataWithPageContext(array $data, string $sectionName, array $sectionData, string $text, array $pageContext): array
    {
        // Add page context to section data
        $sectionData['page_context'] = $this->getSectionPageContext($sectionName, $sectionData, $pageContext);
        
        return $this->processSectionData($data, $sectionName, $sectionData, $text);
    }
    
    /**
     * Get page context for a section
     */
    private function getSectionPageContext(string $sectionName, array $sectionData, array $pageContext): array
    {
        $context = [];
        
        foreach ($pageContext as $pageNum => $pageInfo) {
            if (isset($sectionData['content']) && is_string($sectionData['content'])) {
                if (strpos($pageInfo['content'], $sectionData['content']) !== false) {
                    $context[] = $pageNum;
                }
            }
        }
        
        return $context;
    }
    
    /**
     * Extract fallback data with page context
     */
    private function extractFallbackDataWithPageContext(array $data, string $text, array $pageContext): array
    {
        // If we don't have contact info, try to extract it from all pages
        if (empty($data['contact']) || empty($data['contact']['email'])) {
            $contactInfo = $this->extractContactInfo($text);
            
            // If still no contact info, try page by page
            if (empty($contactInfo['email'])) {
                foreach ($pageContext as $pageNum => $pageInfo) {
                    $pageContact = $this->extractContactInfo($pageInfo['content']);
                    if (!empty($pageContact['email'])) {
                        $contactInfo = array_merge($contactInfo, $pageContact);
                        break;
                    }
                }
            }
            
            $data['contact'] = $contactInfo;
        }
        
        // Similar approach for other sections
        if (empty($data['experiences'])) {
            $experiences = $this->extractWorkExperience($text);
            if (empty($experiences)) {
                foreach ($pageContext as $pageNum => $pageInfo) {
                    $pageExperiences = $this->extractWorkExperience($pageInfo['content']);
                    $experiences = array_merge($experiences, $pageExperiences);
                }
            }
            $data['experiences'] = $experiences;
        }
        
        if (empty($data['education'])) {
            $education = $this->extractEducation($text);
            if (empty($education)) {
                foreach ($pageContext as $pageNum => $pageInfo) {
                    $pageEducation = $this->extractEducation($pageInfo['content']);
                    $education = array_merge($education, $pageEducation);
                }
            }
            $data['education'] = $education;
        }
        
        if (empty($data['skills'])) {
            $skills = $this->extractSkills($text);
            if (empty($skills)) {
                foreach ($pageContext as $pageNum => $pageInfo) {
                    $pageSkills = $this->extractSkills($pageInfo['content']);
                    $skills = array_merge($skills, $pageSkills);
                }
            }
            $data['skills'] = $skills;
        }
        
        return $data;
    }
    
    /**
     * Apply evidence filter with page context
     */
    private function applyEvidenceFilterWithPageContext(array $data, string $text, array $pageContext): array
    {
        // Apply standard evidence filter first
        $data = $this->applyEvidenceFilter($data, $text);
        
        // Additional page-aware filtering
        foreach ($data as $sectionName => $sectionData) {
            if (is_array($sectionData)) {
                $data[$sectionName] = $this->filterSectionWithPageContext($sectionName, $sectionData, $pageContext);
            }
        }
        
        return $data;
    }
    
    /**
     * Filter section data with page context
     */
    private function filterSectionWithPageContext(string $sectionName, array $sectionData, array $pageContext): array
    {
        // Remove duplicate entries that might appear across pages
        if (in_array($sectionName, ['experiences', 'education', 'skills', 'certifications', 'awards'])) {
            $sectionData = $this->removeDuplicateEntries($sectionData);
        }
        
        return $sectionData;
    }
    
    /**
     * Remove duplicate entries from section data
     */
    private function removeDuplicateEntries(array $entries): array
    {
        $unique = [];
        $seen = [];
        
        foreach ($entries as $entry) {
            if (is_array($entry)) {
                $key = $this->generateEntryKey($entry);
                if (!isset($seen[$key])) {
                    $seen[$key] = true;
                    $unique[] = $entry;
                }
            }
        }
        
        return $unique;
    }
    
    /**
     * Generate a unique key for an entry
     */
    private function generateEntryKey(array $entry): string
    {
        $keyFields = [];
        
        if (isset($entry['jobTitle']) && isset($entry['company'])) {
            $keyFields[] = strtolower($entry['jobTitle'] . '|' . $entry['company']);
        } elseif (isset($entry['school']) && isset($entry['degree'])) {
            $keyFields[] = strtolower($entry['school'] . '|' . $entry['degree']);
        } elseif (isset($entry['name'])) {
            $keyFields[] = strtolower($entry['name']);
        } elseif (isset($entry['title'])) {
            $keyFields[] = strtolower($entry['title']);
        }
        
        return implode('|', $keyFields);
    }
    
    /**
     * Validate and clean data with page context
     */
    private function validateAndCleanDataWithPageContext(array $data, array $pageContext): array
    {
        // Apply standard validation first
        $data = $this->validateAndCleanData($data);
        
        // Additional page-aware validation
        $data = $this->validateCrossPageConsistency($data, $pageContext);
        
        return $data;
    }
    
    /**
     * Validate cross-page consistency
     */
    private function validateCrossPageConsistency(array $data, array $pageContext): array
    {
        // Check for contact info consistency across pages
        if (!empty($data['contact']['email'])) {
            $email = $data['contact']['email'];
            foreach ($pageContext as $pageNum => $pageInfo) {
                if (strpos($pageInfo['content'], $email) === false) {
                    Log::debug('Email not found on page', [
                        'page' => $pageNum,
                        'email' => $email
                    ]);
                }
            }
        }
        
        return $data;
    }
    
    /**
     * Extract fallback data for sections not detected by structured parsing
     */
    private function extractFallbackData(array $data, string $text): array
    {
        // If we don't have contact info, try to extract it from the text
        if (empty($data['contact']) || empty($data['contact']['email'])) {
            $data['contact'] = $this->extractContactInfo($text);
        }
        
        // If we don't have experiences, try to extract them from the text
        if (empty($data['experiences'])) {
            $data['experiences'] = $this->extractWorkExperience($text);
        }
        
        // If we don't have education, try to extract it from the text
        if (empty($data['education'])) {
            $data['education'] = $this->extractEducation($text);
        }
        
        // If we don't have skills, try to extract them from the text
        if (empty($data['skills'])) {
            $data['skills'] = $this->extractSkills($text);
        }
        
        // If we don't have summary, try to extract it from the text
        if (empty($data['summary'])) {
            $data['summary'] = $this->extractSummary($text);
        }
        
        // If we don't have languages, try to extract them from the text
        if (empty($data['languages'])) {
            $data['languages'] = $this->extractLanguages($text);
        }
        
        // If we don't have certifications, try to extract them from the text
        if (empty($data['certifications'])) {
            $data['certifications'] = $this->extractCertifications($text);
        }
        
        // If we don't have awards, try to extract them from the text
        if (empty($data['awards'])) {
            $data['awards'] = $this->extractAwards($text);
        }
        
        // If we don't have websites, try to extract them from the text
        if (empty($data['websites'])) {
            $data['websites'] = $this->extractWebsites($text);
        }
        
        // If we don't have references, try to extract them from the text
        if (empty($data['references'])) {
            $data['references'] = $this->extractReferences($text);
        }
        
        // If we don't have hobbies, try to extract them from the text
        if (empty($data['hobbies'])) {
            $data['hobbies'] = $this->extractHobbies($text);
        }
        
        return $data;
    }
    
    /**
     * Enhanced section detection with intelligent content classification
     */
    private function detectSectionsWithPriority(string $text): array
    {
        $sections = [];
        $lines = explode("\n", $text);
        $currentSection = null;
        $currentContent = [];
        $pageMarkers = [];
        
        // Enhanced multi-page awareness: detect page boundaries
        $pageBoundaries = $this->detectPageBoundaries($text);
        
        Log::info('Multi-page section detection started', [
            'total_lines' => count($lines),
            'page_boundaries' => $pageBoundaries,
            'has_page_markers' => strpos($text, '=== PAGE') !== false || strpos($text, '=== SECTION') !== false
        ]);
        
        // First pass: identify section boundaries and classify content with page awareness
        foreach ($lines as $lineNum => $line) {
            $trimmedLine = trim($line);
            if (empty($trimmedLine)) continue;
            
            // Check if this is a page boundary marker
            if ($this->isPageBoundaryMarker($trimmedLine)) {
                $pageMarkers[] = $lineNum;
                continue;
            }
            
            // Detect section headers with enhanced multi-page logic
            $detectedSection = $this->detectSectionHeaderWithPageContext($trimmedLine, $lineNum, $pageBoundaries);
            
            if ($detectedSection) {
                // Save previous section if exists
                if ($currentSection && !empty($currentContent)) {
                    $sections[$currentSection] = $this->classifyAndCleanSectionContent($currentSection, $currentContent);
                }
                
                $currentSection = $detectedSection;
                $currentContent = [];
                
                Log::debug('Section header detected', [
                    'section' => $detectedSection,
                    'line_number' => $lineNum,
                    'line_content' => $trimmedLine
                ]);
            } else {
                // Add content to current section
                if ($currentSection) {
                    $currentContent[] = $trimmedLine;
                } else {
                    // Content before first section - try to classify it
                    $preSectionContent = $this->classifyPreSectionContent($trimmedLine);
                    if ($preSectionContent) {
                        $sections = array_merge($sections, $preSectionContent);
                    }
                }
            }
        }
        
        // Save last section
        if ($currentSection && !empty($currentContent)) {
            $sections[$currentSection] = $this->classifyAndCleanSectionContent($currentSection, $currentContent);
        }
        
        // Enhanced post-processing for multi-page resumes
        $sections = $this->postProcessSectionsWithPageAwareness($sections, $pageBoundaries);
        
        // Merge sections that might be split across pages
        $sections = $this->mergeSectionsAcrossPages($sections);
        
        Log::info('Multi-page section detection completed', [
            'sections_found' => array_keys($sections),
            'page_markers' => $pageMarkers,
            'total_sections' => count($sections)
        ]);
        
        return $sections;
    }
    
    /**
     * Detect page boundaries in multi-page documents
     */
    private function detectPageBoundaries(string $text): array
    {
        $boundaries = [];
        $lines = explode("\n", $text);
        
        foreach ($lines as $lineNum => $line) {
            $trimmedLine = trim($line);
            
            // Look for explicit page markers
            if (preg_match('/=== (?:PAGE|SECTION) \d+ ===/', $trimmedLine)) {
                $boundaries[] = $lineNum;
            }
            
            // Look for page numbers at the beginning or end of lines
            if (preg_match('/^\d+$/', $trimmedLine) && $lineNum > 0 && $lineNum < count($lines) - 1) {
                $boundaries[] = $lineNum;
            }
        }
        
        return $boundaries;
    }
    
    /**
     * Check if a line is a page boundary marker
     */
    private function isPageBoundaryMarker(string $line): bool
    {
        return preg_match('/=== (?:PAGE|SECTION) \d+ ===/', $line) || 
               preg_match('/^\d+$/', $line);
    }
    
    /**
     * Detect section headers with page context awareness
     */
    private function detectSectionHeaderWithPageContext(string $line, int $lineNum, array $pageBoundaries): ?string
    {
        $detectedSection = $this->detectSectionHeader($line);
        
        if ($detectedSection) {
            // Check if this section header appears near a page boundary
            $nearPageBoundary = false;
            foreach ($pageBoundaries as $boundary) {
                if (abs($lineNum - $boundary) <= 3) {
                    $nearPageBoundary = true;
                    break;
                }
            }
            
            if ($nearPageBoundary) {
                Log::debug('Section header near page boundary', [
                    'section' => $detectedSection,
                    'line_number' => $lineNum,
                    'near_boundary' => true
                ]);
            }
        }
        
        return $detectedSection;
    }
    
    /**
     * Post-process sections with page awareness
     */
    private function postProcessSectionsWithPageAwareness(array $sections, array $pageBoundaries): array
    {
        // Apply standard post-processing first
        $sections = $this->postProcessSections($sections);
        
        // Additional multi-page specific processing
        foreach ($sections as $sectionName => $sectionData) {
            // Check for section continuations across pages
            if (isset($sectionData['content']) && is_array($sectionData['content'])) {
                $sectionData['content'] = $this->mergeContentAcrossPages($sectionData['content']);
                $sections[$sectionName] = $sectionData;
            }
        }
        
        return $sections;
    }
    
    /**
     * Merge content that might be split across pages
     */
    private function mergeContentAcrossPages(array $content): array
    {
        $merged = [];
        $currentItem = '';
        
        foreach ($content as $line) {
            $trimmedLine = trim($line);
            
            // If this looks like the start of a new item (bullet point, date, etc.)
            if ($this->isNewItemMarker($trimmedLine)) {
                if (!empty($currentItem)) {
                    $merged[] = $currentItem;
                }
                $currentItem = $trimmedLine;
            } else {
                // Continue the current item
                if (!empty($currentItem)) {
                    $currentItem .= ' ' . $trimmedLine;
                } else {
                    $currentItem = $trimmedLine;
                }
            }
        }
        
        if (!empty($currentItem)) {
            $merged[] = $currentItem;
        }
        
        return $merged;
    }
    
    /**
     * Check if a line is a marker for a new item
     */
    private function isNewItemMarker(string $line): bool
    {
        // Common patterns for new items
        $patterns = [
            '/^\d{4}/', // Year at start
            '/^[A-Z][a-z]+ \d{4}/', // Month Year
            '/^•/', // Bullet point
            '/^[-*]/', // Dash or asterisk
            '/^[A-Z][A-Za-z\s]+:$/', // Section-like header
        ];
        
        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $line)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Merge sections that might be split across pages
     */
    private function mergeSectionsAcrossPages(array $sections): array
    {
        $merged = [];
        $sectionGroups = [];
        
        // Group similar sections
        foreach ($sections as $sectionName => $sectionData) {
            $baseName = $this->getBaseSectionName($sectionName);
            if (!isset($sectionGroups[$baseName])) {
                $sectionGroups[$baseName] = [];
            }
            $sectionGroups[$baseName][] = $sectionData;
        }
        
        // Merge grouped sections
        foreach ($sectionGroups as $baseName => $group) {
            if (count($group) > 1) {
                $merged[$baseName] = $this->mergeSectionGroup($group);
            } else {
                $merged[$baseName] = $group[0];
            }
        }
        
        return $merged;
    }
    
    /**
     * Get base section name (remove page-specific suffixes)
     */
    private function getBaseSectionName(string $sectionName): string
    {
        // Remove page-specific suffixes
        $baseName = preg_replace('/_\d+$/', '', $sectionName);
        $baseName = preg_replace('/_page_\d+$/', '', $baseName);
        
        return $baseName;
    }
    
    /**
     * Merge a group of similar sections
     */
    private function mergeSectionGroup(array $group): array
    {
        $merged = $group[0];
        
        for ($i = 1; $i < count($group); $i++) {
            if (isset($group[$i]['content']) && is_array($group[$i]['content'])) {
                if (!isset($merged['content'])) {
                    $merged['content'] = [];
                }
                $merged['content'] = array_merge($merged['content'], $group[$i]['content']);
            }
        }
        
        return $merged;
    }
    
    /**
     * Process section data and extract structured information
     */
    private function processSectionData(array $data, string $sectionName, array $sectionData, string $text): array
    {
        switch ($sectionName) {
            case 'contact':
                $data['contact'] = $this->extractContactInfo($sectionData['content'] ?? '');
                break;
            case 'summary':
                $data['summary'] = $this->extractSummary($sectionData['content'] ?? '');
                break;
            case 'experiences':
                $data['experiences'] = $this->extractWorkExperience($sectionData['content'] ?? '');
                break;
            case 'education':
                $data['education'] = $this->extractEducation($sectionData['content'] ?? '');
                break;
            case 'skills':
                $data['skills'] = $this->extractSkills($sectionData['content'] ?? '');
                break;
            case 'languages':
                $data['languages'] = $this->extractLanguages($sectionData['content'] ?? '');
                break;
            case 'certifications':
                $data['certifications'] = $this->extractCertifications($sectionData['content'] ?? '');
                break;
            case 'awards':
                $data['awards'] = $this->extractAwards($sectionData['content'] ?? '');
                break;
            case 'websites':
                $data['websites'] = $this->extractWebsites($sectionData['content'] ?? '');
                break;
            case 'references':
                $data['references'] = $this->extractReferences($sectionData['content'] ?? '');
                break;
            case 'hobbies':
                $data['hobbies'] = $this->extractHobbies($sectionData['content'] ?? '');
                break;
        }
        
        return $data;
    }
    
    /**
     * Detect section headers with enhanced pattern matching
     */
    private function detectSectionHeader(string $line): ?string
    {
        $line = trim($line);
        
        // Safety check: ensure we have section headings loaded
        if (empty($this->knownSectionHeadings)) {
            Log::warning('detectSectionHeader: knownSectionHeadings is empty, using fallback values');
            // Fallback to basic section detection
            $basicSections = [
                'contact' => ['contact', 'personal', 'details'],
                'summary' => [
                    'summary', 'profile', 'objective', 'overview', 'about', 'introduction', 'executive summary',
                    'profile summary', 'resume summary', 'professional summary', 'career summary', 'personal summary',
                    'career objective', 'professional objective', 'personal objective', 'job objective',
                    'career profile', 'professional profile', 'personal profile', 'candidate profile',
                    'career overview', 'professional overview', 'personal overview', 'candidate overview',
                    'about me', 'about myself', 'personal statement', 'professional statement',
                    'career statement', 'mission statement', 'value proposition', 'elevator pitch',
                    'bio', 'biography', 'professional bio', 'personal bio', 'career bio',
                    'background', 'professional background', 'career background', 'personal background',
                    'experience summary', 'work summary', 'employment summary', 'career highlights',
                    'key qualifications', 'core competencies', 'professional highlights', 'career achievements',
                    'summary of qualifications', 'qualifications summary', 'professional qualifications',
                    'career focus', 'professional focus', 'areas of expertise', 'expertise summary'
                ],
                'experience' => ['experience', 'work', 'employment'],
                'education' => ['education', 'academic', 'qualifications'],
                'skills' => ['skills', 'competencies', 'expertise']
            ];
            $this->knownSectionHeadings = $basicSections;
        }
        
        // Use configuration for section patterns
        $sectionPatterns = [];
        foreach ($this->knownSectionHeadings as $section => $aliases) {
            if (!empty($aliases) && is_array($aliases)) {
                // Additional safety check for empty aliases
                $validAliases = array_filter($aliases, function($alias) {
                    return is_string($alias) && !empty(trim($alias));
                });
                
                if (!empty($validAliases)) {
                    $pattern = '/^(?:' . implode('|', array_map('preg_quote', $validAliases)) . ')/i';
                    if (!empty($pattern)) {
                        $sectionPatterns[$section] = $pattern;
                    }
                }
            }
        }
        
        // Safety check: ensure we have valid patterns
        if (empty($sectionPatterns)) {
            Log::warning('detectSectionHeader: No valid section patterns generated');
            return null;
        }
        
        // Debug logging for patterns
        Log::debug('detectSectionHeader: Generated patterns', [
            'patterns_count' => count($sectionPatterns),
            'patterns' => $sectionPatterns
        ]);
        
        foreach ($sectionPatterns as $section => $pattern) {
            if (!empty($pattern) && is_string($pattern) && preg_match($pattern, $line)) {
                return $section;
            }
        }
        
        // Check for all-caps headers (common in resumes)
        if (preg_match('/^[A-Z\s]{3,}$/', $line)) {
            $lineLower = strtolower($line);
            foreach ($sectionPatterns as $section => $pattern) {
                if (!empty($pattern) && is_string($pattern) && preg_match($pattern, $lineLower)) {
                    return $section;
                }
            }
        }
        
        return null;
    }
    
    /**
     * Classify content that appears before any section headers
     */
    private function classifyPreSectionContent(string $line): array
    {
        $content = [];
        
        // Check if this looks like contact information
        if ($this->isContactInformation($line)) {
            $content['contact'] = [$line];
            return $content;
        }
        
        // Check if this looks like a name
        if ($this->looksLikeName($line)) {
            $content['contact'] = [$line];
            return $content;
        }
        
        // Check if this looks like a summary
        if ($this->looksLikeSummary($line)) {
            $content['summary'] = [$line];
            return $content;
        }
        
        return [];
    }
    
    /**
     * Check if a line contains contact information
     */
    private function isContactInformation(string $line): bool
    {
        // Email pattern
        if (preg_match('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', $line)) {
            return true;
        }
        
        // Phone pattern
        if (preg_match('/\+?[\d\s\(\)\.\-]{7,15}/', $line)) {
            return true;
        }
        
        // Address pattern
        if (preg_match('/(street|avenue|road|drive|lane|plaza|square|building|suite|floor|apartment|apt|city|province|state)/i', $line)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Check if a line looks like a summary
     */
    private function looksLikeSummary(string $line): bool
    {
        // Summary lines are typically longer and contain professional language
        if (strlen($line) < 50) return false;
        
        $professionalKeywords = [
            'experienced', 'professional', 'skilled', 'dedicated', 'passionate', 'motivated',
            'years of experience', 'expertise', 'specialized', 'proficient', 'background',
            'develop', 'create', 'implement', 'manage', 'lead', 'coordinate', 'design', 'build',
            'team', 'project', 'system', 'application', 'solution', 'service'
        ];
        
        $lineLower = strtolower($line);
        foreach ($professionalKeywords as $keyword) {
            if (strpos($lineLower, $keyword) !== false) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Classify and clean content within a section
     */
    private function classifyAndCleanSectionContent(string $section, array $content): array
    {
        $cleanedContent = [];
        
        foreach ($content as $line) {
            $trimmedLine = trim($line);
            if (empty($trimmedLine)) continue;
            
            // Skip generic placeholder text
            if ($this->isPlaceholderText($trimmedLine)) continue;
            
            // Classify content based on section type
            switch ($section) {
                case 'contact':
                    $cleanedContent[] = $this->cleanContactLine($trimmedLine);
                    break;
                case 'summary':
                    $cleanedContent[] = $this->cleanSummaryLine($trimmedLine);
                    break;
                case 'experience':
                    $cleanedContent[] = $this->cleanExperienceLine($trimmedLine);
                    break;
                case 'education':
                    $cleanedContent[] = $this->cleanEducationLine($trimmedLine);
                    break;
                case 'skills':
                    $cleanedContent[] = $this->cleanSkillLine($trimmedLine);
                    break;
                default:
                    $cleanedContent[] = $trimmedLine;
            }
        }
        
        return array_filter($cleanedContent);
    }
    
    /**
     * Check if text is placeholder/generic content
     */
    private function isPlaceholderText(string $text): bool
    {
        $placeholderPatterns = [
            '/^sample\s+text$/i',
            '/^employer$/i',
            '/^use\s+this\s+section/i',
            '/^placeholder/i',
            '/^template/i',
            '/^example/i'
        ];
        
        foreach ($placeholderPatterns as $pattern) {
            if (preg_match($pattern, $text)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Clean contact information line
     */
    private function cleanContactLine(string $line): string
    {
        // Remove common prefixes
        $line = preg_replace('/^(contact|personal|info|details?):\s*/i', '', $line);
        return trim($line);
    }
    
    /**
     * Clean summary line
     */
    private function cleanSummaryLine(string $line): string
    {
        // Remove bullet points and list markers
        $line = preg_replace('/^[•\-\*]\s*/', '', $line);
        return trim($line);
    }
    
    /**
     * Clean experience line
     */
    private function cleanExperienceLine(string $line): string
    {
        // Skip if it's clearly not experience content
        if ($this->isNotExperienceContent($line)) {
            return '';
        }
        
        // Remove bullet points
        $line = preg_replace('/^[•\-\*]\s*/', '', $line);
        return trim($line);
    }
    
    /**
     * Check if content is clearly not experience-related
     */
    private function isNotExperienceContent(string $line): bool
    {
        $nonExperiencePatterns = [
            '/^email,\s+/i',
            '/^address$/i',
            '/^skills?$/i',
            '/^summary$/i',
            '/^education$/i',
            '/^contact$/i',
            '/^[a-z]+,\s+[a-z]+,\s+[a-z]+$/i', // Location patterns like "Email, Imus, Cavite"
        ];
        
        foreach ($nonExperiencePatterns as $pattern) {
            if (preg_match($pattern, $line)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Clean education line
     */
    private function cleanEducationLine(string $line): string
    {
        // Skip if it's clearly not education content
        if ($this->isNotEducationContent($line)) {
            return '';
        }
        
        // Remove bullet points
        $line = preg_replace('/^[•\-\*]\s*/', '', $line);
        return trim($line);
    }
    
    /**
     * Check if content is clearly not education-related
     */
    private function isNotEducationContent(string $line): bool
    {
        $nonEducationPatterns = [
            '/^email,\s+/i',
            '/^developed\s+and\s+maintained/i',
            '/^collaborated\s+with/i',
            '/^designed\s+ui\s+elements/i',
            '/^summary,\s+a\s+highly\s+motivated/i'
        ];
        
        foreach ($nonEducationPatterns as $pattern) {
            if (preg_match($pattern, $line)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Clean skill line
     */
    private function cleanSkillLine(string $line): string
    {
        // Remove bullet points
        $line = preg_replace('/^[•\-\*]\s*/', '', $line);
        
        // Skip if it's clearly not a skill
        if ($this->isNotSkillContent($line)) {
            return '';
        }
        
        return trim($line);
    }
    
    /**
     * Check if content is clearly not skill-related
     */
    private function isNotSkillContent(string $line): bool
    {
        $nonSkillPatterns = [
            '/^powerpoint\)$/i', // Incomplete text
            '/^grow$/i', // Too generic
            '/^attitude$/i', // Too generic
            '/^team\s+or\s+organization$/i', // Incomplete phrase
        ];
        
        foreach ($nonSkillPatterns as $pattern) {
            if (preg_match($pattern, $line)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Post-process sections to fix misclassifications
     */
    private function postProcessSections(array $sections): array
    {
        // Move misclassified content to correct sections
        $sections = $this->reclassifyMisplacedContent($sections);
        
        // Clean up empty sections
        $sections = array_filter($sections, function($content) {
            return !empty($content);
        });
        
        return $sections;
    }
    
    /**
     * Reclassify content that was placed in wrong sections
     */
    private function reclassifyMisplacedContent(array $sections): array
    {
        // Move experience content from education section
        if (isset($sections['education'])) {
            $education = $sections['education'];
            $experience = $sections['experience'] ?? [];
            
            foreach ($education as $key => $line) {
                if ($this->isExperienceContent($line)) {
                    $experience[] = $line;
                    unset($education[$key]);
                }
            }
            
            $sections['education'] = array_values($education);
            $sections['experience'] = array_values($experience);
        }
        
        // Move summary content from other sections
        if (isset($sections['summary'])) {
            $summary = $sections['summary'];
            $otherSections = ['experience', 'education', 'skills'];
            
            foreach ($otherSections as $section) {
                if (isset($sections[$section])) {
                    $sectionContent = $sections[$section];
                    foreach ($sectionContent as $key => $line) {
                        if ($this->isSummaryContent($line)) {
                            $summary[] = $line;
                            unset($sectionContent[$key]);
                        }
                    }
                    $sections[$section] = array_values($sectionContent);
                }
            }
            
            $sections['summary'] = array_values($summary);
        }
        
        // Move contact information from wrong sections
        $sections = $this->reclassifyContactInfo($sections);
        
        // Move skills from wrong sections
        $sections = $this->reclassifySkills($sections);
        
        return $sections;
    }
    
    /**
     * Check if content is experience-related
     */
    private function isExperienceContent(string $line): bool
    {
        $experiencePatterns = [
            '/^developed\s+and\s+maintained/i',
            '/^collaborated\s+with/i',
            '/^designed\s+ui\s+elements/i',
            '/^managed\s+/i',
            '/^led\s+/i',
            '/^created\s+/i',
            '/^implemented\s+/i'
        ];
        
        foreach ($experiencePatterns as $pattern) {
            if (preg_match($pattern, $line)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check if content is summary-related
     */
    private function isSummaryContent(string $line): bool
    {
        $summaryPatterns = [
            '/^summary,\s+a\s+highly\s+motivated/i',
            '/^strong\s+eagerness\s+to\s+learn/i',
            '/^excellent\s+interpersonal\s+skills/i',
            '/^positive\s+attitude/i',
            '/^collaborative\s+spirit/i'
        ];
        
        foreach ($summaryPatterns as $pattern) {
            if (preg_match($pattern, $line)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Normalize field mappings for consistency
     */
    private function normalizeFieldMappings(array $data): array
    {
        // Normalize experience fields
        if (!empty($data['experiences'])) {
            foreach ($data['experiences'] as &$exp) {
                $exp = $this->normalizeExperienceFields($exp);
            }
        }
        
        // Normalize education fields
        if (!empty($data['education'])) {
            foreach ($data['education'] as &$edu) {
                $edu = $this->normalizeEducationFields($edu);
            }
        }
        
        // Normalize skills fields
        if (!empty($data['skills'])) {
            foreach ($data['skills'] as &$skill) {
                $skill = $this->normalizeSkillFields($skill);
            }
        }
        
        // Normalize contact fields
        $data['contact'] = $this->normalizeContactFields($data['contact']);
        
        return $data;
    }
    
    /**
     * Normalize experience fields using field mappings
     */
    private function normalizeExperienceFields(array $exp): array
    {
        $normalized = [
            'id' => $exp['id'] ?? 1,
            'jobTitle' => '',
            'company' => '',
            'location' => '',
            'startDate' => '',
            'endDate' => '',
            'description' => ''
        ];
        
        // Map fields using field mappings
        foreach ($this->fieldMappings['experiences'] as $canonicalField => $aliases) {
            foreach ($aliases as $alias) {
                if (isset($exp[$alias]) && !empty($exp[$alias])) {
                    $normalized[$canonicalField] = $exp[$alias];
                    break;
                }
            }
        }
        
        // Fallback to original fields if mapping didn't work
        foreach ($normalized as $field => &$value) {
            if (empty($value) && isset($exp[$field])) {
                $value = $exp[$field];
            }
        }
        
        return $normalized;
    }
    
    /**
     * Normalize education fields using field mappings
     */
    private function normalizeEducationFields(array $edu): array
    {
        $normalized = [
            'id' => $edu['id'] ?? 1,
            'school' => '',
            'degree' => '',
            'location' => '',
            'startDate' => '',
            'endDate' => '',
            'description' => ''
        ];
        
        // Map fields using field mappings
        foreach ($this->fieldMappings['education'] as $canonicalField => $aliases) {
            foreach ($aliases as $alias) {
                if (isset($edu[$alias]) && !empty($edu[$alias])) {
                    $normalized[$canonicalField] = $edu[$alias];
                    break;
                }
            }
        }
        
        // Fallback to original fields if mapping didn't work
        foreach ($normalized as $field => &$value) {
            if (empty($value) && isset($edu[$field])) {
                $value = $edu[$field];
            }
        }
        
        return $normalized;
    }
    
    /**
     * Normalize skill fields using field mappings
     */
    private function normalizeSkillFields($skill): array
    {
        if (is_string($skill)) {
            return [
                'id' => 1,
                'name' => trim($skill),
                'level' => '',
                'category' => ''
            ];
        }
        
        $normalized = [
            'id' => $skill['id'] ?? 1,
            'name' => '',
            'level' => '',
            'category' => ''
        ];
        
        // Map fields using field mappings
        foreach ($this->fieldMappings['skills'] as $canonicalField => $aliases) {
            foreach ($aliases as $alias) {
                if (isset($skill[$alias]) && !empty($skill[$alias])) {
                    $normalized[$canonicalField] = $skill[$alias];
                    break;
                }
            }
        }
        
        // Fallback to original fields if mapping didn't work
        foreach ($normalized as $field => &$value) {
            if (empty($value) && isset($skill[$field])) {
                $value = $skill[$field];
            }
        }
        
        return $normalized;
    }
    
    /**
     * Normalize contact fields using field mappings
     */
    private function normalizeContactFields(array $contact): array
    {
        $normalized = [
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
        
        // Map fields using field mappings
        foreach ($this->fieldMappings['contact'] as $canonicalField => $aliases) {
            foreach ($aliases as $alias) {
                if (isset($contact[$alias]) && !empty($contact[$alias])) {
                    $normalized[$canonicalField] = $contact[$alias];
                    break;
                }
            }
        }
        
        // Fallback to original fields if mapping didn't work
        foreach ($normalized as $field => &$value) {
            if (empty($value) && isset($contact[$field])) {
                $value = $contact[$field];
            }
        }
        
        return $normalized;
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
     * Extract contact information with enhanced name detection
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
        
        // Use configuration for email pattern
        $emailPattern = config('resumeparser.regex_patterns.email');
        if (preg_match($emailPattern, $text, $matches)) {
            $contact['email'] = $matches[0];
        }
        
        // Extract phone number (intl-friendly) with better validation
        $phoneNumber = $this->extractValidPhoneNumber($text);
        if ($phoneNumber) {
            $contact['phone'] = $phoneNumber;
        }
        
        // Enhanced name extraction with multiple strategies
        $nameInfo = $this->extractNameWithMultipleStrategies($text);
        if ($nameInfo) {
            $contact['firstName'] = $nameInfo['firstName'];
            $contact['lastName'] = $nameInfo['lastName'];
        }
        
        // Extract address components
        $this->extractAddressInfo($text, $contact);
        
        // Extract job title if present
        $jobTitle = $this->extractJobTitle($text);
        if ($jobTitle) {
            $contact['desiredJobTitle'] = $jobTitle;
        }
        
        return $contact;
    }
    
    /**
     * Extract job title from contact section
     */
    private function extractJobTitle(string $text): string
    {
        $lines = explode("\n", $text);
        
        // Look for job title in first few lines
        for ($i = 0; $i < min(5, count($lines)); $i++) {
            $line = trim($lines[$i]);
            if (empty($line)) continue;
            
            // Skip if it's clearly not a job title
            if ($this->isContactInfo($line) || $this->looksLikeName($line)) {
                continue;
            }
            
            // Look for job title patterns
            if ($this->looksLikeJobTitle($line)) {
                return $line;
            }
        }
        
        return '';
    }
    
    /**
     * Check if a line looks like a job title
     */
    private function looksLikeJobTitle(string $line): bool
    {
        // Job titles are typically 2-6 words, start with capital letters
        if (strlen($line) < 5 || strlen($line) > 50) return false;
        
        // Should start with capital letter
        if (!preg_match('/^[A-Z]/', $line)) return false;
        
        // Should not contain email, phone, or address patterns
        if ($this->isContactInfo($line)) return false;
        
        // Use configuration for job title keywords
        $jobTitleKeywords = config('resumeparser.job_title_keywords', []);
        
        $lineLower = strtolower($line);
        foreach ($jobTitleKeywords as $keyword) {
            if (strpos($lineLower, $keyword) !== false) {
                return true;
            }
        }
        
        // Check if it looks like a professional title (2-4 words, mostly capitalized)
        $words = explode(' ', $line);
        if (count($words) >= 2 && count($words) <= 4) {
            $capitalizedWords = 0;
            foreach ($words as $word) {
                if (preg_match('/^[A-Z][a-z]*$/', $word)) {
                    $capitalizedWords++;
                }
            }
            if ($capitalizedWords >= count($words) * 0.7) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Enhanced name extraction using multiple strategies
     */
    private function extractNameWithMultipleStrategies(string $text): ?array
    {
        $lines = explode("\n", $text);
        
        // Strategy 1: Look for name in first few lines (common pattern)
        for ($i = 0; $i < min(5, count($lines)); $i++) {
            $line = trim($lines[$i]);
            if (empty($line)) continue;
            
            $nameInfo = $this->extractNameFromLine($line);
            if ($nameInfo) {
                return $nameInfo;
            }
        }
        
        // Strategy 2: Look for capitalized name patterns throughout text
        $nameInfo = $this->extractNameFromCapitalizedPatterns($text);
        if ($nameInfo) {
            return $nameInfo;
        }
        
        // Strategy 3: Look for name near email address
        $emailMatches = [];
        if (preg_match('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', $text, $emailMatches)) {
            $email = $emailMatches[0];
            $nameInfo = $this->extractNameNearEmail($text, $email);
            if ($nameInfo) {
                return $nameInfo;
            }
        }
        
        // Strategy 4: Look for name in the "Contact Education" section
        $nameInfo = $this->extractNameFromContactSection($text);
        if ($nameInfo) {
            return $nameInfo;
        }
        
        return null;
    }
    
    /**
     * Extract name from contact section specifically
     */
    private function extractNameFromContactSection(string $text): ?array
    {
        $lines = explode("\n", $text);
        
        // Look for the contact section header
        $contactSectionStart = -1;
        for ($i = 0; $i < count($lines); $i++) {
            $line = trim($lines[$i]);
            // More specific pattern to avoid false matches like "Contact Education"
            if (preg_match('/^(?:contact|personal|header)(?:\s+information)?$/i', $line)) {
                $contactSectionStart = $i;
                break;
            }
        }
        
        if ($contactSectionStart >= 0) {
            // Look for name in the next few lines after contact header
            for ($i = $contactSectionStart + 1; $i < min($contactSectionStart + 5, count($lines)); $i++) {
                $line = trim($lines[$i]);
                if (empty($line)) continue;
                
                // Skip if it's clearly contact info (email, phone, address)
                if ($this->isContactInfo($line)) continue;
                
                $nameInfo = $this->extractNameFromLine($line);
                if ($nameInfo) {
                    return $nameInfo;
                }
            }
        }
        
        return null;
    }
    
    /**
     * Extract name from a single line
     */
    private function extractNameFromLine(string $line): ?array
    {
        // Skip if line is too short or too long
        if (strlen($line) < 3 || strlen($line) > 100) return null;
        
        // Skip if line contains email or phone
        if (preg_match('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', $line)) return null;
        if (preg_match('/\+?[\d\s\(\)\.\-]{7,15}/', $line)) return null;
        
        // Skip if line looks like a section header (contains common section keywords)
        $sectionKeywords = ['contact', 'education', 'experience', 'skills', 'summary', 'objective', 'profile', 'employment', 'work', 'academic', 'qualifications', 'certifications', 'awards', 'references', 'languages', 'hobbies', 'interests'];
        $lineLower = strtolower($line);
        foreach ($sectionKeywords as $keyword) {
            if (strpos($lineLower, $keyword) !== false) {
                return null;
            }
        }
        
        // Use configuration for name patterns
        $namePatterns = config('resumeparser.regex_patterns.name_patterns', []);
        
        foreach ($namePatterns as $pattern) {
            if (preg_match($pattern, $line, $matches)) {
                if (count($matches) === 3) {
                    return [
                        'firstName' => $matches[1],
                        'lastName' => $matches[2]
                    ];
                } elseif (count($matches) === 4) {
                    return [
                        'firstName' => $matches[2],
                        'lastName' => $matches[3]
                    ];
                }
            }
        }
        
        return null;
    }
    
    /**
     * Extract name from capitalized patterns throughout text
     */
    private function extractNameFromCapitalizedPatterns(string $text): ?array
    {
        // Look for patterns like "FirstName LastName" anywhere in text
        if (preg_match('/\b([A-Z][a-z]+)\s+([A-Z][a-z]+)\b/', $text, $matches)) {
            // Validate this looks like a real name
            if ($this->isLikelyRealName($matches[1], $matches[2])) {
                return [
                    'firstName' => $matches[1],
                    'lastName' => $matches[2]
                ];
            }
        }
        
        return null;
    }
    
    /**
     * Extract name near email address
     */
    private function extractNameNearEmail(string $text, string $email): ?array
    {
        // Extract username from email
        $username = explode('@', $email)[0];
        
        // Look for name patterns near the email
        $emailPos = strpos($text, $email);
        if ($emailPos !== false) {
            // Look in the lines before the email
            $lines = explode("\n", substr($text, 0, $emailPos));
            for ($i = count($lines) - 1; $i >= max(0, count($lines) - 3); $i--) {
                $line = trim($lines[$i]);
                if (empty($line)) continue;
                
                $nameInfo = $this->extractNameFromLine($line);
                if ($nameInfo) {
                    return $nameInfo;
                }
            }
        }
        
        return null;
    }
    
    /**
     * Validate if two words look like a real name
     */
    private function isLikelyRealName(string $firstName, string $lastName): bool
    {
        // Use configuration for common first names
        $commonFirstNames = config('resumeparser.common_first_names', []);
        
        $firstNameLower = strtolower($firstName);
        $lastNameLower = strtolower($lastName);
        
        // Check if it's a common name
        if (in_array($firstNameLower, $commonFirstNames)) {
            return true;
        }
        
        // Check if both words look like names (start with capital, reasonable length)
        if (strlen($firstName) >= 2 && strlen($firstName) <= 20 &&
            strlen($lastName) >= 2 && strlen($lastName) <= 20 &&
            preg_match('/^[A-Z][a-z]+$/', $firstName) &&
            preg_match('/^[A-Z][a-z]+$/', $lastName)) {
            return true;
        }
        
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
        
        // Enhanced multi-page experience extraction
        $experienceSections = $this->extractMultiPageSections($text, [
            'experience', 'work experience', 'employment', 'professional experience', 
            'work history', 'career', 'professional background'
        ]);
        
        if (empty($experienceSections)) {
            // Fallback: try to extract experiences from the entire text
            $experienceSections = [$text];
        }
        
        Log::info('Extracting work experience', [
            'sections_found' => count($experienceSections),
            'text_length' => strlen($text)
        ]);
        
        // Process each experience section (could be from different pages)
        foreach ($experienceSections as $sectionIndex => $experienceSection) {
            // Parse individual experience entries from this section
            $entries = $this->parseExperienceEntries($experienceSection);
            
            foreach ($entries as $index => $entry) {
                $experience = [
                    'id' => count($experiences) + 1,
                    'jobTitle' => $entry['title'] ?? '',
                    'company' => $entry['company'] ?? '',
                    'location' => $entry['location'] ?? '',
                    'startDate' => $entry['startDate'] ?? '',
                    'endDate' => $entry['endDate'] ?? '',
                    'description' => $entry['description'] ?? ''
                ];
                
                // Only add if it's not a duplicate
                if (!$this->isDuplicateExperience($experience, $experiences)) {
                    $experiences[] = $experience;
                }
            }
        }
        
        // Sort experiences by date (most recent first)
        $experiences = $this->sortExperiencesByDate($experiences);
        
        Log::info('Work experience extraction completed', [
            'total_experiences' => count($experiences),
            'unique_experiences' => count($experiences)
        ]);
        
        return $experiences;
    }
    
    /**
     * Extract sections that might span multiple pages
     */
    private function extractMultiPageSections(string $text, array $sectionKeywords): array
    {
        $sections = [];
        $lines = explode("\n", $text);
        $currentSection = null;
        $currentContent = [];
        
        foreach ($lines as $lineNum => $line) {
            $trimmedLine = trim($line);
            
            // Skip page markers
            if ($this->isPageBoundaryMarker($trimmedLine)) {
                continue;
            }
            
            // Check if this line is a section header
            $isSectionHeader = false;
            foreach ($sectionKeywords as $keyword) {
                if (stripos($trimmedLine, $keyword) !== false && 
                    (strlen($trimmedLine) < 50 || preg_match('/^' . preg_quote($keyword, '/') . '/i', $trimmedLine))) {
                    $isSectionHeader = true;
                    break;
                }
            }
            
            if ($isSectionHeader) {
                // Save previous section if exists
                if ($currentSection && !empty($currentContent)) {
                    $sections[] = implode("\n", $currentContent);
                }
                
                $currentSection = $trimmedLine;
                $currentContent = [];
            } else {
                // Add content to current section
                if ($currentSection) {
                    $currentContent[] = $line;
                }
            }
        }
        
        // Save last section
        if ($currentSection && !empty($currentContent)) {
            $sections[] = implode("\n", $currentContent);
        }
        
        return $sections;
    }
    
    /**
     * Check if an experience is a duplicate
     */
    private function isDuplicateExperience(array $newExperience, array $existingExperiences): bool
    {
        foreach ($existingExperiences as $existing) {
            $titleMatch = !empty($newExperience['jobTitle']) && 
                         !empty($existing['jobTitle']) && 
                         strtolower($newExperience['jobTitle']) === strtolower($existing['jobTitle']);
            
            $companyMatch = !empty($newExperience['company']) && 
                           !empty($existing['company']) && 
                           strtolower($newExperience['company']) === strtolower($existing['company']);
            
            if ($titleMatch && $companyMatch) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Sort experiences by date (most recent first)
     */
    private function sortExperiencesByDate(array $experiences): array
    {
        usort($experiences, function($a, $b) {
            $dateA = $this->parseDateForSorting($a['startDate'] ?? '');
            $dateB = $this->parseDateForSorting($b['startDate'] ?? '');
            
            // If both have dates, sort by date
            if ($dateA && $dateB) {
                return $dateB <=> $dateA; // Most recent first
            }
            
            // If only one has a date, prioritize it
            if ($dateA && !$dateB) return -1;
            if (!$dateA && $dateB) return 1;
            
            // If neither has a date, maintain original order
            return 0;
        });
        
        return $experiences;
    }
    
    /**
     * Parse date for sorting purposes
     */
    private function parseDateForSorting(string $dateString): ?int
    {
        if (empty($dateString)) return null;
        
        // Handle "Present" or "Current"
        if (stripos($dateString, 'present') !== false || stripos($dateString, 'current') !== false) {
            return time(); // Current timestamp for "Present"
        }
        
        // Try to parse various date formats
        $formats = [
            'Y-m-d', 'Y-m', 'Y', 'M Y', 'F Y', 'm/Y', 'm/Y/d'
        ];
        
        foreach ($formats as $format) {
            $date = \DateTime::createFromFormat($format, $dateString);
            if ($date !== false) {
                return $date->getTimestamp();
            }
        }
        
        // Try strtotime as fallback
        $timestamp = strtotime($dateString);
        return $timestamp !== false ? $timestamp : null;
    }
    
    /**
     * Extract education information with enhanced multi-page support
     */
    private function extractEducation(string $text): array
    {
        $education = [];
        
        // Enhanced multi-page education extraction
        $educationSections = $this->extractMultiPageSections($text, [
            'education', 'academic background', 'qualifications', 'degrees', 
            'academic', 'academics', 'schooling', 'academic background'
        ]);
        
        if (empty($educationSections)) {
            // Fallback: try to extract education from the entire text
            $educationSections = [$text];
        }
        
        Log::info('Extracting education', [
            'sections_found' => count($educationSections),
            'text_length' => strlen($text)
        ]);
        
        // Process each education section (could be from different pages)
        foreach ($educationSections as $sectionIndex => $educationSection) {
            // Parse individual education entries from this section
            $entries = $this->parseEducationEntries($educationSection);
            
            foreach ($entries as $index => $entry) {
                $educationEntry = [
                    'id' => count($education) + 1,
                    'school' => $entry['school'] ?? '',
                    'location' => $entry['location'] ?? '',
                    'degree' => $entry['degree'] ?? '',
                    'startDate' => $entry['startDate'] ?? '',
                    'endDate' => $entry['endDate'] ?? '',
                    'description' => $entry['description'] ?? ''
                ];
                
                // Only add if it's not a duplicate
                if (!$this->isDuplicateEducation($educationEntry, $education)) {
                    $education[] = $educationEntry;
                }
            }
        }
        
        // Sort education by date (most recent first)
        $education = $this->sortEducationByDate($education);
        
        Log::info('Education extraction completed', [
            'total_education' => count($education),
            'unique_education' => count($education)
        ]);
        
        return $education;
    }
    
    /**
     * Check if an education entry is a duplicate
     */
    private function isDuplicateEducation(array $newEducation, array $existingEducation): bool
    {
        foreach ($existingEducation as $existing) {
            $schoolMatch = !empty($newEducation['school']) && 
                          !empty($existing['school']) && 
                          strtolower($newEducation['school']) === strtolower($existing['school']);
            
            $degreeMatch = !empty($newEducation['degree']) && 
                          !empty($existing['degree']) && 
                          strtolower($newEducation['degree']) === strtolower($existing['degree']);
            
            if ($schoolMatch && $degreeMatch) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Sort education by date (most recent first)
     */
    private function sortEducationByDate(array $education): array
    {
        usort($education, function($a, $b) {
            $dateA = $this->parseDateForSorting($a['endDate'] ?? $a['startDate'] ?? '');
            $dateB = $this->parseDateForSorting($b['endDate'] ?? $b['startDate'] ?? '');
            
            // If both have dates, sort by date
            if ($dateA && $dateB) {
                return $dateB <=> $dateA; // Most recent first
            }
            
            // If only one has a date, prioritize it
            if ($dateA && !$dateB) return -1;
            if (!$dateA && $dateB) return 1;
            
            // If neither has a date, maintain original order
            return 0;
        });
        
        return $education;
    }
    
    /**
     * Extract skills with improved organization
     */
    private function extractSkills(string $text): array
    {
        $skills = [];
        
        // Look for skills section
        $skillsSection = $this->extractSection($text, [
            'skills', 'technical skills', 'core competencies', 'expertise', 
            'technologies', 'proficiencies', 'competencies', 'technical competencies'
        ]);
        
        if (!$skillsSection) {
            // Try content-based extraction if no section found
            $skillsSection = $this->extractSkillsByContent($text);
        }
        
        if (!$skillsSection) return $skills;
        
        // Parse skills with better organization
        $skillList = $this->parseSkillsList($skillsSection);
        
        foreach ($skillList as $index => $skill) {
            $skillData = $this->parseSkillEntry($skill);
            if ($skillData) {
                $skillData['id'] = $index + 1;
                $skills[] = $skillData;
            }
        }
        
        return $skills;
    }
    
    /**
     * Parse individual skill entry for better organization
     */
    private function parseSkillEntry(string $skill): ?array
    {
        $skill = trim($skill);
        if (empty($skill) || strlen($skill) < 2) return null;
        
        // Look for skill with proficiency level
        if (preg_match('/^(.+?)\s*[\(\[]\s*(.+?)\s*[\)\]]$/', $skill, $matches)) {
            return [
                'name' => trim($matches[1]),
                'level' => trim($matches[2])
            ];
        }
        
        // Look for skill with version number
        if (preg_match('/^(.+?)\s+(\d+\.?\d*)$/', $skill, $matches)) {
            return [
                'name' => trim($matches[1]),
                'level' => 'v' . $matches[2]
            ];
        }
        
        // Look for skill with proficiency indicators
        $proficiencyPatterns = [
            '/^(.+?)\s+(beginner|intermediate|advanced|expert|proficient|skilled)$/i',
            '/^(.+?)\s+(basic|good|excellent|outstanding)$/i',
            '/^(.+?)\s+(\d+)\s*%$/',
            '/^(.+?)\s+(\d+)\s*\/\s*10$/'
        ];
        
        foreach ($proficiencyPatterns as $pattern) {
            if (preg_match($pattern, $skill, $matches)) {
                return [
                    'name' => trim($matches[1]),
                    'level' => trim($matches[2])
                ];
            }
        }
        
        // Default skill entry
        return [
            'name' => $skill,
            'level' => ''
        ];
    }
    
    /**
     * Parse skills list with better delimiter handling
     */
    private function parseSkillsList(string $text): array
    {
        // Split by common delimiters with better handling
        $delimiters = [
            '/[,•·\n\|;]/',  // Standard delimiters
            '/\s+and\s+/i',  // "and" separator
            '/\s+&\s+/',     // "&" separator
            '/\s*\+\s*/',    // "+" separator
        ];
        
        $skills = [$text]; // Start with the full text
        
        foreach ($delimiters as $delimiter) {
            $newSkills = [];
            foreach ($skills as $skill) {
                $split = preg_split($delimiter, $skill);
                foreach ($split as $splitSkill) {
                    $splitSkill = trim($splitSkill);
                    if (!empty($splitSkill)) {
                        $newSkills[] = $splitSkill;
                    }
                }
            }
            $skills = $newSkills;
        }
        
        // Filter and clean skills
        return array_filter(array_map('trim', $skills), function($skill) {
            return !empty($skill) && strlen($skill) > 2 && $this->looksLikeSkill($skill);
        });
    }
    
    /**
     * Extract summary/objective with enhanced detection
     */
    private function extractSummary(string $text): string
    {
        // Enhanced summary section detection with comprehensive headings
        $summaryHeadings = [
            'summary', 'profile', 'objective', 'overview', 'about', 'introduction', 'executive summary',
            'profile summary', 'resume summary', 'professional summary', 'career summary', 'personal summary',
            'career objective', 'professional objective', 'personal objective', 'job objective',
            'career profile', 'professional profile', 'personal profile', 'candidate profile',
            'career overview', 'professional overview', 'personal overview', 'candidate overview',
            'about me', 'about myself', 'personal statement', 'professional statement',
            'career statement', 'mission statement', 'value proposition', 'elevator pitch',
            'bio', 'biography', 'professional bio', 'personal bio', 'career bio',
            'background', 'professional background', 'career background', 'personal background',
            'experience summary', 'work summary', 'employment summary', 'career highlights',
            'key qualifications', 'core competencies', 'professional highlights', 'career achievements',
            'summary of qualifications', 'qualifications summary', 'professional qualifications',
            'career focus', 'professional focus', 'areas of expertise', 'expertise summary'
        ];
        
        $summarySection = $this->extractSection($text, $summaryHeadings);
        if ($summarySection) {
            return trim($summarySection);
        }

        // Enhanced fallback: detect an unlabeled opening paragraph that looks like a summary
        $fallbackSummary = $this->extractUnlabeledSummaryFromText($text);
        if (!empty($fallbackSummary)) {
            return $fallbackSummary;
        }
        
        // Enhanced fallback: look for professional narrative near the top
        $professionalNarrative = $this->extractProfessionalNarrative($text);
        if (!empty($professionalNarrative)) {
            return $professionalNarrative;
        }
        
        // Additional fallback: look for summary-like content in the first few paragraphs
        return $this->extractSummaryFromEarlyContent($text);
    }
    
    /**
     * Extract professional narrative from resume text
     */
    private function extractProfessionalNarrative(string $text): string
    {
        $lines = explode("\n", $text);
        $narrativeLines = [];
        $foundContact = false;
        
        // Look for the first substantial paragraph after contact info
        for ($i = 0; $i < min(10, count($lines)); $i++) {
            $line = trim($lines[$i]);
            if (empty($line)) continue;
            
            // Skip contact information
            if ($this->isContactInfo($line) || $this->containsDatePatterns($line)) {
                $foundContact = true;
                continue;
            }
            
            // Look for professional narrative
            if ($foundContact && $this->looksLikeProfessionalNarrative($line)) {
                $narrativeLines[] = $line;
                
                // Continue collecting related lines
                for ($j = $i + 1; $j < min($i + 5, count($lines)); $j++) {
                    $nextLine = trim($lines[$j]);
                    if (empty($nextLine)) break;
                    
                    if ($this->looksLikeProfessionalNarrative($nextLine)) {
                        $narrativeLines[] = $nextLine;
                    } else {
                        break;
                    }
                }
                break;
            }
        }
        
        return !empty($narrativeLines) ? implode(' ', $narrativeLines) : '';
    }
    
    /**
     * Extract summary from early content in the resume
     */
    private function extractSummaryFromEarlyContent(string $text): string
    {
        $lines = explode("\n", $text);
        $summaryLines = [];
        $foundContact = false;
        $contactLines = 0;
        
        // Look for the first substantial paragraph after contact info
        for ($i = 0; $i < min(15, count($lines)); $i++) {
            $line = trim($lines[$i]);
            if (empty($line)) continue;
            
            // Skip contact information (usually first few lines)
            if ($this->isContactInfo($line) || $this->containsDatePatterns($line) || 
                preg_match('/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i', $line) ||
                preg_match('/\+?\d[\d\s().-]{7,}\d/', $line)) {
                $foundContact = true;
                $contactLines++;
                continue;
            }
            
            // Skip section headers
            if ($this->isSectionHeader($line)) {
                continue;
            }
            
            // Look for summary-like content after contact info
            if ($foundContact && $contactLines >= 2 && $this->looksLikeSummaryContent($line)) {
                $summaryLines[] = $line;
                
                // Continue collecting related lines
                for ($j = $i + 1; $j < min($i + 8, count($lines)); $j++) {
                    $nextLine = trim($lines[$j]);
                    if (empty($nextLine)) break;
                    
                    // Stop if we hit another section header
                    if ($this->isSectionHeader($nextLine)) {
                        break;
                    }
                    
                    if ($this->looksLikeSummaryContent($nextLine)) {
                        $summaryLines[] = $nextLine;
                    } else {
                        break;
                    }
                }
                break;
            }
        }
        
        return !empty($summaryLines) ? implode(' ', $summaryLines) : '';
    }
    
    /**
     * Check if a line looks like summary content
     */
    private function looksLikeSummaryContent(string $line): bool
    {
        // Skip very short lines
        if (strlen($line) < 30) return false;
        
        // Skip lines that look like job titles, company names, or dates
        if ($this->isLikelyJobTitle($line) || $this->isLikelyCompany($line) || $this->isLikelyDateEnhanced($line)) {
            return false;
        }
        
        // Skip lines that look like skills or technical lists
        if (preg_match('/^[A-Z][a-z]+\s*[,;]/', $line) || preg_match('/\b(programming|software|tools|technologies|skills)\b/i', $line)) {
            return false;
        }
        
        // Look for professional summary indicators
        $summaryKeywords = [
            'experienced', 'professional', 'skilled', 'dedicated', 'passionate', 'motivated',
            'years of experience', 'expertise', 'specialized', 'proficient', 'background',
            'develop', 'create', 'implement', 'manage', 'lead', 'coordinate', 'design', 'build',
            'team', 'project', 'system', 'application', 'solution', 'service', 'industry',
            'strong', 'proven', 'track record', 'successful', 'accomplished', 'results',
            'seeking', 'looking for', 'interested in', 'passionate about', 'committed to',
            'expertise in', 'specialized in', 'focused on', 'dedicated to', 'experienced in',
            'proven ability', 'strong background', 'extensive experience', 'comprehensive knowledge'
        ];
        
        $lineLower = strtolower($line);
        $keywordCount = 0;
        
        foreach ($summaryKeywords as $keyword) {
            if (strpos($lineLower, $keyword) !== false) {
                $keywordCount++;
            }
        }
        
        // Check for professional language patterns
        $hasProfessionalLanguage = $keywordCount >= 2 || 
            preg_match('/\b(experienced|professional|skilled|dedicated|passionate|motivated)\b/i', $line) ||
            preg_match('/\b(years? of experience|expertise|specialized|proficient)\b/i', $line) ||
            preg_match('/\b(develop|create|implement|manage|lead|coordinate|design|build)\b/i', $line);
        
        // Check for sentence structure
        $hasSentenceStructure = preg_match('/[.!?]$/', $line) || 
            preg_match('/\b(and|or|but|with|for|in|on|at|by|to|from|of|the|a|an)\b/', $line);
        
        // Check length (not too short, not too long) - increased limit for longer descriptions
        $appropriateLength = strlen($line) >= 50 && strlen($line) <= 1000;
        
        return $hasProfessionalLanguage && $hasSentenceStructure && $appropriateLength;
    }
    
    /**
     * Check if a line looks like a section header
     */
    private function isSectionHeader(string $line): bool
    {
        $line = trim($line);
        
        // Check for common section headers
        $sectionHeaders = [
            'experience', 'work experience', 'employment', 'professional experience', 'career', 'work history', 'positions',
            'education', 'academic', 'academics', 'qualifications', 'degrees', 'schooling', 'academic background',
            'skills', 'technical skills', 'competencies', 'expertise', 'capabilities', 'proficiencies',
            'languages', 'language skills', 'bilingual', 'multilingual',
            'certifications', 'certificates', 'credentials', 'accreditations', 'licenses',
            'awards', 'honors', 'achievements', 'recognition', 'accolades',
            'projects', 'portfolio', 'work samples', 'case studies',
            'references', 'referees', 'testimonials',
            'activities', 'involvement', 'extracurricular', 'volunteer', 'community',
            'interests', 'hobbies', 'personal interests'
        ];
        
        $lineLower = strtolower($line);
        
        // Check if line matches section headers
        foreach ($sectionHeaders as $header) {
            if ($lineLower === $header || strpos($lineLower, $header) === 0) {
                return true;
            }
        }
        
        // Check for header-like patterns (all caps, short, with colons)
        if (preg_match('/^[A-Z\s]{2,30}:?$/', $line) && strlen($line) < 30) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Check if a line looks like professional narrative
     */
    private function looksLikeProfessionalNarrative(string $line): bool
    {
        // Skip very short lines
        if (strlen($line) < 20) return false;
        
        // Skip lines that are clearly not narrative
        if (preg_match('/^[•\-\*]/', $line)) return false;
        if (preg_match('/^[A-Z][A-Z\s]+$/', $line)) return false; // All caps headers
        
        // Look for professional language patterns
        $professionalPatterns = [
            '/\b(?:I am|I\'m|Experienced|Professional|Skilled|Dedicated|Passionate|Motivated)\b/i',
            '/\b(?:years? of experience|expertise in|specialized in|proficient in)\b/i',
            '/\b(?:develop|create|implement|manage|lead|coordinate|design|build)\b/i',
            '/\b(?:team|project|system|application|solution|service)\b/i'
        ];
        
        foreach ($professionalPatterns as $pattern) {
            if (preg_match($pattern, $line)) {
                return true;
            }
        }
        
        // Check if it's a reasonable length for a narrative sentence
        return strlen($line) >= 30 && strlen($line) <= 200;
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
            if (preg_match('/^[•\-\*]/', $pTrim)) continue;
            
            // Skip if it looks like job titles, company names, or dates
            if ($this->isLikelyJobTitle($pTrim) || $this->isLikelyCompany($pTrim) || $this->isLikelyDateEnhanced($pTrim)) continue;
            
            // Skip if it looks like skills or technical lists
            if (preg_match('/^[A-Z][a-z]+\s*[,;]/', $pTrim) || preg_match('/\b(programming|software|tools|technologies|skills)\b/i', $pTrim)) continue;
            
            $len = mb_strlen($pTrim);
            if ($len >= 50 && $len <= 800) {
                // Check if it looks like summary content
                if ($this->looksLikeSummaryContent($pTrim)) {
                    return $pTrim;
                }
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
            $parts = preg_split('/[•;]+\s*/u', $refSection);
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
        // Enhanced section detection with multiple strategies
        
        // Strategy 1: Look for explicit section headings with various formats
        $section = $this->extractSectionByEnhancedHeadings($text, $sectionNames);
        if ($section) {
            return $section;
        }
        
        // Strategy 2: Look for implicit sections based on content patterns
        $section = $this->extractSectionByContent($text, $sectionNames);
        if ($section) {
            return $section;
        }
        
        return null;
    }
    
    /**
     * Extract section using traditional heading-based approach with enhanced patterns
     */
    private function extractSectionByHeadings(string $text, array $sectionNames): ?string
    {
        // Find all heading-like lines and index them with more flexible patterns
        $headingPatterns = [
            // Standard format: "Section Name:" or "Section Name"
            '/(^|\n)\s*([A-Za-z][A-Za-z&\/\-\s]{2,60})\s*:?[ \t]*?(\n|$)/u',
            // Bold/emphasized sections: "**Section Name**" or "*Section Name*"
            '/(^|\n)\s*[\*\_]+\s*([A-Za-z][A-Za-z&\/\-\s]{2,60})\s*[\*\_]+\s*(\n|$)/u',
            // Underlined sections: "Section Name" with dashes below
            '/(^|\n)\s*([A-Za-z][A-Za-z&\/\-\s]{2,60})\s*\n\s*[-_=]{3,}/u',
            // All caps sections: "SECTION NAME"
            '/(^|\n)\s*([A-Z][A-Z\s&\/\-]{2,60})\s*(\n|$)/u',
            // Sections with numbers: "1. Section Name" or "1) Section Name"
            '/(^|\n)\s*\d+[\.\)]\s*([A-Za-z][A-Za-z&\/\-\s]{2,60})\s*(\n|$)/u'
        ];
        
        // Extract all section names and aliases from knownSectionHeadings
        $allKnownNames = [];
        foreach ($this->knownSectionHeadings as $section => $aliases) {
            if (is_array($aliases)) {
                $allKnownNames = array_merge($allKnownNames, $aliases);
            } else {
                $allKnownNames[] = $aliases;
            }
        }
        
        $allNames = array_unique(array_map('strtolower', array_merge($allKnownNames, $sectionNames)));
        $targetNames = array_map('strtolower', $sectionNames);
        
        $headings = [];
        
        foreach ($headingPatterns as $pattern) {
            if (preg_match_all($pattern, $text, $matches, PREG_OFFSET_CAPTURE)) {
                for ($i = 0; $i < count($matches[2]); $i++) {
                    $label = strtolower(trim($matches[2][$i][0]));
                    if (in_array($label, $allNames, true)) {
                        $headings[] = [
                            'label' => $label,
                            'offset' => $matches[2][$i][1],
                        ];
                    }
                }
            }
        }
        
        if (empty($headings)) {
            return null;
        }
        
        // Sort headings by position
        usort($headings, function($a, $b) {
            return $a['offset'] - $b['offset'];
        });
        
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
     * Extract section using content-based pattern matching
     */
    private function extractSectionByContent(string $text, array $sectionNames): ?string
    {
        $lines = explode("\n", $text);
        $sectionLines = [];
        $inSection = false;
        
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;
            
            // Determine which section this line belongs to based on content
            $detectedSection = $this->detectSectionFromContent($line, $sectionNames);
            
            if ($detectedSection) {
                $inSection = true;
                $sectionLines[] = $line;
            } elseif ($inSection) {
                // Continue collecting lines until we hit another section indicator
                if ($this->isSectionBoundary($line)) {
                    break;
                }
                $sectionLines[] = $line;
            }
        }
        
        // If no content-based extraction worked, try aggressive pattern matching
        if (empty($sectionLines)) {
            return $this->extractSectionByAggressivePatterns($text, $sectionNames);
        }
        
        return !empty($sectionLines) ? implode("\n", $sectionLines) : null;
    }
    
    /**
     * Aggressive section extraction when standard methods fail
     */
    private function extractSectionByAggressivePatterns(string $text, array $sectionNames): ?string
    {
        $lines = explode("\n", $text);
        $sectionLines = [];
        
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;
            
            // Look for any content that might belong to the target section
            foreach ($sectionNames as $sectionName) {
                $sectionLower = strtolower($sectionName);
                
                switch ($sectionLower) {
                    case 'contact':
                    case 'personal':
                        // Look for contact-related content anywhere
                        if ($this->isContactInfo($line) || $this->looksLikeName($line)) {
                            $sectionLines[] = $line;
                        }
                        break;
                        
                    case 'experience':
                    case 'work experience':
                    case 'employment':
                        // Look for job-related content anywhere
                        if ($this->isJobOrCompanyTerm($line) || $this->containsDatePatterns($line)) {
                            $sectionLines[] = $line;
                        }
                        break;
                        
                    case 'education':
                    case 'academic':
                        // Look for education-related content anywhere
                        if ($this->isEducationTerm($line) || $this->containsDatePatterns($line)) {
                            $sectionLines[] = $line;
                        }
                        break;
                        
                    case 'skills':
                    case 'technical skills':
                        // Look for skill-related content anywhere
                        if ($this->isSkillContent($line)) {
                            $sectionLines[] = $line;
                        }
                        break;
                        
                    case 'summary':
                    case 'profile':
                    case 'objective':
                        // Look for summary-like content anywhere
                        if ($this->isSummaryContent($line)) {
                            $sectionLines[] = $line;
                        }
                        break;
                }
            }
        }
        
        return !empty($sectionLines) ? implode("\n", $sectionLines) : null;
    }
    

    
    /**
     * Detect which section a line belongs to based on content patterns
     */
    private function detectSectionFromContent(string $line, array $sectionNames): ?string
    {
        $lineLower = strtolower($line);
        
        foreach ($sectionNames as $sectionName) {
            $sectionLower = strtolower($sectionName);
            
            switch ($sectionLower) {
                case 'contact':
                case 'personal':
                case 'personal information':
                    if ($this->isContactInfo($line)) {
                        return $sectionName;
                    }
                    break;
                    
                case 'experience':
                case 'work experience':
                case 'employment':
                    if ($this->isJobOrCompanyTerm($line)) {
                        return $sectionName;
                    }
                    break;
                    
                case 'education':
                case 'academic':
                case 'qualifications':
                    if ($this->isEducationTerm($line)) {
                        return $sectionName;
                    }
                    break;
                    
                case 'skills':
                case 'technical skills':
                case 'competencies':
                    if ($this->isSkillContent($line)) {
                        return $sectionName;
                    }
                    break;
                    
                case 'summary':
                case 'profile':
                case 'objective':
                    if ($this->isSummaryContent($line)) {
                        return $sectionName;
                    }
                    break;
            }
        }
        
        return null;
    }
    
    /**
     * Check if a line indicates a section boundary
     */
    private function isSectionBoundary(string $line): bool
    {
        $lineLower = strtolower($line);
        
        // Look for common section boundary indicators
        $boundaryPatterns = [
            '/^[A-Z][A-Z\s&\/\-]{2,30}$/', // ALL CAPS sections
            '/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/', // Title Case sections
            '/^\d+[\.\)]\s+[A-Z][a-z\s]+$/', // Numbered sections
            '/^[A-Z][a-z\s]+:$/', // Sections with colons
        ];
        
        foreach ($boundaryPatterns as $pattern) {
            if (preg_match($pattern, $line)) {
                return true;
            }
        }
        
        return false;
    }
    

    
    /**
     * Extract experience section by looking for job-related content patterns
     */
    private function extractExperienceByContent(string $text): ?string
    {
        $lines = explode("\n", $text);
        $experienceLines = [];
        $inExperienceSection = false;
        
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;
            
            // Look for job title patterns
            if ($this->isLikelyJobTitle($line) || $this->isLikelyCompany($line)) {
                $inExperienceSection = true;
            }
            
            // Look for date patterns that suggest work experience
            if ($this->containsDatePatterns($line) && $inExperienceSection) {
                $inExperienceSection = true;
            }
            
            // Look for bullet points or descriptions that suggest job details
            if (preg_match('/^[•\-\*]\s+/u', $line) && $inExperienceSection) {
                $inExperienceSection = true;
            }
            
            if ($inExperienceSection) {
                $experienceLines[] = $line;
            }
        }
        
        return !empty($experienceLines) ? implode("\n", $experienceLines) : null;
    }
    
    /**
     * Extract education section by looking for academic content patterns
     */
    private function extractEducationByContent(string $text): ?string
    {
        $lines = explode("\n", $text);
        $educationLines = [];
        $inEducationSection = false;
        
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;
            
            // Look for degree patterns
            if ($this->isLikelyDegree($line)) {
                $inEducationSection = true;
            }
            
            // Look for university/school patterns
            if ($this->isLikelySchool($line)) {
                $inEducationSection = true;
            }
            
            // Look for date patterns that suggest education
            if ($this->containsDatePatterns($line) && $inEducationSection) {
                $inEducationSection = true;
            }
            
            if ($inEducationSection) {
                $educationLines[] = $line;
            }
        }
        
        return !empty($educationLines) ? implode("\n", $educationLines) : null;
    }
    
    /**
     * Extract skills section by looking for skill-like content patterns
     */
    private function extractSkillsByContent(string $text): ?string
    {
        $lines = explode("\n", $text);
        $skillsLines = [];
        
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;
            
            // Look for comma-separated lists
            if (strpos($line, ',') !== false && strlen($line) < 200) {
                $skillsLines[] = $line;
                continue;
            }
            
            // Look for bullet points with short items
            if (preg_match('/^[•\-\*]\s+/u', $line) && strlen($line) < 100) {
                $skillsLines[] = $line;
                continue;
            }
            
            // Look for single skills (short, technical terms)
            if (strlen($line) < 50 && $this->looksLikeSkill($line)) {
                $skillsLines[] = $line;
            }
        }
        
        return !empty($skillsLines) ? implode("\n", $skillsLines) : null;
    }
    
    /**
     * Extract summary section by looking for narrative content
     */
    private function extractSummaryByContent(string $text): ?string
    {
        return $this->extractUnlabeledSummaryFromText($text);
    }
    
    /**
     * Parse experience entries with enhanced bulleted description support
     * Improved to better handle multiple bullets and pool them together
     */
    private function parseExperienceEntries(string $text): array
    {
        $entries = [];
        
        // Split by job entries (enhanced heuristic)
        $lines = explode("\n", $text);
        $currentEntry = [];
        $descriptionLines = [];
        $inDescription = false;
        $hasStartedDescription = false;
        
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;
            
            // Check if this looks like a job title or company
            if ($this->isLikelyJobTitle($line)) {
                // Save previous entry if exists
                if (!empty($currentEntry)) {
                    $currentEntry['description'] = $this->processDescriptionLines($descriptionLines);
                    $entries[] = $currentEntry;
                }
                $currentEntry = ['title' => $line];
                $descriptionLines = [];
                $inDescription = false;
                $hasStartedDescription = false;
            } elseif (isset($currentEntry['title']) && !isset($currentEntry['company'])) {
                $currentEntry['company'] = $line;
            } elseif (isset($currentEntry['company']) && $this->isLikelyDateEnhanced($line)) {
                $dates = $this->parseDateRange($line);
                $currentEntry['startDate'] = $dates['start'];
                $currentEntry['endDate'] = $dates['end'];
                $inDescription = true; // Start collecting description after dates
                $hasStartedDescription = true;
            } elseif ($inDescription || isset($currentEntry['company'])) {
                // Check if this line looks like it could be part of a bulleted description
                $isBulletLine = $this->isBulletLine($line);
                $isLikelyDescription = $this->isLikelyDescriptionLine($line);
                
                // If we've started collecting description or this looks like a bullet/description
                if ($hasStartedDescription || $isBulletLine || $isLikelyDescription) {
                    $descriptionLines[] = $line;
                    $inDescription = true;
                    $hasStartedDescription = true;
                } elseif ($inDescription) {
                    // Continue collecting if we're already in description mode
                    $descriptionLines[] = $line;
                }
            }
        }
        
        // Save last entry
        if (!empty($currentEntry)) {
            $currentEntry['description'] = $this->processDescriptionLines($descriptionLines);
            $entries[] = $currentEntry;
        }
        
        return $entries;
    }
    
    /**
     * Parse education entries with enhanced bulleted description support
     * Improved to better handle multiple bullets and pool them together
     */
    private function parseEducationEntries(string $text): array
    {
        $entries = [];
        
        // Enhanced education parsing with bulleted description support
        $lines = explode("\n", $text);
        $currentEntry = [];
        $descriptionLines = [];
        $inDescription = false;
        $hasStartedDescription = false;
        
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;
            
            if ($this->isLikelyDegree($line)) {
                // Save previous entry if exists
                if (!empty($currentEntry)) {
                    $currentEntry['description'] = $this->processDescriptionLines($descriptionLines);
                    $entries[] = $currentEntry;
                }
                $currentEntry = ['degree' => $line];
                $descriptionLines = [];
                $inDescription = false;
                $hasStartedDescription = false;
            } elseif (isset($currentEntry['degree']) && !isset($currentEntry['school'])) {
                $currentEntry['school'] = $line;
            } elseif (isset($currentEntry['school']) && $this->isLikelyDateEnhanced($line)) {
                $dates = $this->parseDateRange($line);
                $currentEntry['startDate'] = $dates['start'];
                $currentEntry['endDate'] = $dates['end'];
                $inDescription = true; // Start collecting description after dates
                $hasStartedDescription = true;
            } elseif ($inDescription || isset($currentEntry['school'])) {
                // Check if this line looks like it could be part of a bulleted description
                $isBulletLine = $this->isBulletLine($line);
                $isLikelyDescription = $this->isLikelyEducationDescriptionLine($line);
                
                // If we've started collecting description or this looks like a bullet/description
                if ($hasStartedDescription || $isBulletLine || $isLikelyDescription) {
                    $descriptionLines[] = $line;
                    $inDescription = true;
                    $hasStartedDescription = true;
                } elseif ($inDescription) {
                    // Continue collecting if we're already in description mode
                    $descriptionLines[] = $line;
                }
            }
        }
        
        // Save last entry
        if (!empty($currentEntry)) {
            $currentEntry['description'] = $this->processDescriptionLines($descriptionLines);
            $entries[] = $currentEntry;
        }
        
        return $entries;
    }
    
    /**
     * Process description lines to handle bulleted content properly
     * Enhanced to automatically detect and add asterisks to bullet-like content
     */
    private function processDescriptionLines(array $descriptionLines): string
    {
        if (empty($descriptionLines)) {
            return '';
        }
        
        $processedLines = [];
        $hasBullets = false;
        $bulletCount = 0;
        
        // First pass: detect if we have any explicit bullets
        $hasExplicitBullets = false;
        $explicitBulletCount = 0;
        foreach ($descriptionLines as $line) {
            $line = trim($line);
            if (empty($line)) continue;
            
            if ($this->isBulletLine($line)) {
                $hasExplicitBullets = true;
                $explicitBulletCount++;
            }
        }
        
        // If we have some explicit bullets but not many, try to enhance with auto-detection
        if ($hasExplicitBullets && $explicitBulletCount < 3) {
            $descriptionLines = $this->enhanceWithAutoDetection($descriptionLines);
        } elseif (!$hasExplicitBullets) {
            // If no explicit bullets, try to detect bullet-like content and add asterisks
            $descriptionLines = $this->autoDetectAndAddBullets($descriptionLines);
        }
        
        foreach ($descriptionLines as $line) {
            $line = trim($line);
            if (empty($line)) continue;
            
            // Check if line starts with bullet points (various formats)
            if ($this->isBulletLine($line)) {
                $content = $this->extractBulletContent($line);
                if (!empty($content)) {
                    // Check if this single bullet contains multiple sentences that should be split
                    $splitBullets = $this->splitLongBulletIntoMultiple($content);
                    foreach ($splitBullets as $bullet) {
                        $processedLines[] = '• ' . $bullet;
                        $bulletCount++;
                    }
                    $hasBullets = true;
                }
            } else {
                // Regular text line - only add if we don't have bullets yet
                // or if it's clearly not part of a bullet list
                if (!$hasBullets || $bulletCount === 0) {
                    $processedLines[] = $line;
                } else {
                    // If we already have bullets, treat this as a continuation
                    // of the last bullet point
                    if (!empty($processedLines)) {
                        $lastIndex = count($processedLines) - 1;
                        $processedLines[$lastIndex] .= ' ' . $line;
                    } else {
                        $processedLines[] = $line;
                    }
                }
            }
        }
        
        // If we have bullets, join with newlines to preserve structure
        if ($hasBullets && $bulletCount > 0) {
            return implode("\n", $processedLines);
        } else {
            // If no bullets, join with spaces for regular paragraph
            return implode(' ', $processedLines);
        }
    }
    
    /**
     * Enhance existing bullet list with auto-detection for missing bullets
     */
    private function enhanceWithAutoDetection(array $descriptionLines): array
    {
        if (empty($descriptionLines)) {
            return $descriptionLines;
        }
        
        $processedLines = [];
        $bulletLikeCount = 0;
        $totalLines = count($descriptionLines);
        
        foreach ($descriptionLines as $line) {
            $line = trim($line);
            if (empty($line)) {
                $processedLines[] = $line;
                continue;
            }
            
            // Check if line already has a bullet
            if ($this->isBulletLine($line)) {
                $processedLines[] = $line;
                $bulletLikeCount++;
            } else {
                // Check if this line looks like it should be a bullet point
                if ($this->isLikelyBulletContent($line)) {
                    $bulletLikeCount++;
                    // Add asterisk to the beginning
                    $processedLines[] = '* ' . $line;
                } else {
                    $processedLines[] = $line;
                }
            }
        }
        
        // Only return processed lines if we detected at least 2 bullet-like items
        // or if more than 50% of lines look like bullets
        if ($bulletLikeCount >= 2 || ($totalLines > 0 && $bulletLikeCount / $totalLines > 0.5)) {
            return $processedLines;
        }
        
        // Otherwise, return original lines
        return $descriptionLines;
    }
    
    /**
     * Automatically detect bullet-like content and add asterisks to sentences
     * that look like they should be bullet points
     */
    private function autoDetectAndAddBullets(array $descriptionLines): array
    {
        if (empty($descriptionLines)) {
            return $descriptionLines;
        }
        
        $processedLines = [];
        $bulletLikeCount = 0;
        $totalLines = count($descriptionLines);
        
        foreach ($descriptionLines as $line) {
            $line = trim($line);
            if (empty($line)) {
                $processedLines[] = $line;
                continue;
            }
            
            // Check if this line looks like it should be a bullet point
            if ($this->isLikelyBulletContent($line)) {
                $bulletLikeCount++;
                // Add asterisk to the beginning
                $processedLines[] = '* ' . $line;
            } else {
                $processedLines[] = $line;
            }
        }
        
        // Only return processed lines if we detected at least 2 bullet-like items
        // or if more than 50% of lines look like bullets
        if ($bulletLikeCount >= 2 || ($totalLines > 0 && $bulletLikeCount / $totalLines > 0.5)) {
            return $processedLines;
        }
        
        // Otherwise, return original lines
        return $descriptionLines;
    }
    
    /**
     * Check if a line looks like it should be a bullet point
     */
    private function isLikelyBulletContent(string $line): bool
    {
        $line = trim($line);
        
        // Skip very short lines
        if (strlen($line) < 8) {
            return false;
        }
        
        // Skip lines that look like dates, locations, or other structured data
        if ($this->isLikelyDateEnhanced($line)) {
            return false;
        }
        
        // Skip lines that look like names or titles (all caps, short)
        if (preg_match('/^[A-Z\s]{2,30}$/', $line) && strlen($line) < 30) {
            return false;
        }
        
        // Skip lines that look like contact information
        if (preg_match('/^[\w\.-]+@[\w\.-]+\.\w+$/', $line) || 
            preg_match('/^\+?[\d\s\-\(\)]{10,}$/', $line) ||
            preg_match('/^https?:\/\//', $line)) {
            return false;
        }
        
        // Skip lines that look like addresses or locations
        if (preg_match('/^\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd)/', $line)) {
            return false;
        }
        
        // Check for action words that typically start bullet points
        $actionWords = [
            'managed', 'led', 'developed', 'implemented', 'designed', 'created', 'built', 'improved',
            'optimized', 'increased', 'reduced', 'achieved', 'delivered', 'collaborated', 'mentored',
            'trained', 'supervised', 'analyzed', 'researched', 'maintained', 'supported', 'configured',
            'deployed', 'integrated', 'automated', 'streamlined', 'enhanced', 'established', 'ensures',
            'defines', 'manages', 'responsible', 'oversaw', 'coordinated', 'facilitated', 'executed',
            'administered', 'monitored', 'evaluated', 'planned', 'organized', 'directed', 'handled',
            'processed', 'generated', 'produced', 'completed', 'accomplished', 'performed', 'conducted',
            'assisted', 'helped', 'contributed', 'participated', 'involved', 'engaged', 'worked',
            'operated', 'utilized', 'leveraged', 'applied', 'employed', 'used', 'adopted', 'spearheaded',
            'initiated', 'launched', 'established', 'founded', 'co-founded', 'coached', 'guided',
            'instructed', 'taught', 'presented', 'demonstrated', 'exhibited', 'showcased', 'highlighted',
            'emphasized', 'focused', 'specialized', 'concentrated', 'dedicated', 'committed', 'devoted',
            'solved', 'resolved', 'addressed', 'tackled', 'overcame', 'conquered', 'mastered', 'excelled',
            'exceeded', 'surpassed', 'outperformed', 'dominated', 'led', 'headed', 'chaired', 'presided',
            'governed', 'controlled', 'regulated', 'supervised', 'oversaw', 'managed', 'administered'
        ];
        
        $lineLower = strtolower($line);
        
        // Check if line starts with an action word
        foreach ($actionWords as $actionWord) {
            if (strpos($lineLower, $actionWord) === 0) {
                return true;
            }
        }
        
        // Check for common bullet patterns
        // Lines that start with capital letters and contain action-like content
        if (preg_match('/^[A-Z][a-z]+.*(?:ed|ing|s|tion|sion|ment|ance|ence)\b/', $line)) {
            return true;
        }
        
        // Lines that contain colons (common in job descriptions)
        if (strpos($line, ':') !== false && strlen($line) > 15) {
            return true;
        }
        
        // Lines that contain numbers or percentages (achievements)
        if (preg_match('/\d+%|\d+\+|\d+x|\$\d+|\d+\s*(?:years?|months?|days?|hours?|times?|fold)/', $line)) {
            return true;
        }
        
        // Lines that contain technology keywords
        $techKeywords = [
            'api', 'database', 'framework', 'library', 'tool', 'software', 'system', 'platform',
            'application', 'website', 'mobile', 'web', 'cloud', 'server', 'client', 'frontend',
            'backend', 'full-stack', 'devops', 'agile', 'scrum', 'methodology', 'process',
            'workflow', 'pipeline', 'deployment', 'testing', 'quality', 'security', 'performance',
            'javascript', 'python', 'java', 'php', 'react', 'angular', 'vue', 'node', 'sql',
            'mysql', 'postgresql', 'mongodb', 'redis', 'docker', 'kubernetes', 'aws', 'azure',
            'gcp', 'git', 'github', 'gitlab', 'jenkins', 'ci/cd', 'rest', 'graphql', 'microservices'
        ];
        
        foreach ($techKeywords as $keyword) {
            if (strpos($lineLower, $keyword) !== false) {
                return true;
            }
        }
        
        // Lines that contain business/achievement keywords
        $businessKeywords = [
            'revenue', 'profit', 'sales', 'growth', 'efficiency', 'productivity', 'cost', 'budget',
            'roi', 'kpi', 'metrics', 'analytics', 'reporting', 'dashboard', 'insights', 'strategy',
            'planning', 'execution', 'implementation', 'rollout', 'launch', 'campaign', 'project',
            'initiative', 'program', 'team', 'department', 'organization', 'company', 'client',
            'customer', 'user', 'stakeholder', 'vendor', 'partner', 'collaboration', 'cooperation'
        ];
        
        foreach ($businessKeywords as $keyword) {
            if (strpos($lineLower, $keyword) !== false) {
                return true;
            }
        }
        
        // Lines that are reasonably long and contain sentence-like structure - increased limit
        if (strlen($line) > 25 && strlen($line) < 800) {
            // Check if it contains sentence-like structure
            if (preg_match('/[.!?]$/', $line) || 
                preg_match('/\b(and|or|but|with|for|in|on|at|by|to|from|of|the|a|an)\b/', $line) ||
                preg_match('/\b(that|which|who|where|when|how|why|what)\b/', $line)) {
                return true;
            }
        }
        
        // Lines that start with common bullet-like patterns
        if (preg_match('/^(Responsible|Duties|Tasks|Key|Main|Primary|Secondary|Additional|Other)/i', $line)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Split a long bullet point into multiple bullets based on sentence structure
     */
    private function splitLongBulletIntoMultiple(string $content): array
    {
        // If the content is short, don't split it
        if (strlen($content) < 80) {
            return [$content];
        }
        
        $bullets = [];
        
        // First, try to split on colons (common pattern for job descriptions)
        // Look for patterns like "Designs Applications: Creates applications..."
        if (preg_match_all('/([A-Z][^:]*):\s*([^.!?]*[.!?]?)/', $content, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $title = trim($match[1]);
                $description = trim($match[2]);
                if (!empty($description)) {
                    $bullets[] = $title . ': ' . $description;
                }
            }
            // If we found colon splits, return them
            if (!empty($bullets)) {
                return $bullets;
            }
        }
        
        // Try to split on semicolons (common in long bullet points)
        if (strpos($content, ';') !== false) {
            $parts = explode(';', $content);
            $cleanParts = [];
            foreach ($parts as $part) {
                $part = trim($part);
                if (!empty($part) && strlen($part) > 10) {
                    $cleanParts[] = $part;
                }
            }
            if (count($cleanParts) > 1) {
                return $cleanParts;
            }
        }
        
        // Try to split on sentence boundaries with action words
        $actionWords = [
            'managed', 'led', 'developed', 'implemented', 'designed', 'created', 'built', 'improved', 
            'optimized', 'increased', 'reduced', 'achieved', 'delivered', 'collaborated', 'mentored', 
            'trained', 'supervised', 'analyzed', 'researched', 'maintained', 'supported', 'configured', 
            'deployed', 'integrated', 'automated', 'streamlined', 'enhanced', 'established', 'ensures',
            'defines', 'manages', 'responsible', 'oversaw', 'coordinated', 'facilitated', 'executed',
            'administered', 'monitored', 'evaluated', 'planned', 'organized', 'directed', 'handled',
            'processed', 'generated', 'produced', 'completed', 'accomplished', 'performed', 'conducted',
            'assisted', 'helped', 'contributed', 'participated', 'involved', 'engaged', 'worked',
            'operated', 'utilized', 'leveraged', 'applied', 'employed', 'used', 'adopted', 'spearheaded',
            'initiated', 'launched', 'established', 'founded', 'co-founded', 'coached', 'guided',
            'instructed', 'taught', 'presented', 'demonstrated', 'exhibited', 'showcased', 'highlighted'
        ];
        
        // Look for patterns like "Action Word: Description" or "Action Word Description"
        $pattern = '/(' . implode('|', $actionWords) . ')[:\s]+([^.!?]*[.!?]?)/i';
        if (preg_match_all($pattern, $content, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $action = trim($match[1]);
                $description = trim($match[2]);
                if (!empty($description) && strlen($description) > 10) {
                    $bullets[] = ucfirst($action) . ': ' . $description;
                }
            }
            if (!empty($bullets)) {
                return $bullets;
            }
        }
        
        // Try to split on common conjunctions and transitions
        $splitPatterns = [
            '/\s+and\s+(?=[A-Z])/i',  // Split on "and" followed by capital letter
            '/\s+or\s+(?=[A-Z])/i',   // Split on "or" followed by capital letter
            '/\s+but\s+(?=[A-Z])/i',  // Split on "but" followed by capital letter
            '/\s+also\s+(?=[A-Z])/i', // Split on "also" followed by capital letter
            '/\s+additionally\s+(?=[A-Z])/i', // Split on "additionally" followed by capital letter
            '/\s+furthermore\s+(?=[A-Z])/i',  // Split on "furthermore" followed by capital letter
        ];
        
        foreach ($splitPatterns as $pattern) {
            if (preg_match($pattern, $content)) {
                $parts = preg_split($pattern, $content);
                $cleanParts = [];
                foreach ($parts as $part) {
                    $part = trim($part);
                    if (!empty($part) && strlen($part) > 15) {
                        $cleanParts[] = $part;
                    }
                }
                if (count($cleanParts) > 1) {
                    return $cleanParts;
                }
            }
        }
        
        // Try to split on sentence boundaries
        $sentences = preg_split('/([.!?])\s+/', $content, -1, PREG_SPLIT_DELIM_CAPTURE);
        if (count($sentences) > 2) {
            $bullets = [];
            for ($i = 0; $i < count($sentences); $i += 2) {
                $sentence = trim($sentences[$i]);
                if ($i + 1 < count($sentences)) {
                    $sentence .= $sentences[$i + 1]; // Add the punctuation
                }
                if (!empty($sentence) && strlen($sentence) > 20) {
                    $bullets[] = $sentence;
                }
            }
            if (count($bullets) > 1) {
                return $bullets;
            }
        }
        
        // If all else fails, return the original content as a single bullet
        return [$content];
    }
    
    /**
     * Check if a line looks like a bullet point
     */
    private function isBulletLine(string $line): bool
    {
        $line = trim($line);
        return preg_match('/^[•\-\*]\s+/u', $line) ||
               preg_match('/^\d+\.\s+/', $line) ||
               preg_match('/^[a-z]\)\s+/i', $line) ||
               preg_match('/^[ivx]+\)\s+/i', $line) ||
               preg_match('/^[A-Z][\.\)]\s+/', $line) ||
               preg_match('/^\s+[•\-\*]\s+/u', $line) ||
               preg_match('/^\s+\d+\.\s+/', $line) ||
               preg_match('/^\s+[a-z]\)\s+/i', $line) ||
               preg_match('/^\s+[A-Z][\.\)]\s+/', $line) ||
               preg_match('/^\s+[ivx]+\)\s+/i', $line) ||
               preg_match('/^[▪▫▸▹▻▽▼]\s+/u', $line) ||
               preg_match('/^\s+[▪▫▸▹▻▽▼]\s+/u', $line);
    }
    
    /**
     * Extract content after bullet point
     */
    private function extractBulletContent(string $line): string
    {
        // Remove bullet point and return content
        return trim(preg_replace('/^[•\-\*]\s+/', '', 
                preg_replace('/^\d+\.\s+/', '', 
                preg_replace('/^[a-z]\)\s+/i', '', 
                preg_replace('/^[A-Z][\.\)]\s+/', '', 
                preg_replace('/^[ivx]+\)\s+/i', '', 
                preg_replace('/^\s+[•\-\*]\s+/', '', 
                preg_replace('/^\s+\d+\.\s+/', '', 
                preg_replace('/^\s+[a-z]\)\s+/i', '', 
                preg_replace('/^\s+[A-Z][\.\)]\s+/', '', 
                preg_replace('/^\s+[ivx]+\)\s+/i', '', 
                preg_replace('/^[▪▫▸▹▻▽▼]\s+/', '', 
                preg_replace('/^\s+[▪▫▸▹▻▽▼]\s+/', '', $line)))))))))))));
    }
    
    /**
     * Check if a line looks like it could be part of a description
     */
    private function isLikelyDescriptionLine(string $line): bool
    {
        $line = trim($line);
        
        // Skip very short lines
        if (strlen($line) < 8) return false;
        
        // Skip lines that look like dates, locations, or other structured data
        if ($this->isLikelyDateEnhanced($line)) return false;
        if (preg_match('/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/', $line)) return false; // Likely company/school name
        
        // Skip contact information
        if (preg_match('/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i', $line)) return false;
        if (preg_match('/\+?\d[\d\s().-]{7,}\d/', $line)) return false;
        
        // Look for action words that suggest job responsibilities
        $actionWords = [
            'developed', 'created', 'built', 'implemented', 'designed', 'managed', 'led', 'coordinated',
            'improved', 'optimized', 'increased', 'reduced', 'achieved', 'delivered', 'collaborated',
            'mentored', 'trained', 'supervised', 'analyzed', 'researched', 'maintained', 'supported',
            'configured', 'deployed', 'integrated', 'automated', 'streamlined', 'enhanced', 'established',
            'spearheaded', 'initiated', 'launched', 'founded', 'co-founded', 'coached', 'guided',
            'instructed', 'taught', 'presented', 'demonstrated', 'exhibited', 'showcased', 'highlighted',
            'solved', 'resolved', 'addressed', 'tackled', 'overcame', 'conquered', 'mastered', 'excelled',
            'exceeded', 'surpassed', 'outperformed', 'dominated', 'headed', 'chaired', 'presided',
            'governed', 'controlled', 'regulated', 'administered', 'monitored', 'evaluated', 'planned',
            'organized', 'directed', 'handled', 'processed', 'generated', 'produced', 'completed',
            'accomplished', 'performed', 'conducted', 'assisted', 'helped', 'contributed', 'participated',
            'involved', 'engaged', 'worked', 'operated', 'utilized', 'leveraged', 'applied', 'employed',
            'used', 'adopted', 'responsible', 'oversaw', 'facilitated', 'executed'
        ];
        
        $lineLower = strtolower($line);
        foreach ($actionWords as $action) {
            if (strpos($lineLower, $action) === 0) {
                return true;
            }
        }
        
        // Look for common description patterns
        if (preg_match('/^(responsibilities|duties|achievements|accomplishments|projects?|key|main|primary|secondary|additional|other):/i', $line)) {
            return true;
        }
        
        // Look for lines that contain professional keywords
        $professionalKeywords = [
            'team', 'project', 'system', 'application', 'solution', 'service', 'industry',
            'client', 'customer', 'user', 'stakeholder', 'vendor', 'partner', 'collaboration',
            'revenue', 'profit', 'sales', 'growth', 'efficiency', 'productivity', 'cost', 'budget',
            'roi', 'kpi', 'metrics', 'analytics', 'reporting', 'dashboard', 'insights', 'strategy',
            'planning', 'execution', 'implementation', 'rollout', 'launch', 'campaign', 'initiative',
            'program', 'department', 'organization', 'company', 'technology', 'software', 'hardware',
            'database', 'framework', 'library', 'tool', 'platform', 'cloud', 'server', 'client',
            'frontend', 'backend', 'full-stack', 'devops', 'agile', 'scrum', 'methodology', 'process'
        ];
        
        $keywordCount = 0;
        foreach ($professionalKeywords as $keyword) {
            if (strpos($lineLower, $keyword) !== false) {
                $keywordCount++;
            }
        }
        
        // If line contains professional keywords and has reasonable length - increased limit
        if ($keywordCount >= 1 && strlen($line) >= 20 && strlen($line) <= 800) {
            return true;
        }
        
        // Look for lines that contain numbers or percentages (achievements)
        if (preg_match('/\d+%|\d+\+|\d+x|\$\d+|\d+\s*(?:years?|months?|days?|hours?|times?|fold)/', $line)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Check if a line looks like it could be part of an education description
     */
    private function isLikelyEducationDescriptionLine(string $line): bool
    {
        $line = trim($line);
        
        // Skip very short lines
        if (strlen($line) < 8) return false;
        
        // Skip lines that look like dates, locations, or other structured data
        if ($this->isLikelyDateEnhanced($line)) return false;
        if (preg_match('/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/', $line)) return false; // Likely school name
        
        // Look for education-related action words and patterns
        $educationWords = [
            'graduated', 'completed', 'studied', 'major', 'minor', 'concentration', 'specialization',
            'gpa', 'grade point average', 'honors', 'dean\'s list', 'magna cum laude', 'summa cum laude',
            'relevant coursework', 'thesis', 'dissertation', 'research', 'project', 'internship',
            'scholarship', 'award', 'certificate', 'diploma', 'degree', 'bachelor', 'master', 'phd'
        ];
        
        $lineLower = strtolower($line);
        foreach ($educationWords as $word) {
            if (strpos($lineLower, $word) !== false) {
                return true;
            }
        }
        
        // Look for common education description patterns
        if (preg_match('/^(relevant coursework|honors|awards|projects?|research|thesis):/i', $line)) {
            return true;
        }
        
        // Look for GPA patterns
        if (preg_match('/gpa[:\s]*\d+\.\d+/i', $line)) {
            return true;
        }
        
        return false;
    }

    /**
     * Check if a line looks like a certification
     */
    private function isLikelyCertificationLine(string $line): bool
    {
        $line = trim($line);
        
        // Skip very short lines
        if (strlen($line) < 5) return false;
        
        // Skip lines that look like dates, locations, or other structured data
        if ($this->isLikelyDateEnhanced($line)) return false;
        if (preg_match('/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/', $line)) return false; // Likely name
        
        // Look for certification-specific keywords
        $certKeywords = [
            'certificate', 'certification', 'certified', 'license', 'licensed', 'credential', 
            'accreditation', 'diploma', 'badge', 'issued by', 'expires', 'valid until',
            'aws', 'azure', 'google', 'microsoft', 'ibm', 'oracle', 'cisco', 'comptia',
            'pmp', 'scrum', 'agile', 'six sigma', 'lean', 'itil', 'cissp', 'ceh'
        ];
        
        $lineLower = strtolower($line);
        foreach ($certKeywords as $keyword) {
            if (strpos($lineLower, $keyword) !== false) {
                return true;
            }
        }
        
        // Check for common certification patterns
        if (preg_match('/\b[A-Z]{2,}\b/', $line)) return true; // Contains acronyms (AWS, IBM, etc.)
        if (preg_match('/\d+\.\d+/', $line)) return true; // Contains version numbers
        if (preg_match('/\b(professional|associate|expert|foundation|essentials|practitioner)\b/i', $line)) return true;
        
        return true; // Default to true for certification lines
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
     * Enhanced to automatically detect and add asterisks to bullet-like content
     */
    private function parseCertificationsList(string $text): array
    {
        $lines = explode("\n", $text);
        $certifications = [];
        
        // First pass: detect if we have any explicit bullets
        $hasExplicitBullets = false;
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;
            
            if ($this->isBulletLine($line)) {
                $hasExplicitBullets = true;
                break;
            }
        }
        
        // If no explicit bullets, try to detect bullet-like content and add asterisks
        if (!$hasExplicitBullets) {
            $lines = $this->autoDetectAndAddBullets($lines);
        }
        
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;
            
            // Check if this line contains bulleted content
            if ($this->isBulletLine($line)) {
                // Extract content after bullet
                $content = $this->extractBulletContent($line);
                if (!empty($content)) {
                    $certifications[] = $content;
                }
            } else {
                // Regular line - could be a certification or description
                if ($this->isLikelyCertificationLine($line)) {
                    $certifications[] = $line;
                }
            }
        }
        
        return $certifications;
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
               !$this->isLikelyDateEnhanced($line);
    }
    
    private function isLikelyCompany(string $line): bool
    {
        // Basic heuristics for company names
        if (strlen($line) < 2 || strlen($line) > 100) return false;
        if (preg_match('/[0-9@]/', $line)) return false;
        
        // Look for common company indicators
        $companyIndicators = ['inc', 'corp', 'llc', 'ltd', 'company', 'co', '&', 'and'];
        $lineLower = strtolower($line);
        
        foreach ($companyIndicators as $indicator) {
            if (strpos($lineLower, $indicator) !== false) {
                return true;
            }
        }
        
        // Look for capitalization patterns typical of company names
        if (preg_match('/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/', $line)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Check if a line looks like a skill
     */
    private function looksLikeSkill(string $line): bool
    {
        // Skills are typically short, technical terms
        if (strlen($line) < 3 || strlen($line) > 50) return false;
        
        // Should contain letters
        if (!preg_match('/[A-Za-z]/', $line)) return false;
        
        // Should not look like a date
        if ($this->containsDatePatterns($line)) return false;
        
        // Should not look like a name
        if ($this->looksLikeName($line)) return false;
        
        // Should not look like a company
        if ($this->isLikelyCompany($line)) return false;
        
        // Common skill patterns
        $skillPatterns = [
            '/^[A-Za-z]+(?:\s*[+\-]\s*[A-Za-z]+)*$/', // Basic skill format
            '/^[A-Za-z]+\s+\d+\.?\d*$/', // Skill with version number
            '/^[A-Za-z]+\s*\([A-Za-z\s]+\)$/', // Skill with proficiency level
        ];
        
        foreach ($skillPatterns as $pattern) {
            if (preg_match($pattern, $line)) {
                return true;
            }
        }
        
        return true; // Default to true for short technical terms
    }
    
    /**
     * Extract a valid phone number while avoiding dates
     */
    private function extractValidPhoneNumber(string $text): ?string
    {
        // Multiple phone number patterns with validation
        $patterns = [
            // International format with country code
            '/\+?1[\s\-\.]?\(?[0-9]{3}\)?[\s\-\.]?[0-9]{3}[\s\-\.]?[0-9]{4}/',
            // US format: (555) 555-5555 or 555-555-5555
            '/\(?[0-9]{3}\)?[\s\-\.]?[0-9]{3}[\s\-\.]?[0-9]{4}/',
            // International format without country code
            '/\+?[0-9]{1,4}[\s\-\.]?[0-9]{1,4}[\s\-\.]?[0-9]{1,4}[\s\-\.]?[0-9]{1,4}/',
            // Simple 7-15 digit pattern (but validate it's not a date)
            '/\+?[\d\s\(\)\.\-]{7,15}/'
        ];
        
        foreach ($patterns as $pattern) {
            if (preg_match_all($pattern, $text, $matches)) {
                foreach ($matches[0] as $match) {
                    $cleanMatch = trim($match);
                    
                    // Validate this is actually a phone number, not a date
                    if ($this->isValidPhoneNumber($cleanMatch)) {
                        return $cleanMatch;
                    }
                }
            }
        }
        
        return null;
    }
    
    /**
     * Validate if a string is likely a phone number and not a date
     */
    private function isValidPhoneNumber(string $text): bool
    {
        // Remove common phone formatting characters
        $clean = preg_replace('/[\s\(\)\.\-]/', '', $text);
        
        // Must contain digits
        if (!preg_match('/\d/', $clean)) {
            return false;
        }
        
        // Check if it looks like a date pattern
        if ($this->containsDatePatterns($text)) {
            return false;
        }
        
        // Must have reasonable length for a phone number
        $digitCount = preg_match_all('/\d/', $clean);
        if ($digitCount < 7 || $digitCount > 15) {
            return false;
        }
        
        // Should not contain only digits (likely a date)
        if (preg_match('/^\d+$/', $clean) && $digitCount <= 8) {
            return false;
        }
        
        // Should contain some non-digit characters (formatting)
        if (preg_match('/[^\d]/', $text)) {
            return true;
        }
        
        // For all-digit strings, check if they're reasonable phone lengths
        return $digitCount >= 10;
    }
    
    /**
     * Check if text looks like a date pattern
     */
    private function isLikelyDatePattern(string $text): bool
    {
        return $this->containsDatePatterns($text);
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

    private function isLikelySchool(string $line): bool
    {
        return preg_match('/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s*at\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/i', $line);
    }
    
    private function isLikelyDate(string $line): bool
    {
        return $this->isLikelyDateEnhanced($line);
    }
    
    private function parseDateRange(string $dateString): array
    {
        $dates = ['start' => '', 'end' => ''];
        
        // Look for date patterns
        if (preg_match('/(\d{1,2}\/\d{4}|\w+\s+\d{4}|\d{4})\s*[-–]\s*(\d{1,2}\/\d{4}|\w+\s+\d{4}|\d{4}|present|current)/i', $dateString, $matches)) {
            $dates['start'] = $this->parseAndNormalizeDate($matches[1]);
            $dates['end'] = strtolower($matches[2]) === 'present' || strtolower($matches[2]) === 'current' ? '' : $this->parseAndNormalizeDate($matches[2]);
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
        // First, try to detect and fix encoding issues
        if (!mb_check_encoding($text, 'UTF-8')) {
            // Try to convert from various encodings
            $encodings = ['ISO-8859-1', 'Windows-1252', 'ASCII', 'UTF-8'];
            foreach ($encodings as $encoding) {
                if (mb_check_encoding($text, $encoding)) {
                    $text = mb_convert_encoding($text, 'UTF-8', $encoding);
                    break;
                }
            }
        }
        
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
        
        // Additional UTF-8 validation and cleaning
        $converted = preg_replace('/[\x{FFFD}]/u', '', $converted); // Remove replacement characters
        $converted = preg_replace('/[\x{200B}-\x{200D}\x{FEFF}]/u', '', $converted); // Remove zero-width spaces
        
        // Final UTF-8 validation
        if (!mb_check_encoding($converted, 'UTF-8')) {
            // If still invalid, force clean conversion
            $converted = mb_convert_encoding($converted, 'UTF-8', 'UTF-8//IGNORE');
        }
        
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
        
        try {
            $model = config('services.gemini.parser_model', 'gemini-1.5-flash');
            $schema = '{contact:{firstName,lastName,desiredJobTitle,phone,email,country,city,address,postCode},experiences:[{jobTitle,company,location,startDate,endDate,description}],education:[{school,location,degree,startDate,endDate,description}],skills:[{name,level}],summary,languages:[{name,proficiency}],certifications:[{title}],awards:[{title}],websites:[{label,url}],references:[{name,relationship,contactInfo}],hobbies:[string]}';
            
            $prompt = "You are a professional resume parser. Analyze the provided resume text and extract structured information.\n\n" .
                     "Output rules:\n" .
                     "- Output ONLY valid JSON conforming to this schema: $schema\n" .
                     "- Do not invent or hallucinate information. Extract only what is clearly present in the resume.\n" .
                     "- For dates, preserve the original format (e.g., 'Jan 2020', '2021', 'Present')\n" .
                     "- For skills, extract both the skill name and proficiency level if available\n" .
                     "- For experiences and education, extract ALL available details including descriptions\n" .
                     "- CRITICAL: For experience and education descriptions, preserve ALL bullet points and list items exactly as they appear\n" .
                     "- If descriptions contain bullet points (•, -, *, numbers, letters), preserve the complete structure\n" .
                     "- Do not truncate or cut off bullet point lists - include ALL items in the description field\n" .
                     "- For summary section, look for various headings like 'Profile Summary', 'Resume Summary', 'Professional Summary', 'Career Objective', 'About Me', 'Personal Statement', etc.\n" .
                     "- Extract the complete summary content even if it spans multiple paragraphs or lines\n" .
                     "- If a section is not present, omit it from the output\n" .
                     "- Ensure all text is properly cleaned and formatted\n\n" .
                     "Resume text to analyze:\n\n" . $cleanText;
            
            $response = $this->gemini->generateText($prompt, $model, [
                'response_mime_type' => 'application/json',
                'maxOutputTokens' => config('resume.parsing.ai_parsing.max_output_tokens', 8192),
                'temperature' => config('resume.parsing.ai_parsing.temperature', 0.1),
                'topP' => config('resume.parsing.ai_parsing.top_p', 0.1),
            ]);
            
            if (!is_array($response)) {
                return [];
            }
            
            $jsonText = $this->extractJsonFromGeminiResponse($response);
            if (!$jsonText) {
                return [];
            }
            
            // Sanitize the JSON text before decoding
            $jsonText = $this->sanitizeUtf8($jsonText);
            
            $decoded = json_decode($jsonText, true);
            if (!is_array($decoded)) {
                Log::warning('Failed to decode Gemini response JSON: ' . json_last_error_msg());
                return [];
            }
            
            // Normalize AI output to expected schema
            return $this->normalizeAiSchema($decoded);
            
        } catch (\Exception $e) {
            Log::warning('LLM resume parsing failed: ' . $e->getMessage());
            return [];
        }
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
        $remainingSkills = [];
        foreach ($ai['skills'] ?? [] as $skill) {
            $name = is_array($skill) ? ($skill['name'] ?? '') : (string)$skill;
            $nameL = strtolower($name);
            $isOrgLike = $this->containsDatePatterns($name) || array_reduce($keywords, function($carry, $kw) use ($nameL) { return $carry || strpos($nameL, $kw) !== false; }, false);
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
        // Remove leading bullet/list markers (using safe Unicode ranges)
        $value = preg_replace('/^([•\-\*]+)\s*/u', '', $value);
        // Remove bullet-like characters anywhere (using safe Unicode ranges)
        $value = preg_replace('/[•\-\*]/u', '', $value);
        // Remove emojis and pictographs (using safe Unicode ranges)
        $value = preg_replace('/[\x{1F300}-\x{1F5FF}]/u', '', $value);
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
            $isValidShape = (mb_strlen($name) <= 50) && preg_match('/[A-Za-z]/', $name) && !$this->containsDatePatterns($name);
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
    
    /**
     * Calculate enhanced parsing confidence score with quality metrics
     */
    public function calculateEnhancedParsingConfidence(array $parsedData): array
    {
        $confidence = [
            'overall_score' => 0,
            'sections_found' => [],
            'missing_sections' => [],
            'suggestions' => [],
            'quality_metrics' => [
                'completeness' => 0,
                'accuracy' => 0,
                'structure' => 0,
                'field_coverage' => 0,
                'data_quality' => 0
            ],
            'section_details' => []
        ];
        
        $totalSections = 0;
        $foundSections = 0;
        $totalFields = 0;
        $foundFields = 0;
        $sectionScores = [];
        
        // Check each section with enhanced scoring
        foreach ($this->sectionMappings as $sectionName => $config) {
        $totalSections++;
            $sectionScore = $this->calculateSectionScore($parsedData, $sectionName, $config);
            $sectionScores[$sectionName] = $sectionScore;
            
            if ($sectionScore['found'] > 0) {
            $foundSections++;
                $confidence['sections_found'][] = ucfirst($sectionName);
                $confidence['section_details'][$sectionName] = $sectionScore;
        } else {
                $confidence['missing_sections'][] = ucfirst($sectionName);
            }
            
            $totalFields += $sectionScore['total_fields'];
            $foundFields += $sectionScore['found_fields'];
        }
        
        // Calculate overall score with weighted approach
        $confidence['overall_score'] = $this->calculateWeightedScore($sectionScores);
        
        // Calculate quality metrics
        $confidence['quality_metrics']['completeness'] = $foundSections / max(1, $totalSections);
        $confidence['quality_metrics']['field_coverage'] = $foundFields / max(1, $totalFields);
        $confidence['quality_metrics']['structure'] = $this->calculateStructureScore($parsedData);
        $confidence['quality_metrics']['accuracy'] = $this->calculateAccuracyScore($parsedData);
        $confidence['quality_metrics']['data_quality'] = $this->calculateDataQualityScore($parsedData);
        
        // Generate targeted suggestions based on missing sections and quality
        $confidence['suggestions'] = $this->generateTargetedSuggestions($confidence, $parsedData);
        
        return $confidence;
    }
    
    /**
     * Calculate score for a specific section
     */
    private function calculateSectionScore(array $parsedData, string $sectionName, array $config): array
    {
        $score = [
            'found' => 0,
            'total_fields' => 0,
            'found_fields' => 0,
            'required_fields' => 0,
            'found_required' => 0,
            'quality_score' => 0
        ];
        
        $sectionData = $parsedData[$sectionName] ?? null;
        
        if (empty($sectionData)) {
            return $score;
        }
        
        // Check if section has content
        if ($this->hasSectionContent($sectionData, $sectionName)) {
            $score['found'] = 1;
        }
        
        // Count fields
        $score['total_fields'] = count($config['required_fields']) + count($config['optional_fields']);
        $score['required_fields'] = count($config['required_fields']);
        
        // Check required fields
        foreach ($config['required_fields'] as $field) {
            if ($this->hasFieldContent($sectionData, $field, $sectionName)) {
                $score['found_required']++;
            }
        }
        
        // Check optional fields
        foreach ($config['optional_fields'] as $field) {
            if ($this->hasFieldContent($sectionData, $field, $sectionName)) {
                $score['found_fields']++;
            }
        }
        
        $score['found_fields'] += $score['found_required'];
        
        // Calculate quality score
        $score['quality_score'] = $this->calculateFieldQualityScore($sectionData, $sectionName);
        
        return $score;
    }
    
    /**
     * Check if a section has meaningful content
     */
    private function hasSectionContent($sectionData, string $sectionName): bool
    {
        if (empty($sectionData)) {
            return false;
        }
        
        switch ($sectionName) {
            case 'contact':
                return !empty($sectionData['email']) || !empty($sectionData['phone']);
                
            case 'summary':
                return !empty($sectionData) && strlen(trim($sectionData)) > 10;
                
            case 'experiences':
            case 'education':
            case 'skills':
            case 'languages':
            case 'certifications':
            case 'awards':
            case 'websites':
            case 'references':
            case 'hobbies':
                return is_array($sectionData) && count($sectionData) > 0;
                
            default:
                return !empty($sectionData);
        }
    }
    
    /**
     * Check if a specific field has content
     */
    private function hasFieldContent($sectionData, string $field, string $sectionName): bool
    {
        if (empty($sectionData)) {
            return false;
        }
        
        if ($sectionName === 'summary') {
            return !empty($sectionData);
        }
        
        if (is_array($sectionData)) {
            if (isset($sectionData[$field])) {
                return !empty($sectionData[$field]);
            }
            
            // For array sections, check if any item has the field
            if (in_array($sectionName, ['experiences', 'education', 'skills', 'languages', 'certifications', 'awards', 'websites', 'references'])) {
                foreach ($sectionData as $item) {
                    if (is_array($item) && isset($item[$field]) && !empty($item[$field])) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    /**
     * Calculate field quality score
     */
    private function calculateFieldQualityScore($sectionData, string $sectionName): float
    {
        if (empty($sectionData)) {
            return 0.0;
        }
        
        $qualityScore = 0.0;
        $totalChecks = 0;
        
        switch ($sectionName) {
            case 'contact':
                $qualityScore += $this->validateEmail($sectionData['email'] ?? '') ? 1.0 : 0.0;
                $qualityScore += $this->validatePhone($sectionData['phone'] ?? '') ? 1.0 : 0.0;
                $totalChecks = 2;
                break;
                
            case 'experiences':
            case 'education':
                if (is_array($sectionData)) {
                    foreach ($sectionData as $item) {
                        if (is_array($item)) {
                            $qualityScore += $this->validateDate($item['startDate'] ?? '') ? 0.5 : 0.0;
                            $qualityScore += $this->validateDate($item['endDate'] ?? '') ? 0.5 : 0.0;
                            $totalChecks += 1;
                        }
                    }
                }
                break;
                
            case 'skills':
                if (is_array($sectionData)) {
                    foreach ($sectionData as $skill) {
                        if (is_array($skill) && !empty($skill['name'])) {
                            $qualityScore += 1.0;
                            $totalChecks += 1;
                        }
                    }
                }
                break;
        }
        
        return $totalChecks > 0 ? $qualityScore / $totalChecks : 0.0;
    }
    
    /**
     * Calculate weighted overall score
     */
    private function calculateWeightedScore(array $sectionScores): int
    {
        $totalWeight = 0;
        $weightedSum = 0;
        
        foreach ($sectionScores as $sectionName => $score) {
            $weight = $this->sectionMappings[$sectionName]['priority'];
            $totalWeight += $weight;
            
            $sectionValue = $score['found'] * 100;
            if ($score['found'] > 0) {
                $sectionValue += ($score['found_required'] / max(1, $score['required_fields'])) * 50;
                $sectionValue += $score['quality_score'] * 50;
            }
            
            $weightedSum += $sectionValue * $weight;
        }
        
        return $totalWeight > 0 ? round($weightedSum / $totalWeight) : 0;
    }
    
    /**
     * Calculate structure score
     */
    private function calculateStructureScore(array $parsedData): float
    {
        $structureScore = 0.0;
        $totalChecks = 0;
        
        // Check if required sections exist
        $requiredSections = ['contact', 'experiences', 'education', 'skills'];
        foreach ($requiredSections as $section) {
            $structureScore += !empty($parsedData[$section]) ? 1.0 : 0.0;
            $totalChecks++;
        }
        
        // Check data consistency
        $structureScore += $this->checkDataConsistency($parsedData);
        $totalChecks++;
        
        return $totalChecks > 0 ? $structureScore / $totalChecks : 0.0;
    }
    
    /**
     * Calculate accuracy score
     */
    private function calculateAccuracyScore(array $parsedData): float
    {
        $accuracyScore = 0.0;
        $totalChecks = 0;
        
        // Check email format
        if (!empty($parsedData['contact']['email'])) {
            $accuracyScore += $this->validateEmail($parsedData['contact']['email']) ? 1.0 : 0.0;
            $totalChecks++;
        }
        
        // Check phone format
        if (!empty($parsedData['contact']['phone'])) {
            $accuracyScore += $this->validatePhone($parsedData['contact']['phone']) ? 1.0 : 0.0;
            $totalChecks++;
        }
        
        // Check date formats
        $dateSections = ['experiences', 'education'];
        foreach ($dateSections as $section) {
            if (!empty($parsedData[$section])) {
                foreach ($parsedData[$section] as $item) {
                    if (is_array($item)) {
                        $accuracyScore += $this->validateDate($item['startDate'] ?? '') ? 0.5 : 0.0;
                        $accuracyScore += $this->validateDate($item['endDate'] ?? '') ? 0.5 : 0.0;
                        $totalChecks += 1;
                    }
                }
            }
        }
        
        return $totalChecks > 0 ? $accuracyScore / $totalChecks : 0.0;
    }
    
    /**
     * Calculate data quality score
     */
    private function calculateDataQualityScore(array $parsedData): float
    {
        $qualityScore = 0.0;
        $totalChecks = 0;
        
        // Check for empty or placeholder data
        $sections = ['contact', 'experiences', 'education', 'skills'];
        foreach ($sections as $section) {
            if (!empty($parsedData[$section])) {
                $qualityScore += $this->assessDataQuality($parsedData[$section], $section);
                $totalChecks++;
            }
        }
        
        return $totalChecks > 0 ? $qualityScore / $totalChecks : 0.0;
    }
    
    /**
     * Check data consistency across sections
     */
    private function checkDataConsistency(array $parsedData): float
    {
        $consistencyScore = 0.0;
        $checks = 0;
        
        // Check if contact info is consistent
        if (!empty($parsedData['contact']['email']) && !empty($parsedData['contact']['phone'])) {
            $consistencyScore += 1.0;
            $checks++;
        }
        
        // Check if experiences have consistent structure
        if (!empty($parsedData['experiences'])) {
            $consistentStructure = true;
            foreach ($parsedData['experiences'] as $exp) {
                if (!is_array($exp) || !isset($exp['jobTitle']) || !isset($exp['company'])) {
                    $consistentStructure = false;
                    break;
                }
            }
            $consistencyScore += $consistentStructure ? 1.0 : 0.0;
            $checks++;
        }
        
        return $checks > 0 ? $consistencyScore / $checks : 0.0;
    }
    
    /**
     * Assess data quality for a specific section
     */
    private function assessDataQuality($sectionData, string $sectionName): float
    {
        if (empty($sectionData)) {
            return 0.0;
        }
        
        $qualityScore = 0.0;
        $totalChecks = 0;
        
        switch ($sectionName) {
            case 'contact':
                $qualityScore += !empty($sectionData['firstName']) ? 1.0 : 0.0;
                $qualityScore += !empty($sectionData['lastName']) ? 1.0 : 0.0;
                $qualityScore += !empty($sectionData['desiredJobTitle']) ? 1.0 : 0.0;
                $totalChecks = 3;
                break;
                
            case 'experiences':
            case 'education':
                if (is_array($sectionData)) {
                    foreach ($sectionData as $item) {
                        if (is_array($item)) {
                            $qualityScore += !empty($item['description']) ? 1.0 : 0.0;
                            $totalChecks++;
                        }
                    }
                }
                break;
                
            case 'skills':
                if (is_array($sectionData)) {
                    foreach ($sectionData as $skill) {
                        if (is_array($skill) && !empty($skill['level'])) {
                            $qualityScore += 1.0;
                        }
                        $totalChecks++;
                    }
                }
                break;
        }
        
        return $totalChecks > 0 ? $qualityScore / $totalChecks : 0.0;
    }
    
    /**
     * Generate targeted suggestions based on confidence analysis
     */
    private function generateTargetedSuggestions(array $confidence, array $parsedData): array
    {
        $suggestions = [];
        
        // Section-specific suggestions
        foreach ($confidence['missing_sections'] as $section) {
            $sectionLower = strtolower($section);
            switch ($sectionLower) {
                case 'contact':
                    $suggestions[] = 'Add your contact information including email and phone number.';
                    break;
                case 'experiences':
                    $suggestions[] = 'Include your work experience with job titles, companies, and dates.';
                    break;
                case 'education':
                    $suggestions[] = 'Add your educational background including degrees and institutions.';
                    break;
                case 'skills':
                    $suggestions[] = 'List your technical and soft skills with proficiency levels if possible.';
                    break;
                case 'summary':
                    $suggestions[] = 'Add a professional summary or objective statement.';
                    break;
            }
        }
        
        // Quality-based suggestions
        if ($confidence['quality_metrics']['accuracy'] < 0.5) {
            $suggestions[] = 'Some extracted information may need verification. Please review contact details and dates.';
        }
        
        if ($confidence['quality_metrics']['structure'] < 0.5) {
            $suggestions[] = 'Consider reorganizing your resume with clear section headings for better parsing.';
        }
        
        if ($confidence['quality_metrics']['data_quality'] < 0.5) {
            $suggestions[] = 'Add more detailed descriptions to your experiences and education sections.';
        }
        
        // Overall suggestions
        if ($confidence['overall_score'] < 50) {
            $suggestions[] = 'Low parsing confidence. Consider reformatting your resume with clear section headings.';
        } elseif ($confidence['overall_score'] < 80) {
            $suggestions[] = 'Moderate parsing confidence. Some sections may need manual review and editing.';
        } else {
            $suggestions[] = 'High parsing confidence. Most sections were successfully extracted.';
        }
        
        return array_unique($suggestions);
    }
    
    /**
     * Validate email format
     */
    private function validateEmail(string $email): bool
    {
        return filter_var(trim($email), FILTER_VALIDATE_EMAIL) !== false;
    }
    
    /**
     * Validate phone number format
     */
    private function validatePhone(string $phone): bool
    {
        $cleanPhone = preg_replace('/[\s\(\)\.\-]/', '', $phone);
        return preg_match('/^\+?[\d]{7,15}$/', $cleanPhone);
    }
    
    /**
     * Validate date format
     */
    private function validateDate(string $date): bool
    {
        if (empty($date)) return true; // Empty dates are valid
        
        // Check for common date patterns
        $patterns = [
            '/^\d{4}$/', // Year only
            '/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}$/i', // Month Year
            '/^(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}$/i', // Full month Year
            '/^(present|current|now)$/i', // Present
            '/^\d{1,2}\/\d{4}$/', // MM/YYYY
            '/^\d{1,2}-\d{4}$/' // MM-YYYY
        ];
        
        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $date)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Post-process and organize data for better template mapping
     */
    private function organizeDataForTemplate(array $data): array
    {
        // Ensure all required fields are present and properly formatted
        $data = $this->ensureRequiredFields($data);
        
        // Clean and validate contact information
        $data['contact'] = $this->cleanContactInfo($data['contact']);
        
        // Organize experiences with proper field mapping
        $data['experiences'] = $this->organizeExperiences($data['experiences']);
        
        // Organize education with proper field mapping
        $data['education'] = $this->organizeEducation($data['education']);
        
        // Organize skills with proper structure
        $data['skills'] = $this->organizeSkills($data['skills']);
        
        // Clean and format summary
        $data['summary'] = $this->cleanSummary($data['summary']);
        
        // Ensure all arrays have proper IDs and structure
        $data = $this->ensureArrayStructure($data);
        
        return $data;
    }
    
    /**
     * Ensure all required fields are present
     */
    private function ensureRequiredFields(array $data): array
    {
        // Ensure contact has all required fields
        $requiredContactFields = [
            'firstName', 'lastName', 'desiredJobTitle', 'phone', 'email',
            'country', 'city', 'address', 'postCode'
        ];
        
        foreach ($requiredContactFields as $field) {
            if (!isset($data['contact'][$field])) {
                $data['contact'][$field] = '';
            }
        }
        
        // Ensure all array fields exist
        $arrayFields = ['experiences', 'education', 'skills', 'languages', 'certifications', 'awards', 'websites', 'references', 'hobbies'];
        foreach ($arrayFields as $field) {
            if (!isset($data[$field]) || !is_array($data[$field])) {
                $data[$field] = [];
            }
        }
        
        // Ensure summary exists
        if (!isset($data['summary'])) {
            $data['summary'] = '';
        }
        
        return $data;
    }
    
    /**
     * Clean and validate contact information
     */
    private function cleanContactInfo(array $contact): array
    {
        // Clean and validate each field
        $contact['firstName'] = trim($contact['firstName'] ?? '');
        $contact['lastName'] = trim($contact['lastName'] ?? '');
        $contact['desiredJobTitle'] = trim($contact['desiredJobTitle'] ?? '');
        $contact['phone'] = trim($contact['phone'] ?? '');
        $contact['email'] = trim($contact['email'] ?? '');
        $contact['country'] = trim($contact['country'] ?? '');
        $contact['city'] = trim($contact['city'] ?? '');
        $contact['address'] = trim($contact['address'] ?? '');
        $contact['postCode'] = trim($contact['postCode'] ?? '');
        
        // Try to extract job title from summary if not found
        if (empty($contact['desiredJobTitle'])) {
            $contact['desiredJobTitle'] = $this->extractJobTitleFromSummary($contact['summary'] ?? '');
        }
        
        return $contact;
    }
    
    /**
     * Extract job title from summary text
     */
    private function extractJobTitleFromSummary(string $summary): string
    {
        if (empty($summary)) return '';
        
        // Look for common job title patterns in summary
        $jobTitlePatterns = [
            '/\b(?:I am|I\'m|Experienced|Professional|Skilled|Dedicated)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/',
            '/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Developer|Engineer|Manager|Designer|Analyst|Consultant|Specialist))/',
            '/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+with\s+\d+\s+years?)/'
        ];
        
        foreach ($jobTitlePatterns as $pattern) {
            if (preg_match($pattern, $summary, $matches)) {
                return trim($matches[1]);
            }
        }
        
        return '';
    }
    
    /**
     * Organize experiences with proper field mapping
     */
    private function organizeExperiences(array $experiences): array
    {
        $organized = [];
        
        foreach ($experiences as $index => $exp) {
            $organized[] = [
                'id' => $index + 1,
                'jobTitle' => trim($exp['jobTitle'] ?? $exp['title'] ?? ''),
                'company' => trim($exp['company'] ?? ''),
                'location' => trim($exp['location'] ?? ''),
                'startDate' => trim($exp['startDate'] ?? ''),
                'endDate' => trim($exp['endDate'] ?? ''),
                'description' => trim($exp['description'] ?? '')
            ];
        }
        
        return $organized;
    }
    
    /**
     * Organize education with proper field mapping
     */
    private function organizeEducation(array $education): array
    {
        $organized = [];
        
        foreach ($education as $index => $edu) {
            $organized[] = [
                'id' => $index + 1,
                'school' => trim($edu['school'] ?? ''),
                'location' => trim($edu['location'] ?? ''),
                'degree' => trim($edu['degree'] ?? ''),
                'startDate' => trim($edu['startDate'] ?? ''),
                'endDate' => trim($edu['endDate'] ?? ''),
                'description' => trim($edu['description'] ?? '')
            ];
        }
        
        return $organized;
    }
    
    /**
     * Organize skills with proper structure
     */
    private function organizeSkills(array $skills): array
    {
        $organized = [];
        
        foreach ($skills as $index => $skill) {
            if (is_string($skill)) {
                $organized[] = [
                    'id' => $index + 1,
                    'name' => trim($skill),
                    'level' => ''
                ];
            } elseif (is_array($skill)) {
                $organized[] = [
                    'id' => $index + 1,
                    'name' => trim($skill['name'] ?? ''),
                    'level' => trim($skill['level'] ?? '')
                ];
            }
        }
        
        return $organized;
    }
    
    /**
     * Clean and format summary
     */
    private function cleanSummary(string $summary): string
    {
        $summary = trim($summary);
        
        // Remove excessive whitespace and normalize
        $summary = preg_replace('/\s+/', ' ', $summary);
        
        // Increased limit to allow longer summaries (was 500, now 1000)
        if (strlen($summary) > 1000) {
            $summary = substr($summary, 0, 1000) . '...';
        }
        
        return $summary;
    }
    
    /**
     * Ensure all arrays have proper IDs and structure
     */
    private function ensureArrayStructure(array $data): array
    {
        $arrayFields = ['experiences', 'education', 'skills', 'languages', 'certifications', 'awards', 'websites', 'references', 'hobbies'];
        
        foreach ($arrayFields as $field) {
            if (isset($data[$field]) && is_array($data[$field])) {
                // Ensure each item has an ID
                foreach ($data[$field] as $index => $item) {
                    if (is_array($item)) {
                        $data[$field][$index]['id'] = $index + 1;
                    }
                }
            }
        }
        
        return $data;
    }

    /**
     * Parse resume using Gemini's multimodal capabilities
     */
    private function parseWithGeminiMultimodal(UploadedFile $file, string $filePath): array
    {
        try {
            $fullPath = Storage::disk('local')->path($filePath);
            $fileContent = file_get_contents($fullPath);
            $mimeType = $file->getMimeType();
            
            // Use Gemini to analyze the file directly with full text extraction
            $aiData = $this->parseWithGemini($fileContent, $mimeType);
            
            if (empty($aiData)) {
                return ['success' => false];
            }
            
            // Extract full text for evidence filtering
            $fullText = $aiData['full_text'] ?? '';
            unset($aiData['full_text']); // Remove from data structure
            
            // Post-process and organize data for better template mapping
            $aiData = $this->organizeDataForTemplate($aiData);
            
            // Apply evidence filtering and data cleaning with extracted text
            $aiData = $this->applyEvidenceFilter($aiData, $fullText);
            $aiData = $this->deepCleanStrings($aiData);
            
            // Normalize data for storage
            $aiData = $this->normalizeDataForStorage($aiData);
            
            return [
                'success' => true,
                'data' => $aiData,
                'raw_text' => $fullText,
                'confidence' => $this->calculateEnhancedParsingConfidence($aiData)
            ];
            
        } catch (\Exception $e) {
            Log::error('Gemini multimodal parsing failed: ' . $e->getMessage());
            return ['success' => false];
        }
    }
    
    /**
     * Parse resume using Gemini with single API call (no chunking needed)
     */
    private function parseWithGemini(string $fileContent, string $mimeType): array
    {
        if (!$this->gemini) {
            return [];
        }
        
        try {
            $model = config('services.gemini.parser_model', 'gemini-1.5-flash');
            $schema = '{contact:{firstName,lastName,desiredJobTitle,phone,email,country,city,address,postCode},experiences:[{jobTitle,company,location,startDate,endDate,description}],education:[{school,location,degree,startDate,endDate,description}],skills:[{name,level}],summary,languages:[{name,proficiency}],certifications:[{title}],awards:[{title}],websites:[{label,url}],references:[{name,relationship,contactInfo}],hobbies:[string],full_text:string}';
            
            $prompt = "You are a professional resume parser specialized in multi-page document analysis. Analyze the provided resume file and extract structured information with enhanced accuracy for complex, multi-page resumes.\n\n" .
                     "Multi-Page Analysis Guidelines:\n" .
                     "- Read and analyze ALL pages of the resume document completely\n" .
                     "- Maintain context and continuity across pages when organizing information\n" .
                     "- Pay special attention to section headers that may span across pages\n" .
                     "- Look for continuation of sections (e.g., 'Experience' continued on next page)\n" .
                     "- Identify and properly merge information that appears across multiple pages\n" .
                     "- Be aware that contact information might appear in headers/footers on multiple pages\n" .
                     "- Recognize that skills, education, or experience sections may be split across pages\n\n" .
                     "Output rules:\n" .
                     "- Output ONLY valid JSON conforming to this schema: $schema\n" .
                     "- Do not invent or hallucinate information. Extract only what is clearly present in the resume.\n" .
                     "- For dates, preserve the original format (e.g., 'Jan 2020', '2021', 'Present')\n" .
                     "- For skills, extract both the skill name and proficiency level if available\n" .
                     "- For experiences and education, extract ALL available details including descriptions\n" .
                     "- CRITICAL: For experience and education descriptions, preserve ALL bullet points and list items exactly as they appear\n" .
                     "- If descriptions contain bullet points (•, -, *, numbers, letters), preserve the complete structure\n" .
                     "- Do not truncate or cut off bullet point lists - include ALL items in the description field\n" .
                     "- Pay special attention to bullet points that may be split across pages\n" .
                     "- For summary section, look for various headings like 'Profile Summary', 'Resume Summary', 'Professional Summary', 'Career Objective', 'About Me', 'Personal Statement', etc.\n" .
                     "- Extract the complete summary content even if it spans multiple paragraphs or lines\n" .
                     "- If a section is not present, omit it from the output\n" .
                     "- Ensure all text is properly cleaned and formatted\n" .
                     "- Include the full_text field containing the complete, recognized text from ALL pages of the resume for validation purposes\n\n" .
                     "Enhanced Content Classification Rules:\n" .
                     "- NEVER put email addresses, phone numbers, or contact info in skills section\n" .
                     "- Skills should only contain technical abilities, programming languages, tools, or professional competencies\n" .
                     "- Education terms (like 'Junior-Senior High', 'University', 'College') belong in education section\n" .
                     "- Job titles and company names belong in experience section\n" .
                     "- Contact information should be properly categorized in contact section (check headers/footers on all pages)\n" .
                     "- Summary should contain professional overview, not contact details\n" .
                     "- When sections span multiple pages, ensure complete information is captured\n" .
                     "- Pay attention to page breaks and section continuations\n\n" .
                     "Quality Assurance:\n" .
                     "- Verify that all relevant information from every page is included\n" .
                     "- Check for duplicate information that might appear on multiple pages\n" .
                     "- Ensure chronological order is maintained for experiences and education\n" .
                     "- Validate that section headers are properly recognized across page boundaries\n\n" .
                     "Resume file to analyze:";
            
            // Use Gemini's file processing capabilities
            $response = $this->gemini->generateFromFile($prompt, $fileContent, $mimeType, $model, [
                'response_mime_type' => 'application/json',
                'maxOutputTokens' => config('resume.parsing.ai_parsing.max_output_tokens', 8192),
                'temperature' => config('resume.parsing.ai_parsing.temperature', 0.1),
                'topP' => config('resume.parsing.ai_parsing.top_p', 0.1),
            ]);
            
            if (!is_array($response)) {
                return [];
            }
            
            $jsonText = $this->extractJsonFromGeminiResponse($response);
            if (!$jsonText) {
                return [];
            }
            
            // Sanitize the JSON text before decoding
            $jsonText = $this->sanitizeUtf8($jsonText);
            
            $decoded = json_decode($jsonText, true);
            if (!is_array($decoded)) {
                Log::warning('Failed to decode Gemini response JSON: ' . json_last_error_msg());
                return [];
            }
            
            // Normalize AI output to expected schema
            return $this->normalizeAiSchema($decoded);
            
        } catch (\Exception $e) {
            Log::warning('Gemini resume parsing failed: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Normalize data for storage and template compatibility
     */
    private function normalizeDataForStorage(array $data): array
    {
        // Normalize dates across all sections
        $data = $this->normalizeDates($data);
        
        // Normalize phone numbers
        $data = $this->normalizePhoneNumbers($data);
        
        // Normalize email addresses
        $data = $this->normalizeEmails($data);
        
        // Normalize skill levels
        $data = $this->normalizeSkillLevels($data);
        
        // Ensure consistent data types
        $data = $this->ensureDataTypes($data);
        
        return $data;
    }
    
    /**
     * Normalize date formats across all sections
     */
    private function normalizeDates(array $data): array
    {
        // Normalize experience dates
        if (!empty($data['experiences'])) {
            foreach ($data['experiences'] as &$exp) {
                $exp['startDate'] = $this->parseAndNormalizeDate($exp['startDate'] ?? '');
                $exp['endDate'] = $this->parseAndNormalizeDate($exp['endDate'] ?? '');
            }
        }
        
        // Normalize education dates
        if (!empty($data['education'])) {
            foreach ($data['education'] as &$edu) {
                $edu['startDate'] = $this->parseAndNormalizeDate($edu['startDate'] ?? '');
                $edu['endDate'] = $this->parseAndNormalizeDate($edu['endDate'] ?? '');
            }
        }
        
        return $data;
    }
    
    /**
     * Unified date parsing and normalization utility method
     * This method consolidates all date handling logic and is used by both
     * heuristic parsing and post-processing normalization
     */
    private function parseAndNormalizeDate(string $date): string
    {
        $date = trim($date);
        if (empty($date)) return '';
        
        // Handle "Present", "Current", "Now", "Ongoing", "Active"
        if (preg_match('/\b(present|current|now|ongoing|active)\b/i', $date)) {
            return 'Present';
        }
        
        // Handle year-only dates
        if (preg_match('/^\d{4}$/', $date)) {
            return $date;
        }
        
        // Handle month-year formats (abbreviated)
        if (preg_match('/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{4})$/i', $date, $matches)) {
            $month = ucfirst(strtolower($matches[1]));
            $year = $matches[2];
            return "$month $year";
        }
        
        // Handle full month names
        if (preg_match('/^(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})$/i', $date, $matches)) {
            $month = ucfirst(strtolower($matches[1]));
            $year = $matches[2];
            return "$month $year";
        }
        
        // Handle date ranges with various separators
        if (preg_match('/(.+?)\s*[-–—]\s*(.+)/u', $date, $matches)) {
            $start = $this->parseAndNormalizeDate($matches[1]);
            $end = $this->parseAndNormalizeDate($matches[2]);
            return "$start - $end";
        }
        
        // Handle MM/YYYY format
        if (preg_match('/^(\d{1,2})\/(\d{4})$/', $date, $matches)) {
            $month = (int)$matches[1];
            $year = $matches[2];
            if ($month >= 1 && $month <= 12) {
                $monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return $monthNames[$month] . ' ' . $year;
            }
        }
        
        // Handle MM-YYYY format
        if (preg_match('/^(\d{1,2})-(\d{4})$/', $date, $matches)) {
            $month = (int)$matches[1];
            $year = $matches[2];
            if ($month >= 1 && $month <= 12) {
                $monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return $monthNames[$month] . ' ' . $year;
            }
        }
        
        return $date; // Return as-is if no pattern matches
    }
    
    /**
     * Normalize phone numbers for consistency
     */
    private function normalizePhoneNumbers(array $data): array
    {
        if (!empty($data['contact']['phone'])) {
            $phone = $data['contact']['phone'];
            // Remove extra spaces and normalize formatting
            $phone = preg_replace('/\s+/', ' ', trim($phone));
            $data['contact']['phone'] = $phone;
        }
        
        return $data;
    }
    
    /**
     * Normalize email addresses
     */
    private function normalizeEmails(array $data): array
    {
        if (!empty($data['contact']['email'])) {
            $email = strtolower(trim($data['contact']['email']));
            $data['contact']['email'] = $email;
        }
        
        return $data;
    }
    
    /**
     * Normalize skill levels for consistency
     */
    private function normalizeSkillLevels(array $data): array
    {
        if (!empty($data['skills'])) {
            foreach ($data['skills'] as &$skill) {
                if (isset($skill['level'])) {
                    $level = strtolower(trim($skill['level']));
                    
                    // Standardize common level variations
                    $levelMap = [
                        'beginner' => 'Beginner',
                        'basic' => 'Basic',
                        'intermediate' => 'Intermediate',
                        'moderate' => 'Intermediate',
                        'advanced' => 'Advanced',
                        'expert' => 'Expert',
                        'proficient' => 'Proficient',
                        'skilled' => 'Skilled',
                        'master' => 'Master'
                    ];
                    
                    $skill['level'] = $levelMap[$level] ?? ucfirst($level);
                }
            }
        }
        
        return $data;
    }
    
    /**
     * Ensure consistent data types across all fields
     */
    private function ensureDataTypes(array $data): array
    {
        // Ensure contact fields are strings
        $contactFields = ['firstName', 'lastName', 'desiredJobTitle', 'phone', 'email', 'country', 'city', 'address', 'postCode'];
        foreach ($contactFields as $field) {
            if (isset($data['contact'][$field])) {
                $data['contact'][$field] = (string) $data['contact'][$field];
            }
        }
        
        // Ensure summary is string
        if (isset($data['summary'])) {
            $data['summary'] = (string) $data['summary'];
        }
        
        // Ensure all array fields are arrays
        $arrayFields = ['experiences', 'education', 'skills', 'languages', 'certifications', 'awards', 'websites', 'references', 'hobbies'];
        foreach ($arrayFields as $field) {
            if (!isset($data[$field]) || !is_array($data[$field])) {
                $data[$field] = [];
            }
        }
        
        return $data;
    }
    
    /**
     * Enhanced section extraction with better pattern matching
     */
    private function extractSectionEnhanced(string $text, array $sectionNames): ?string
    {
        // Strategy 1: Look for explicit section headings with enhanced patterns
        $section = $this->extractSectionByEnhancedHeadings($text, $sectionNames);
        if ($section) {
            return $section;
        }
        
        // Strategy 2: Look for implicit sections based on content patterns
        $section = $this->extractSectionByEnhancedContent($text, $sectionNames);
        if ($section) {
            return $section;
        }
        
        return null;
    }
    
    /**
     * Extract section using enhanced heading patterns
     */
    private function extractSectionByEnhancedHeadings(string $text, array $sectionNames): ?string
    {
        // Enhanced heading patterns for better detection
        $headingPatterns = [
            // Standard format: "Section Name:" or "Section Name"
            '/(^|\n)\s*([A-Za-z][A-Za-z&\/\-\s]{2,60})\s*:?[ \t]*?(\n|$)/u',
            // Bold/emphasized sections: "**Section Name**" or "*Section Name*"
            '/(^|\n)\s*[\*\_]+\s*([A-Za-z][A-Za-z&\/\-\s]{2,60})\s*[\*\_]+\s*(\n|$)/u',
            // Underlined sections: "Section Name" with dashes below
            '/(^|\n)\s*([A-Za-z][A-Za-z&\/\-\s]{2,60})\s*\n\s*[-_=]{3,}/u',
            // All caps sections: "SECTION NAME"
            '/(^|\n)\s*([A-Z][A-Z\s&\/\-]{2,60})\s*(\n|$)/u',
            // Sections with numbers: "1. Section Name" or "1) Section Name"
            '/(^|\n)\s*\d+[\.\)]\s*([A-Za-z][A-Za-z&\/\-\s]{2,60})\s*(\n|$)/u',
            // Sections with bullets: "• Section Name" or "- Section Name"
            '/(^|\n)\s*[•\-\*]\s*([A-Za-z][A-Za-z&\/\-\s]{2,60})\s*(\n|$)/u',
            // Sections with special characters: "§ Section Name" or "¶ Section Name"
            '/(^|\n)\s*[§¶]\s*([A-Za-z][A-Za-z&\/\-\s]{2,60})\s*(\n|$)/u'
        ];
        
        // Extract all section names and aliases from knownSectionHeadings
        $allKnownNames = [];
        foreach ($this->knownSectionHeadings as $section => $aliases) {
            if (is_array($aliases)) {
                $allKnownNames = array_merge($allKnownNames, $aliases);
            } else {
                $allKnownNames[] = $aliases;
            }
        }
        
        $allNames = array_unique(array_map('strtolower', array_merge($allKnownNames, $sectionNames)));
        $targetNames = array_map('strtolower', $sectionNames);
        
        $headings = [];
        
        foreach ($headingPatterns as $pattern) {
            if (preg_match_all($pattern, $text, $matches, PREG_OFFSET_CAPTURE)) {
                for ($i = 0; $i < count($matches[2]); $i++) {
                    $label = strtolower(trim($matches[2][$i][0]));
                    if (in_array($label, $allNames, true)) {
                        $headings[] = [
                            'label' => $label,
                            'offset' => $matches[2][$i][1],
                            'pattern' => $pattern
                        ];
                    }
                }
            }
        }
        
        if (empty($headings)) {
            return null;
        }
        
        // Sort headings by position
        usort($headings, function($a, $b) {
            return $a['offset'] - $b['offset'];
        });
        
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
     * Extract section using enhanced content-based pattern matching
     */
    private function extractSectionByEnhancedContent(string $text, array $sectionNames): ?string
    {
        // Enhanced content patterns for section detection
        $contentPatterns = [
            // Contact section patterns
            'contact' => [
                '/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', // Email
                '/\+?[\d\s\(\)\.\-]{7,15}/', // Phone
                '/^(Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)\s+[A-Z][a-z]+/i' // Title + Name
            ],
            // Experience section patterns
            'experience' => [
                '/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\b/i', // Dates
                '/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Developer|Engineer|Manager|Designer|Analyst|Consultant|Specialist|Coordinator|Director|Lead|Architect|Administrator|Supervisor|Representative|Assistant)/', // Job titles
                '/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+at\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/i' // "Title at Company" format
            ],
            // Education section patterns
            'education' => [
                '/\b(?:Bachelor|Master|PhD|MBA|BSc|MSc|BA|MA|Associate|Diploma|Certificate)\b/i', // Degrees
                '/\b(?:University|College|Institute|School|Academy)\b/i', // Institutions
                '/\b(?:Computer Science|Engineering|Business|Arts|Science|Technology)\b/i' // Fields of study
            ],
            // Skills section patterns
            'skills' => [
                '/\b(?:PHP|Laravel|React|JavaScript|Python|Java|HTML|CSS|SQL|Git|Docker|AWS|Azure|Linux|Windows|MacOS)\b/i', // Technical skills
                '/\b(?:Project Management|Leadership|Communication|Problem Solving|Teamwork|Agile|Scrum)\b/i' // Soft skills
            ]
        ];
        
        // For now, return null as this is a fallback method
        // The main extraction should use the heading-based approach
        return null;
    }
    
    /**
     * Extract experience section with enhanced content analysis
     */
    private function extractExperienceByEnhancedContent(string $text): ?string
    {
        $lines = explode("\n", $text);
        $experienceLines = [];
        $inExperienceSection = false;
        $experienceStart = -1;
        
        foreach ($lines as $index => $line) {
            $line = trim($line);
            if (empty($line)) continue;
            
            // Look for job title patterns with enhanced detection
            if ($this->isLikelyJobTitleEnhanced($line) || $this->isLikelyCompanyEnhanced($line)) {
                if (!$inExperienceSection) {
                    $experienceStart = $index;
                }
                $inExperienceSection = true;
            }
            
            // Look for date patterns that suggest work experience
            if ($this->containsDatePatterns($line) && $inExperienceSection) {
                $inExperienceSection = true;
            }
            
            // Look for bullet points or descriptions that suggest job details
            if (preg_match('/^[•\-\*]\s+/u', $line) && $inExperienceSection) {
                $inExperienceSection = true;
            }
            
            // Look for company indicators
            if ($this->containsCompanyIndicators($line) && $inExperienceSection) {
                $inExperienceSection = true;
            }
            
            if ($inExperienceSection) {
                $experienceLines[] = $line;
            }
        }
        
        return !empty($experienceLines) ? implode("\n", $experienceLines) : null;
    }
    
    /**
     * Enhanced job title detection
     */
    private function isLikelyJobTitleEnhanced(string $line): bool
    {
        // Enhanced heuristics for job titles
        $jobTitlePatterns = [
            '/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Developer|Engineer|Manager|Designer|Analyst|Consultant|Specialist|Coordinator|Director|Lead|Architect|Administrator|Coordinator|Supervisor|Coordinator|Representative|Assistant|Coordinator|Coordinator|Coordinator)/',
            '/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:of|for|in)\s+[A-Z][a-z]+/',
            '/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+\d+$/',
            '/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+\([A-Z][a-z]+\)/'
        ];
        
        foreach ($jobTitlePatterns as $pattern) {
            if (preg_match($pattern, $line)) {
                return true;
            }
        }
        
        // Basic heuristics
        return preg_match('/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/', $line) && 
               !$this->containsDatePatterns($line) &&
               strlen($line) > 3 && strlen($line) < 100;
    }
    
    /**
     * Enhanced company detection
     */
    private function isLikelyCompanyEnhanced(string $line): bool
    {
        if (strlen($line) < 2 || strlen($line) > 100) return false;
        if (preg_match('/[0-9@]/', $line)) return false;
        
        // Look for common company indicators
        $companyIndicators = ['inc', 'corp', 'llc', 'ltd', 'company', 'co', '&', 'and', 'group', 'partners', 'associates', 'solutions', 'technologies', 'systems', 'services'];
        $lineLower = strtolower($line);
        
        foreach ($companyIndicators as $indicator) {
            if (strpos($lineLower, $indicator) !== false) {
                return true;
            }
        }
        
        // Look for capitalization patterns typical of company names
        if (preg_match('/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/', $line)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Enhanced date detection
     */
    private function isLikelyDateEnhanced(string $line): bool
    {
        // Use the unified date parsing method to validate if the line contains a valid date
        $parsedDate = $this->parseAndNormalizeDate($line);
        return $parsedDate !== $line || $this->containsDatePatterns($line);
    }
    
    /**
     * Check if a line contains date patterns without full parsing
     */
    private function containsDatePatterns(string $line): bool
    {
        $datePatterns = [
            '/\b(19|20)\d{2}\b/',
            '/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i',
            '/\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i',
            '/\d{1,2}\/\d{1,2}\/\d{2,4}/',
            '/\d{1,2}-\d{1,2}-\d{2,4}/',
            '/\d{1,2}\.\d{1,2}\.\d{2,4}/',
            '/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}\b/i',
            '/\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}\b/i',
            '/\b(present|current|now|ongoing|active)\b/i'
        ];
        
        foreach ($datePatterns as $pattern) {
            if (preg_match($pattern, $line)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check if line contains company indicators
     */
    private function containsCompanyIndicators(string $line): bool
    {
        $indicators = ['street', 'avenue', 'road', 'drive', 'lane', 'plaza', 'square', 'building', 'suite', 'floor', 'department', 'division', 'branch'];
        $lineLower = strtolower($line);
        
        foreach ($indicators as $indicator) {
            if (strpos($lineLower, $indicator) !== false) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Enhanced data validation and cleaning
     */
    private function validateAndCleanData(array $data): array
    {
        // Validate and clean contact information
        $data['contact'] = $this->validateAndCleanContact($data['contact']);
        
        // Validate and clean experiences
        if (!empty($data['experiences'])) {
            $data['experiences'] = $this->validateAndCleanExperiences($data['experiences']);
        }
        
        // Validate and clean education
        if (!empty($data['education'])) {
            $data['education'] = $this->validateAndCleanEducation($data['education']);
        }
        
        // Validate and clean skills
        if (!empty($data['skills'])) {
            $data['skills'] = $this->validateAndCleanSkills($data['skills']);
        }
        
        // Validate and clean summary
        $data['summary'] = $this->validateAndCleanSummary($data['summary']);
        
        return $data;
    }
    
    /**
     * Validate and clean contact information
     */
    private function validateAndCleanContact(array $contact): array
    {
        // Clean email
        if (!empty($contact['email'])) {
            $contact['email'] = filter_var(trim($contact['email']), FILTER_VALIDATE_EMAIL) ? trim($contact['email']) : '';
        }
        
        // Clean phone
        if (!empty($contact['phone'])) {
            $contact['phone'] = $this->cleanPhoneNumber($contact['phone']);
        }
        
        // Clean names
        if (!empty($contact['firstName'])) {
            $contact['firstName'] = $this->cleanName($contact['firstName']);
        }
        
        if (!empty($contact['lastName'])) {
            $contact['lastName'] = $this->cleanName($contact['lastName']);
        }
        
        return $contact;
    }
    
    /**
     * Clean phone number
     */
    private function cleanPhoneNumber(string $phone): string
    {
        // Remove all non-digit characters except + and spaces
        $clean = preg_replace('/[^\d\s\+]/', '', $phone);
        $clean = preg_replace('/\s+/', ' ', trim($clean));
        
        // Ensure it starts with + if international
        if (strlen($clean) > 10 && !str_starts_with($clean, '+')) {
            $clean = '+' . $clean;
        }
        
        // Format US phone numbers nicely
        if (strlen($clean) === 10 && !str_starts_with($clean, '+')) {
            $clean = substr($clean, 0, 3) . '-' . substr($clean, 3, 3) . '-' . substr($clean, 6, 4);
        }
        
        return $clean;
    }
    
    /**
     * Clean name
     */
    private function cleanName(string $name): string
    {
        // Remove extra spaces and normalize
        $name = preg_replace('/\s+/', ' ', trim($name));
        
        // Capitalize first letter of each word
        $name = ucwords(strtolower($name));
        
        return $name;
    }
    
    /**
     * Validate and clean experiences
     */
    private function validateAndCleanExperiences(array $experiences): array
    {
        $cleaned = [];
        
        foreach ($experiences as $exp) {
            if (is_array($exp)) {
                $cleanedExp = [
                    'id' => $exp['id'] ?? 1,
                    'jobTitle' => $this->cleanString($exp['jobTitle'] ?? ''),
                    'company' => $this->cleanString($exp['company'] ?? ''),
                    'location' => $this->cleanString($exp['location'] ?? ''),
                    'startDate' => $this->cleanDate($exp['startDate'] ?? ''),
                    'endDate' => $this->cleanDate($exp['endDate'] ?? ''),
                    'description' => $this->cleanDescription($exp['description'] ?? '')
                ];
                
                // Only add if it has essential information
                if (!empty($cleanedExp['jobTitle']) || !empty($cleanedExp['company'])) {
                    $cleaned[] = $cleanedExp;
                }
            }
        }
        
        return $cleaned;
    }
    
    /**
     * Clean date string
     */
    private function cleanDate(string $date): string
    {
        return $this->parseAndNormalizeDate($date);
    }
    
    /**
     * Clean description text
     */
    private function cleanDescription(string $description): string
    {
        $description = trim($description);
        
        // Remove excessive whitespace
        $description = preg_replace('/\s+/', ' ', $description);
        
        // Remove bullet points at the beginning
        $description = preg_replace('/^[•\-\*]\s*/u', '', $description);
        
        // Increased limit to allow longer descriptions (was 500, now 2000)
        if (strlen($description) > 2000) {
            $description = substr($description, 0, 2000) . '...';
        }
        
        return $description;
    }
    
    /**
     * Extract education section with enhanced content analysis
     */
    private function extractEducationByEnhancedContent(string $text): ?string
    {
        $lines = explode("\n", $text);
        $educationLines = [];
        $inEducationSection = false;
        
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;
            
            // Look for degree patterns
            if ($this->isLikelyDegreeEnhanced($line)) {
                $inEducationSection = true;
            }
            
            // Look for university/school patterns
            if ($this->isLikelySchoolEnhanced($line)) {
                $inEducationSection = true;
            }
            
            // Look for date patterns that suggest education
            if ($this->containsDatePatterns($line) && $inEducationSection) {
                $inEducationSection = true;
            }
            
            if ($inEducationSection) {
                $educationLines[] = $line;
            }
        }
        
        return !empty($educationLines) ? implode("\n", $educationLines) : null;
    }
    
    /**
     * Extract skills section with enhanced content analysis
     */
    private function extractSkillsByEnhancedContent(string $text): ?string
    {
        $lines = explode("\n", $text);
        $skillsLines = [];
        
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;
            
            // Look for comma-separated lists
            if (strpos($line, ',') !== false && strlen($line) < 200) {
                $skillsLines[] = $line;
                continue;
            }
            
            // Look for bullet points with short items
            if (preg_match('/^[•\-\*]\s+/u', $line) && strlen($line) < 100) {
                $skillsLines[] = $line;
                continue;
            }
            
            // Look for single skills (short, technical terms)
            if (strlen($line) < 50 && $this->looksLikeSkillEnhanced($line)) {
                $skillsLines[] = $line;
            }
        }
        
        return !empty($skillsLines) ? implode("\n", $skillsLines) : null;
    }
    
    /**
     * Extract summary section with enhanced content analysis
     */
    private function extractSummaryByEnhancedContent(string $text): ?string
    {
        return $this->extractUnlabeledSummaryFromText($text);
    }
    
    /**
     * Enhanced degree detection
     */
    private function isLikelyDegreeEnhanced(string $line): bool
    {
        $degreeKeywords = [
            'bachelor', 'master', 'phd', 'mba', 'bs', 'ba', 'ms', 'ma', 'degree',
            'associate', 'diploma', 'certificate', 'licensure', 'qualification'
        ];
        $line = strtolower($line);
        
        foreach ($degreeKeywords as $keyword) {
            if (strpos($line, $keyword) !== false) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Enhanced school detection
     */
    private function isLikelySchoolEnhanced(string $line): bool
    {
        $schoolPatterns = [
            '/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:University|College|Institute|School|Academy)/i',
            '/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+at\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/i',
            '/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+of\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/i'
        ];
        
        foreach ($schoolPatterns as $pattern) {
            if (preg_match($pattern, $line)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Enhanced skill detection
     */
    private function looksLikeSkillEnhanced(string $line): bool
    {
        // Skills are typically short, technical terms
        if (strlen($line) < 3 || strlen($line) > 50) return false;
        if (!preg_match('/[A-Za-z]/', $line)) return false;
        if ($this->containsDatePatterns($line)) return false;
        if ($this->looksLikeName($line)) return false;
        if ($this->isLikelyCompanyEnhanced($line)) return false;
        
        // Common skill patterns
        $skillPatterns = [
            '/^[A-Za-z]+(?:\s*[+\-]\s*[A-Za-z]+)*$/', // Basic skill format
            '/^[A-Za-z]+\s+\d+\.?\d*$/', // Skill with version number
            '/^[A-Za-z]+\s*\([A-Za-z\s]+\)$/', // Skill with proficiency level
            '/^[A-Za-z]+\s+(?:Framework|Library|Tool|Technology|Language|Platform)/i' // Skill with type
        ];
        
        foreach ($skillPatterns as $pattern) {
            if (preg_match($pattern, $line)) {
                return true;
            }
        }
        
        return true; // Default to true for short technical terms
    }
    
    /**
     * Validate and clean education data
     */
    private function validateAndCleanEducation(array $education): array
    {
        $cleaned = [];
        
        foreach ($education as $edu) {
            if (is_array($edu)) {
                $cleanedEdu = [
                    'id' => $edu['id'] ?? 1,
                    'school' => $this->cleanString($edu['school'] ?? ''),
                    'degree' => $this->cleanString($edu['degree'] ?? ''),
                    'location' => $this->cleanString($edu['location'] ?? ''),
                    'startDate' => $this->cleanDate($edu['startDate'] ?? ''),
                    'endDate' => $this->cleanDate($edu['endDate'] ?? ''),
                    'description' => $this->cleanDescription($edu['description'] ?? '')
                ];
                
                // Only add if it has essential information
                if (!empty($cleanedEdu['school']) || !empty($cleanedEdu['degree'])) {
                    $cleaned[] = $cleanedEdu;
                }
            }
        }
        
        return $cleaned;
    }
    
    /**
     * Validate and clean skills data
     */
    private function validateAndCleanSkills(array $skills): array
    {
        $cleaned = [];
        
        foreach ($skills as $skill) {
            if (is_string($skill)) {
                $cleanedSkill = $this->cleanString($skill);
                if (!empty($cleanedSkill)) {
                    $cleaned[] = [
                        'id' => count($cleaned) + 1,
                        'name' => $cleanedSkill,
                        'level' => '',
                        'category' => ''
                    ];
                }
            } elseif (is_array($skill)) {
                $cleanedSkill = [
                    'id' => $skill['id'] ?? count($cleaned) + 1,
                    'name' => $this->cleanString($skill['name'] ?? ''),
                    'level' => $this->cleanString($skill['level'] ?? ''),
                    'category' => $this->cleanString($skill['category'] ?? '')
                ];
                
                if (!empty($cleanedSkill['name'])) {
                    $cleaned[] = $cleanedSkill;
                }
            }
        }
        
        return $cleaned;
    }
    
    /**
     * Validate and clean summary data
     */
    private function validateAndCleanSummary(string $summary): string
    {
        $summary = trim($summary);
        
        // Remove excessive whitespace and normalize
        $summary = preg_replace('/\s+/', ' ', $summary);
        
        // Remove bullet points and list markers
        $summary = preg_replace('/^[•\-\*]\s*/u', '', $summary);
        
        // Increased limit to allow longer summaries (was 500, now 1000)
        if (strlen($summary) > 1000) {
            $summary = substr($summary, 0, 1000) . '...';
        }
        
        return $summary;
    }

    /**
     * Enhanced skills validation and filtering
     */
    private function validateAndFilterSkills(array $skills): array
    {
        $validSkills = [];
        $seenSkills = [];
        
        Log::info('Validating and filtering skills', [
            'total_skills' => count($skills)
        ]);
        
        foreach ($skills as $skill) {
            $skillName = is_array($skill) ? ($skill['name'] ?? '') : (string)$skill;
            $skillName = trim($skillName);
            
            if (empty($skillName)) continue;
            
            // Check for duplicates across pages
            $skillKey = strtolower($skillName);
            if (isset($seenSkills[$skillKey])) {
                Log::debug('Duplicate skill filtered out', [
                    'skill' => $skillName
                ]);
                continue;
            }
            
            if ($this->isValidSkillContent($skillName)) {
                $seenSkills[$skillKey] = true;
                $validSkills[] = is_array($skill) ? $skill : ['id' => count($validSkills) + 1, 'name' => $skillName, 'level' => ''];
            } else {
                Log::debug('Invalid skill content filtered out', [
                    'skill' => $skillName
                ]);
            }
        }
        
        // Sort skills alphabetically for better organization
        usort($validSkills, function($a, $b) {
            $nameA = is_array($a) ? ($a['name'] ?? '') : (string)$a;
            $nameB = is_array($b) ? ($b['name'] ?? '') : (string)$b;
            return strcasecmp($nameA, $nameB);
        });
        
        // Re-assign IDs after sorting
        foreach ($validSkills as $index => &$skill) {
            if (is_array($skill)) {
                $skill['id'] = $index + 1;
            }
        }
        
        Log::info('Skills validation completed', [
            'valid_skills' => count($validSkills),
            'filtered_out' => count($skills) - count($validSkills)
        ]);
        
        return $validSkills;
    }
    
    /**
     * Enhanced content validation to prevent misclassification
     */
    private function isValidSkillContent(string $content): bool
    {
        $content = trim($content);
        if (empty($content)) return false;
        
        // Reject contact information
        if ($this->isContactInfo($content)) return false;
        
        // Reject education terms
        if ($this->isEducationTerm($content)) return false;
        
        // Reject job/company terms
        if ($this->isJobOrCompanyTerm($content)) return false;
        
        // Reject incomplete phrases
        if ($this->isIncompletePhrase($content)) return false;
        
        // Must be valid skill shape
        return $this->hasValidSkillShape($content);
    }
    
    /**
     * Check if content is contact information
     */
    private function isContactInfo(string $content): bool
    {
        // Email patterns
        if (preg_match('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', $content)) {
            return true;
        }
        
        // Phone patterns
        if (preg_match('/\+?[\d\s\(\)\.\-]{7,15}/', $content)) {
            return true;
        }
        
        // Address patterns
        if (preg_match('/(street|avenue|road|drive|lane|plaza|square|building|suite|floor|apartment|apt)/i', $content)) {
            return true;
        }
        
        // Name patterns (likely contact info)
        if (preg_match('/^(mr\.|mrs\.|ms\.|dr\.|prof\.)\s+[A-Z][a-z]+/i', $content)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Check if content is education-related
     */
    private function isEducationTerm(string $content): bool
    {
        $educationKeywords = [
            'university', 'college', 'institute', 'school', 'academy', 'academic',
            'bachelor', 'master', 'phd', 'mba', 'degree', 'diploma', 'certificate',
            'graduation', 'student', 'freshman', 'sophomore', 'junior', 'senior',
            'high school', 'elementary', 'middle school', 'kindergarten'
        ];
        
        $contentLower = strtolower($content);
        foreach ($educationKeywords as $keyword) {
            if (strpos($contentLower, $keyword) !== false) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check if content is job or company related
     */
    private function isJobOrCompanyTerm(string $content): bool
    {
        $jobKeywords = [
            'manager', 'director', 'supervisor', 'coordinator', 'specialist',
            'analyst', 'developer', 'engineer', 'designer', 'consultant',
            'assistant', 'associate', 'lead', 'senior', 'junior', 'principal'
        ];
        
        $companyKeywords = [
            'inc', 'corp', 'llc', 'ltd', 'company', 'co', 'group', 'partners',
            'associates', 'solutions', 'technologies', 'systems', 'services'
        ];
        
        $contentLower = strtolower($content);
        
        // Check for job titles
        foreach ($jobKeywords as $keyword) {
            if (strpos($contentLower, $keyword) !== false) {
                return true;
            }
        }
        
        // Check for company indicators
        foreach ($companyKeywords as $keyword) {
            if (strpos($contentLower, $keyword) !== false) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check if content is an incomplete phrase
     */
    private function isIncompletePhrase(string $content): bool
    {
        // Phrases that start with common incomplete patterns
        $incompletePatterns = [
            '/^ensured\s+[a-z]+$/i',           // "ensured responsive"
            '/^maintained\s+[a-z]+$/i',         // "maintained web"
            '/^built\s+[a-z]+$/i',              // "built custom"
            '/^developed\s+[a-z]+$/i',          // "developed software"
            '/^created\s+[a-z]+$/i',            // "created user"
            '/^implemented\s+[a-z]+$/i',        // "implemented system"
            '/^managed\s+[a-z]+$/i',            // "managed team"
            '/^led\s+[a-z]+$/i',                // "led project"
            '/^coordinated\s+[a-z]+$/i',        // "coordinated events"
            '/^supervised\s+[a-z]+$/i'          // "supervised staff"
        ];
        
        foreach ($incompletePatterns as $pattern) {
            if (preg_match($pattern, $content)) {
                return true;
            }
        }
        
        // Check for very short content that's likely incomplete
        if (strlen($content) < 10 && !preg_match('/^[A-Za-z]+$/', $content)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Check if content has valid skill shape
     */
    private function hasValidSkillShape(string $content): bool
    {
        // Must contain letters
        if (!preg_match('/[A-Za-z]/', $content)) return false;
        
        // Must be reasonable length
        if (strlen($content) < 3 || strlen($content) > 50) return false;
        
        // Should not look like a date
        if ($this->containsDatePatterns($content)) return false;
        
        // Should not contain excessive punctuation
        if (preg_match('/[^\w\s\-\.\+\(\)]/', $content)) return false;
        
        return true;
    }
    
    /**
     * Enhanced experience validation and filtering
     */
    private function validateAndFilterExperiences(array $experiences): array
    {
        $validExperiences = [];
        $seenExperiences = [];
        
        Log::info('Validating and filtering experiences', [
            'total_experiences' => count($experiences)
        ]);
        
        foreach ($experiences as $exp) {
            if (!$this->isValidExperienceEntry($exp)) {
                Log::debug('Invalid experience entry filtered out', [
                    'jobTitle' => $exp['jobTitle'] ?? '',
                    'company' => $exp['company'] ?? ''
                ]);
                continue;
            }
            
            // Check for duplicates across pages
            $experienceKey = $this->generateExperienceKey($exp);
            if (isset($seenExperiences[$experienceKey])) {
                Log::debug('Duplicate experience entry filtered out', [
                    'jobTitle' => $exp['jobTitle'] ?? '',
                    'company' => $exp['company'] ?? ''
                ]);
                continue;
            }
            
            $seenExperiences[$experienceKey] = true;
            $validExperiences[] = $exp;
        }
        
        // Sort by date to ensure proper chronological order
        $validExperiences = $this->sortExperiencesByDate($validExperiences);
        
        Log::info('Experience validation completed', [
            'valid_experiences' => count($validExperiences),
            'filtered_out' => count($experiences) - count($validExperiences)
        ]);
        
        return $validExperiences;
    }
    
    /**
     * Generate a unique key for experience deduplication
     */
    private function generateExperienceKey(array $exp): string
    {
        $title = strtolower(trim($exp['jobTitle'] ?? ''));
        $company = strtolower(trim($exp['company'] ?? ''));
        $location = strtolower(trim($exp['location'] ?? ''));
        
        return md5($title . '|' . $company . '|' . $location);
    }
    
    /**
     * Check if an experience entry is valid
     */
    private function isValidExperienceEntry(array $exp): bool
    {
        // Must have either job title or company
        if (empty($exp['jobTitle']) && empty($exp['company'])) {
            return false;
        }
        
        // Reject generic terms
        if ($this->isGenericTerm($exp['jobTitle']) || $this->isGenericTerm($exp['company'])) {
            return false;
        }
        
        // Reject education-related content
        if ($this->isEducationTerm($exp['jobTitle']) || $this->isEducationTerm($exp['company'])) {
            return false;
        }
        
        // Reject contact-related content
        if ($this->isContactInfo($exp['jobTitle']) || $this->isContactInfo($exp['company'])) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Check if a term is generic and not meaningful
     */
    private function isGenericTerm(string $term): bool
    {
        if (empty($term)) return false;
        
        $genericTerms = [
            'contact', 'company', 'education', 'experience', 'work', 'job',
            'position', 'role', 'title', 'employer', 'organization', 'institution'
        ];
        
        $termLower = strtolower(trim($term));
        foreach ($genericTerms as $generic) {
            if ($termLower === $generic) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Enhanced education validation and filtering with multi-page support
     */
    private function validateAndFilterEducation(array $education): array
    {
        $validEducation = [];
        $seenEducation = [];
        
        Log::info('Validating and filtering education', [
            'total_education' => count($education)
        ]);
        
        foreach ($education as $edu) {
            if (!$this->isValidEducationEntry($edu)) {
                Log::debug('Invalid education entry filtered out', [
                    'school' => $edu['school'] ?? '',
                    'degree' => $edu['degree'] ?? ''
                ]);
                continue;
            }
            
            // Check for duplicates across pages
            $educationKey = $this->generateEducationKey($edu);
            if (isset($seenEducation[$educationKey])) {
                Log::debug('Duplicate education entry filtered out', [
                    'school' => $edu['school'] ?? '',
                    'degree' => $edu['degree'] ?? ''
                ]);
                continue;
            }
            
            $seenEducation[$educationKey] = true;
            $validEducation[] = $edu;
        }
        
        // Sort by date to ensure proper chronological order
        $validEducation = $this->sortEducationByDate($validEducation);
        
        Log::info('Education validation completed', [
            'valid_education' => count($validEducation),
            'filtered_out' => count($education) - count($validEducation)
        ]);
        
        return $validEducation;
    }
    
    /**
     * Generate a unique key for education deduplication
     */
    private function generateEducationKey(array $edu): string
    {
        $school = strtolower(trim($edu['school'] ?? ''));
        $degree = strtolower(trim($edu['degree'] ?? ''));
        $location = strtolower(trim($edu['location'] ?? ''));
        
        return md5($school . '|' . $degree . '|' . $location);
    }
    
    /**
     * Check if an education entry is valid
     */
    private function isValidEducationEntry(array $edu): bool
    {
        // Must have either school or degree
        if (empty($edu['school']) && empty($edu['degree'])) {
            return false;
        }
        
        // Reject generic terms
        if ($this->isGenericTerm($edu['school']) || $this->isGenericTerm($edu['degree'])) {
            return false;
        }
        
        // Reject contact-related content
        if ($this->isContactInfo($edu['school']) || $this->isContactInfo($edu['degree'])) {
            return false;
        }
        
        return true;
    }

    /**
     * Check if a line looks like a person's name
     */
    private function looksLikeName(string $line): bool
    {
        $line = trim($line);
        if (empty($line)) return false;
        
        // Use configuration for name length validation
        $minNameLength = config('resumeparser.content_validation.min_name_length', 3);
        $maxNameLength = config('resumeparser.content_validation.max_name_length', 50);
        if (strlen($line) < $minNameLength || strlen($line) > $maxNameLength) return false;
        
        // Skip if line contains email or phone
        if (preg_match('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', $line)) return false;
        if (preg_match('/\+?[\d\s\(\)\.\-]{7,15}/', $line)) return false;
        
        // Use configuration for name patterns
        $namePatterns = config('resumeparser.regex_patterns.name_patterns', []);
        
        foreach ($namePatterns as $pattern) {
            if (preg_match($pattern, $line)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Reclassify contact information that was placed in wrong sections
     */
    private function reclassifyContactInfo(array $sections): array
    {
        $contact = $sections['contact'] ?? [];
        
        // Look for contact info in other sections
        $sectionsToCheck = ['experience', 'education', 'skills', 'summary'];
        
        foreach ($sectionsToCheck as $section) {
            if (isset($sections[$section])) {
                $sectionContent = $sections[$section];
                $newContent = [];
                
                foreach ($sectionContent as $line) {
                    if ($this->isContactInfo($line) || $this->looksLikeName($line)) {
                        $contact[] = $line;
                    } else {
                        $newContent[] = $line;
                    }
                }
                
                $sections[$section] = $newContent;
            }
        }
        
        $sections['contact'] = array_unique($contact);
        return $sections;
    }
    
    /**
     * Reclassify skills that were placed in wrong sections
     */
    private function reclassifySkills(array $sections): array
    {
        $skills = $sections['skills'] ?? [];
        
        // Look for skills in other sections
        $sectionsToCheck = ['experience', 'education', 'summary'];
        
        foreach ($sectionsToCheck as $section) {
            if (isset($sections[$section])) {
                $sectionContent = $sections[$section];
                $newContent = [];
                
                foreach ($sectionContent as $line) {
                    if ($this->isSkillContent($line)) {
                        $skills[] = $line;
                    } else {
                        $newContent[] = $line;
                    }
                }
                
                $sections[$section] = $newContent;
            }
        }
        
        $sections['skills'] = array_unique($skills);
        return $sections;
    }
    
    /**
     * Check if content is skill-related
     */
    private function isSkillContent(string $line): bool
    {
        // Skip if it's clearly not a skill
        if ($this->isContactInfo($line) || $this->looksLikeName($line) || $this->isExperienceContent($line)) {
            return false;
        }
        
        // Use configuration for content validation limits
        $maxSkillLength = config('resumeparser.content_validation.max_skill_length', 100);
        $minSkillLength = config('resumeparser.content_validation.min_skill_length', 3);
        if (strlen($line) < $minSkillLength || strlen($line) > $maxSkillLength) return false;
        
        // Use configuration for skill patterns
        $skillPatterns = config('resumeparser.regex_patterns.skill_patterns', []);
        
        foreach ($skillPatterns as $pattern) {
            if (preg_match($pattern, $line)) {
                return true;
            }
        }
        
        // Use configuration for skill keywords
        $skillKeywords = config('resumeparser.skill_keywords', []);
        
        $lineLower = strtolower($line);
        foreach ($skillKeywords as $keyword) {
            if (strpos($lineLower, $keyword) !== false) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Test method to validate enhanced parsing functionality
     */
    public function testEnhancedParsing(string $text): array
    {
        // Test the enhanced section detection
        $sections = $this->detectSectionsWithPriority($text);
        
        // Test contact extraction
        $contact = $this->extractContactInfo($text);
        
        // Test name extraction
        $nameInfo = $this->extractNameWithMultipleStrategies($text);
        
        return [
            'sections_detected' => array_keys($sections),
            'sections_content' => $sections,
            'contact_extracted' => $contact,
            'name_extracted' => $nameInfo,
            'text_length' => strlen($text),
            'lines_count' => count(explode("\n", $text))
        ];
    }
}