@php
use App\Helpers\BulletProcessor;
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Resume</title>
    <style>
        /* Using system fonts for better PDF compatibility */
        
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
            padding: 16px;
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
            word-wrap: break-word;
            overflow-wrap: break-word;
            line-height: 1.1;
            position: relative;
            z-index: 1;
            margin-top: 20px;
        }
        
        .title {
            margin-top: 2px;
            font-size: 11px;
            font-weight: 700;
            word-wrap: break-word;
            overflow-wrap: break-word;
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
            /* Prevent layout jumping by stabilizing table dimensions */
            min-height: 200px;
        }
        
        .grid td {
            vertical-align: top;
            padding: 0;
            /* Prevent content shifting during dynamic loading */
            position: relative;
        }
        
        .grid tr {
            page-break-inside: avoid;
            /* Reserve minimum height to prevent jumping */
            min-height: 50px;
        }
        
        .grid tr + tr td {
            border-top: 1px solid #D1D5DB;
        }
        
        .cell-left {
            width: 33.33%;
            padding: 16px 0;
            border-right: 1px solid #D1D5DB;
            /* Stabilize left column width and prevent reflow */
            min-height: 100px;
            box-sizing: border-box;
        }
        
        .cell-right {
            width: 66.67%;
            padding: 16px 0 16px 20px;
            /* Stabilize right column and prevent content jumping */
            min-height: 100px;
            box-sizing: border-box;
        }
        
        .inner {
            padding-left: 8px;
            overflow: hidden;
            /* Prevent content reflow during section loading */
            min-height: 50px;
        }

        .section-title {
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.25em;
            margin-bottom: 8px;
            /* Anchor positioning for smooth scrolling */
            scroll-margin-top: 20px;
            position: relative;
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
            /* Reserve space for contact items */
            min-height: 80px;
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

        .skills-container { 
            margin-top: 3px;
            /* Stabilize skills section to prevent reflow */
            min-height: 40px;
            contain: layout;
        }

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

        .experience-item { 
            margin-bottom: 12px;
            /* Prevent layout shift during content loading */
            min-height: 40px;
            contain: layout;
        }
        .experience-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 2px;
        }
        .experience-company { font-size: 12px; font-weight: 600; }
        .experience-date { font-size: 10px; color: #666666; }
        .experience-title { font-size: 12px; margin-bottom: 4px; }

        .education-item { 
            margin-bottom: 8px;
            /* Stabilize education section height */
            min-height: 30px;
            contain: layout;
        }
        .education-degree { font-size: 12px; font-weight: 600; margin-bottom: 2px; }
        .education-school { font-size: 12px; margin-bottom: 2px; }
        .education-date { font-size: 10px; color: #666666; }

        .profile-summary { 
            font-size: 12px; 
            line-height: 1.4;
            /* Reserve space for profile content */
            min-height: 60px;
        }

        .additional-section { 
            margin-bottom: 10px;
            /* Prevent blogs/vlogs section from causing jumps */
            min-height: 30px;
            contain: layout;
        }
        .additional-section:last-child { margin-bottom: 0; }

        /* Smart page break handling for multi-page content */
        .experience-item, .education-item { 
            page-break-inside: avoid; 
            break-inside: avoid;
        }
        .skill-item { 
            page-break-inside: auto; 
            break-inside: auto;
        }
        h1, h2, h3, .section-title { 
            page-break-after: avoid; 
            break-after: avoid;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        table { 
            page-break-inside: auto; 
            break-inside: auto;
        }
        
        /* Ensure clean page breaks for multi-page content */
        .grid {
            page-break-inside: auto;
            break-inside: auto;
        }
        
        /* Layout stability improvements */
        .content-wrapper {
            /* Prevent entire wrapper from shifting */
            contain: layout style;
            will-change: auto;
        }
        
        /* Smooth transitions without causing reflow */
        .grid, .cell-left, .cell-right {
            transition: none; /* Disable transitions that cause jumping */
        }
        
        /* Prevent font loading from causing layout shifts */
        body {
            font-display: swap;
        }
        
        /* Print-specific overrides for compact layout */
        @media print {
            body {
                padding: 8px !important;
            }
            
            /* Remove min-heights for print to save space */
            .grid, .cell-left, .cell-right, .inner, 
            .contact-list, .skills-container, .profile-summary,
            .experience-item, .education-item, .additional-section {
                min-height: auto !important;
            }
            
            /* Ensure clean page breaks for multi-page content */
            .experience-item, .education-item {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }
            
            .skill-item, .grid {
                page-break-inside: auto !important;
                break-inside: auto !important;
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
         * Layout stability: Maintain min-heights even in compact mode
         */
        .content-wrapper .cell-left {
            padding: 12px 0;
            min-height: 80px; /* Maintain stability */
        }
        .content-wrapper .cell-right {
            padding: 12px 0 12px 14px;
            min-height: 80px; /* Maintain stability */
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
            min-height: 40px; /* Prevent jumping */
        }
        .content-wrapper .experience-item { 
            margin-bottom: 8px;
            min-height: 30px; /* Maintain item stability */
        }
        .content-wrapper .education-item { 
            margin-bottom: 6px;
            min-height: 25px; /* Maintain item stability */
        }
        .content-wrapper .skills-container .skill-item { 
            margin-bottom: 1px;
        }
        .content-wrapper .section-title { 
            margin-bottom: 6px; 
            letter-spacing: 0.22em;
            scroll-margin-top: 15px; /* Compact scroll positioning */
        }
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
        .content-wrapper .subdivider, .content-wrapper .experience-item, .content-wrapper .education-item, .additional-section { margin-bottom: {{ (int)$sec }}px !important; }
        @endif
        @if(!is_null($para))
        .profile-summary, .education-description, .experience-title, .experience-company, .experience-title + ul li, .skills-container .skill-item, .contact-item { margin-bottom: {{ (int)$para }}px !important; }
        @endif
        @if(!is_null($lh))
        body, .profile-summary, .education-description, .experience-title + ul li, li { line-height: {{ $lh }} !important; }
        @endif
        @if($fontStyle==='small')
        body { font-size: 11px !important; }
        @elseif($fontStyle==='large')
        body { font-size: 15px !important; }
        @endif
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
        
        $locationParts = array_filter([
            $contact['address'] ?? null,
            $contact['city'] ?? null,
            $contact['country'] ?? null,
            $contact['postCode'] ?? null,
        ]);
        
        // Comprehensive validation functions for all sections
        $hasValidContact = (!empty($contact['phone']) && trim($contact['phone']) !== '') ||
                          (!empty($contact['email']) && trim($contact['email']) !== '') ||
                          !empty($locationParts) ||
                          (!empty($websites) && count(array_filter($websites, function($site) {
                              return !empty($site['url']) && trim($site['url']) !== '';
                          })) > 0);
        
        $hasValidSummary = !empty($summary) && trim($summary) !== '';
        
        $hasValidExperiences = !empty($experiences) && count(array_filter($experiences, function($exp) {
            return (!empty($exp['company']) && trim($exp['company']) !== '') ||
                   (!empty($exp['jobTitle']) && trim($exp['jobTitle']) !== '') ||
                   (!empty($exp['description']) && trim($exp['description']) !== '');
        })) > 0;
        
        $hasValidEducation = !empty($education) && count(array_filter($education, function($edu) {
            return (!empty($edu['degree']) && trim($edu['degree']) !== '') ||
                   (!empty($edu['school']) && trim($edu['school']) !== '') ||
                   (!empty($edu['description']) && trim($edu['description']) !== '');
        })) > 0;
        
        $hasValidSkills = !empty($skills) && count(array_filter($skills, function($skill) {
            return !empty($skill['name']) && trim($skill['name']) !== '';
        })) > 0;
        
        $hasValidLanguages = !empty($languages) && count(array_filter($languages, function($lang) {
            return !empty($lang['name']) && trim($lang['name']) !== '';
        })) > 0;
        
        $hasValidHobbies = !empty($hobbies) && count(array_filter($hobbies, function($hobby) {
            $hobbyName = is_array($hobby) ? ($hobby['name'] ?? '') : $hobby;
            return !empty($hobbyName) && trim($hobbyName) !== '';
        })) > 0;
        
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
        
        // Check if left column has any content
        $hasLeftColumnContent = $hasValidContact || $hasValidEducation || $hasValidSkills || $hasValidLanguages || $hasValidHobbies;
        
        // Check if right column has any content
        $hasRightColumnContent = $hasValidSummary || $hasValidExperiences || $hasAdditionalContent;
        
        // Check if there's any content at all (including header content)
        $hasAnyContent = $hasLeftColumnContent || $hasRightColumnContent || 
                        (!empty($initials)) || 
                        (!empty(trim(($contact['firstName'] ?? '') . ' ' . ($contact['lastName'] ?? '')))) || 
                        (!empty($contact['desiredJobTitle']));
    @endphp

    @if($hasAnyContent)
    <div class="header-top-separator"></div>

    <div class="header">
        @if(!empty($initials))
            <div class="signature">{{ $initials }}</div>
        @endif
        @if(!empty(trim(($contact['firstName'] ?? '') . ' ' . ($contact['lastName'] ?? ''))))
            <div class="name">{{ ($contact['firstName'] ?? '') }} {{ ($contact['lastName'] ?? '') }}</div>
        @endif
        @if(!empty($contact['desiredJobTitle']))
            <div class="title">{{ $contact['desiredJobTitle'] }}</div>
        @endif
    </div>
    @endif

    @if($hasLeftColumnContent || $hasRightColumnContent)
    <div class="content-wrapper">
        <table class="grid">
            @if($hasLeftColumnContent || $hasRightColumnContent)
            <tr>
                @if($hasLeftColumnContent)
                <td class="cell-left">
                    <div class="inner">
                        @if($hasValidContact)
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
                                    @if(!empty($site['url']) && trim($site['url']) !== '')
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
                                    @endif
                                @endforeach
                            @endif
                        </ul>
                        @endif
                    </div>
                </td>
                @else
                <td class="cell-left"></td>
                @endif
                @if($hasRightColumnContent)
                <td class="cell-right">
                    <div style="padding-left: 20px;">
                        @if($hasValidSummary)
                        <div class="section-title">PROFILE SUMMARY</div>
                        <div class="profile-summary">
                            {!! nl2br(e($summary)) !!}
                        </div>
                        @endif
                    </div>
                </td>
                @else
                <td class="cell-right"></td>
                @endif
            </tr>
            @endif

            @if($hasLeftColumnContent && ($hasValidEducation || $hasValidSkills || $hasValidLanguages || $hasValidHobbies))
            <tr>
                @if($hasLeftColumnContent)
                <td class="cell-left">
                    <div class="inner">
                        @if($hasValidEducation)
                        <div class="section-title">EDUCATION</div>
                        <div class="mt-1">
                            @foreach ($education as $edu)
                                @if((!empty($edu['degree']) && trim($edu['degree']) !== '') || (!empty($edu['school']) && trim($edu['school']) !== '') || (!empty($edu['description']) && trim($edu['description']) !== ''))
                                <div class="education-item">
                                    @if(!empty($edu['degree']) && trim($edu['degree']) !== '')
                                    <div class="education-degree">{{ $edu['degree'] }}</div>
                                    @endif
                                    @if(!empty($edu['school']) && trim($edu['school']) !== '')
                                    <div class="education-school">
                                        {{ $edu['school'] }}
                                        @if(!empty($edu['location']))
                                            — {{ $edu['location'] }}
                                        @endif
                                    </div>
                                    @endif
                                    @if(!empty($edu['startDate']) || !empty($edu['endDate']))
                                    <div class="education-date">
                                        {{ $formatMonthYear($edu['startDate'] ?? '') }}
                                        @if(!empty($edu['endDate']) || empty($edu['startDate']))
                                            — {{ $formatMonthYear($edu['endDate'] ?? '') }}
                                        @endif
                                    </div>
                                    @endif
                                    @if(!empty($edu['description']) && trim($edu['description']) !== '')
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
                                            <ul style="margin: 4px 0; padding-left: 16px;">
                                                @foreach ($lines as $line)
                                                    @php $t = trim($line); @endphp
                                                    @if ($t !== '')
                                                        @if (preg_match('/^([•\-–\*])\s*(.+)$/u', $t, $matches))
                                                            <li style="margin-bottom: 2px; font-size: 12px; line-height: 1.3;">{{ trim($matches[2]) }}</li>
                                                        @else
                                                            <li style="margin-bottom: 2px; font-size: 12px; line-height: 1.3;">{{ $t }}</li>
                                                        @endif
                                                    @endif
                                                @endforeach
                                            </ul>
                                        @else
                                            <div class="mt-1">{{ $edu['description'] }}</div>
                                        @endif
                                    @endif
                                </div>
                                @endif
                            @endforeach
                        </div>
                        @endif

                        @if($hasValidEducation && ($hasValidSkills || $hasValidLanguages || $hasValidHobbies))
                        <hr class="subdivider" />
                        @endif

                        @if($hasValidSkills)
                        <div style="padding-top: 12px;">
                            <div class="section-title">SKILLS</div>
                            <div class="skills-container">
                                @php
                                    $showExperienceLevel = $resume['showExperienceLevel'] ?? false;
                                    $validSkills = array_filter($skills, function($skill) {
                                        return !empty($skill['name']) && trim($skill['name']) !== '';
                                    });
                                @endphp
                                @foreach ($validSkills as $skill)
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
                                        <span class="skill-name">{{ $skill['name'] }}</span>
                                        @if($showExperienceLevel)
                                            <div class="skill-dots">
                                                @for ($i = 0; $i < 5; $i++)
                                                    <span class="skill-dot {{ $i < $dotCount ? 'filled' : 'empty' }}"></span>
                                                @endfor
                                            </div>
                                        @endif
                                    </div>
                                @endforeach
                            </div>
                        </div>
                        @endif

                        @if($hasValidLanguages)
                            @if($hasValidEducation || $hasValidSkills)
                            <hr class="subdivider" />
                            @endif
                            <div style="padding-top: 12px;">
                                <div class="section-title">LANGUAGES</div>
                                <ul class="mt-1">
                                    @foreach ($languages as $lang)
                                        @if(!empty($lang['name']) && trim($lang['name']) !== '')
                                        <li>{{ $lang['name'] }}
                                            @if(!empty($lang['proficiency']))
                                                ({{ $lang['proficiency'] }})
                                            @endif
                                        </li>
                                        @endif
                                    @endforeach
                                </ul>
                            </div>
                        @endif
                        
                        @if($hasValidHobbies)
                            @if($hasValidEducation || $hasValidSkills || $hasValidLanguages)
                            <hr class="subdivider" />
                            @endif
                            <div style="padding-top: 12px;">
                                <div class="section-title">HOBBIES</div>
                                <ul class="mt-1">
                                    @foreach ($hobbies as $hobby)
                                        @php $hobbyName = is_array($hobby) ? ($hobby['name'] ?? '') : $hobby; @endphp
                                        @if(!empty($hobbyName) && trim($hobbyName) !== '')
                                        <li>{{ $hobbyName }}</li>
                                        @endif
                                    @endforeach
                                </ul>
                            </div>
                        @endif

                    </div>
                </td>
                @else
                <td class="cell-left"></td>
                @endif
                @if($hasRightColumnContent)
                <td class="cell-right">
                    <div style="padding-left: 20px;">
                        @if($hasValidExperiences)
                        <div class="section-title">WORK EXPERIENCE</div>
                        <div style="margin-top: 3px;">
                            @foreach ($experiences as $exp)
                                @if((!empty($exp['company']) && trim($exp['company']) !== '') || (!empty($exp['jobTitle']) && trim($exp['jobTitle']) !== '') || (!empty($exp['description']) && trim($exp['description']) !== ''))
                                @php
                                    $desc = $exp['description'] ?? '';
                                    $items = array_values(array_filter(preg_split("/(\r\n|\n|\r)/", $desc)));
                                @endphp
                                <div class="experience-item">
                                    <div class="experience-header">
                                        <div class="experience-company">{{ $exp['company'] ?? '' }}</div>
                                        @if(!empty($exp['startDate']) || !empty($exp['endDate']))
                                        <div class="experience-date">
                                            {{ $formatMonthYear($exp['startDate'] ?? '') }} — {{ $formatMonthYear($exp['endDate'] ?? '') }}
                                        </div>
                                        @endif
                                    </div>
                                    @if(!empty($exp['jobTitle']) && trim($exp['jobTitle']) !== '')
                                    <div class="experience-title">
                                        {{ $exp['jobTitle'] }}
                                        @if(!empty($exp['location']))
                                            – {{ $exp['location'] }}
                                        @endif
                                    </div>
                                    @endif
                                    @if(count($items) > 0)
                                        <ul>
                                            @foreach ($items as $line)
                                                <li>{{ $line }}</li>
                                            @endforeach
                                        </ul>
                                    @elseif(!empty($desc) && trim($desc) !== '')
                                        <div>{{ $desc }}</div>
                                    @endif
                                </div>
                                @endif
                            @endforeach
                        </div>
                        @endif
                    </div>
                </td>
                @else
                <td class="cell-right"></td>
                @endif
            </tr>
            @endif

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
                            @php 
                                $allCertTexts = array_map(fn($c)=>$c['title'] ?? '', $certifications);
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
                                    // If no bullets detected, try to split long certification strings by commas
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
                                <ul>
                                    @foreach ($processedBullets as $bullets)
                                        @foreach (BulletProcessor::getBulletTexts($bullets) as $text)
                                            <li>{{ $text }}</li>
                                        @endforeach
                                    @endforeach
                                </ul>
                            @elseif ($hasLongCertList)
                                <ul>
                                    @foreach ($certItems as $cert)
                                        <li>{{ $cert }}</li>
                                    @endforeach
                                </ul>
                            @else
                                <ul>
                                    @foreach ($certifications as $cert)
                                        @if(!empty($cert['title']) && trim($cert['title']) !== '')
                                            <li>{{ $cert['title'] }}</li>
                                        @endif
                                    @endforeach
                                </ul>
                            @endif
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
    @endif
</body>
</html>