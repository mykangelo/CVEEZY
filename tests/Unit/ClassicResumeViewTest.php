<?php

namespace Tests\Unit;

use Illuminate\Support\Str;
use Tests\TestCase;

class ClassicResumeViewTest extends TestCase
{
    /**
     * Returns the view name to render the Classic Resume.
     * Adjust this to the actual blade view path if different.
     */
    private function viewName(): string
    {
        // Try the most common guesses; update to match repo if necessary
        $candidates = [
            'classic-resume',
            'resume.classic',
            'resumes.classic',
            'classic.resume',
            'classicResume',
        ];
        foreach ($candidates as $candidate) {
            try {
                // Attempt to render quickly; suppress errors and continue on failure
                view($candidate, ['resume' => ['contact' => ['firstName' => 'A', 'lastName' => 'B']]])->render();
                return $candidate;
            } catch (\Throwable $e) {
                // continue
            }
        }
        // Fallback to a default guess; replace in your project if needed.
        return 'classic-resume';
    }

    private function baseResume(): array
    {
        return [
            'contact' => [
                'firstName' => 'Jane',
                'lastName' => 'Doe',
                'desiredJobTitle' => 'Senior Developer',
                'address' => '123 Main St',
                'city' => 'Metropolis',
                'country' => 'Fictionland',
                'postCode' => '12345',
                'email' => 'jane@example.com',
                'phone' => '+1 555 123 4567',
            ],
            'summary' => 'Experienced developer with a focus on clean architecture and maintainable code.',
            'skills' => [
                ['name' => 'PHP', 'level' => 'Expert'],
                ['name' => 'Laravel', 'level' => 'Experienced'],
                ['name' => 'JavaScript', 'level' => 'Skillful'],
            ],
            'showExperienceLevel' => true,
            'experiences' => [
                [
                    'jobTitle' => 'Lead Developer',
                    'startDate' => 'Jan 2020',
                    'endDate' => 'Present',
                    'company' => 'Tech Corp',
                    'location' => 'Remote',
                    'description' => 'Leading a team of developers to build scalable web applications.',
                ],
            ],
            'education' => [
                [
                    'degree' => 'B.Sc. Computer Science',
                    'startDate' => '2014',
                    'endDate' => '2018',
                    'school' => 'State University',
                    'location' => 'Springfield',
                    'description' => 'Graduated with honors.',
                ],
            ],
            'hobbies' => [
                ['name' => 'Hiking'],
                ['name' => 'Photography'],
                ['name' => 'Chess'],
            ],
            'websites' => [
                ['label' => 'Portfolio', 'url' => 'https://portfolio.example.com'],
                ['label' => 'GitHub', 'url' => 'https://github.com/janedoe'],
            ],
            'references' => [
                [
                    'name' => 'John Smith',
                    'relationship' => 'Manager',
                    'contactInfo' => 'john.smith@example.com',
                ],
            ],
            'languages' => [
                ['name' => 'English', 'proficiency' => 'Native'],
                ['name' => 'Spanish', 'proficiency' => 'Intermediate'],
            ],
            'certifications' => [
                ['title' => 'AWS Certified Developer'],
                ['title' => 'Scrum Master'],
            ],
            'awards' => [
                ['title' => 'Employee of the Year'],
            ],
        ];
    }

    public function test_contact_info_renders_full_line_with_separators()
    {
        $html = view($this->viewName(), ['resume' => $this->baseResume()])->render();

        $this->assertStringContainsString('<h2 class="contact-name">', $html);
        $this->assertStringContainsString('Jane Doe', $html);
        $this->assertStringContainsString('Senior Developer', $html);

        // LocationInfo comma-joined + separators | email | phone
        $this->assertStringContainsString('123 Main St, Metropolis, Fictionland, 12345', $html);
        $this->assertStringContainsString('jane@example.com', $html);
        $this->assertStringContainsString('+1 555 123 4567', $html);

        // Ensure separators appear only when applicable
        $this->assertStringContainsString('12345</div>', $html); // ensure details block closed
    }

    public function test_contact_info_omits_optional_fields_and_separators()
    {
        $resume = $this->baseResume();
        // Remove email and phone to ensure no stray separators
        unset($resume['contact']['email'], $resume['contact']['phone']);
        // Remove address pieces too
        unset(
            $resume['contact']['address'],
            $resume['contact']['city'],
            $resume['contact']['country'],
            $resume['contact']['postCode'],
        );
        $html = view($this->viewName(), ['resume' => $resume])->render();

        $this->assertStringNotContainsString('|', $html, 'No separators expected without optional fields');
        $this->assertStringNotContainsString('desiredJobTitle', $html); // not class, but check text absence next
        $this->assertStringNotContainsString('Senior Developer', $html);
    }

    public function test_summary_is_rendered_when_present_and_hidden_when_empty()
    {
        $html = view($this->viewName(), ['resume' => $this->baseResume()])->render();
        $this->assertStringContainsString('<div class="summary-text">', $html);

        $resume = $this->baseResume();
        $resume['summary'] = '';
        $html2 = view($this->viewName(), ['resume' => $resume])->render();
        $this->assertStringNotContainsString('<div class="summary-text">', $html2);
    }

    public function test_skills_render_names_and_levels_when_enabled()
    {
        $resume = $this->baseResume();
        $resume['showExperienceLevel'] = true;
        $html = view($this->viewName(), ['resume' => $resume])->render();

        // Skill names
        $this->assertStringContainsString('PHP', $html);
        $this->assertStringContainsString('Laravel', $html);
        $this->assertStringContainsString('JavaScript', $html);

        // Verify dots for levels (Expert=5, Experienced=4, Skillful=3)
        // We check style fragments; each dot uses inline style background-color
        $this->assertTrue(substr_count($html, 'background-color:#000;') >= 12, 'Expected at least 12 filled dots across skills'); // heuristic
    }

    public function test_skills_hide_levels_when_flag_disabled()
    {
        $resume = $this->baseResume();
        $resume['showExperienceLevel'] = false;
        $html = view($this->viewName(), ['resume' => $resume])->render();

        // Ensure no level dots appear
        $this->assertStringNotContainsString('background-color:#000;', $html);
        $this->assertStringNotContainsString('background-color:#d1d5db;', $html);
    }

    public function test_skills_chunk_into_two_columns_and_pad_empty_cell()
    {
        $resume = $this->baseResume();
        $resume['skills'] = [
            ['name' => 'OnlyOne', 'level' => 'Novice'],
        ];
        $html = view($this->viewName(), ['resume' => $resume])->render();

        // With a single skill, array_chunk(..., 2) should produce a row with 1 skill and an empty <td></td>
        $this->assertStringContainsString('<table class="skills-table">', $html);
        $this->assertStringContainsString('OnlyOne', $html);
        $this->assertStringContainsString('<td></td>', $html, 'Expected empty cell when odd number of items');
    }

    public function test_experience_section_with_optional_description()
    {
        $html = view($this->viewName(), ['resume' => $this->baseResume()])->render();

        $this->assertStringContainsString('PROFESSIONAL EXPERIENCE', $html);
        $this->assertStringContainsString('Lead Developer', $html);
        $this->assertStringContainsString('Jan 2020 - Present', $html);
        $this->assertStringContainsString('Tech Corp — Remote', $html);
        $this->assertStringContainsString('<ul class="experience-description-list">', $html);

        $resume = $this->baseResume();
        unset($resume['experiences'][0]['description']);
        $html2 = view($this->viewName(), ['resume' => $resume])->render();
        $this->assertStringNotContainsString('<ul class="experience-description-list">', $html2);
    }

    public function test_education_section_with_optional_description()
    {
        $html = view($this->viewName(), ['resume' => $this->baseResume()])->render();

        $this->assertStringContainsString('EDUCATION', $html);
        $this->assertStringContainsString('B.Sc. Computer Science', $html);
        $this->assertStringContainsString('2014 - 2018', $html);
        $this->assertStringContainsString('State University — Springfield', $html);
        $this->assertStringContainsString('<ul class="education-description-list">', $html);

        $resume = $this->baseResume();
        unset($resume['education'][0]['description']);
        $html2 = view($this->viewName(), ['resume' => $resume])->render();
        $this->assertStringNotContainsString('<ul class="education-description-list">', $html2);
    }

    public function test_hobbies_chunking_and_empty_cell_behavior()
    {
        $resume = $this->baseResume();
        // Use an odd number of hobbies to ensure padding cell
        $resume['hobbies'] = [
            ['name' => 'One'],
            ['name' => 'Two'],
            ['name' => 'Three'],
        ];
        $html = view($this->viewName(), ['resume' => $resume])->render();

        $this->assertStringContainsString('<table class="hobbies-table">', $html);
        $this->assertStringContainsString('<li>One</li>', $html);
        $this->assertStringContainsString('<li>Two</li>', $html);
        $this->assertStringContainsString('<li>Three</li>', $html);
        $this->assertStringContainsString('<td></td>', $html, 'Expected padding cell for odd count');
    }

    public function test_websites_links_have_target_and_rel()
    {
        $html = view($this->viewName(), ['resume' => $this->baseResume()])->render();

        $this->assertStringContainsString('WEBSITES', $html);
        $this->assertStringContainsString('<strong>Portfolio:</strong>', $html);
        $this->assertStringContainsString('<a href="https://portfolio.example.com" target="_blank" rel="noopener noreferrer">', $html);
        $this->assertStringContainsString('<strong>GitHub:</strong>', $html);
        $this->assertStringContainsString('<a href="https://github.com/janedoe" target="_blank" rel="noopener noreferrer">', $html);
    }

    public function test_references_optional_fields_and_separators()
    {
        $html = view($this->viewName(), ['resume' => $this->baseResume()])->render();
        $this->assertStringContainsString('REFERENCES', $html);
        $this->assertStringContainsString('<strong>John Smith</strong>', $html);
        $this->assertStringContainsString('— Manager', $html);
        $this->assertStringContainsString('| john.smith@example.com', $html);

        $resume = $this->baseResume();
        unset($resume['references'][0]['relationship'], $resume['references'][0]['contactInfo']);
        $html2 = view($this->viewName(), ['resume' => $resume])->render();
        $this->assertStringContainsString('<strong>John Smith</strong>', $html2);
        $this->assertStringNotContainsString('—', $html2);
        $this->assertStringNotContainsString('|', $html2);
    }

    public function test_additional_information_languages_certifications_awards_with_commas()
    {
        $html = view($this->viewName(), ['resume' => $this->baseResume()])->render();

        $this->assertStringContainsString('ADDITIONAL INFORMATION', $html);

        // Languages line with comma between entries and optional proficiency
        $this->assertStringContainsString('Languages:', $html);
        $this->assertStringContainsString('English – Native', $html);
        $this->assertStringContainsString('Spanish – Intermediate', $html);
        $this->assertTrue(
            strpos($html, 'English') !== false && strpos($html, 'Spanish') !== false && strpos($html, ',') !== false,
            'Expected comma separation between languages'
        );

        // Certifications
        $this->assertStringContainsString('Certification:', $html);
        $this->assertTrue(
            strpos($html, 'AWS Certified Developer') !== false && strpos($html, 'Scrum Master') !== false,
            'Expected certifications listed'
        );
        $this->assertTrue(
            substr_count($html, 'AWS Certified Developer') === 1 && substr_count($html, 'Scrum Master') === 1,
            'Expected single entries without duplication'
        );

        // Awards
        $this->assertStringContainsString('Awards:', $html);
        $this->assertStringContainsString('Employee of the Year', $html);
    }

    public function test_sections_hidden_when_collections_empty()
    {
        $resume = $this->baseResume();
        $resume['skills'] = [];
        $resume['experiences'] = [];
        $resume['education'] = [];
        $resume['hobbies'] = [];
        $resume['websites'] = [];
        $resume['references'] = [];
        $resume['languages'] = [];
        $resume['certifications'] = [];
        $resume['awards'] = [];
        $resume['summary'] = '';

        $html = view($this->viewName(), ['resume' => $resume])->render();

        $this->assertStringNotContainsString('AREA OF EXPERTISE', $html);
        $this->assertStringNotContainsString('PROFESSIONAL EXPERIENCE', $html);
        $this->assertStringNotContainsString('EDUCATION', $html);
        $this->assertStringNotContainsString('HOBBIES', $html);
        $this->assertStringNotContainsString('WEBSITES', $html);
        $this->assertStringNotContainsString('REFERENCES', $html);
        $this->assertStringNotContainsString('ADDITIONAL INFORMATION', $html);
        $this->assertStringNotContainsString('<div class="summary-text">', $html);
    }
}