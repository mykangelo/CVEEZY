<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Services\ResumeParsingService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ResumeParsingTest extends TestCase
{
    private ResumeParsingService $parsingService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->parsingService = new ResumeParsingService();
        Storage::fake('local');
    }

    public function test_phone_number_extraction_avoids_dates()
    {
        // Test text with both phone numbers and dates
        $text = "Contact Information\nPhone: (555) 123-4567\nEmail: test@example.com\nGraduation: 2020\nExperience: 2018-2022";
        
        $result = $this->parsingService->parseTextToStructuredData($text);
        
        // Should extract phone number correctly
        $this->assertEquals('(555) 123-4567', $result['contact']['phone']);
        
        // Should not have phone number as a date
        $this->assertNotEquals('2020', $result['contact']['phone']);
        $this->assertNotEquals('2018-2022', $result['contact']['phone']);
    }

    public function test_enhanced_section_detection()
    {
        // Test text with various section formats
        $text = "PERSONAL INFORMATION\nName: John Doe\nEmail: john@example.com\n\nWORK EXPERIENCE\nSoftware Engineer at Tech Corp\n2020-2022\n\nEDUCATION\nBachelor of Science in Computer Science\nUniversity of Technology\n2016-2020";
        
        $result = $this->parsingService->parseTextToStructuredData($text);
        
        // Should detect contact information
        $this->assertNotEmpty($result['contact']['email']);
        
        // Should detect work experience
        $this->assertNotEmpty($result['experiences']);
        $this->assertEquals('Software Engineer', $result['experiences'][0]['jobTitle']);
        
        // Should detect education
        $this->assertNotEmpty($result['education']);
        $this->assertEquals('Bachelor of Science in Computer Science', $result['education'][0]['degree']);
    }

    public function test_confidence_calculation()
    {
        // Test with complete resume data
        $completeData = [
            'contact' => ['email' => 'test@example.com', 'phone' => '(555) 123-4567'],
            'experiences' => [['jobTitle' => 'Developer']],
            'education' => [['degree' => 'BS']],
            'skills' => [['name' => 'PHP']],
            'summary' => 'Experienced developer'
        ];
        
        $confidence = $this->parsingService->calculateParsingConfidence($completeData);
        
        // Should have high confidence for complete data
        $this->assertEquals(100, $confidence['overall_score']);
        $this->assertCount(5, $confidence['sections_found']);
        $this->assertEmpty($confidence['missing_sections']);
    }

    public function test_confidence_calculation_with_missing_sections()
    {
        // Test with incomplete resume data
        $incompleteData = [
            'contact' => ['email' => 'test@example.com'],
            'experiences' => [],
            'education' => [],
            'skills' => [],
            'summary' => ''
        ];
        
        $confidence = $this->parsingService->calculateParsingConfidence($incompleteData);
        
        // Should have low confidence for incomplete data
        $this->assertEquals(20, $confidence['overall_score']);
        $this->assertCount(1, $confidence['sections_found']);
        $this->assertCount(4, $confidence['missing_sections']);
        $this->assertNotEmpty($confidence['suggestions']);
    }

    public function test_improved_company_detection()
    {
        $text = "WORK EXPERIENCE\nSoftware Engineer\nTech Solutions Inc.\n2020-2022\n\nSenior Developer\nGlobal Systems Corp.\n2018-2020";
        
        $result = $this->parsingService->parseTextToStructuredData($text);
        
        $this->assertNotEmpty($result['experiences']);
        $this->assertEquals('Tech Solutions Inc.', $result['experiences'][0]['company']);
        $this->assertEquals('Global Systems Corp.', $result['experiences'][1]['company']);
    }

    public function test_improved_education_detection()
    {
        $text = "EDUCATION\nBachelor of Science in Computer Science\nUniversity of Technology\n2016-2020\n\nMaster of Business Administration\nBusiness School University\n2020-2022";
        
        $result = $this->parsingService->parseTextToStructuredData($text);
        
        $this->assertNotEmpty($result['education']);
        $this->assertEquals('Bachelor of Science in Computer Science', $result['education'][0]['degree']);
        $this->assertEquals('University of Technology', $result['education'][0]['school']);
        $this->assertEquals('Master of Business Administration', $result['education'][1]['degree']);
    }

    public function test_improved_data_organization()
    {
        // Test text with various section formats
        $text = "JOHN DOE\nSoftware Engineer\njohn@example.com\n(555) 123-4567\n\nWORK EXPERIENCE\nSoftware Engineer\nTech Solutions Inc.\nSan Francisco, CA\n2020-2022\nDeveloped web applications\n\nEDUCATION\nBachelor of Science in Computer Science\nUniversity of Technology\n2016-2020\n\nSKILLS\nJavaScript (Advanced), Python (Intermediate), React v18, Node.js";
        
        $result = $this->parsingService->parseTextToStructuredData($text);
        
        // Check contact organization
        $this->assertEquals('JOHN', $result['contact']['firstName']);
        $this->assertEquals('DOE', $result['contact']['lastName']);
        $this->assertEquals('Software Engineer', $result['contact']['desiredJobTitle']);
        $this->assertEquals('(555) 123-4567', $result['contact']['phone']);
        $this->assertEquals('john@example.com', $result['contact']['email']);
        
        // Check experience organization
        $this->assertNotEmpty($result['experiences']);
        $this->assertEquals('Software Engineer', $result['experiences'][0]['jobTitle']);
        $this->assertEquals('Tech Solutions Inc.', $result['experiences'][0]['company']);
        $this->assertEquals('San Francisco, CA', $result['experiences'][0]['location']);
        $this->assertEquals('2020-2022', $result['experiences'][0]['startDate']);
        
        // Check education organization
        $this->assertNotEmpty($result['education']);
        $this->assertEquals('Bachelor of Science in Computer Science', $result['education'][0]['degree']);
        $this->assertEquals('University of Technology', $result['education'][0]['school']);
        
        // Check skills organization
        $this->assertNotEmpty($result['skills']);
        $this->assertEquals('JavaScript', $result['skills'][0]['name']);
        $this->assertEquals('Advanced', $result['skills'][0]['level']);
        $this->assertEquals('React', $result['skills'][2]['name']);
        $this->assertEquals('v18', $result['skills'][2]['level']);
    }
    
    public function test_template_field_mapping()
    {
        $text = "WORK EXPERIENCE\nSenior Developer\nABC Company\nNew York, NY\n2018-2020\nLed development team\n\nJunior Developer\nXYZ Corp\nBoston, MA\n2016-2018\nDeveloped features";
        
        $result = $this->parsingService->parseTextToStructuredData($text);
        
        // Check that experiences are properly mapped to template fields
        $this->assertCount(2, $result['experiences']);
        
        // First experience
        $this->assertEquals(1, $result['experiences'][0]['id']);
        $this->assertEquals('Senior Developer', $result['experiences'][0]['jobTitle']);
        $this->assertEquals('ABC Company', $result['experiences'][0]['company']);
        $this->assertEquals('New York, NY', $result['experiences'][0]['location']);
        $this->assertEquals('2018-2020', $result['experiences'][0]['startDate']);
        
        // Second experience
        $this->assertEquals(2, $result['experiences'][1]['id']);
        $this->assertEquals('Junior Developer', $result['experiences'][1]['jobTitle']);
        $this->assertEquals('XYZ Corp', $result['experiences'][1]['company']);
        $this->assertEquals('Boston, MA', $result['experiences'][1]['location']);
        $this->assertEquals('2016-2018', $result['experiences'][1]['startDate']);
    }
    
    public function test_data_normalization()
    {
        $data = [
            'contact' => [
                'firstName' => 'John',
                'lastName' => 'Doe',
                'phone' => '  (555) 123-4567  ',
                'email' => 'JOHN@EXAMPLE.COM'
            ],
            'experiences' => [
                [
                    'jobTitle' => 'Developer',
                    'startDate' => 'jan 2020',
                    'endDate' => 'present'
                ]
            ],
            'skills' => [
                [
                    'name' => 'JavaScript',
                    'level' => 'advanced'
                ]
            ]
        ];
        
        // Test normalization through the service
        $result = $this->parsingService->parseTextToStructuredData(""); // Empty text to trigger organization
        $result = array_merge($result, $data); // Merge test data
        
        // Apply normalization
        $reflection = new \ReflectionClass($this->parsingService);
        $normalizeMethod = $reflection->getMethod('normalizeDataForStorage');
        $normalizeMethod->setAccessible(true);
        $normalized = $normalizeMethod->invoke($this->parsingService, $result);
        
        // Check phone normalization
        $this->assertEquals('(555) 123-4567', $normalized['contact']['phone']);
        
        // Check email normalization
        $this->assertEquals('john@example.com', $normalized['contact']['email']);
        
        // Check date normalization
        $this->assertEquals('Jan 2020', $normalized['experiences'][0]['startDate']);
        $this->assertEquals('Present', $normalized['experiences'][0]['endDate']);
        
        // Check skill level normalization
        $this->assertEquals('Advanced', $normalized['skills'][0]['level']);
    }
}
