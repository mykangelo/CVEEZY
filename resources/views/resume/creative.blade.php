@php
use App\Helpers\BulletProcessor;
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Resume</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html, body {
            margin: 0 !important;
            padding: 0 !important;
            font-family: DejaVu Sans, Arial, sans-serif;
            font-size: 14px;
            color: #333;
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        
        /* Ensure no top spacing from any source */
        body > *:first-child {
            margin-top: 0 !important;
            padding-top: 0 !important;
        }

        .resume-container {
            max-width: 896px; /* max-w-4xl equivalent */
            margin: 0 auto;
            background: white;
            box-shadow: none;
            padding: 0;
        }

        /* Header Section - Exact match to JSX */
        .header-section {
            display: flex;
            width: 100%;
            max-width: 100%;
        }

        .header-left {
            width: 60%;
            display: flex;
            align-items: flex-start;
        }

        .header-left-content {
            background-color: #000;
            color: white;
            padding: 32px;
        }

        .header-left h1 {
            font-size: 30px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 8px;
            word-wrap: break-word;
            overflow-wrap: break-word;
            color: white;
        }

        .header-left .job-title {
            font-size: 18px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #d1d5db;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        .header-right {
            background: white;
            padding: 32px;
            width: 40%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 16px;
            padding-top: 20px;
        }

        .contact-item {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .contact-icon {
            width: 32px;
            height: 32px;
            border: 1px solid #000;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            font-size: 14px;
        }

        .contact-icon.phone::before {
            content: '☎';
            font-size: 14px;
            color: #000;
        }

        .contact-icon.email::before {
            content: '✉';
            font-size: 14px;
            color: #000;
        }

        .contact-icon.location::before {
            content: '⚲';
            font-size: 14px;
            color: #000;
        }

        .contact-text {
            font-size: 14px;
            color: #000;
            line-height: 1.4;
            word-break: break-word;
            overflow-wrap: break-word;
            flex: 1;
            min-width: 0;
        }

        /* Main Content - Two Column Layout */
        .content-section {
            border-top: 1px solid #000;
            padding: 24px 0;
            display: flex;
        }

        .section-title {
            width: 25%;
        }

        .section-title h2 {
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #000;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        .section-content {
            width: 75%;
        }

        .section-content p {
            color: #1f2937;
            font-size: 14px;
            line-height: 1.6;
            margin: 0;
            white-space: pre-line;
        }

        /* Experience Items */
        .experience-item {
            margin-bottom: 24px;
        }

        .experience-item:last-child {
            margin-bottom: 0;
        }

        .experience-header {
            margin-bottom: 4px;
        }

        .experience-header h3 {
            font-weight: bold;
            font-size: 14px;
            color: #000;
        }

        .experience-title {
            color: #374151;
            font-size: 14px;
            margin-bottom: 4px;
        }

        .experience-location {
            color: #6b7280;
            font-size: 12px;
            font-style: italic;
        }

        .experience-description {
            color: #1f2937;
            font-size: 14px;
            line-height: 1.6;
        }

        /* Education Layout */
        .education-item {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
        }

        .education-item:last-child {
            margin-bottom: 0;
        }

        .education-left {
            width: 50%;
        }

        .education-right {
            width: 50%;
            margin-left: -12px;
        }

        .education-date {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 4px;
        }

        .education-school {
            font-size: 12px;
            color: #374151;
            margin-bottom: 4px;
        }

        .education-degree {
            font-size: 12px;
            font-weight: bold;
        }

        .education-description {
            font-size: 12px;
            color: #1f2937;
            line-height: 1.6;
        }

        /* Skills */
        .skills-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px 8px;
        }

        .skill-item {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .skill-name {
            font-size: 14px;
            color: #1f2937;
            font-weight: 500;
        }

        .skill-bullets {
            display: flex;
            align-items: center;
            gap: 2px;
        }

        .skill-bullet {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: #d1d5db;
        }

        .skill-bullet.active {
            background-color: #000;
        }

        /* Skills without level display */
        .skills-simple-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px 4px;
        }

        .skills-simple-item {
            font-size: 14px;
            color: #1f2937;
        }

        /* Additional Sections - 3 Column Grid */
        .additional-sections {
            border-top: 1px solid #000;
            padding: 24px 0;
        }

        .sections-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 24px;
        }

        .additional-section h3 {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 12px;
            color: #1f2937;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }

        /* Language Bars */
        .language-item {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
        }

        .language-item:last-child {
            margin-bottom: 0;
        }

        .language-name {
            font-size: 12px;
            font-weight: 500;
        }

        .language-bars {
            display: flex;
            gap: 2px;
        }

        .language-bar {
            width: 8px;
            height: 2px;
            background-color: #d1d5db;
        }

        .language-bar.active {
            background-color: #000;
        }

        /* Bullet Lists */
        .bullet-list {
            list-style: none;
        }

        .bullet-list li {
            font-size: 12px;
            margin-bottom: 4px;
            display: flex;
            align-items: flex-start;
        }

        .bullet-list li::before {
            content: '';
            width: 4px;
            height: 4px;
            background-color: #000;
            border-radius: 50%;
            margin-top: 6px;
            margin-right: 8px;
            flex-shrink: 0;
        }

        /* Website Links */
        .website-item {
            margin-bottom: 4px;
        }

        .website-item:last-child {
            margin-bottom: 0;
        }

        .website-label {
            font-size: 12px;
            font-weight: 500;
            margin-bottom: 2px;
        }

        .website-url {
            font-size: 12px;
            color: #2563eb;
            text-decoration: underline;
            word-break: break-all;
            word-wrap: break-word;
            overflow-wrap: break-word;
            line-height: 1.3;
            display: block;
        }

        /* References */
        .reference-item {
            margin-bottom: 12px;
            font-size: 12px;
        }

        .reference-item:last-child {
            margin-bottom: 0;
        }

        .reference-name {
            font-weight: bold;
            color: #1f2937;
        }

        .reference-relationship {
            color: #6b7280;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin: 4px 0;
        }

        .reference-contact {
            color: #374151;
        }

        /* Custom Sections */
        .custom-content {
            color: #1f2937;
            font-size: 14px;
            line-height: 1.6;
            white-space: pre-line;
        }

                /* Print-specific overrides */
        @media print {
            html, body {
                margin: 0 !important;
                padding: 0 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            .resume-container {
                box-shadow: none !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            
            .header-section {
                margin: 0 !important;
                padding: 0 !important;
                max-width: 100% !important;
            }
            
            .header-left-content {
                padding: 24px !important;
            }
            
            .header-right {
                padding: 24px !important;
            }
            
            .content-section {
                padding: 24px 0 !important;
            }
            
            .additional-sections {
                padding: 24px 0 !important;
            }
            
            .sections-grid {
                gap: 24px !important;
            }
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
        .content-section, .section, .additional-sections { margin-bottom: {{ (int)$sec }}px !important; }
        @endif
        @if(!is_null($para))
        .section-content p, .experience-description, .education-description, .bullet-list li, .contact-text, .custom-content { margin-bottom: {{ (int)$para }}px !important; }
        @endif
        @if(!is_null($lh))
        body, .section-content p, .experience-description, .education-description, .bullet-list li, .contact-text, .custom-content { line-height: {{ $lh }} !important; }
        @endif
        @if($fontStyle==='small')
        body { font-size: 13px !important; }
        @elseif($fontStyle==='large')
        body { font-size: 16px !important; }
        @endif
    </style>
</head>
<body>
    <div class="resume-container">
        {{-- Header Section --}}
        <div class="header-section">
            {{-- Left Column --}}
            <div class="header-left">
                <div class="header-left-content">
                <h1>{{ $resume['contact']['firstName'] ?? '' }} {{ $resume['contact']['lastName'] ?? '' }}</h1>
                <p class="job-title">{{ $resume['contact']['desiredJobTitle'] ?? '' }}</p>
                </div>
            </div>

            {{-- Right Column --}}
            <div class="header-right">
                @if (!empty($resume['contact']['phone']))
                    <div class="contact-item">
                        <div class="contact-icon phone"></div>
                        <span class="contact-text">{{ $resume['contact']['phone'] }}</span>
                    </div>
                @endif

                @if (!empty($resume['contact']['email']))
                    <div class="contact-item">
                        <div class="contact-icon email"></div>
                        <span class="contact-text">{{ $resume['contact']['email'] }}</span>
                    </div>
                @endif

                @php
                    $locationParts = array_filter([
                        $resume['contact']['address'] ?? '',
                        $resume['contact']['city'] ?? '',
                        $resume['contact']['country'] ?? '',
                        $resume['contact']['postCode'] ?? ''
                    ]);
                @endphp

                @if (!empty($locationParts))
                    <div class="contact-item">
                        <div class="contact-icon location"></div>
                        <span class="contact-text">{{ implode(', ', $locationParts) }}</span>
                    </div>
                @endif
            </div>
        </div>

            {{-- About Me / Summary --}}
            @if (!empty($resume['summary']) && trim($resume['summary']) !== '')
            <div class="content-section">
                    <div class="section-title">
                        <h2>ABOUT ME</h2>
                    </div>
                    <div class="section-content">
                        <p>{{ $resume['summary'] }}</p>
                    </div>
                </div>
            @endif

            {{-- Experience --}}
            @php
                $validExperiences = [];
                if (!empty($resume['experiences']) && is_array($resume['experiences'])) {
                    foreach ($resume['experiences'] as $exp) {
                        if (!empty($exp) && (
                            !empty($exp['company'] ?? '') ||
                            !empty($exp['jobTitle'] ?? '') ||
                            !empty($exp['description'] ?? '') ||
                            !empty($exp['startDate'] ?? '') ||
                            !empty($exp['endDate'] ?? '')
                        )) {
                            $validExperiences[] = $exp;
                        }
                    }
                }
            @endphp

            @if (!empty($validExperiences))
            <div class="content-section">
                    <div class="section-title">
                        <h2>EXPERIENCE</h2>
                    </div>
                <div class="section-content">
                        @foreach ($validExperiences as $exp)
                            <div class="experience-item">
                                <div class="experience-header">
                                    <h3>{{ $exp['company'] ?? '' }} {{ $exp['startDate'] ?? '' }}{{ ($exp['startDate'] ?? '') && ($exp['endDate'] ?? '') ? ' - ' : '' }}{{ $exp['endDate'] ?? '' }}</h3>
                                    @if (!empty($exp['jobTitle']))
                                        <p class="experience-title">{{ $exp['jobTitle'] }}</p>
                                    @endif
                                @if (!empty($exp['location']))
                                    <p class="experience-location">{{ $exp['location'] }}</p>
                                @endif
                            </div>
                                @if (!empty($exp['description']))
                                    @php 
                                        $processedBullets = BulletProcessor::processBulletedDescription($exp['description']);
                                        $hasBullets = BulletProcessor::hasBullets($processedBullets);
                                    @endphp
                                    @if ($hasBullets)
                                    <ul class="bullet-list">
                                            @foreach (BulletProcessor::getBulletTexts($processedBullets) as $text)
                                            <li class="experience-description">{{ $text }}</li>
                                            @endforeach
                                        </ul>
                                    @else
                                        <p class="experience-description">{{ $exp['description'] }}</p>
                                    @endif
                                @endif
                            </div>
                        @endforeach
                    </div>
                </div>
            @endif

            {{-- Education --}}
            @php
                $validEducation = [];
                if (!empty($resume['education']) && is_array($resume['education'])) {
                    foreach ($resume['education'] as $edu) {
                        if (!empty($edu) && (
                            !empty($edu['school'] ?? '') ||
                            !empty($edu['degree'] ?? '') ||
                            !empty($edu['description'] ?? '') ||
                            !empty($edu['startDate'] ?? '') ||
                            !empty($edu['endDate'] ?? '')
                        )) {
                            $validEducation[] = $edu;
                        }
                    }
                }
            @endphp

            @if (!empty($validEducation))
            <div class="content-section">
                    <div class="section-title">
                        <h2>EDUCATION</h2>
                    </div>
                <div class="section-content">
                        @foreach ($validEducation as $edu)
                            <div class="education-item">
                                <div class="education-left">
                                    @if (!empty($edu['startDate']) || !empty($edu['endDate']))
                                        <p class="education-date">{{ $edu['startDate'] ?? '' }}{{ ($edu['startDate'] ?? '') && ($edu['endDate'] ?? '') ? ' - ' : '' }}{{ $edu['endDate'] ?? '' }}</p>
                                    @endif
                                    @if (!empty($edu['school']) || !empty($edu['location']))
                                        <p class="education-school">
                                            {{ $edu['school'] ?? '' }}
                                            @if (!empty($edu['location']) && !empty($edu['school']))
                                                — {{ $edu['location'] }}
                                            @elseif (!empty($edu['location']))
                                                {{ $edu['location'] }}
                                            @endif
                                        </p>
                                    @endif
                                    @if (!empty($edu['degree']))
                                        <h4 class="education-degree">{{ $edu['degree'] }}</h4>
                                    @endif
                                </div>
                                <div class="education-right">
                                    @if (!empty($edu['description']))
                                        @php 
                                            $lines = preg_split('/\r\n|\r|\n/', (string)$edu['description']);
                                            $hasBullets = false;
                                            foreach ($lines as $line) {
                                                if (preg_match('/^[•\-–\*]\s*/u', trim($line))) {
                                                    $hasBullets = true;
                                                    break;
                                                }
                                            }
                                        @endphp
                                        @if ($hasBullets)
                                        <ul class="bullet-list">
                                                @foreach ($lines as $line)
                                                    @php $t = trim($line); @endphp
                                                    @if ($t !== '')
                                                        @if (preg_match('/^([•\-–\*])\s*(.+)$/u', $t, $matches))
                                                        <li class="education-description">{{ trim($matches[2]) }}</li>
                                                        @else
                                                        <li class="education-description">{{ $t }}</li>
                                                        @endif
                                                    @endif
                                                @endforeach
                                            </ul>
                                        @else
                                            <p class="education-description">{{ $edu['description'] }}</p>
                                        @endif
                                    @endif
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
            @endif

        {{-- Skills --}}
            @php
                $validSkills = [];
                if (!empty($resume['skills']) && is_array($resume['skills'])) {
                    foreach ($resume['skills'] as $skill) {
                        if (!empty($skill['name'] ?? '') && trim($skill['name']) !== '') {
                            $validSkills[] = $skill;
                        }
                    }
                }
                
                $showExperienceLevel = $resume['showExperienceLevel'] ?? false;
            @endphp

            @if (!empty($validSkills))
            <div class="content-section">
                    <div class="section-title">
                        <h2>SKILLS</h2>
                    </div>
                    <div class="section-content">
                        @if ($showExperienceLevel)
                            <div class="skills-grid">
                            @foreach ($validSkills as $skill)
                                            <div class="skill-item">
                                                    <span class="skill-name">{{ $skill['name'] }}</span>
                                                    <div class="skill-bullets">
                                                        @php
                                                            $level = strtolower(trim($skill['level'] ?? ''));
                                            $bulletCount = 1;
                                                            
                                                            if (str_contains($level, 'expert')) {
                                                                $bulletCount = 5;
                                                            } elseif (str_contains($level, 'experienced')) {
                                                                $bulletCount = 4;
                                                            } elseif (str_contains($level, 'skillful')) {
                                                                $bulletCount = 3;
                                                            } elseif (str_contains($level, 'beginner')) {
                                                                $bulletCount = 2;
                                                            } elseif (str_contains($level, 'novice')) {
                                                                $bulletCount = 1;
                                                            }
                                                        @endphp
                                                        @for ($i = 1; $i <= 5; $i++)
                                                            <div class="skill-bullet {{ $i <= $bulletCount ? 'active' : '' }}"></div>
                                                        @endfor
                                                </div>
                                    </div>
                                @endforeach
                            </div>
                        @else
                            <div class="skills-simple-grid">
                            @foreach ($validSkills as $skill)
                                            <div class="skills-simple-item">
                                                {{ $skill['name'] }}
                                    </div>
                                @endforeach
                            </div>
                        @endif
                    </div>
                </div>
            @endif

            {{-- Additional Sections --}}
            @php
                $additionalSections = [];
                
                // Languages
                if (!empty($resume['languages']) && is_array($resume['languages'])) {
                    $validLanguages = [];
                    foreach ($resume['languages'] as $lang) {
                        if (!empty($lang['name'] ?? '') && trim($lang['name']) !== '') {
                            $validLanguages[] = $lang;
                        }
                    }
                    if (!empty($validLanguages)) {
                        $additionalSections[] = ['id' => 'languages', 'title' => 'Languages', 'content' => $validLanguages];
                    }
                }
                
                // Certifications
                if (!empty($resume['certifications']) && is_array($resume['certifications'])) {
                    $validCertifications = [];
                    foreach ($resume['certifications'] as $cert) {
                        $certName = is_array($cert) ? ($cert['title'] ?? $cert['name'] ?? '') : $cert;
                        if (!empty($certName) && trim($certName) !== '') {
                            $validCertifications[] = $cert;
                        }
                    }
                    if (!empty($validCertifications)) {
                        $additionalSections[] = ['id' => 'certifications', 'title' => 'Certifications', 'content' => $validCertifications];
                    }
                }
                
                // Awards
                if (!empty($resume['awards']) && is_array($resume['awards'])) {
                    $validAwards = [];
                    foreach ($resume['awards'] as $award) {
                        $awardName = is_array($award) ? ($award['title'] ?? $award['name'] ?? '') : $award;
                        if (!empty($awardName) && trim($awardName) !== '') {
                            $validAwards[] = $award;
                        }
                    }
                    if (!empty($validAwards)) {
                        $additionalSections[] = ['id' => 'awards', 'title' => 'Awards', 'content' => $validAwards];
                    }
                }
                
                // Websites
                if (!empty($resume['websites']) && is_array($resume['websites'])) {
                    $validWebsites = [];
                    foreach ($resume['websites'] as $site) {
                        if (!empty($site['url'] ?? '') && trim($site['url']) !== '') {
                            $validWebsites[] = $site;
                        }
                    }
                    if (!empty($validWebsites)) {
                        $additionalSections[] = ['id' => 'websites', 'title' => 'Websites', 'content' => $validWebsites];
                    }
                }
                
                // Hobbies/Interests
                if (!empty($resume['hobbies']) && is_array($resume['hobbies'])) {
                    $validHobbies = [];
                    foreach ($resume['hobbies'] as $hobby) {
                        $hobbyName = is_array($hobby) ? ($hobby['title'] ?? $hobby['name'] ?? '') : $hobby;
                        if (!empty($hobbyName) && trim($hobbyName) !== '') {
                            $validHobbies[] = $hobby;
                        }
                    }
                    if (!empty($validHobbies)) {
                        $additionalSections[] = ['id' => 'hobbies', 'title' => 'Interests', 'content' => $validHobbies];
                    }
                }
                
                // References
                if (!empty($resume['references']) && is_array($resume['references'])) {
                    $validReferences = [];
                    foreach ($resume['references'] as $ref) {
                        if (!empty($ref['name'] ?? '') && trim($ref['name']) !== '') {
                            $validReferences[] = $ref;
                        }
                    }
                    if (!empty($validReferences)) {
                        $additionalSections[] = ['id' => 'references', 'title' => 'References', 'content' => $validReferences];
                    }
                }
            @endphp

            @if (!empty($additionalSections))
                <div class="additional-sections">
                    <div class="sections-grid">
                    @foreach ($additionalSections as $section)
                                    <div class="additional-section">
                                        <h3>{{ $section['title'] }}</h3>
                                        
                                        @if ($section['id'] == 'languages')
                                            @foreach ($section['content'] as $lang)
                                                <div class="language-item">
                                                    <span class="language-name">{{ $lang['name'] }}</span>
                                                    <div class="language-bars">
                                                        @php
                                                            $proficiency = strtolower($lang['proficiency'] ?? '');
                                                            $barCount = 3;
                                                            
                                                            if (str_contains($proficiency, 'beginner') || str_contains($proficiency, 'basic')) {
                                                                $barCount = 1;
                                                            } elseif (str_contains($proficiency, 'intermediate')) {
                                                                $barCount = 2;
                                                            } elseif (str_contains($proficiency, 'advanced')) {
                                                                $barCount = 3;
                                                            } elseif (str_contains($proficiency, 'fluent')) {
                                                                $barCount = 4;
                                                            } elseif (str_contains($proficiency, 'native') || str_contains($proficiency, 'expert')) {
                                                                $barCount = 5;
                                                            }
                                                        @endphp
                                                        @for ($i = 1; $i <= 5; $i++)
                                                            <div class="language-bar {{ $i <= $barCount ? 'active' : '' }}"></div>
                                                        @endfor
                                                    </div>
                                                </div>
                                            @endforeach
                                            
                                        @elseif ($section['id'] == 'websites')
                                            @foreach ($section['content'] as $site)
                                                <div class="website-item">
                                                    @if (!empty($site['label']))
                                                        <div class="website-label">{{ $site['label'] }}</div>
                                                    @endif
                                                    <a href="{{ $site['url'] }}" class="website-url">{{ $site['url'] }}</a>
                                                </div>
                                            @endforeach
                                            
                                        @elseif ($section['id'] == 'references')
                                            @foreach ($section['content'] as $ref)
                                                <div class="reference-item">
                                                    <div class="reference-name">{{ $ref['name'] }}</div>
                                                    @if (!empty($ref['relationship']))
                                                        <div class="reference-relationship">{{ $ref['relationship'] }}</div>
                                                    @endif
                                                    @if (!empty($ref['contactInfo']))
                                                        <div class="reference-contact">
                                                            <div>{{ $ref['contactInfo'] }}</div>
                                                        </div>
                                                    @endif
                                                </div>
                                            @endforeach
                                            
                                        @elseif ($section['id'] == 'certifications')
                                            @php 
                                                $allCertTexts = array_map(function($item) {
                                                    return is_array($item) ? ($item['title'] ?? $item['name'] ?? '') : $item;
                                                }, $section['content']);
                                                $processedBullets = array_map(function($title) {
                                                    return BulletProcessor::processBulletedDescription($title);
                                                }, $allCertTexts);
                                                $hasAnyBullets = false;
                                                foreach ($processedBullets as $bullets) {
                                                    if (BulletProcessor::hasBullets($bullets)) {
                                                        $hasAnyBullets = true;
                                                        break;
                                                    }
                                                }
                                                
                                                if (!$hasAnyBullets) {
                                                    $certsLine = implode(', ', $allCertTexts);
                                                    if (strlen($certsLine) > 100 && strpos($certsLine, ',') !== false) {
                                                        $certItems = array_map('trim', explode(',', $certsLine));
                                                        $certItems = array_filter($certItems, function($item) { return !empty($item); });
                                                        $hasLongCertList = true;
                                                    } else {
                                                        $hasLongCertList = false;
                                                    }
                                                }
                                            @endphp
                                            @if ($hasAnyBullets)
                                                <ul class="bullet-list">
                                                    @foreach ($processedBullets as $bullets)
                                                        @foreach (BulletProcessor::getBulletTexts($bullets) as $text)
                                                            <li>{{ $text }}</li>
                                                        @endforeach
                                                    @endforeach
                                                </ul>
                                            @elseif ($hasLongCertList)
                                                <ul class="bullet-list">
                                                    @foreach ($certItems as $cert)
                                                        <li>{{ $cert }}</li>
                                                    @endforeach
                                                </ul>
                                            @else
                                                <ul class="bullet-list">
                                                    @foreach ($section['content'] as $item)
                                                        <li>{{ is_array($item) ? ($item['title'] ?? $item['name'] ?? '') : $item }}</li>
                                                    @endforeach
                                                </ul>
                                            @endif
                                        @else
                                            <ul class="bullet-list">
                                                @foreach ($section['content'] as $item)
                                                    <li>{{ is_array($item) ? ($item['title'] ?? $item['name'] ?? '') : $item }}</li>
                                                @endforeach
                                            </ul>
                                        @endif
                                    </div>
                                @endforeach
                    </div>
                </div>
            @endif

            {{-- Custom Sections --}}
            @php
                $validCustomSections = [];
                if (!empty($resume['customSections']) && is_array($resume['customSections'])) {
                    foreach ($resume['customSections'] as $custom) {
                        if (!empty($custom['title'] ?? '') && !empty($custom['content'] ?? '') && 
                            trim($custom['title']) !== '' && trim($custom['content']) !== '') {
                            $validCustomSections[] = $custom;
                        }
                    }
                }
            @endphp

            @if (!empty($validCustomSections))
                @foreach ($validCustomSections as $custom)
                <div class="content-section">
                        <div class="section-title">
                            <h2>{{ strtoupper($custom['title']) }}</h2>
                        </div>
                        <div class="section-content">
                            <p class="custom-content">{{ $custom['content'] }}</p>
                        </div>
                    </div>
                @endforeach
            @endif
    </div>
</body>
</html>