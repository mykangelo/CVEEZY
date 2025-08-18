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

        body {
            font-family: DejaVu Sans, Arial, sans-serif;
            margin: 0;
            font-size: 14px;
            color: #333;
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .resume-container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 32px;
        }

        /* Header Section - Use table layout for better PDF support */
        .header-section {
            display: table;
            width: 100%;
            table-layout: fixed;
            margin-bottom: 24px; /* Reduced margin */
        }

        .header-left {
            display: table-cell;
            background-color: #000;
            color: white;
            padding: 32px;
            vertical-align: middle;
            width: 60%;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .header-left h1 {
            font-size: 24px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 8px;
            color: white;
        }

        .header-left .job-title {
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #ccc;
        }

        .header-right {
            display: table-cell;
            background: white;
            padding: 20px 32px;
            vertical-align: middle;
            width: 40%;
        }

        .contact-item {
            margin-bottom: 16px;
            position: relative;
            padding-left: 55px;
            display: flex;
            align-items: flex-start;
        }

        .contact-item:last-child {
            margin-bottom: 0;
        }

        .contact-icon {
            position: absolute;
            left: 0;
            top: 0;
            width: 45px;
            height: 45px;
            border: 1px solid #000;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            font-weight: normal;
            color: #000;
            flex-shrink: 0;
        }

        .contact-icon.phone::before {
            content: '☎';
            font-size: 16px;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        .contact-icon.email::before {
            content: '✉';
            font-size: 16px;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        .contact-icon.location::before {
            content: '⚲';
            font-size: 16px;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        .contact-text {
            font-size: 14px;
            color: #000;
            line-height: 1.4;
            word-break: break-all;
            overflow-wrap: anywhere;
            hyphens: auto;
            flex: 1;
            min-width: 0;
        }

        /* Main Content - Improved spacing */
        .main-content {
            padding: 0;
        }

        .content-section {
            display: table;
            width: 100%;
            border-top: 1px solid #000;
            padding: 12px 0; /* Reduced padding */
            table-layout: fixed;
            page-break-inside: avoid; /* Prevent breaking sections */
        }
        h1, h2, h3 { page-break-after: avoid; }

        /* Enhanced page break and overflow prevention */
        .content-section, .experience-item, .education-item, .skill-item, .hobby-item, .website-item, .reference-item {
            page-break-inside: avoid;
            break-inside: avoid;
        }
        
        /* Ensure proper page breaks for all elements */
        h1, h2, h3, .section-title {
            page-break-after: avoid;
            break-after: avoid;
        }
        
        /* Prevent text overflow and ensure proper wrapping */
        p, li, .job-title, .company, .degree, .school, .skill-name, .hobby-name, .website-label, .reference-name {
            word-wrap: break-word;
            overflow-wrap: break-word;
            hyphens: auto;
        }
        
        /* Force page breaks when content exceeds page height */
        .content-section:last-child {
            page-break-inside: auto;
        }

        /* Dynamic section spacing based on content */
        .content-section.compact {
            padding: 8px 0;
        }

        .content-section.standard {
            padding: 12px 0;
        }

        .content-section.extended {
            padding: 16px 0;
        }

        .section-title {
            display: table-cell;
            width: 25%;
            padding-right: 32px;
            vertical-align: top;
        }

        .section-title h2 {
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #000;
        }

        .section-content {
            display: table-cell;
            width: 75%;
            vertical-align: top;
        }

        .section-content p {
            color: #333;
            font-size: 14px;
            line-height: 1.6;
            margin: 0;
        }

        /* Experience Items - Improved spacing */
        .experience-item {
            padding: 12px 0; /* Reduced padding */
            border-top: 1px solid #ddd;
        }

        .experience-item:first-child {
            border-top: none;
            padding-top: 0;
        }

        .experience-item:last-child {
            padding-bottom: 0;
        }

        /* Single experience item gets less spacing */
        .experience-single .experience-item {
            padding: 8px 0;
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
            color: #555;
            font-size: 14px;
            margin-bottom: 8px;
        }

        .experience-description {
            color: #333;
            font-size: 14px;
            line-height: 1.6;
        }

        /* Education Layout - Improved spacing */
        .education-item {
            display: table;
            width: 100%;
            table-layout: fixed;
            padding: 12px 0; /* Reduced padding */
            border-top: 1px solid #ddd;
        }

        .education-item:first-child {
            border-top: none;
            padding-top: 0;
        }

        .education-item:last-child {
            padding-bottom: 0;
        }

        /* Single education item gets less spacing */
        .education-single .education-item {
            padding: 8px 0;
        }

        .education-left {
            display: table-cell;
            width: 50%;
            padding-right: 16px;
            vertical-align: top;
        }

        .education-right {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }

        .education-date {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 4px;
        }

        .education-school {
            font-size: 14px;
            color: #555;
            margin-bottom: 4px;
        }

        .education-degree {
            font-size: 14px;
            font-weight: bold;
        }

        .education-description {
            font-size: 14px;
            color: #333;
            line-height: 1.5;
        }

        /* Skills - Responsive grid */
        .skills-grid {
            display: table;
            width: 100%;
        }

        .skills-row {
            display: table-row;
        }

        .skill-item {
            display: table-cell;
            width: 50%;
            padding-right: 32px;
            padding-bottom: 12px; /* Reduced padding */
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

        .skill-name {
            display: table-cell;
            font-size: 14px;
            color: #333;
            font-weight: normal; /* Changed from 500 to normal to match other text */
            width: auto;
            white-space: nowrap;
            padding-right: 8px;
        }

        .skill-bullets {
            display: table-cell;
            width: auto;
            vertical-align: middle;
        }

        .skill-bullet {
            display: inline-block;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: #ccc;
            margin-left: 2px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .skill-bullet.active {
            background-color: #000;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        /* Additional Sections - More compact */
        .additional-sections {
            border-top: 1px solid #000;
            padding: 12px 0 0 0; /* Reduced padding */
        }

        .sections-grid {
            display: table;
            width: 100%;
            table-layout: fixed;
        }

        .sections-row {
            display: table-row;
        }

        .sections-row:not(:first-child) .additional-section {
            padding-top: 12px; /* Reduced padding */
        }

        .additional-section {
            display: table-cell;
            width: 33.33%;
            padding-right: 24px;
            vertical-align: top;
        }

        .additional-section:last-child {
            padding-right: 0;
        }

        .additional-section h3 {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 8px; /* Reduced margin */
            color: #333;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* Language Bars - More compact */
        .language-item {
            display: table;
            width: 100%;
            table-layout: fixed;
            margin-bottom: 8px; /* Reduced margin */
        }

        .language-name {
            font-size: 14px;
            font-weight: normal; /* Changed from 500 to normal to match other text */
            width: auto;
            white-space: nowrap;
        }

        .language-bars {
            display: table-cell;
            width: auto;
        }

        .language-bar {
            display: inline-block;
            width: 8px;
            height: 2px;
            background-color: #ccc;
            margin-left: 2px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .language-bar.active {
            background-color: #000;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        /* Bullet Lists - More compact */
        .bullet-list {
            list-style: none;
        }

        .bullet-list li {
            font-size: 14px;
            margin-bottom: 3px; /* Reduced margin */
            position: relative;
            padding-left: 12px;
        }

        .bullet-list li::before {
            content: '•';
            position: absolute;
            left: 0;
            color: #000;
            font-weight: bold;
        }

        /* Website Links */
        .website-item {
            margin-bottom: 6px; /* Reduced margin */
        }

        .website-label {
            font-size: 14px;
            font-weight: normal; /* Changed from 500 to normal to match other text */
            margin-bottom: 2px;
        }

        .website-url {
            font-size: 12px;
            color: #2563eb;
            text-decoration: underline;
            word-break: break-all;
            word-wrap: break-word;
            overflow-wrap: break-word;
            hyphens: auto;
            line-height: 1.3;
            display: block;
            max-width: 100%;
        }

        /* References - More compact */
        .reference-item {
            margin-bottom: 10px; /* Reduced margin */
            font-size: 14px;
        }

        .reference-name {
            font-weight: bold;
            color: #333;
        }

        .reference-relationship {
            color: #555;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 4px 0;
        }

        .reference-contact {
            color: #555;
        }

        .reference-contact .label {
            font-weight: normal; /* Changed from 500 to normal to match other text */
        }

        /* Custom Sections */
        .custom-content {
            color: #333;
            font-size: 14px;
            line-height: 1.6;
            white-space: pre-line;
        }

        /* Responsive adjustments for content length */
        .content-short {
            margin-bottom: 16px;
        }

        .content-medium {
            margin-bottom: 20px;
        }

        .content-long {
            margin-bottom: 24px;
        }

        /* Print-specific overrides */
        @media print {
            body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            .resume-container {
                box-shadow: none !important;
                max-width: none !important;
                padding: 16px !important; /* More compact for print */
            }
            
            .header-left {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                background-color: #000 !important;
            }
            
            .skill-bullet.active,
            .language-bar.active {
                background-color: #000 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            .website-url {
                word-break: break-all !important;
                overflow-wrap: break-word !important;
                hyphens: auto !important;
                font-size: 11px !important;
            }

            .contact-icon::before {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color: #000 !important;
            }

            /* More aggressive spacing reduction for print */
            .content-section {
                padding: 8px 0 !important;
                page-break-inside: avoid !important;
            }

            .experience-item {
                padding: 8px 0 !important;
            }

            .education-item {
                padding: 8px 0 !important;
            }

            .additional-sections {
                padding: 8px 0 0 0 !important;
            }

            .header-section {
                margin-bottom: 16px !important;
            }

            .contact-text {
                word-break: break-all !important;
                overflow-wrap: anywhere !important;
                hyphens: auto !important;
            }
        }

        /* Media queries for different content scenarios */
        @media screen and (max-height: 800px) {
            .content-section {
                padding: 10px 0;
            }
            
            .experience-item,
            .education-item {
                padding: 10px 0;
            }
        }
    </style>
</head>
<body>
    <div class="resume-container">
        {{-- Header Section --}}
        <div class="header-section">
            {{-- Left Column --}}
            <div class="header-left">
                <h1>{{ $resume['contact']['firstName'] ?? '' }} {{ $resume['contact']['lastName'] ?? '' }}</h1>
                <p class="job-title">{{ $resume['contact']['desiredJobTitle'] ?? '' }}</p>
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

        {{-- Main Content --}}
        <div class="main-content">
            {{-- About Me / Summary --}}
            @if (!empty($resume['summary']))
                <div class="content-section compact">
                    <div class="section-title">
                        <h2>ABOUT ME</h2>
                    </div>
                    <div class="section-content">
                        <p>{{ $resume['summary'] }}</p>
                    </div>
                </div>
            @endif

            {{-- Experience --}}
            @if (!empty($resume['experiences']) && is_array($resume['experiences']))
                @php
                    $expClass = count($resume['experiences']) === 1 ? 'experience-single' : '';
                    $sectionClass = count($resume['experiences']) === 1 ? 'compact' : 'standard';
                @endphp
                <div class="content-section {{ $sectionClass }}">
                    <div class="section-title">
                        <h2>EXPERIENCE</h2>
                    </div>
                    <div class="section-content {{ $expClass }}">
                        @foreach ($resume['experiences'] as $exp)
                            <div class="experience-item">
                                <div class="experience-header">
                                    <h3>{{ $exp['company'] ?? '' }} {{ $exp['startDate'] ?? '' }} - {{ $exp['endDate'] ?? '' }}</h3>
                                    <p class="experience-title">{{ $exp['jobTitle'] ?? '' }}</p>
                                </div>
                                @if (!empty($exp['location']))
                                    <p class="experience-title" style="color:#666; font-style: italic; margin-top:-4px;">{{ $exp['location'] }}</p>
                                @endif
                                @if (!empty($exp['description']))
                                    <p class="experience-description">{{ $exp['description'] }}</p>
                                @endif
                            </div>
                        @endforeach
                    </div>
                </div>
            @endif

            {{-- Education --}}
            @if (!empty($resume['education']) && is_array($resume['education']) && count($resume['education']) > 0)
                @php
                    $eduClass = count($resume['education']) === 1 ? 'education-single' : '';
                    $sectionClass = count($resume['education']) === 1 ? 'compact' : 'standard';
                @endphp
                <div class="content-section {{ $sectionClass }}">
                    <div class="section-title">
                        <h2>EDUCATION</h2>
                    </div>
                    <div class="section-content {{ $eduClass }}">
                        @foreach ($resume['education'] as $edu)
                            @if (!empty($edu))
                                <div class="education-item">
                                    <div class="education-left">
                                        <p class="education-date">{{ $edu['startDate'] ?? '' }} - {{ $edu['endDate'] ?? '' }}</p>
                                        <p class="education-school">
                                            {{ $edu['school'] ?? '' }}
                                            @if (!empty($edu['location']))
                                                — {{ $edu['location'] }}
                                            @endif
                                        </p>
                                        <h4 class="education-degree">{{ $edu['degree'] ?? '' }}</h4>
                                    </div>
                                    <div class="education-right">
                                        @if (!empty($edu['description']))
                                            <p class="education-description">{{ $edu['description'] }}</p>
                                        @endif
                                    </div>
                                </div>
                            @endif
                        @endforeach
                    </div>
                </div>
            @endif

            {{-- Skills --}}
            @if (!empty($resume['skills']) && is_array($resume['skills']))
                @php
                    $sectionClass = count($resume['skills']) <= 4 ? 'compact' : 'standard';
                @endphp
                <div class="content-section {{ $sectionClass }}">
                    <div class="section-title">
                        <h2>SKILLS</h2>
                    </div>
                    <div class="section-content">
                        <div class="skills-grid">
                            @php
                                $skillChunks = array_chunk($resume['skills'], 2);
                            @endphp
                            @foreach ($skillChunks as $skillPair)
                                <div class="skills-row">
                                    @foreach ($skillPair as $skill)
                                        <div class="skill-item">
                                            <div class="skill-content">
                                                <span class="skill-name">{{ $skill['name'] ?? '' }}</span>
                                                @if (!empty($skill['level']))
                                                    <div class="skill-bullets">
                                                        @php
                                                            $level = strtolower(trim($skill['level'] ?? ''));
                                                            $bulletCount = 3;
                                                            
                                                            if (str_contains($level, 'expert')) {
                                                                $bulletCount = 5;
                                                            } elseif (str_contains($level, 'experienced') || str_contains($level, 'advanced')) {
                                                                $bulletCount = 4;
                                                            } elseif (str_contains($level, 'intermediate')) {
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
                                                @endif
                                            </div>
                                        </div>
                                    @endforeach
                                    {{-- Fill empty cell if odd number of skills --}}
                                    @if (count($skillPair) == 1)
                                        <div class="skill-item"></div>
                                    @endif
                                </div>
                            @endforeach
                        </div>
                    </div>
                </div>
            @endif

            {{-- Additional Sections --}}
            @php
                $additionalSections = [];
                
                if (!empty($resume['languages']) && is_array($resume['languages'])) {
                    $additionalSections[] = ['id' => 'languages', 'title' => 'Languages', 'content' => $resume['languages']];
                }
                if (!empty($resume['certifications']) && is_array($resume['certifications'])) {
                    $additionalSections[] = ['id' => 'certifications', 'title' => 'Certifications', 'content' => $resume['certifications']];
                }
                if (!empty($resume['awards']) && is_array($resume['awards'])) {
                    $additionalSections[] = ['id' => 'awards', 'title' => 'Awards', 'content' => $resume['awards']];
                }
                if (!empty($resume['websites']) && is_array($resume['websites'])) {
                    $additionalSections[] = ['id' => 'websites', 'title' => 'Websites', 'content' => $resume['websites']];
                }
                if (!empty($resume['hobbies']) && is_array($resume['hobbies'])) {
                    $additionalSections[] = ['id' => 'hobbies', 'title' => 'Interests', 'content' => $resume['hobbies']];
                }
                if (!empty($resume['references']) && is_array($resume['references'])) {
                    $additionalSections[] = ['id' => 'references', 'title' => 'References', 'content' => $resume['references']];
                }
                
                $sectionCount = count($additionalSections);
            @endphp

            @if (!empty($additionalSections))
                <div class="additional-sections">
                    <div class="sections-grid">
                        @php
                            $sectionChunks = array_chunk($additionalSections, 3);
                        @endphp
                        @foreach ($sectionChunks as $sectionRow)
                            <div class="sections-row">
                                @foreach ($sectionRow as $section)
                                    <div class="additional-section">
                                        <h3>{{ $section['title'] }}</h3>
                                        
                                        @if ($section['id'] == 'languages')
                                            @foreach ($section['content'] as $lang)
                                                <div class="language-item">
                                                    <span class="language-name">{{ $lang['name'] ?? '' }}</span>
                                                    <span class="language-spacing"></span>
                                                    <div class="language-bars">
                                                        @php
                                                            $proficiency = strtolower($lang['proficiency'] ?? '');
                                                            $barCount = 3;
                                                            
                                                            if (str_contains($proficiency, 'beginner') || str_contains($proficiency, 'basic')) {
                                                                $barCount = 2;
                                                            } elseif (str_contains($proficiency, 'intermediate')) {
                                                                $barCount = 3;
                                                            } elseif (str_contains($proficiency, 'advanced') || str_contains($proficiency, 'fluent')) {
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
                                                    <div class="website-label">{{ $site['label'] ?? '' }}</div>
                                                    <a href="{{ $site['url'] ?? '' }}" class="website-url">{{ $site['url'] ?? '' }}</a>
                                                </div>
                                            @endforeach
                                            
                                        @elseif ($section['id'] == 'references')
                                            @foreach ($section['content'] as $ref)
                                                <div class="reference-item">
                                                    <div class="reference-name">{{ $ref['name'] ?? '' }}</div>
                                                    @if (!empty($ref['relationship']))
                                                        <div class="reference-relationship">{{ $ref['relationship'] }}</div>
                                                    @endif
                                                    @if (!empty($ref['contactInfo']))
                                                        <div class="reference-contact">
                                                            <div class="label">Phone</div>
                                                            <div>{{ $ref['contactInfo'] }}</div>
                                                        </div>
                                                    @endif
                                                </div>
                                            @endforeach
                                            
                                        @else
                                            <ul class="bullet-list">
                                                @if(is_array($section['content']))
                                                    @foreach ($section['content'] as $item)
                                                        <li>{{ is_array($item) ? ($item['title'] ?? $item['name'] ?? '') : $item }}</li>
                                                    @endforeach
                                                @endif
                                            </ul>
                                        @endif
                                    </div>
                                @endforeach
                                
                                {{-- Fill empty cells for proper table layout --}}
                                @for ($i = count($sectionRow); $i < 3; $i++)
                                    <div class="additional-section"></div>
                                @endfor
                            </div>
                        @endforeach
                    </div>
                </div>
            @endif

            {{-- Custom Sections --}}
            @if (!empty($resume['customSections']) && is_array($resume['customSections']))
                @foreach ($resume['customSections'] as $custom)
                    <div class="content-section compact">
                        <div class="section-title">
                            <h2>{{ strtoupper($custom['title'] ?? '') }}</h2>
                        </div>
                        <div class="section-content">
                            <p class="custom-content">{{ $custom['content'] ?? '' }}</p>
                        </div>
                    </div>
                @endforeach
            @endif
        </div>
    </div>
</body>
</html>