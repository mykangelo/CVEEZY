<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Resume</title>
    <style>
        @font-face {
            font-family: 'Elegant Grotesk';
            src: url('/fonts/alte_haas_grotesk/AlteHaasGroteskRegular.ttf') format('truetype');
            font-weight: 400;
            font-style: normal;
            font-display: swap;
        }
        @font-face {
            font-family: 'Elegant Grotesk';
            src: url('/fonts/alte_haas_grotesk/AlteHaasGroteskBold.ttf') format('truetype');
            font-weight: 700;
            font-style: normal;
            font-display: swap;
        }
        
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
            color: #333333;
            background: #ffffff;
            padding: 24px 32px;
            max-width: 100%;
            margin: 0 auto;
            font-feature-settings: "kern" 1;
            text-rendering: optimizeLegibility;
        }

        h1, h2, h3, p {
            margin: 0;
            padding: 0;
            font-weight: inherit;
        }

        .header-top-separator {
            border-top: 1px solid #D1D5DB;
            margin-bottom: 16px;
        }
        
        .header {
            position: relative;
            text-align: center;
            margin-bottom: 20px;
            overflow: hidden;
            height: 85px;
        }
        
        .signature {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) translateY(4px);
            font-family: "Times New Roman", "Georgia", serif;
            font-size: 120px;
            line-height: 1;
            opacity: 0.08;
            z-index: 0;
            pointer-events: none;
            color: #333333;
        }
        
        .name {
            font-size: 32px;
            font-weight: 800;
            letter-spacing: 0.18em;
            line-height: 1.1;
            position: relative;
            z-index: 1;
            margin-top: 20px;
        }
        
        .title {
            margin-top: 2px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.35em;
            position: relative;
            z-index: 1;
        }

        .content-wrapper {
            border-top: 1px solid #D1D5DB;
            border-bottom: 1px solid #D1D5DB;
        }
        
        .grid {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }
        
        .grid td {
            vertical-align: top;
            padding: 0;
        }
        
        .grid tr {
            page-break-inside: avoid;
        }
        
        .grid tr + tr td {
            border-top: 1px solid #D1D5DB;
        }
        
        .cell-left {
            width: 33.33%;
            padding: 16px 0;
            border-right: 1px solid #D1D5DB;
        }
        
        .cell-right {
            width: 66.67%;
            padding: 16px 0 16px 20px;
        }
        
        .inner {
            padding-left: 8px;
            overflow: hidden;
        }

        .section-title {
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.25em;
            margin-bottom: 8px;
        }

        .subdivider {
            border: 0;
            border-top: 1px solid #D1D5DB;
            height: 0;
            margin: 14px -16px 0 0;
        }

        .contact-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .contact-item {
            display: flex;
            align-items: center;
            margin-bottom: 6px;
            font-size: 12px;
            line-height: 1.4;
        }

        .contact-icon {
            width: 12px;
            height: 12px;
            margin-right: 8px;
            flex-shrink: 0;
            display: inline-block;
            text-align: center;
            font-size: 12px;
            line-height: 12px;
        }

        .contact-text {
            flex: 1;
            word-wrap: break-word;
            overflow-wrap: break-word;
            word-break: break-word;
        }

        .contact-text a {
            text-decoration: none;
            color: inherit;
        }

        .contact-text a:hover {
            text-decoration: none;
            color: inherit;
        }

        .phone-icon::before { content: "☎"; }
        .email-icon::before { content: "✉"; }
        .location-icon::before { content: "⚲"; }
        .linkedin-icon::before { content: "모"; }
        .web-icon::before { content: "모"; }
        
        .small {
            font-size: 10px;
            color: #666666;
            line-height: 1.3;
        }
        
        .bold {
            font-weight: 600;
        }
        
        .mb-1 { margin-bottom: 3px; }
        .mb-2 { margin-bottom: 6px; }
        .mb-3 { margin-bottom: 8px; }
        .mt-1 { margin-top: 3px; }

        ul {
            margin: 0;
            padding-left: 16px;
            line-height: 1.4;
        }
        
        li {
            margin-bottom: 2px;
            font-size: 12px;
            line-height: 1.4;
        }

        .skills-container { margin-top: 3px; }

        /* === NEW BULLETPROOF FIX USING TABLE DISPLAY === */
        .skill-item {
            display: table;
            width: 100%;
            margin-bottom: 8px;
            border-collapse: collapse;
            border-spacing: 0;
        }
        .skill-name {
            display: table-cell;
            vertical-align: middle;
            padding-right: 0px;
        }
        .skill-dots {
            display: table-cell;
            vertical-align: middle;
            width: 1%;
            white-space: nowrap;
            transform: translateX(-10px);
        }
        .skill-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            display: inline-block;
            margin-left: 2px; /* Replaces gap for better compatibility */
        }
        .skill-dots .skill-dot:first-child { margin-left: 0; }
        /* ============================================= */

        .skill-dot.filled { background-color: #333333; }
        .skill-dot.empty { background-color: #D1D5DB; }

        .experience-item { margin-bottom: 12px; }
        .experience-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 2px;
        }
        .experience-company { font-size: 12px; font-weight: 600; }
        .experience-date { font-size: 10px; color: #666666; }
        .experience-title { font-size: 12px; margin-bottom: 4px; }

        .education-item { margin-bottom: 8px; }
        .education-degree { font-size: 12px; font-weight: 600; margin-bottom: 2px; }
        .education-school { font-size: 12px; margin-bottom: 2px; }
        .education-date { font-size: 10px; color: #666666; }

        .profile-summary { font-size: 12px; line-height: 1.4; }

        .additional-section { margin-bottom: 10px; }
        .additional-section:last-child { margin-bottom: 0; }

        .experience-item, .education-item, .skill-item { page-break-inside: avoid; }
        h1, h2, h3, .section-title { page-break-after: avoid; }
        table { page-break-inside: auto; }
        
        p, li, span, div {
            word-wrap: break-word;
            overflow-wrap: break-word;
            word-break: break-word;
            hyphens: auto;
        }

        .experience-title, .education-school, .profile-summary {
            word-wrap: break-word;
            overflow-wrap: break-word;
            word-break: break-word;
            hyphens: auto;
        }

        .no-underline { text-decoration: none; color: #333333; }
        
        a { text-decoration: none; color: #333333; }
        a:hover { text-decoration: none; color: #333333; }

        /*
         * Compact the body content without affecting the top header
         * (signature, name, position). All overrides are scoped under
         * `.content-wrapper` so the header remains unchanged.
         */
        .content-wrapper .cell-left {
            padding: 12px 0;
        }
        .content-wrapper .cell-right {
            padding: 12px 0 12px 14px;
        }
        .content-wrapper .subdivider {
            margin: 10px -16px 0 0;
        }
        .content-wrapper .contact-item {
            margin-bottom: 4px;
            font-size: 11px;
        }
        .content-wrapper .profile-summary {
            font-size: 11px;
            line-height: 1.35;
        }
        .content-wrapper .experience-item { margin-bottom: 8px; }
        .content-wrapper .education-item { margin-bottom: 6px; }
        .content-wrapper .skills-container .skill-item { margin-bottom: 1px; }
        .content-wrapper .section-title { margin-bottom: 6px; letter-spacing: 0.22em; }
        .content-wrapper li,
        .content-wrapper .skill-name,
        .content-wrapper .experience-company,
        .content-wrapper .experience-title,
        .content-wrapper .education-degree,
        .content-wrapper .education-school { font-size: 11px; }
        .content-wrapper .education-date,
        .content-wrapper .experience-date,
        .content-wrapper .small { font-size: 9px; }

    </style>
</head>
<body style="font-family: DejaVu Sans, Arial, sans-serif;">
    @php
        $formatMonthYear = function ($value) {
            if (empty($value)) return '';
            $ts = strtotime($value);
            if ($ts === false) { return $value; }
            return date('F Y', $ts);
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
        
        $initials = '';
        if (!empty($contact['firstName'])) {
            $initials .= strtoupper(substr($contact['firstName'], 0, 1));
        }
        if (!empty($contact['lastName'])) {
            $initials .= strtoupper(substr($contact['lastName'], 0, 1));
        }
        if (empty($initials)) {
            $initials = 'YN';
        }
        
        $locationParts = array_filter([
            $contact['address'] ?? null,
            $contact['city'] ?? null,
            $contact['country'] ?? null,
            $contact['postCode'] ?? null,
        ]);
        
        // Improved logic to check for meaningful content
        $hasValidCertifications = !empty($certifications) && count(array_filter($certifications, function($cert) {
            return !empty($cert['title']) && trim($cert['title']) !== '';
        })) > 0;
        
        $hasValidAwards = !empty($awards) && count(array_filter($awards, function($award) {
            return !empty($award['title']) && trim($award['title']) !== '';
        })) > 0;
        
        $hasValidReferences = !empty($references) && count(array_filter($references, function($ref) {
            return (!empty($ref['name']) && trim($ref['name']) !== '') || 
                   (!empty($ref['relationship']) && trim($ref['relationship']) !== '') ||
                   (!empty($ref['contactInfo']) && trim($ref['contactInfo']) !== '');
        })) > 0;
        
        $hasValidCustomSections = !empty($customSections) && count(array_filter($customSections, function($custom) {
            return (!empty($custom['title']) && trim($custom['title']) !== '') ||
                   (!empty($custom['content']) && trim($custom['content']) !== '');
        })) > 0;
        
        $hasAdditionalContent = $hasValidCertifications || $hasValidAwards || $hasValidReferences || $hasValidCustomSections;
    @endphp

    <div class="header-top-separator"></div>

    <div class="header">
        <div class="signature">{{ $initials }}</div>
        <div class="name">{{ ($contact['firstName'] ?? '') }} {{ ($contact['lastName'] ?? '') }}</div>
        @if(!empty($contact['desiredJobTitle']))
            <div class="title">{{ $contact['desiredJobTitle'] }}</div>
        @endif
    </div>

    <div class="content-wrapper">
        <table class="grid">
            <tr>
                <td class="cell-left">
                    <div class="inner">
                        <div class="section-title">CONTACT</div>
                        <ul class="contact-list">
                            @if (!empty($contact['phone']))
                                <li class="contact-item">
                                    <span class="contact-icon">☎</span>
                                    <span class="contact-text">{{ $contact['phone'] }}</span>
                                </li>
                            @endif
                            @if (!empty($contact['email']))
                                <li class="contact-item">
                                    <span class="contact-icon">✉</span>
                                    <span class="contact-text">{{ $contact['email'] }}</span>
                                </li>
                            @endif
                            @if (!empty($locationParts))
                                <li class="contact-item">
                                    <span class="contact-icon">⚲</span>
                                    <span class="contact-text">{{ implode(', ', $locationParts) }}</span>
                                </li>
                            @endif
                            @if (!empty($websites))
                                @foreach ($websites as $site)
                                    <li class="contact-item">
                                        <span class="contact-icon">모</span>
                                        <span class="contact-text">
                                            @if(!empty($site['label']) && stripos($site['url'] ?? '', 'linkedin') !== false)
                                                LinkedIn: {{ str_replace(['http://', 'https://'], '', $site['url'] ?? '') }}
                                            @elseif(!empty($site['label']))
                                                {{ $site['label'] }}: {{ str_replace(['http://', 'https://'], '', $site['url'] ?? '') }}
                                            @else
                                                {{ str_replace(['http://', 'https://'], '', $site['url'] ?? '') }}
                                            @endif
                                        </span>
                                    </li>
                                @endforeach
                            @endif
                        </ul>
                    </div>
                </td>
                <td class="cell-right">
                    <div style="padding-left: 20px;">
                        <div class="section-title">PROFILE SUMMARY</div>
                        <div class="profile-summary">
                            @if(!empty($summary))
                                {!! nl2br(e($summary)) !!}
                            @else
                                Use this section to give recruiters a quick glimpse of your professional profile. In just 3–4 lines, highlight your background, education and main skills.
                            @endif
                        </div>
                    </div>
                </td>
            </tr>

            <tr>
                <td class="cell-left">
                    <div class="inner">
                        <div class="section-title">EDUCATION</div>
                        <div class="mt-1">
                            @if(!empty($education))
                                @foreach ($education as $edu)
                                    <div class="education-item">
                                        <div class="education-degree">{{ $edu['degree'] ?? 'Degree in Field of study' }}</div>
                                        <div class="education-school">
                                            {{ $edu['school'] ?? 'School Name' }}
                                            @if(!empty($edu['location']))
                                                — {{ $edu['location'] }}
                                            @endif
                                        </div>
                                        <div class="education-date">
                                            {{ $formatMonthYear($edu['startDate'] ?? '2017') }}
                                            @if(!empty($edu['endDate']) || empty($edu['startDate']))
                                                — {{ $formatMonthYear($edu['endDate'] ?? '2020') }}
                                            @endif
                                        </div>
                                        @if(!empty($edu['description']))
                                            <div class="mt-1">{{ $edu['description'] }}</div>
                                        @endif
                                    </div>
                                @endforeach
                            @else
                                <div class="education-item">
                                    <div class="education-degree">Degree in Field of study</div>
                                    <div class="education-school">School Name — Location</div>
                                    <div class="education-date">2017 — 2020</div>
                                </div>
                            @endif
                        </div>

                        <hr class="subdivider" />

                        <div style="padding-top: 12px;">
                            <div class="section-title">SKILLS</div>
                            <div class="skills-container">
                                @if(!empty($skills))
                                    @foreach ($skills as $skill)
                                        @php
                                            $level = $skill['level'] ?? 'Experienced';
                                            $dotCount = 4;
                                            if ($level == 'Novice') $dotCount = 1;
                                            elseif ($level == 'Beginner') $dotCount = 2;
                                            elseif ($level == 'Skillful') $dotCount = 3;
                                            elseif ($level == 'Experienced') $dotCount = 4;
                                            elseif ($level == 'Expert') $dotCount = 5;
                                        @endphp
                                        <div class="skill-item">
                                            <span class="skill-name">{{ $skill['name'] ?? 'Skill' }}</span>
                                            <div class="skill-dots">
                                                @for ($i = 0; $i < 5; $i++)
                                                    <span class="skill-dot {{ $i < $dotCount ? 'filled' : 'empty' }}"></span>
                                                @endfor
                                            </div>
                                        </div>
                                    @endforeach
                                @else
                                    <div class="skill-item">
                                        <span class="skill-name">Skill 1</span>
                                        <div class="skill-dots">
                                            @for ($i = 0; $i < 5; $i++)
                                                <span class="skill-dot {{ $i < 4 ? 'filled' : 'empty' }}"></span>
                                            @endfor
                                        </div>
                                    </div>
                                @endif
                            </div>
                        </div>

                        @if (!empty($languages))
                            <hr class="subdivider" />
                            <div style="padding-top: 12px;">
                                <div class="section-title">LANGUAGES</div>
                                <ul class="mt-1">
                                    @foreach ($languages as $lang)
                                        <li>{{ $lang['name'] }}
                                            @if(!empty($lang['proficiency']))
                                                ({{ $lang['proficiency'] }})
                                            @endif
                                        </li>
                                    @endforeach
                                </ul>
                            </div>
                        @endif
                        
                        @if (!empty($hobbies))
                            <hr class="subdivider" />
                            <div style="padding-top: 12px;">
                                <div class="section-title">HOBBIES</div>
                                <ul class="mt-1">
                                    @foreach ($hobbies as $hobby)
                                        {{-- This handles hobbies as simple strings or as objects with a 'name' key --}}
                                        <li>{{ is_array($hobby) ? ($hobby['name'] ?? '') : $hobby }}</li>
                                    @endforeach
                                </ul>
                            </div>
                        @endif

                    </div>
                </td>
                <td class="cell-right">
                    <div style="padding-left: 20px;">
                        <div class="section-title">WORK EXPERIENCE</div>
                        <div style="margin-top: 3px;">
                            @if(!empty($experiences))
                                @foreach ($experiences as $exp)
                                    @php
                                        $desc = $exp['description'] ?? '';
                                        $items = array_values(array_filter(preg_split("/(\r\n|\n|\r)/", $desc)));
                                    @endphp
                                    <div class="experience-item">
                                        <div class="experience-header">
                                            <div class="experience-company">{{ $exp['company'] ?? 'Company' }}</div>
                                            <div class="experience-date">
                                                {{ $formatMonthYear($exp['startDate'] ?? 'Sep 2017') }} — {{ $formatMonthYear($exp['endDate'] ?? 'May 2020') }}
                                            </div>
                                        </div>
                                        <div class="experience-title">
                                            {{ $exp['jobTitle'] ?? 'Job Title' }}
                                            @if(!empty($exp['location']))
                                                – {{ $exp['location'] }}
                                            @endif
                                        </div>
                                        @if(count($items) > 0)
                                            <ul>
                                                @foreach ($items as $line)
                                                    <li>{{ $line }}</li>
                                                @endforeach
                                            </ul>
                                        @elseif(!empty($desc))
                                            <div>{{ $desc }}</div>
                                        @else
                                            <ul>
                                                <li>Responsibilities</li>
                                                <li>Responsibilities</li>
                                            </ul>
                                        @endif
                                    </div>
                                @endforeach
                            @else
                                <div class="experience-item">
                                    <div class="experience-header">
                                        <div class="experience-company">Company</div>
                                        <div class="experience-date">Sep 2017 — May 2020</div>
                                    </div>
                                    <div class="experience-title">Job Title – Location</div>
                                    <ul>
                                        <li>Responsibilities</li>
                                        <li>Responsibilities</li>
                                    </ul>
                                </div>
                            @endif
                        </div>
                    </div>
                </td>
            </tr>

            @if ($hasAdditionalContent)
            <tr>
                <td class="cell-left"></td>
                <td class="cell-right" style="border-left: 1px solid #D1D5DB; padding-left: 20px;">
                    @if ($hasValidCustomSections)
                        @foreach ($customSections as $custom)
                            @if((!empty($custom['title']) && trim($custom['title']) !== '') || (!empty($custom['content']) && trim($custom['content']) !== ''))
                                <div class="additional-section">
                                    <div class="section-title">{{ strtoupper($custom['title'] ?? '') }}</div>
                                    <div>{!! nl2br(e($custom['content'] ?? '')) !!}</div>
                                </div>
                            @endif
                        @endforeach
                    @endif
                    
                    @if ($hasValidCertifications)
                        <div class="additional-section">
                            <div class="section-title">CERTIFICATIONS</div>
                            <ul>
                                @foreach ($certifications as $cert)
                                    @if(!empty($cert['title']) && trim($cert['title']) !== '')
                                        <li>{{ $cert['title'] }}</li>
                                    @endif
                                @endforeach
                            </ul>
                        </div>
                    @endif
                    
                    @if ($hasValidAwards)
                        <div class="additional-section">
                            <div class="section-title">AWARDS</div>
                            <ul>
                                @foreach ($awards as $award)
                                    @if(!empty($award['title']) && trim($award['title']) !== '')
                                        <li>{{ $award['title'] }}</li>
                                    @endif
                                @endforeach
                            </ul>
                        </div>
                    @endif
                    
                    @if ($hasValidReferences)
                        <div class="additional-section">
                            <div class="section-title">REFERENCES</div>
                            <ul>
                                @foreach ($references as $ref)
                                    @if((!empty($ref['name']) && trim($ref['name']) !== '') || (!empty($ref['relationship']) && trim($ref['relationship']) !== '') || (!empty($ref['contactInfo']) && trim($ref['contactInfo']) !== ''))
                                        <li>
                                            @if(!empty($ref['name']) && trim($ref['name']) !== '')
                                                <span class="bold">{{ $ref['name'] }}</span>
                                            @endif
                                            @if(!empty($ref['relationship']) && trim($ref['relationship']) !== '')
                                                @if(!empty($ref['name']) && trim($ref['name']) !== '') — @endif{{ $ref['relationship'] }}
                                            @endif
                                            @if(!empty($ref['contactInfo']) && trim($ref['contactInfo']) !== '')
                                                @if((!empty($ref['name']) && trim($ref['name']) !== '') || (!empty($ref['relationship']) && trim($ref['relationship']) !== '')) — @endif{{ $ref['contactInfo'] }}
                                            @endif
                                        </li>
                                    @endif
                                @endforeach
                            </ul>
                        </div>
                    @endif
                </td>
            </tr>
            @endif
        </table>
    </div>
</body>
</html>