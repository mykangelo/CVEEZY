@php
use App\Helpers\BulletProcessor;
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Resume</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            margin: 0;
            padding: 16px;
            background: white;
            color: #1f2937;
            line-height: 1.2;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
        }
        
        .header {
            margin-bottom: 16px;
        }
        
        .name {
            font-size: 30px;
            font-weight: bold;
            color: #383741;
            margin-bottom: 4px;
            word-wrap: break-word;
            overflow-wrap: break-word;
            letter-spacing: 0.025em;
            text-transform: uppercase;
        }
        
        .job-title {
            font-size: 14px;
            font-weight: bold;
            color: #000;
            word-wrap: break-word;
            overflow-wrap: break-word;
            margin-bottom: 6px;
            text-transform: uppercase;
        }
        
        .contact-info {
            font-size: 11px;
            color: #374151;
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-bottom: 0;
            align-items: center;
        }
        
        .contact-info span, .contact-info a {
            white-space: nowrap;
        }
        
        .contact-sep {
            margin: 0 4px;
            color: #6b7280;
            font-weight: 300;
        }
        
        .section {
            margin-bottom: 20px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            page-break-inside: auto;
        }
        
        .section-header {
            background-color: #e5e7eb;
            padding: 8px 16px;
            margin-bottom: 12px;
            border-radius: 6px;
            page-break-after: auto;
            border-radius: 9999px;
        }
        
        .section-title {
            font-size: 15px;
            font-weight: bold;
            font-style: italic;
            color: #383741;
            margin: 0;
        }
        
        .summary-text {
            font-size: 12px;
            color: #383741;
            margin: 0;
            line-height: 1.4;
            word-wrap: break-word;
            overflow-wrap: break-word;
            word-break: break-word;
            overflow-wrap: anywhere;
            text-align: justify;
            text-justify: inter-word;
            -webkit-hyphens: auto;
            -ms-hyphens: auto;
            hyphens: auto;
            text-align-last: left;
        }
        
        .experience-item, .education-item {
            margin-bottom: 16px;
            page-break-inside: auto;
            break-inside: auto;
        }
        
        .experience-header, .education-header {
            display: grid;  
            grid-template-columns: 1fr 1fr;
            justify-content: space-between;
            margin-bottom: 4px;
        }
        
        .experience-title, .education-title {
            font-weight: 700;
            color: #000;
            margin-right: 12px;
            font-size: 12px;
            min-width: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            position: relative;
        }
        
        .dates {
            font-size: 12px;
            color: #000;
            font-weight: 700;
            position: absolute;
            right: 0;
            top: 0;
        }
        
        .company, .school, .location {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 4px;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        
        .description {
            font-size: 12px;
            color: #1f2937;
            margin-top: 4px;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        
        .bullet-point {
            display: flex;
            align-items: flex-start;
            gap: 4px;
            margin-bottom: 4px;
        }
        
        .bullet {
            color: #1f2937;
            font-weight: bold;
            margin-top: 0;
            flex-shrink: 0;
        }
        
        .bullet-text {
            flex: 1;
            min-width: 0;
            word-break: break-word;
            line-height: 1.3;
        }
        
        .additional-info {
            margin-top: 0;
        }
        
        .info-item span {
            margin-bottom: 6px;
            color: #1f2937;
        }
        
        .info-content {
            font-size: 12px;
            color: #1f2937;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        
        .references-item {
            margin-bottom: 4px;
        }
        
        .custom-section {
            margin-bottom: 12px;
        }
        
        .custom-section-content {
            font-size: 12px;
            color: #1f2937;
            word-break: break-word;
            white-space: pre-line;
        }
        
        /* Skills layout */
        .skills-table { 
            width: 100%; 
            border-collapse: collapse; 
            table-layout: fixed; 
        }
        
        .skills-table td { 
            width: 33.333%; 
            padding: 2px 16px 2px 0; 
            vertical-align: middle; 
            white-space: nowrap; 
        }
        
        .skill-row {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
            break-inside: auto;
        }
        
        .skill-dots {
            display: inline-block;
            white-space: nowrap;
            line-height: 1;
        }
        
        .skill-dot {
            display: inline-block;
            width: 5px;
            height: 5px;
            border-radius: 50%;
            margin-right: 2px;
            text-align: center;
        }
        
        @media print {
            html, body {
                width: 100%;
                height: 100%;
                padding: 0;
                margin: 0;
                font-size: 9px;
            }
            
            .container {
                max-width: none;
                width: 100%;
                margin: 0;
            }
            
            .section, .custom-section {
                page-break-inside: auto;
            }
            
            .header {
                margin-bottom: 10px;
            }
            
            .section {
                margin-bottom: 8px;
            }
            
            .experience-item, .education-item {
                margin-bottom: 8px;
            }
            
            .name {
                font-size: 22px;
                margin-bottom: 3px;
            }
            
            .job-title {
                font-size: 13px;
                margin-bottom: 5px;
            }
            
            .contact-info {
                font-size: 10px;
                gap: 6px;
            }
            
            .section-header {
                padding: 3px 8px;
                margin-bottom: 5px;
            }
            
            .section-title {
                font-size: 12px;
                color: #383741;
            }
            
            .summary-text, .experience-title, .education-title, .dates, .company, .school, .location, .description, .bullet-text, .info-content, .custom-section-content {
                font-size: 10px;
            }
        }
        
        /* Smart page break handling for multi-page content */
        .info-item, .references-item {
            page-break-inside: auto;
            break-inside: auto;
        }
        
        .custom-section, .skill-row {
            page-break-inside: auto;
            break-inside: auto;
        }
        
        /* Ensure proper page breaks for all elements */
        h1, h2, .section-title, .section-header {
            page-break-after: auto;
            break-after: auto;
            page-break-inside: auto;
            break-inside: auto;
        }
        
        /* Ensure clean page breaks for multi-page content */
        .container {
            page-break-inside: auto;
            break-inside: auto;
        }
        
        /* Prevent text overflow and ensure proper wrapping */
        .info-content, .custom-section-content, .bullet-text {
            word-wrap: break-word;
            overflow-wrap: break-word;
            hyphens: auto;
        }
        
        /* Force page breaks when content exceeds page height */
        .section:last-child {
            page-break-inside: auto;
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
        .section, .custom-section { margin-bottom: {{ (int)$sec }}px !important; }
        @endif
        @if(!is_null($para))
        .summary-text, .description, .bullet-point, .info-item span, .custom-section-content { margin-bottom: {{ (int)$para }}px !important; }
        @endif
        @if(!is_null($lh))
        body, .summary-text, .description, .bullet-text, .info-item span, .custom-section-content { line-height: {{ $lh }} !important; }
        @endif
        @if($fontStyle==='small')
        body { font-size: 11px !important; }
        @elseif($fontStyle==='large')
        body { font-size: 15px !important; }
        @endif
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        @php
            $hasName = !empty($resume['contact']['firstName']) || !empty($resume['contact']['lastName']);
            $hasJobTitle = !empty($resume['contact']['desiredJobTitle']);
            $contactParts = [];

            // Address
            if (!empty($resume['contact']['address']) || !empty($resume['contact']['city']) || !empty($resume['contact']['country']) || !empty($resume['contact']['postCode'])) {
                $contactParts[] = collect([
                    $resume['contact']['address'] ?? '',
                    $resume['contact']['city'] ?? '',
                    $resume['contact']['country'] ?? '',
                    $resume['contact']['postCode'] ?? ''
                ])->filter()->implode(', ');
            }
            // Phone
            if (!empty($resume['contact']['phone'])) $contactParts[] = $resume['contact']['phone'];
            // Email
            if (!empty($resume['contact']['email'])) $contactParts[] = $resume['contact']['email'];
            // Websites
            if (!empty($resume['websites']) && is_array($resume['websites'])) {
                foreach ($resume['websites'] as $site) {
                    if (!empty($site['url'])) $contactParts[] = '<a href="' . e($site['url']) . '" target="_blank">' . e($site['label'] ?? $site['url']) . '</a>';
                }
            }
            // Socials
            if (!empty($resume['contact']['socials']) && is_array($resume['contact']['socials'])) {
                foreach ($resume['contact']['socials'] as $social) {
                    if (!empty($social['url'])) $contactParts[] = '<a href="' . e($social['url']) . '" target="_blank">' . e($social['label'] ?? $social['url']) . '</a>';
                }
            }
            $hasContact = count($contactParts) > 0;
        @endphp

        @if($hasName || $hasJobTitle || $hasContact)
            <div class="header">
                @if($hasName)
                    <h1 class="name">{{ strtoupper($resume['contact']['firstName'] ?? '') }} {{ strtoupper($resume['contact']['lastName'] ?? '') }}</h1>
                @endif
                @if($hasJobTitle)
                    <p class="job-title">{{ $resume['contact']['desiredJobTitle'] }}</p>
                @endif
                @if($hasContact)
                    <div class="contact-info">
                        {!! implode('<span class="contact-sep">|</span>', $contactParts) !!}
                    </div>
                @endif
            </div>
        @endif

        <!-- Summary -->
        @if(!empty($resume['summary']))
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">SUMMARY</h2>
                </div>
                <p class="summary-text">{{ $resume['summary'] }}</p>
            </div>
        @endif

        <!-- Skills -->
        @php
            $validSkills = [];
            if (!empty($resume['skills']) && is_array($resume['skills'])) {
                foreach ($resume['skills'] as $skill) {
                    if (!empty($skill['name'])) {
                        $validSkills[] = $skill;
                    }
                }
            }
        @endphp
        @if (count($validSkills) > 0)
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">TECHNICAL SKILLS</h2>
                </div>
                <table class="skills-table">
                    <tbody>
                        @foreach(array_chunk($validSkills, 3) as $skillsRow)
                            <tr>
                                @for ($col = 0; $col < 3; $col++)
                                    <td>
                                        @if(isset($skillsRow[$col]))
                                            @php $skill = $skillsRow[$col]; @endphp
                                            <div class="skill-row">
                                                <span>{{ $skill['name'] }}</span>
                                                @if (isset($skill['level']) && ($resume['showExperienceLevel'] ?? false))
                                                    <span class="skill-dots">
                                                        @php
                                                            $level = $skill['level'] ?? 'Novice';
                                                            $bulletCount = match($level) {
                                                                'Novice' => 1,
                                                                'Beginner' => 2,
                                                                'Skillful' => 3,
                                                                'Experienced' => 4,
                                                                'Expert' => 5,
                                                                default => 1
                                                            };
                                                        @endphp
                                                        @for ($i = 0; $i < 5; $i++)
                                                            <span class="skill-dot" style="background-color: {{ $i < $bulletCount ? '#000000' : '#cccccc' }};"></span>
                                                        @endfor
                                                    </span>
                                                @endif
                                            </div>
                                        @endif
                                    </td>
                                @endfor
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif


        <!-- Experience -->
        @php
            $validExperiences = [];
            if (!empty($resume['experiences']) && is_array($resume['experiences'])) {
                foreach ($resume['experiences'] as $exp) {
                    if (!empty($exp['jobTitle']) || !empty($exp['company']) || !empty($exp['description'])) {
                        $validExperiences[] = $exp;
                    }
                }
            }
        @endphp
        @if (count($validExperiences) > 0)
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">PROFESSIONAL EXPERIENCE</h2>
                </div>
                <div class="experience-container">
                    @foreach($validExperiences as $exp)
                        <div class="experience-item">
                            <div class="experience-header">
                                <h3 class="experience-title">{{ $exp['jobTitle'] ?? '' }}{{ isset($exp['company']) ? ', ' . $exp['company'] : '' }}    
                                    @if(!empty($exp['startDate']) || !empty($exp['endDate']))
                                        <span class="dates">{{ $exp['startDate'] ?? '' }} - {{ $exp['endDate'] ?? '' }}</span>
                                    @endif
                                </h3>
                            </div>
                            @if(!empty($exp['location']))
                                <p class="location">{{ $exp['location'] }}</p>
                            @endif
                            @if(!empty($exp['description']))
                                <div class="description">
                                    @php 
                                        $processedBullets = BulletProcessor::processBulletedDescription($exp['description']);
                                        $hasBullets = BulletProcessor::hasBullets($processedBullets);
                                    @endphp
                                    @if ($hasBullets)
                                        @foreach (BulletProcessor::getBulletTexts($processedBullets) as $text)
                                            <div class="bullet-point">
                                                <span class="bullet">•</span>
                                                <span class="bullet-text">{{ $text }}</span>
                                            </div>
                                        @endforeach
                                    @else
                                        <div class="bullet-point">
                                            <span class="bullet">•</span>
                                            <span class="bullet-text">{{ trim($exp['description']) }}</span>
                                        </div>
                                    @endif
                                </div>
                            @endif
                        </div>
                    @endforeach
                </div>
            </div>
        @endif


        <!-- Education -->
        @php
            $validEducation = [];
            if (!empty($resume['education']) && is_array($resume['education'])) {
                foreach ($resume['education'] as $edu) {
                    if (!empty($edu['degree']) || !empty($edu['school'])) {
                        $validEducation[] = $edu;
                    }
                }
            }
        @endphp
        @if (count($validEducation) > 0)
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">EDUCATION</h2>
                </div>
                <div>
                    @foreach($validEducation as $edu)
                        <div class="education-item">
                            <div class="education-header">
                                <h3 class="education-title">{{ $edu['degree'] ?? '' }}
                                    @if(!empty($edu['startDate']) || !empty($edu['endDate']))
                                        <span class="dates">{{ $edu['startDate'] ?? '' }} - {{ $edu['endDate'] ?? '' }}</span>
                                    @endif
                                </h3>
                            </div>
                            @if(!empty($edu['school']))
                                <p class="school">{{ $edu['school'] }}</p>
                            @endif
                            @if(!empty($edu['location']))
                                <p class="location">{{ $edu['location'] }}</p>
                            @endif
                            @if(!empty($edu['description']))
                                <div class="description">
                                    @php 
                                        $processedBullets = BulletProcessor::processBulletedDescription($edu['description']);
                                        $hasBullets = BulletProcessor::hasBullets($processedBullets);
                                    @endphp
                                    @if ($hasBullets)
                                        @foreach (BulletProcessor::getBulletTexts($processedBullets) as $text)
                                            <div class="bullet-point">
                                                <span class="bullet">•</span>
                                                <span class="bullet-text">{{ $text }}</span>
                                            </div>
                                        @endforeach
                                    @else
                                        <div class="bullet-point">
                                            <span class="bullet">•</span>
                                            <span class="bullet-text">{{ trim($edu['description']) }}</span>
                                        </div>
                                    @endif
                                </div>
                            @endif
                        </div>
                    @endforeach
                </div>
            </div>
        @endif

        <!-- Additional Information -->
        @if(
            (!empty($resume['languages']) && is_array($resume['languages']) && count($resume['languages']) > 0) || 
            (!empty($resume['certifications']) && is_array($resume['certifications']) && count($resume['certifications']) > 0) || 
            (!empty($resume['awards']) && is_array($resume['awards']) && count($resume['awards']) > 0) || 
            (!empty($resume['hobbies']) && is_array($resume['hobbies']) && count($resume['hobbies']) > 0)
        )
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">ADDITIONAL INFORMATION</h2>
                </div>
                <div class="additional-info">
                    @if(!empty($resume['languages']) && is_array($resume['languages']) && count($resume['languages']) > 0)
                        <div class="info-item">
                            <span class="info-content"><b>Languages:</b> {{ collect($resume['languages'])->map(fn($lang) => isset($lang['proficiency']) ? $lang['name'] . ' (' . $lang['proficiency'] . ')' : $lang['name'])->implode(', ') }}</span>
                        </div>
                    @endif

                    @if(!empty($resume['certifications']) && is_array($resume['certifications']) && count($resume['certifications']) > 0)
                        <div class="info-item">
                            <span class="info-content"><b>Certifications:</b> {{ collect($resume['certifications'])->pluck('title')->implode(', ') }}</span>
                        </div>
                    @endif

                    @if(!empty($resume['awards']) && is_array($resume['awards']) && count($resume['awards']) > 0)
                        <div class="info-item">
                            <span class="info-content"><b>Awards/Activities:</b> {{ collect($resume['awards'])->pluck('title')->implode(', ') }}</span>
                        </div>
                    @endif

                    @if(!empty($resume['hobbies']) && is_array($resume['hobbies']) && count($resume['hobbies']) > 0)
                        <div class="info-item">
                            <span class="info-content"><b>Hobbies:</b> {{ collect($resume['hobbies'])->pluck('name')->implode(', ') }}</span>
                        </div>
                    @endif
                </div>
            </div>
        @endif

        <!-- References -->
        @if(!empty($resume['references']) && is_array($resume['references']) && count($resume['references']) > 0)
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">REFERENCES</h2>
                </div>
                <div>
                    @foreach($resume['references'] as $ref)
                        @if(!empty($ref['name']))
                            <div class="references-item">
                                <span style="font-weight: bold;">{{ $ref['name'] }}</span>
                                @if(!empty($ref['relationship']))
                                    — {{ $ref['relationship'] }}
                                @endif
                                @if(!empty($ref['contactInfo']))
                                    <span class="text-gray-600"> — {{ $ref['contactInfo'] }}</span>
                                @endif
                            </div>
                        @endif
                    @endforeach
                </div>
            </div>
        @endif

        <!-- Custom Sections -->
        @if(!empty($resume['customSections']) && is_array($resume['customSections']) && count($resume['customSections']) > 0)
            <div class="space-y-6">
                @foreach($resume['customSections'] as $custom)
                    @if(!empty($custom['title']) || !empty($custom['content']))
                        <div class="custom-section">
                            <div class="section-header">
                                <h2 class="section-title">{{ strtoupper($custom['title'] ?? '') }}</h2>
                            </div>
                            @if(!empty($custom['content']))
                                <p class="custom-section-content">{{ $custom['content'] }}</p>
                            @endif
                        </div>
                    @endif
                @endforeach
            </div>
        @endif
    </div>
</body>

</html>