@php
use App\Helpers\BulletProcessor;
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Resume</title>
    <style>
        @page {
            margin: 0.4in 0.3in 0.3in 0.3in;
            size: A4;
        }
        
        * {
            box-sizing: border-box;
        }
        
        body {
            margin: 0;
            padding: 0;
            font-size: 12px;
            line-height: 1.4;
            color: #000000;
            background: #ffffff;
            max-width: 100%;
            margin: 0 auto;
            font-feature-settings: "kern" 1;
            text-rendering: optimizeLegibility;
            font-family: DejaVu Sans, Arial, sans-serif;
        }

        h1, h2, h3, p {
            margin: 0;
            padding: 0;
            font-weight: inherit;
        }

        /* Header Section - Black background with white text */
        .header {
            background: #000000;
            color: #ffffff;
            padding: 40px 50px;
            position: relative;
            overflow: hidden;
        }
        
        .header-content {
            width: 100%;
            position: relative;
        }
        
        .header-left {
            width: 60%;
            float: left;
        }

        .name {
            font-size: 36px;
            font-weight: 800;
            letter-spacing: 0.1em;
            word-wrap: break-word;
            overflow-wrap: break-word;
            line-height: 1.1;
            margin-bottom: 8px;
            display: block;
            text-transform: uppercase;
        }

        .title {
            font-size: 14px;
            font-weight: 400;
            word-wrap: break-word;
            overflow-wrap: break-word;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            display: block;
            margin-top: 4px;
        }

        /* Contact Info - Right side of header */
        .contact-info {
            width: 35%;
            float: right;
            margin-top: 0;
        }

        .contact-item {
            display: block;
            margin-bottom: 8px;
            font-size: 11px;
            line-height: 1.3;
            overflow: hidden;
            min-height: 24px;
        }

        .contact-icon {
            width: 18px;
            height: 18px;
            float: left;
            margin-right: 10px;
            margin-top: 2px;
            border: 1px solid #ffffff;
            border-radius: 50%;
            font-size: 8px;
            text-align: center;
            line-height: 14px;
            position: relative;
        }

        .contact-icon::before {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        .contact-text {
            display: block;
            margin-left: 28px;
            word-wrap: break-word;
            overflow-wrap: break-word;
            word-break: break-word;
            padding-top: 1px;
        }

        .phone-icon::before { content: "☎"; }
        .email-icon::before { content: "✉"; }
        .location-icon::before { content: "⚲"; }

        .header::after {
            content: "";
            display: table;
            clear: both;
        }

        /* Main Content Area */
        .main-content {
            background: #ffffff;
            color: #000000;
            padding: 40px 50px;
        }

        /* Section Headers */
        .section-title {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 8px;
            padding-bottom: 12px;
            border-bottom: 1px solid #000000;
        }

    /* Enhanced Skills - Better PDF compatibility and visual appeal */
    .skills-grid {
        display: table;
        width: 100%;
        table-layout: fixed;
    }

    .skills-row {
        display: table-row;
    }

    .skill-item {
        display: table-cell;
        width: 50%;
        padding-right: 32px;
        padding-bottom: 8px;
        vertical-align: top;
    }

    .skill-item:last-child {
        padding-right: 0;
    }

    .skill-content {
        display: table;
        width: 100%;
        table-layout: fixed;
    }

    .skill-name-enhanced {
        display: table-cell;
        font-size: 12px;
        color: #000000;
        font-weight: normal;
        width: auto;
        white-space: nowrap;
        padding-right: 8px;
    }

    .skill-bullets-enhanced {
        display: table-cell;
        width: auto;
        vertical-align: middle;
    }

    .skill-bullet-enhanced {
        display: inline-block;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #d1d5db;
        margin-left: 2px;
    }

    .skill-bullet-enhanced.active {
        background-color: #000000;
    }

    /* Skills without level display */
    .skills-simple-grid {
        display: table;
        width: 100%;
        table-layout: fixed;
    }

    .skills-simple-row {
        display: table-row;
    }

    .skills-simple-item {
        display: table-cell;
        width: 50%;
        padding-right: 32px;
        padding-bottom: 4px;
        vertical-align: top;
        font-size: 12px;
        color: #000000;
    }

    .skills-simple-item:last-child {
        padding-right: 0;
    }

    /* Print overrides for enhanced skills */
    @media print {
        .skill-bullet-enhanced.active {
            background-color: #000000 !important;
        }
    }

        /* All Other Sections */
        .section-row {
            width: 100%;
            margin-bottom: 12px;
        }

        /* Experience Section - Match React format */
        .experience-section {
            margin-bottom: 12px;
        }

        .experience-item {
            margin-bottom: 12px;
            padding-top: 12px;
        }

        .experience-item:first-child {
            border-top: none;
            padding-top: 0;
        }

        .experience-company {
            font-size: 12px;
            font-weight: 700;
            color: #000000;
            margin-bottom: 8px;
        }

        .experience-title {
            font-size: 12px;
            color: #666666;
            margin-bottom: 8px;
        }

        .experience-location {
            font-size: 12px;
            color: #666666;
            font-style: italic;
            margin-top: -4px;
            margin-bottom: 8px;
        }

        /* Education Section - Match Experience format */
        .education-item {
            margin-bottom: 12px;
            padding-top: 12px;
            border-top: 1px solid #d1d5db;
        }

        .education-item:first-child {
            border-top: none;
            padding-top: 0;
        }

        .education-school {
            font-size: 12px;
            font-weight: 700;
            color: #000000;
            margin-bottom: 8px;
        }

        .education-degree {
            font-size: 12px;
            color: #666666;
            margin-bottom: 8px;
        }

        /* FIXED: Custom bullet points - PDF compatible */
        .custom-bullet-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .custom-bullet-item {
            margin-bottom: 4px;
            font-size: 12px;
            line-height: 1.4;
            overflow: hidden;
        }

        .custom-bullet {
            width: 4px;
            height: 4px;
            background-color: #000000;
            border-radius: 50%;
            float: left;
            margin-right: 12px;
            margin-top: 6px;
        }

        .custom-bullet-text {
            display: block;
            margin-left: 16px;
        }

        /* FIXED: Language items - PDF compatible */
        .language-item {
            margin-bottom: 8px;
            font-size: 12px;
            line-height: 1.4;
            overflow: hidden;
        }

        .language-bullet {
            width: 4px;
            height: 4px;
            background-color: #000000;
            border-radius: 50%;
            float: left;
            margin-right: 12px;
            margin-top: 6px;
        }

        .language-text {
            display: block;
            margin-left: 16px;
            font-weight: normal;
        }

        /* Website section styling */
        .website-item {
            margin-bottom: 6px;
        }

        .website-label {
            font-size: 12px;
            font-weight: normal;
            margin-bottom: 2px;
        }

        .website-url {
            font-size: 10px;
            color: #2563eb;
            text-decoration: underline;
            word-break: break-all;
            line-height: 1.2;
            display: block;
        }

        /* Small text */
        .small {
            font-size: 10px;
            color: #666666;
            line-height: 1.3;
        }
        
        .bold {
            font-weight: 600;
        }

        /* Profile Summary */
        .profile-summary {
            font-size: 12px;
            line-height: 1.5;
            margin-bottom: 12px;
        }

        /* Utility classes */
        .mb-1 { margin-bottom: 5px; }
        .mb-2 { margin-bottom: 10px; }
        .mb-3 { margin-bottom: 15px; }
        .mt-1 { margin-top: 5px; }

        /* Page break handling */
        .experience-item, .education-item { 
            page-break-inside: avoid; 
            break-inside: avoid;
        }

        h1, h2, h3, .section-title { 
            page-break-after: avoid; 
            break-after: avoid;
            page-break-inside: avoid;
            break-inside: avoid;
        }

        /* Print specific styles */
        @media print {
            body {
                padding: 0 !important;
            }
            
            .experience-item, .education-item {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }
            
            h1, h2, h3, .section-title {
                page-break-after: avoid !important;
                break-after: avoid !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }
        }

        p, li, span, div {
            word-wrap: break-word;
            overflow-wrap: break-word;
            word-break: break-word;
            hyphens: auto;
        }

        .no-underline { 
            text-decoration: none; 
            color: inherit; 
        }
        
        a { 
            text-decoration: none; 
            color: inherit; 
        }
        
        a:hover { 
            text-decoration: none; 
            color: inherit; 
        }

        /* Reference section styling - match React */
        .reference-item {
            margin-bottom: 10px;
        }

        .reference-name {
            font-size: 12px;
            font-weight: 700;
            color: #000000;
            margin-bottom: 4px;
        }

        .reference-relationship {
            font-size: 12px;
            color: #666666;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-top: 4px;
            margin-bottom: 4px;
        }

        .reference-contact {
            font-size: 12px;
            color: #666666;
            margin-top: 4px;
        }

    </style>
    @php
        $design = $settings['design'] ?? ($resume['settings']['design'] ?? null);
        $sec = $design['sectionSpacing'] ?? null;
        $para = $design['paragraphSpacing'] ?? null;
        $lp = $design['lineSpacing'] ?? null;
        $lh = $lp ? max(1.0, min(2.2, $lp/100)) : null;
        $fontStyle = $design['fontStyle'] ?? null;
    @endphp
    <style>
        @if(!is_null($sec))
        .experience-item, .education-item, .reference-item { margin-bottom: {{ (int)$sec }}px !important; }
        @endif
        @if(!is_null($para))
        .profile-summary, .education-degree, .experience-company, .experience-title, li { margin-bottom: {{ (int)$para }}px !important; }
        @endif
        @if(!is_null($lh))
        body, .profile-summary, li { line-height: {{ $lh }} !important; }
        @endif
        @if($fontStyle==='small')
        body { font-size: 11px !important; }
        @elseif($fontStyle==='large')
        body { font-size: 15px !important; }
        @endif
    </style>
</head>
<body>
    @php
        $formatMonthYear = function ($value) {
            if (empty($value)) return '';
            $ts = strtotime($value);
            if ($ts === false) { return $value; }
            return date('M Y', $ts);
        };
        
        $contact = $resume['contact'] ?? [];
        $experiences = $resume['experiences'] ?? [];
        $education = $resume['education'] ?? [];
        $skills = $resume['skills'] ?? [];
        $languages = $resume['languages'] ?? [];
        $hobbies = $resume['hobbies'] ?? [];
        $certifications = $resume['certifications'] ?? [];
        $awards = $resume['awards'] ?? [];
        $websites = $resume['websites'] ?? [];
        $references = $resume['references'] ?? [];
        $customSections = $resume['customSections'] ?? [];
        $summary = $resume['summary'] ?? '';
        
        $locationParts = array_filter([
            $contact['address'] ?? null,
            $contact['city'] ?? null,
            $contact['country'] ?? null,
            $contact['postCode'] ?? null,
        ]);
        
        // Helper function to check if array has meaningful content
        $hasContent = function($array, $fields) {
            if (empty($array)) return false;
            return count(array_filter($array, function($item) use ($fields) {
                if (empty($item) || !is_array($item)) return false;
                foreach ($fields as $field) {
                    if (!empty($item[$field]) && trim($item[$field]) !== '') {
                        return true;
                    }
                }
                return false;
            })) > 0;
        };
        
        // Check for meaningful content in each section
        $hasValidExperiences = $hasContent($experiences, ['company', 'jobTitle', 'description']);
        $hasValidEducation = $hasContent($education, ['school', 'degree', 'description']);
        $hasValidCertifications = $hasContent($certifications, ['title', 'name']);
        $hasValidAwards = $hasContent($awards, ['title', 'name']);
        $hasValidReferences = $hasContent($references, ['name', 'relationship', 'contactInfo']);
        $hasValidCustomSections = $hasContent($customSections, ['title', 'content']);
        $hasValidLanguages = $hasContent($languages, ['name', 'language']);
        $hasValidWebsites = $hasContent($websites, ['url', 'label']);
        
        // Skills validation
        $hasValidSkills = !empty($skills) && count(array_filter($skills, function($skill) {
            $skillName = is_array($skill) ? ($skill['name'] ?? '') : $skill;
            return !empty($skillName) && trim($skillName) !== '';
        })) > 0;
        
        // Hobbies validation  
        $hasValidHobbies = !empty($hobbies) && count(array_filter($hobbies, function($hobby) {
            $hobbyName = is_array($hobby) ? ($hobby['name'] ?? '') : $hobby;
            return !empty($hobbyName) && trim($hobbyName) !== '';
        })) > 0;
    @endphp

    <!-- Header Section -->
    <div class="header">
        <div class="header-content">
            <div class="header-left">
                <div class="name">
                    @if(!empty($contact['firstName']) || !empty($contact['lastName']))
                        {{ ($contact['firstName'] ?? '') }} {{ ($contact['lastName'] ?? '') }}
                    @else
                        Your Name
                    @endif
                </div>
                @if(!empty($contact['desiredJobTitle']))
                    <div class="title">{{ $contact['desiredJobTitle'] }}</div>
                @endif
            </div>
            
            <!-- Contact Information -->
            <div class="contact-info">
                @if (!empty($contact['phone']))
                    <div class="contact-item">
                        <span class="contact-icon phone-icon"></span>
                        <span class="contact-text">{{ $contact['phone'] }}</span>
                    </div>
                @endif
                @if (!empty($contact['email']))
                    <div class="contact-item">
                        <span class="contact-icon email-icon"></span>
                        <span class="contact-text">{{ $contact['email'] }}</span>
                    </div>
                @endif
                @if (!empty($locationParts))
                    <div class="contact-item">
                        <span class="contact-icon location-icon"></span>
                        <span class="contact-text">{{ implode(', ', $locationParts) }}</span>
                    </div>
                @endif
            </div>
        </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
        <!-- About Me Section - Only show if summary exists -->
        @if(!empty($summary) && trim($summary) !== '')
        <div class="section-title">ABOUT ME</div>
        <div class="profile-summary">
            {!! nl2br(e($summary)) !!}
        </div>
        @endif

        <!-- Experience Section - Match React format exactly -->
        @if($hasValidExperiences)
        <div class="experience-section">
            <div class="section-title">EXPERIENCE</div>
            @foreach ($experiences as $exp)
                @if(!empty($exp['company']) || !empty($exp['jobTitle']) || !empty($exp['description']))
                    @php
                        $desc = $exp['description'] ?? '';
                        $items = array_values(array_filter(preg_split("/(\r\n|\n|\r)/", $desc)));
                    @endphp
                    <div class="experience-item">
                        <div class="experience-company">
                            {{ $exp['company'] ?? 'Company Name' }} 
                            @if(!empty($exp['startDate']))
                                {{ $formatMonthYear($exp['startDate']) }} - 
                                @if(!empty($exp['endDate'])){{ $formatMonthYear($exp['endDate']) }}@endif
                            @endif
                        </div>
                        @if(!empty($exp['jobTitle']))
                            <div class="experience-title">{{ $exp['jobTitle'] }}</div>
                        @endif
                        @if(!empty($exp['location']))
                            <div class="experience-location">{{ $exp['location'] }}</div>
                        @endif
                        @if(count($items) > 0)
                            @foreach ($items as $line)
                                @if(trim($line) !== '')
                                    <div style="font-size: 12px; color: #000000; line-height: 1.5; margin-bottom: 2px;">{{ $line }}</div>
                                @endif
                            @endforeach
                        @elseif(!empty($desc) && trim($desc) !== '')
                            <div style="font-size: 12px; color: #000000; line-height: 1.5;">{{ $desc }}</div>
                        @endif
                    </div>
                @endif
            @endforeach
        </div>
        @endif

        <!-- Education Section - Match Experience format -->
        @if($hasValidEducation)
        <div class="section-title">EDUCATION</div>
        @foreach ($education as $edu)
            @if(!empty($edu['school']) || !empty($edu['degree']) || !empty($edu['description']))
                <div class="education-item">
                    @if(!empty($edu['school']))
                        <div class="education-school">
                            {{ $edu['school'] }}
                            @if(!empty($edu['startDate']))
                                {{ $formatMonthYear($edu['startDate']) }} - 
                                @if(!empty($edu['endDate'])){{ $formatMonthYear($edu['endDate']) }}@endif
                            @endif
                        </div>
                    @endif
                    @if(!empty($edu['degree']))
                        <div class="education-degree">{{ $edu['degree'] }}</div>
                    @endif
                    @if(!empty($edu['location']))
                        <div class="experience-location">{{ $edu['location'] }}</div>
                    @endif
                    @if(!empty($edu['description']) && trim($edu['description']) !== '')
                        <div style="font-size: 12px; color: #000000; line-height: 1.5;">{{ $edu['description'] }}</div>
                    @endif
                </div>
            @endif
        @endforeach
        @endif

        {{-- Enhanced Skills Section HTML - Replace your existing skills section --}}
@if($hasValidSkills)
<div class="section-title">SKILLS</div>
@php
    // Filter valid skills with enhanced validation
    $validSkills = array_filter($skills, function($skill) {
        $skillName = is_array($skill) ? ($skill['name'] ?? '') : $skill;
        return !empty($skillName) && trim($skillName) !== '';
    });
    
    $totalSkills = count($validSkills);
    $showExperienceLevel = $resume['showExperienceLevel'] ?? false;
    
    // Enhanced skill level mapping function
    $getSkillLevelBullets = function($level) {
        if (empty($level)) return 3; // Default to 3 for better visual balance
        $levelLower = strtolower(trim($level));
        
        // More comprehensive level mapping
        if (str_contains($levelLower, 'expert') || str_contains($levelLower, 'master')) return 5;
        if (str_contains($levelLower, 'experienced') || str_contains($levelLower, 'advanced')) return 4;
        if (str_contains($levelLower, 'skillful') || str_contains($levelLower, 'intermediate')) return 3;
        if (str_contains($levelLower, 'beginner') || str_contains($levelLower, 'basic')) return 2;
        if (str_contains($levelLower, 'novice') || str_contains($levelLower, 'learning')) return 1;
        
        return 3; // Default fallback
    };
    
    // Calculate optimal grid distribution
    if ($totalSkills > 0) {
        if ($totalSkills <= 2) {
            $firstSkillsCount = $totalSkills;
            $secondSkillsCount = 0;
        } else {
            $firstSkillsCount = ceil($totalSkills / 2);
            $secondSkillsCount = $totalSkills - $firstSkillsCount;
        }
        
        $firstSkills = array_slice($validSkills, 0, $firstSkillsCount);
        $secondSkills = $secondSkillsCount > 0 ? array_slice($validSkills, $firstSkillsCount, $secondSkillsCount) : [];
    }
@endphp

@if($totalSkills > 0)
    @if($showExperienceLevel)
        {{-- Enhanced Skills Grid with Level Bullets --}}
        <div class="skills-grid">
            <div class="skills-row">
                <div class="skill-item">
                    @foreach ($firstSkills as $skill)
                        @php
                            $skillName = is_array($skill) ? ($skill['name'] ?? '') : $skill;
                            $skillLevel = is_array($skill) ? ($skill['level'] ?? 'Intermediate') : 'Intermediate';
                            $bullets = $getSkillLevelBullets($skillLevel);
                        @endphp
                        <div class="skill-content" style="margin-bottom: 8px;">
                            <span class="skill-name-enhanced">{{ $skillName }}</span>
                            <div class="skill-bullets-enhanced">
                                @for ($i = 1; $i <= 5; $i++)
                                    <div class="skill-bullet-enhanced {{ $i <= $bullets ? 'active' : '' }}"></div>
                                @endfor
                            </div>
                        </div>
                    @endforeach
                </div>
                
                <div class="skill-item">
                    @foreach ($secondSkills as $skill)
                        @php
                            $skillName = is_array($skill) ? ($skill['name'] ?? '') : $skill;
                            $skillLevel = is_array($skill) ? ($skill['level'] ?? 'Intermediate') : 'Intermediate';
                            $bullets = $getSkillLevelBullets($skillLevel);
                        @endphp
                        <div class="skill-content" style="margin-bottom: 8px;">
                            <span class="skill-name-enhanced">{{ $skillName }}</span>
                            <div class="skill-bullets-enhanced">
                                @for ($i = 1; $i <= 5; $i++)
                                    <div class="skill-bullet-enhanced {{ $i <= $bullets ? 'active' : '' }}"></div>
                                @endfor
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>
    @else
        {{-- Simple Skills Grid without Level Indicators --}}
        <div class="skills-simple-grid">
            <div class="skills-simple-row">
                <div class="skills-simple-item">
                    @foreach ($firstSkills as $skill)
                        @php
                            $skillName = is_array($skill) ? ($skill['name'] ?? '') : $skill;
                        @endphp
                        <div style="margin-bottom: 4px;">{{ $skillName }}</div>
                    @endforeach
                </div>
                
                <div class="skills-simple-item">
                    @foreach ($secondSkills as $skill)
                        @php
                            $skillName = is_array($skill) ? ($skill['name'] ?? '') : $skill;
                        @endphp
                        <div style="margin-bottom: 4px;">{{ $skillName }}</div>
                    @endforeach
                </div>
            </div>
        </div>
    @endif
@endif
@endif

        <!-- Languages Section - FIXED for PDF compatibility -->
        @if($hasValidLanguages)
        <div class="section-row">
            <div class="section-title">LANGUAGES</div>
            @foreach ($languages as $lang)
                @if(!empty($lang) && is_array($lang))
                    @php
                        $langName = $lang['name'] ?? $lang['language'] ?? '';
                    @endphp
                    @if(!empty($langName) && trim($langName) !== '')
                        <div class="language-item">
                            <div class="language-bullet"></div>
                            <div class="language-text">
                                {{ htmlspecialchars($langName) }} 
                                @if(!empty($lang['proficiency']) && trim($lang['proficiency']) !== '')
                                    <span style="color: #666666;">({{ htmlspecialchars($lang['proficiency']) }})</span>
                                @endif
                            </div>
                        </div>
                    @endif
                @endif
            @endforeach
        </div>
        @endif

        <!-- Certifications Section - FIXED for PDF compatibility -->
        @if($hasValidCertifications)
        <div class="section-row">
            <div class="section-title">CERTIFICATIONS</div>
            <ul class="custom-bullet-list">
                @foreach ($certifications as $cert)
                    @if(!empty($cert) && is_array($cert))
                        @php
                            $certTitle = $cert['title'] ?? $cert['name'] ?? '';
                        @endphp
                        @if(!empty($certTitle) && trim($certTitle) !== '')
                            <li class="custom-bullet-item">
                                <div class="custom-bullet"></div>
                                <div class="custom-bullet-text">{{ htmlspecialchars($certTitle) }}</div>
                            </li>
                        @endif
                    @endif
                @endforeach
            </ul>
        </div>
        @endif

        <!-- Awards Section - FIXED for PDF compatibility -->
        @if($hasValidAwards)
        <div class="section-row">
            <div class="section-title">AWARDS</div>
            <ul class="custom-bullet-list">
                @foreach ($awards as $award)
                    @if(!empty($award) && is_array($award))
                        @php
                            $awardTitle = $award['title'] ?? $award['name'] ?? '';
                        @endphp
                        @if(!empty($awardTitle) && trim($awardTitle) !== '')
                            <li class="custom-bullet-item">
                                <div class="custom-bullet"></div>
                                <div class="custom-bullet-text">{{ htmlspecialchars($awardTitle) }}</div>
                            </li>
                        @endif
                    @endif
                @endforeach
            </ul>
        </div>
        @endif

        <!-- Websites Section - Match React format -->
        @if($hasValidWebsites)
        <div class="section-row">
            <div class="section-title">WEBSITES</div>
            @foreach ($websites as $site)
                @if(!empty($site) && is_array($site) && !empty($site['url']) && trim($site['url']) !== '')
                    <div class="website-item">
                        <div class="website-label">
                            {{ !empty($site['label']) && trim($site['label']) !== '' ? htmlspecialchars($site['label']) : 'Website' }}
                        </div>
                        <a href="{{ htmlspecialchars($site['url']) }}" class="website-url" target="_blank" rel="noopener noreferrer">
                            {{ htmlspecialchars($site['url']) }}
                        </a>
                    </div>
                @endif
            @endforeach
        </div>
        @endif

        <!-- Interests Section - FIXED for PDF compatibility -->
        @if($hasValidHobbies)
        <div class="section-row">
            <div class="section-title">INTERESTS</div>
            <ul class="custom-bullet-list">
                @foreach ($hobbies as $hobby)
                    @php
                        $hobbyName = is_array($hobby) ? ($hobby['name'] ?? '') : $hobby;
                    @endphp
                    @if(!empty($hobbyName) && trim($hobbyName) !== '')
                        <li class="custom-bullet-item">
                            <div class="custom-bullet"></div>
                            <div class="custom-bullet-text">{{ htmlspecialchars($hobbyName) }}</div>
                        </li>
                    @endif
                @endforeach
            </ul>
        </div>
        @endif

        <!-- References Section - Match React format -->
        @if($hasValidReferences)
        <div class="section-row">
            <div class="section-title">REFERENCES</div>
            @foreach ($references as $ref)
                @if(!empty($ref) && is_array($ref))
                    @if((!empty($ref['name']) && trim($ref['name']) !== '') || 
                        (!empty($ref['relationship']) && trim($ref['relationship']) !== '') || 
                        (!empty($ref['contactInfo']) && trim($ref['contactInfo']) !== ''))
                        <div class="reference-item">
                            @if(!empty($ref['name']) && trim($ref['name']) !== '')
                                <div class="reference-name">{{ htmlspecialchars($ref['name']) }}</div>
                            @endif
                            @if(!empty($ref['relationship']) && trim($ref['relationship']) !== '')
                                <div class="reference-relationship">{{ htmlspecialchars($ref['relationship']) }}</div>
                            @endif
                            @if(!empty($ref['contactInfo']) && trim($ref['contactInfo']) !== '')
                                <div class="reference-contact">{{ htmlspecialchars($ref['contactInfo']) }}</div>
                            @endif
                        </div>
                    @endif
                @endif
            @endforeach
        </div>
        @endif

        <!-- Custom Sections - Match React format -->
        @if($hasValidCustomSections)
            @foreach ($customSections as $custom)
                @if((!empty($custom['title']) && trim($custom['title']) !== '') || (!empty($custom['content']) && trim($custom['content']) !== ''))
                    <div class="section-row">
                        <div class="section-title">{{ strtoupper($custom['title'] ?? 'CUSTOM SECTION') }}</div>
                        <div style="font-size: 12px; color: #000000; line-height: 1.5; margin-bottom: 8px;">{!! nl2br(e($custom['content'] ?? '')) !!}</div>
                    </div>
                @endif
            @endforeach
        @endif
    </div>
</body>
</html>