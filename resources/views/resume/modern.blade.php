<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Resume</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            margin: 0;
            padding: 0;
            background: white;
            color: #1f2937;
            line-height: 1.4;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 0;
        }
        
        .header {
            padding: 24px;
            margin-bottom: 0;
        }
        
        .name {
            font-size: 28px;
            font-weight: bold;
            color: #000;
            margin-bottom: 4px;
            letter-spacing: 0.025em;
        }
        
        .job-title {
            font-size: 16px;
            font-weight: normal;
            color: #000;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .contact-info {
            font-size: 12px;
            color: #000;
            line-height: 1.2;
        }
        
        .contact-info a {
            color: #000;
            text-decoration: underline;
        }
        
        .contact-info a:hover {
            color: #000;
        }
        
        .content {
            padding: 0 24px 24px 24px;
        }
        
        .section {
    margin-bottom: 24px;
    
}
        
        .section-header {
            background-color: #4a5a7a;
            color: white;
            padding: 8px 12px;
            margin-bottom: 16px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        
        .summary-text {
            font-size: 12px;
            color: #000;
            margin: 0;
            line-height: 1.5;
            word-break: break-word;
        }
        
        .experience-item, .education-item {
           
        }
        
        .experience-header, .education-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 4px;
        }
        
        .experience-title, .education-title {
            font-weight: bold;
            color: #000;
            font-size: 12px;
            flex: 1;
            margin-right: 12px;
        }
        
        .dates {
            font-size: 12px;
            color: #000;
            font-weight: normal;
            white-space: nowrap;
        }
        
        .location {
            font-size: 12px;
            color: #000;
            margin-bottom: 8px;
        }
        
        .description {
            font-size: 12px;
            color: #000;
            margin-top: 8px;
        }
        
        .bullet-point {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            margin-bottom: 4px;
        }
        
        .bullet {
            color: #000;
            font-weight: normal;
            margin-top: 0;
            flex-shrink: 0;
        }
        
        .bullet-text {
            flex: 1;
            min-width: 0;
            word-break: break-word;
            line-height: 1.4;
        }
        
       .skills-grid {
    display: flex;
    flex-wrap: wrap;   /* allow wrapping */
}

.skill-item {
    width: 50%;        /* exactly two per row */
    box-sizing: border-box;
    padding-right: 12px; /* small spacing between columns */
    margin-bottom: 8px;
    font-size: 12px;
    color: #000;
    white-space: nowrap;
    display: flex;
    align-items: center;
}

.skill-name {
    font-weight: bold;
    margin-right: 6px;
    display: inline-block;
}

.skill-dots {
    display: inline-block;
    vertical-align: middle;
}

.skill-dot {
    display: inline-block; /* instead of flex item */
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 2px; /* spacing between dots */
    background-color: #cccccc;
}

.skill-dot.filled {
    background-color: #4a5a7a;
}
        
        .additional-info {
            margin-top: 0;
        }
        
        .info-item {
            margin-bottom: 4px;
        }
        
        .info-content {
            font-size: 12px;
            color: #000;
            display: flex;
            align-items: flex-start;
            gap: 8px;
        }
        
        .info-content .bullet {
            flex-shrink: 0;
            margin-top: 0;
        }
        
        .info-label {
            font-weight: bold;
        }
        
        .references-item {
            margin-bottom: 8px;
            font-size: 12px;
            color: #000;
        }
        
        .custom-section {
            margin-bottom: 24px;
        }
        
        .custom-section-content {
            font-size: 12px;
            color: #000;
            word-break: break-word;
            white-space: pre-line;
            line-height: 1.4;
        }
/* Two-per-row skills table (PDF safe) */
.skills-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;   /* forces equal 2 columns */
}
.skills-table td {
    width: 50%;
    padding: 0 12px 8px 0;
    vertical-align: top;
}
        @media print {
            body {
                font-size: 9px;
            }
            
            .container {
                max-width: none;
                width: 100%;
                margin: 0;
                padding: 0;
            }
            
            .header {
                padding: 16px;
                margin-bottom: 0;
            }
            
            .content {
                padding: 0 16px 16px 16px;
            }
            
            .section {
                margin-bottom: 16px;
                page-break-inside: avoid;
            }
            
            .name {
                font-size: 20px;
                margin-bottom: 3px;
            }
            
            .job-title {
                font-size: 13px;
                margin-bottom: 8px;
            }
            
            .contact-info {
                font-size: 10px;
            }
            
            .section-header {
                padding: 4px 8px;
                margin-bottom: 10px;
                font-size: 10px;
            }
            
            .summary-text, .experience-title, .education-title, .dates, .location, .description, .bullet-text, .info-content, .custom-section-content, .skill-item {
                font-size: 9px;
            }
        }
        
        /* Prevent page breaks within items */
        .experience-item, .education-item, .info-item, .references-item, .custom-section, .skill-item {
            page-break-inside: avoid;
            break-inside: avoid;
        }
        
        .section-header {
            page-break-after: avoid;
            break-after: avoid;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1 class="name">{{ ($resume['contact']['firstName'] ?? '') }} {{ ($resume['contact']['lastName'] ?? '') }}</h1>
            <p class="job-title">{{ $resume['contact']['desiredJobTitle'] ?? '' }}</p>
            <div class="contact-info">
                @php
                    $contactParts = [];
                    // Phone
                    if (!empty($resume['contact']['phone'])) $contactParts[] = $resume['contact']['phone'];
                    // Address
                    if (!empty($resume['contact']['address'])) $contactParts[] = $resume['contact']['address'];
                    // Email
                    if (!empty($resume['contact']['email'])) $contactParts[] = $resume['contact']['email'];
                    // Websites
                    if (!empty($resume['websites']) && is_array($resume['websites'])) {
                        foreach ($resume['websites'] as $site) {
                            if (!empty($site['url'])) $contactParts[] = '<a href="' . e($site['url']) . '" target="_blank">' . e($site['url']) . '</a>';
                        }
                    }
                    // Socials
                    if (!empty($resume['contact']['socials']) && is_array($resume['contact']['socials'])) {
                        foreach ($resume['contact']['socials'] as $social) {
                            if (!empty($social['url'])) $contactParts[] = '<a href="' . e($social['url']) . '" target="_blank">' . e($social['label'] ?? $social['url']) . '</a>';
                        }
                    }
                @endphp
                {!! implode(' | ', $contactParts) !!}
            </div>
        </div>

        <div class="content">
            <!-- Summary -->
            @if(!empty($resume['summary']))
                <div class="section">
                    <div class="section-header">
                        SUMMARY
                    </div>
                    <p class="summary-text">{{ $resume['summary'] }}</p>
                </div>
            @endif

            <!-- Work Experience -->
            @if(!empty($resume['experiences']) && is_array($resume['experiences']) && count($resume['experiences']) > 0)
                <div class="section">
                    <div class="section-header">
                        WORK EXPERIENCE
                    </div>
                    <div>
                        @foreach($resume['experiences'] as $exp)
                            <div class="experience-item">
                                <div class="experience-header">
                                    <h3 class="experience-title">{{ $exp['jobTitle'] ?? '' }}{{ isset($exp['company']) ? ' | ' . $exp['company'] : '' }}</h3>
                                    <div class="dates">{{ $exp['startDate'] ?? '' }} - {{ $exp['endDate'] ?? '' }}</div>
                                </div>
                                @if(!empty($exp['location']))
                                    <p class="location">{{ $exp['location'] }}</p>
                                @endif
                                @if(!empty($exp['description']))
                                    <div class="description">
                                        @php
                                            $description = trim($exp['description']);
                                            $lines = explode("\n", $description);
                                        @endphp
                                        @foreach($lines as $line)
                                            @if(trim($line) !== '')
                                                <div class="bullet-point">
                                                    <span class="bullet">•</span>
                                                    <span class="bullet-text">{{ trim($line) }}</span>
                                                </div>
                                            @endif
                                        @endforeach
                                    </div>
                                @endif
                            </div>
                        @endforeach
                    </div>
                </div>
            @endif

           <!-- Skills -->
@if (!empty($resume['skills']))
    <div class="section">
        <div class="section-header">
            SKILLS
        </div>

        <table class="skills-table">
            <tbody>
            @foreach($resume['skills'] as $i => $skill)
                @if($i % 2 === 0)
                    <tr>
                @endif

                <td>
                    <div class="skill-item">
                        <span class="skill-name">{{ $skill['name'] }}</span>
                        @if (isset($skill['level']) && ($resume['showExperienceLevel'] ?? false))
                            <span class="skill-dots">
                                @php
                                    $level = $skill['level'] ?? 'Novice';
                                    switch ($level) {
                                        case 'Novice': $bulletCount = 1; break;
                                        case 'Beginner': $bulletCount = 2; break;
                                        case 'Skillful': $bulletCount = 3; break;
                                        case 'Experienced': $bulletCount = 4; break;
                                        case 'Expert': $bulletCount = 5; break;
                                        default: $bulletCount = 1;
                                    }
                                @endphp
                                @for ($j = 0; $j < 5; $j++)
                                    <span class="skill-dot {{ $j < $bulletCount ? 'filled' : '' }}"></span>
                                @endfor
                            </span>
                        @endif
                    </div>
                </td>

                @if($i % 2 === 1)
                    </tr>
                @endif
            @endforeach

            @if(count($resume['skills']) % 2 === 1)
                <td></td></tr> {{-- pad the last row if odd number of skills --}}
            @endif
            </tbody>
        </table>
    </div>
@endif

            <!-- Education -->
            @if(!empty($resume['education']) && is_array($resume['education']) && count($resume['education']) > 0)
                <div class="section">
                    <div class="section-header">
                        EDUCATION
                    </div>
                    <div>
                        @foreach($resume['education'] as $edu)
                            <div class="education-item">
                                <div class="education-header">
                                    <h3 class="education-title">{{ $edu['degree'] ?? '' }}{{ isset($edu['school']) ? ' | ' . $edu['school'] : '' }}</h3>
                                    <div class="dates">{{ $edu['startDate'] ?? '' }} - {{ $edu['endDate'] ?? '' }}</div>
                                </div>
                                @if(!empty($edu['location']))
                                    <p class="location">{{ $edu['location'] }}</p>
                                @endif
                                @if(!empty($edu['description']))
                                    <div class="description">
                                        @php
                                            $description = trim($edu['description']);
                                            $lines = explode("\n", $description);
                                        @endphp
                                        @foreach($lines as $line)
                                            @if(trim($line) !== '')
                                                <div class="bullet-point">
                                                    <span class="bullet">•</span>
                                                    <span class="bullet-text">{{ trim($line) }}</span>
                                                </div>
                                            @endif
                                        @endforeach
                                    </div>
                                @endif
                            </div>
                        @endforeach
                    </div>
                </div>
            @endif

            <!-- Websites -->
            @if(!empty($resume['websites']) && is_array($resume['websites']) && count($resume['websites']) > 0)
                <div class="section">
                    <div class="section-header">
                        WEBSITES
                    </div>
                    <div>
                        @foreach($resume['websites'] as $site)
                            <div class="info-item">
                                <div class="info-content">
                                    <span class="bullet">•</span>
                                    <span><span class="info-label">{{ $site['label'] ?? 'Website' }}:</span> <a href="{{ $site['url'] }}" target="_blank">{{ $site['url'] }}</a></span>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
            @endif

            <!-- Interests/Hobbies -->
            @if(!empty($resume['hobbies']) && is_array($resume['hobbies']) && count($resume['hobbies']) > 0)
                <div class="section">
                    <div class="section-header">
                        INTERESTS
                    </div>
                    <div class="skills-grid">
                        @foreach($resume['hobbies'] as $hobby)
                            <div class="info-item">
                                <div class="info-content">
                                    <span class="bullet">•</span>
                                    <span>{{ $hobby['name'] }}</span>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
            @endif

            <!-- Awards -->
            @if(!empty($resume['awards']) && is_array($resume['awards']) && count($resume['awards']) > 0)
                <div class="section">
                    <div class="section-header">
                        AWARDS
                    </div>
                    <div>
                        @foreach($resume['awards'] as $award)
                            <div class="info-item">
                                <div class="info-content">
                                    <span class="bullet">•</span>
                                    <span>{{ $award['title'] }}</span>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
            @endif

            <!-- Languages -->
            @if(!empty($resume['languages']) && is_array($resume['languages']) && count($resume['languages']) > 0)
                <div class="section">
                    <div class="section-header">
                        LANGUAGES
                    </div>
                    <div>
                        @foreach($resume['languages'] as $lang)
                            <div class="info-item">
                                <div class="info-content">
                                    <span class="bullet">•</span>
                                    <span>{{ isset($lang['proficiency']) ? $lang['name'] . ' (' . $lang['proficiency'] . ')' : $lang['name'] }}</span>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
            @endif

            <!-- Certifications -->
            @if(!empty($resume['certifications']) && is_array($resume['certifications']) && count($resume['certifications']) > 0)
                <div class="section">
                    <div class="section-header">
                        CERTIFICATIONS
                    </div>
                    <div>
                        @foreach($resume['certifications'] as $cert)
                            <div class="info-item">
                                <div class="info-content">
                                    <span class="bullet">•</span>
                                    <span>{{ $cert['title'] }}</span>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
            @endif

            <!-- References -->
            @if(!empty($resume['references']) && is_array($resume['references']) && count($resume['references']) > 0)
                <div class="section">
                    <div class="section-header">
                        REFERENCES
                    </div>
                    <div>
                        @foreach($resume['references'] as $ref)
                            <div class="references-item">
                                <span style="font-weight: bold;">{{ $ref['name'] ?? '' }}</span>
                                @if(!empty($ref['relationship']))
                                    — {{ $ref['relationship'] }}
                                @endif
                                @if(!empty($ref['contactInfo']))
                                    — {{ $ref['contactInfo'] }}
                                @endif
                            </div>
                        @endforeach
                    </div>
                </div>
            @endif

            <!-- Custom Sections -->
            @if(!empty($resume['customSections']) && is_array($resume['customSections']) && count($resume['customSections']) > 0)
                @foreach($resume['customSections'] as $custom)
                    <div class="custom-section">
                        <div class="section-header">
                            {{ strtoupper($custom['title'] ?? '') }}
                        </div>
                        <p class="custom-section-content">{{ $custom['content'] ?? '' }}</p>
                    </div>
                @endforeach
            @endif
        </div>
    </div>
</body>
</html>

