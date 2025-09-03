@php
use App\Helpers\BulletProcessor;
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Classic Resume</title>
    <style>
        /* Global Font & Colors */
        * {
            font-family: DejaVu Sans, sans-serif !important;
        }

        body {
            font-family: DejaVu Sans, sans-serif !important;
            color: #111827;
            font-size: 12px;
            line-height: 1.8;
            margin: 0 8px 8px 8px;
        }

        /* Headings */
        h1, h2, h3, .section-title, .skills-title,
        .contact-name, .contact-jobtitle {
            font-weight: 700;
            color: inherit;
            margin: 0;
        }
        h1 { font-size: 28px; text-align: center; word-wrap: break-word; overflow-wrap: break-word; }
        h2 { font-size: 20px; text-align: center; word-wrap: break-word; overflow-wrap: break-word; }
        h3, .section-title, .skills-title { font-size: 16px; margin: 10px 0 4px 16px; word-wrap: break-word; overflow-wrap: break-word; }

        /* Dividers */
        .section-divider {
            border-top: 2px solid #111827;
            margin: 2px 0;
        }
        .section-divider-thin {
            border-top: 1px solid #111827;
            margin: 2px 0 4px 0;
        }

        /* Contact Info */
        .contact-name {
            font-size: 30px;
            font-weight: 700;
            text-align: center;
            margin-top: 0;
            margin-bottom: -16px;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        .contact-jobtitle {
            font-size: 18px;
            font-weight: 700;
            text-align: center;
            margin-top: 0;
            margin-bottom: 6px;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        .contact-details {
            font-size: 12px;
            text-align: center;
            color: #111827;
            margin-bottom: 4px;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        /* Summary */
        .summary-text {
            font-size: 12px;
            line-height: 1.6;
            color: #111827;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        /* Skills */
        table.skills-table { width: 100%; }
        table.skills-table td {
            vertical-align: top;
            padding: 0px 6px;
            width: 50%;
            line-height: 1.4;
        }
        .skill-name {
            font-family: DejaVu Sans, sans-serif !important;
            font-weight: bold;
            font-size: 12px;
            margin-top: -10px; /* removed top/bottom margin */
            color: #111827;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        /* Experience */
        .experience-item { margin-bottom: 4px; page-break-inside: avoid; }
        table.experience-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 1px;
            margin-top: -4px;
        }
        .experience-job-title {
            font-weight: bold;
            font-size: 14px;
            width: 70%;
            color: #111827;
        }
        .experience-dates {
            font-family: DejaVu Sans, sans-serif !important;
            font-weight: bold;
            font-size: 12px;
            text-align: right;
            white-space: nowrap;
            color: #111827;
        }
        .experience-company {
            font-style: italic;
            font-size: 12px;
            margin: -10px 0 2px 0px;
            color: #111827;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        .experience-description-list {
            margin: 0;
            padding-left: 16px;
            list-style-type: disc;
        }
        .experience-description {
            font-size: 11px;
            line-height: 1.3;
            color: #111827;
        }

        /* Education */
        .education-item { margin-bottom: 4px; page-break-inside: avoid; }
        table.education-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 2px;
            margin-top: -4px;
        }
        .education-degree {
            font-weight: bold;
            font-size: 14px;
            width: 70%;
            color: #111827;
        }
        .education-dates {
            font-family: DejaVu Sans, sans-serif !important;
            font-weight: bold;
            font-size: 12px;
            text-align: right;
            white-space: nowrap;
            color: #111827;
        }
        .education-school {
            font-style: italic;
            font-size: 12px;
            margin: -10px 0 0 0px;
            color: #111827;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        .education-description-list {
            margin: 1px 0 0 16px;
            padding: 0;
            list-style-type: disc;
        }
        .education-description {
            font-size: 11px;
            line-height: 1.3;
            color: #111827;
        }

        /* Hobbies in table with bullets */
        .hobbies-table {
            width: 100%;
        }
        .hobbies-table td {
            vertical-align: top;
            padding: 0px 16px;
        }
        .hobbies-table ul {
            list-style-type: disc;
            margin: 0;
            padding-left: 20px; /* space for bullet */
        }
        .hobbies-table li {
            font-size: 12px;
            color: #111827;
            margin-top: 4px;
            line-height: 1.4;
        }
        .hobby-name {
            margin: -12px 0;
            padding-left: 16px;
            font-size: 12px;
            color: #111827;
        }

        /* Websites & References */
        .websites-list {
            margin: 2px 0;
            padding-left: 16px;
            font-size: 12px;
            list-style: none;
        }
        .website-item {
            margin-bottom: 0px;
            font-size: 12px;
            color: #111827;
        }
        .references-list {
            margin: 4px 0;
            padding-left: 16px;
            font-size: 12px;
            color: #111827;
        }
        .reference-item {
            font-size: 12px;
            color: #111827;
        }
        .additional-info-list {
            margin: 4px 0;
            padding-left: 16px;
            font-size: 12px;
            color: #111827;
            line-height: 1.4;
        }
        .additional-label {
            margin: 4px 0;
            padding-left: 16px;
            font-size: 12px;
            color: #111827;
            font-weight:bold;
        }
        a {
            color: inherit;
            text-decoration: underline;
        }
        /* prevent headings from detaching from content */
        .section-title, .skills-title { page-break-after: avoid; }

        /* Smart page break handling for multi-page content */
        .experience-item, .education-item {
            page-break-inside: avoid;
            break-inside: avoid;
        }
        
        .hobbies-table, .websites-table, .references-table {
            page-break-inside: auto;
            break-inside: auto;
        }
        
        /* Ensure proper page breaks for all elements */
        h1, h2, h3, .section-title, .skills-title {
            page-break-after: avoid;
            break-after: avoid;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        
        /* Ensure clean page breaks for multi-page content */
        .space-y-4 {
            page-break-inside: auto;
            break-inside: auto;
        }
        
        /* Prevent text overflow and ensure proper wrapping */
        p, li, .contact-info, .job-title, .company, .degree, .school, .hobby-item, .website-item, .reference-item {
            word-wrap: break-word;
            overflow-wrap: break-word;
            hyphens: auto;
        }
        
        /* Force page breaks when content exceeds page height */
        .section:last-child {
            page-break-inside: auto;
        }
        
        /* Print-specific overrides for compact layout */
        @media print {
            body {
                margin: 0 4px 4px 4px !important;
            }
            
            /* Ensure clean page breaks for multi-page content */
            .experience-item, .education-item {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }
            
            .hobbies-table, .websites-table, .references-table, .space-y-4 {
                page-break-inside: auto !important;
                break-inside: auto !important;
            }
            
            h1, h2, h3, .section-title, .skills-title {
                page-break-after: avoid !important;
                break-after: avoid !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
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
        .section-divider, .education-section, .skills-title, .section-title { margin-bottom: {{ (int)$sec }}px !important; }
        @endif
        @if(!is_null($para))
        .summary-text, .experience-description, .education-description, .website-item, .reference-item, .additional-info-list li { margin-bottom: {{ (int)$para }}px !important; }
        @endif
        @if(!is_null($lh))
        body, .summary-text, .experience-description, .education-description, li { line-height: {{ $lh }} !important; }
        @endif
        @if($fontStyle==='small')
        body { font-size: 11px !important; }
        @elseif($fontStyle==='large')
        body { font-size: 15px !important; }
        @endif
    </style>
</head>
<body>

<div class="space-y-4 text-gray-800">



    {{-- Contact Info --}}
    @php
        $firstName = trim($resume['contact']['firstName'] ?? '');
        $lastName = trim($resume['contact']['lastName'] ?? '');
        $jobTitle = trim($resume['contact']['desiredJobTitle'] ?? '');
        $email = trim($resume['contact']['email'] ?? '');
        $phone = trim($resume['contact']['phone'] ?? '');

        $locationInfo = collect([
            $resume['contact']['address'] ?? null,
            $resume['contact']['city'] ?? null,
            $resume['contact']['country'] ?? null,
            $resume['contact']['postCode'] ?? null
        ])->filter()->implode(', ');

        // check if ANY info is present
        $hasContactInfo = $firstName || $lastName || $jobTitle || $email || $phone || $locationInfo;
    @endphp

    @if($hasContactInfo)
        <div>
            @if($firstName || $lastName)
                <h2 class="contact-name">
                    {{ $firstName }} {{ $lastName }}
                </h2>
            @endif

            @if($jobTitle)
                <div class="contact-jobtitle">
                    {{ $jobTitle }}
                </div>
            @endif

            <hr class="section-divider-thin" />

            <div class="contact-details">
                @if($locationInfo)
                    {{ $locationInfo }}
                @endif
                @if($locationInfo && $email) | @endif
                @if($email)
                    {{ $email }}
                @endif
                @if(($locationInfo || $email) && $phone) | @endif
                @if($phone)
                    {{ $phone }}
                @endif
            </div>

            <hr class="section-divider-thin" />
        </div>
    @endif

    {{-- Summary --}}
    @if(!empty($resume['summary']))
        <div>
            <div class="summary-text">{{ $resume['summary'] }}</div>
        </div>
    @endif



    {{-- Skills --}}
    @php
        $validSkills = collect($resume['skills'] ?? [])->filter(function($skill) {
            return isset($skill['name'], $skill['level'])
                ? trim($skill['name']) !== '' || trim($skill['level']) !== ''
                : false;
        })->values();
    @endphp

    @if($validSkills->count() > 0)
        <div>
            <h3 class="skills-title">AREA OF EXPERTISE</h3>
            <hr class="section-divider-thin" />

            <table class="skills-table">
                @foreach($validSkills->chunk(2) as $row)
                    <tr>
                        @foreach($row as $skill)
                            <td>
                                <span class="skill-name">{{ $skill['name'] }}</span>
                                @if(!empty($skill['level']) && !empty($resume['showExperienceLevel']))
                                    <span>
                                        @php
                                            $levelMap = [
                                                'Novice' => 1,
                                                'Beginner' => 2,
                                                'Skillful' => 3,
                                                'Experienced' => 4,
                                                'Expert' => 5
                                            ];
                                            $filled = $levelMap[$skill['level']] ?? 1;
                                        @endphp
                                        @for($i = 0; $i < 5; $i++)
                                            <span style="display:inline-block;width:6px;height:6px;border-radius:50%;margin-right:2px;{{ $i < $filled ? 'background-color:#000;' : 'background-color:#d1d5db;' }}"></span>
                                        @endfor
                                    </span>
                                @endif
                            </td>
                        @endforeach
                        @if($row->count() < 2)
                            <td></td>
                        @endif
                    </tr>
                @endforeach
            </table>
        </div>
    @endif



    {{-- Experience --}}
    @php
        $validExperiences = collect($resume['experiences'] ?? [])->filter(function($exp) {
            return !empty($exp['jobTitle']) ||
                !empty($exp['company']) ||
                !empty($exp['location']) ||
                !empty($exp['startDate']) ||
                !empty($exp['endDate']) ||
                !empty($exp['description']);
        });
    @endphp

    @if($validExperiences->isNotEmpty())
        <div>
            <h3 class="section-title">PROFESSIONAL EXPERIENCE</h3>
            <hr class="section-divider-thin" />

            @foreach($validExperiences as $exp)
                <div class="experience-item">
                    <table class="experience-table">
                        <tr>
                            <td class="experience-job-title">{{ $exp['jobTitle'] ?? '' }}</td>
                            <td class="experience-dates">
                                {{ $exp['startDate'] ?? '' }}
                                @if(!empty($exp['endDate'])) - {{ $exp['endDate'] }} @endif
                            </td>
                        </tr>
                    </table>
                    <div class="experience-company">
                        {{ $exp['company'] ?? '' }}
                        @if(!empty($exp['location'])) — {{ $exp['location'] }} @endif
                    </div>
                    @if(!empty($exp['description']))
                        @php 
                            $rawDesc = (string)($exp['description'] ?? '');
                            // Normalize HTML to plain text with bullet markers/newlines for processor
                            $norm = preg_replace('/<li[^>]*>\s*/i', '* ', $rawDesc);
                            $norm = preg_replace('/<\/li>/i', "\n", $norm);
                            $norm = preg_replace('/<br\s*\/?>(\s*)/i', "\n", $norm);
                            $norm = strip_tags($norm);
                            $processedBullets = BulletProcessor::processBulletedDescription($norm);
                            $hasBullets = BulletProcessor::hasBullets($processedBullets);
                        @endphp
                        @if ($hasBullets)
                            <ul class="experience-description-list">
                                @foreach (BulletProcessor::getBulletTexts($processedBullets) as $text)
                                    <li class="experience-description">{{ $text }}</li>
                                @endforeach
                            </ul>
                        @else
                            @php $desc = trim($norm); @endphp
                            @if($desc !== '')
                                <p class="experience-description">{{ $desc }}</p>
                            @endif
                        @endif
                    @endif
                </div>
            @endforeach
        </div>
    @endif

    {{-- Education --}}
    @if(!empty($resume['education']) && count($resume['education']) > 0)
        @php
            // Filter only entries that have actual data
            $validEducation = collect($resume['education'])->filter(function($edu) {
                return !empty($edu['degree']) ||
                    !empty($edu['school']) ||
                    !empty($edu['location']) ||
                    !empty($edu['startDate']) ||
                    !empty($edu['endDate']) ||
                    !empty($edu['description']);
            });
        @endphp

        @if($validEducation->isNotEmpty())
            <div class="education-section">
                <h3 class="section-title">EDUCATION</h3>
                <hr class="section-divider-thin" />

                @foreach($validEducation as $edu)
                    <div class="education-item">
                        <table class="education-table">
                            <tr>
                                <td class="education-degree">{{ $edu['degree'] ?? '' }}</td>
                                <td class="education-dates">
                                    {{ $edu['startDate'] ?? '' }}
                                    @if(!empty($edu['endDate'])) - {{ $edu['endDate'] }} @endif
                                </td>
                            </tr>
                        </table>
                        <div class="education-school">
                            {{ $edu['school'] ?? '' }}
                            @if(!empty($edu['location'])) — {{ $edu['location'] }} @endif
                        </div>
                        @if(!empty($edu['description']))
                            @php 
                                $rawDesc = (string)($edu['description'] ?? '');
                                $norm = preg_replace('/<li[^>]*>\s*/i', '* ', $rawDesc);
                                $norm = preg_replace('/<\/li>/i', "\n", $norm);
                                $norm = preg_replace('/<br\s*\/?>(\s*)/i', "\n", $norm);
                                $norm = strip_tags($norm);
                                $processedBullets = BulletProcessor::processBulletedDescription($norm);
                                $hasBullets = BulletProcessor::hasBullets($processedBullets);
                            @endphp
                            @if ($hasBullets)
                                <ul class="education-description-list">
                                    @foreach (BulletProcessor::getBulletTexts($processedBullets) as $text)
                                        <li class="education-description">{{ $text }}</li>
                                    @endforeach
                                </ul>
                            @else
                                @php $desc = trim($norm); @endphp
                                @if($desc !== '')
                                    <p class="education-description">{{ $desc }}</p>
                                @endif
                            @endif
                        @endif
                    </div>
                @endforeach
            </div>
        @endif
    @endif


    {{-- Hobbies --}}
    @if(!empty($resume['hobbies']))
        <div>
            <h3 class="skills-title">HOBBIES</h3>
            <hr class="section-divider-thin" />
            <table class="hobbies-table">
                @foreach(array_chunk($resume['hobbies'], 2) as $row)
                    <tr>
                        @foreach($row as $hobby)
                            <td>
                                <ul>
                                    <li>{{ $hobby['name'] }}</li>
                                </ul>
                            </td>
                        @endforeach
                        @if(count($row) < 2)
                            <td></td>
                        @endif
                    </tr>
                @endforeach
            </table>
        </div>
    @endif

    {{-- Websites --}}
    @if(!empty($resume['websites']))
        <div>
            <h3 class="section-title" style="margin-left: 16px;">WEBSITES</h3>
            <hr class="section-divider-thin" />
            <ul class="websites-list">
                @foreach($resume['websites'] as $site)
                    <li class="website-item">
                        <strong>{{ $site['label'] }}:</strong>
                        <a href="{{ $site['url'] }}" target="_blank" rel="noopener noreferrer">{{ $site['url'] }}</a>
                    </li>
                @endforeach
            </ul>
        </div>
    @endif

    {{-- References --}}
    @if(!empty($resume['references']))
        <div>
            <h3 class="section-title" style="margin-left: 16px;">REFERENCES</h3>
            <hr class="section-divider-thin" />
            <ul class="references-list">
                @foreach($resume['references'] as $ref)
                    <li class="reference-item">
                        <strong>{{ $ref['name'] }}</strong>
                        @if(!empty($ref['relationship'])) — {{ $ref['relationship'] }} @endif
                        @if(!empty($ref['contactInfo'])) | {{ $ref['contactInfo'] }} @endif
                    </li>
                @endforeach
            </ul>
        </div>
    @endif

    {{-- Additional Information --}}
    @if(!empty($resume['languages']) || !empty($resume['certifications']) || !empty($resume['awards']))
        <div>
            <h3 class="section-title" style="margin-left: 16px;">ADDITIONAL INFORMATION</h3>
            <hr class="section-divider-thin" />
            <ul class="additional-info-list">
                @if(!empty($resume['languages']))
                    <li>
                        <span class="additional-label">Languages:</span>
                        @foreach($resume['languages'] as $index => $lang)
                            {{ $lang['name'] }}@if(!empty($lang['proficiency'])) – {{ $lang['proficiency'] }} @endif
                            @if($index < count($resume['languages']) - 1), @endif
                        @endforeach
                    </li>
                @endif
                @if(!empty($resume['certifications']))
                    @php 
                        $allCertTexts = array_map(fn($c)=>$c['title'] ?? '', $resume['certifications']);
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
                        <li>
                            <span class="additional-label">Certification:</span>
                            <ul class="additional-info-list" style="margin-left: 16px;">
                                @foreach ($processedBullets as $bullets)
                                    @foreach (BulletProcessor::getBulletTexts($bullets) as $text)
                                        <li style="margin-bottom: 2px;">{{ $text }}</li>
                                    @endforeach
                                @endforeach
                            </ul>
                        </li>
                    @elseif ($hasLongCertList)
                        <li>
                            <span class="additional-label">Certification:</span>
                            <ul class="additional-info-list" style="margin-left: 16px;">
                                @foreach ($certItems as $cert)
                                    <li style="margin-bottom: 2px;">{{ $cert }}</li>
                                @endforeach
                            </ul>
                        </li>
                    @else
                        <li>
                            <span class="additional-label">Certification:</span>
                            @foreach($resume['certifications'] as $index => $cert)
                                {{ $cert['title'] }}@if($index < count($resume['certifications']) - 1), @endif
                            @endforeach
                        </li>
                    @endif
                @endif
                @if(!empty($resume['awards']))
                    <li>
                        <span class="additional-label">Awards:</span>
                        @foreach($resume['awards'] as $index => $award)
                            {{ $award['title'] }}@if($index < count($resume['awards']) - 1), @endif
                        @endforeach
                    </li>
                @endif
            </ul>
        </div>
    @endif

</div>

</body>
</html>
