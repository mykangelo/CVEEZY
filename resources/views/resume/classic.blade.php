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
            margin: 0 16px 16px 16px;
        }

        /* Headings */
        h1, h2, h3, .section-title, .skills-title,
        .contact-name, .contact-jobtitle {
            font-weight: 700;
            color: inherit;
            margin: 0;
        }
        h1 { font-size: 28px; text-align: center; }
        h2 { font-size: 20px; text-align: center; }
        h3, .section-title, .skills-title { font-size: 16px; margin: 10px 0 4px 16px; }

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
        }
        .contact-jobtitle {
            font-size: 18px;
            font-weight: 700;
            text-align: center;
            margin-top: 0;
            margin-bottom: 6px;
        }
        .contact-details {
            font-size: 12px;
            text-align: center;
            color: #111827;
            margin-bottom: 4px;
        }

        /* Summary */
        .summary-text {
            font-size: 12px;
            line-height: 1.6;
            color: #111827;
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
        }

        /* Experience */
        .experience-item { margin-bottom: 4px; }
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
        }
        .experience-description-list {
            margin: 0;
            padding-left: 16px;
        }
        .experience-description {
            font-size: 11px;
            line-height: 1.3;
            color: #111827;
        }

        /* Education */
        .education-item { margin-bottom: 4px; }
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
        }
        .education-description-list {
            margin: 1px 0 0 16px;
            padding: 0;
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
    </style>
</head>
<body>

<div class="space-y-4 text-gray-800">

    {{-- Contact Info --}}
    <div>
        <h2 class="contact-name">
            {{ $resume['contact']['firstName'] }} {{ $resume['contact']['lastName'] }}
        </h2>

        @if(!empty($resume['contact']['desiredJobTitle']))
            <div class="contact-jobtitle">
                {{ $resume['contact']['desiredJobTitle'] }}
            </div>
        @endif

        <hr class="section-divider-thin" />

        @php
            $locationInfo = collect([
                $resume['contact']['address'] ?? null,
                $resume['contact']['city'] ?? null,
                $resume['contact']['country'] ?? null,
                $resume['contact']['postCode'] ?? null
            ])->filter()->implode(', ');
        @endphp

        <div class="contact-details">
            @if($locationInfo)
                {{ $locationInfo }}
            @endif
            @if($locationInfo && !empty($resume['contact']['email'])) | @endif
            @if(!empty($resume['contact']['email']))
                {{ $resume['contact']['email'] }}
            @endif
            @if(($locationInfo || !empty($resume['contact']['email'])) && !empty($resume['contact']['phone'])) | @endif
            @if(!empty($resume['contact']['phone']))
                {{ $resume['contact']['phone'] }}
            @endif
        </div>

        <hr class="section-divider-thin" />
    </div>

    {{-- Summary --}}
    @if(!empty($resume['summary']))
        <div>
            <div class="summary-text">{{ $resume['summary'] }}</div>
        </div>
    @endif

    {{-- Skills --}}
    @if(!empty($resume['skills']))
        <div>
            <h3 class="skills-title">
                AREA OF EXPERTISE
            </h3>
            <hr class="section-divider-thin" />

            <table class="skills-table">
                @foreach(array_chunk($resume['skills'], 2) as $row)
                    <tr>
                        @foreach($row as $skill)
                            <td>
                                <span class="skill-name">
                                    {{ $skill['name'] }}
                                </span>
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
                        @if(count($row) < 2)
                            <td></td>
                        @endif
                    </tr>
                @endforeach
            </table>
        </div>
    @endif


    {{-- Experience --}}
    @if(!empty($resume['experiences']))
        <div>
            <h3 class="section-title">PROFESSIONAL EXPERIENCE</h3>
            <hr class="section-divider-thin" />
            @foreach($resume['experiences'] as $exp)
                <div class="experience-item">
                    <table class="experience-table">
                        <tr>
                            <td class="experience-job-title">{{ $exp['jobTitle'] }}</td>
                            <td class="experience-dates">{{ $exp['startDate'] }} - {{ $exp['endDate'] }}</td>
                        </tr>
                    </table>
                    <div class="experience-company">{{ $exp['company'] }} — {{ $exp['location'] }}</div>
                    @if(!empty($exp['description']))
                        <ul class="experience-description-list">
                            <li class="experience-description">{{ $exp['description'] }}</li>
                        </ul>
                    @endif
                </div>
            @endforeach
        </div>
    @endif

    {{-- Education --}}
    @if(!empty($resume['education']))
        <div class="education-section">
            <h3 class="section-title">EDUCATION</h3>
            <hr class="section-divider-thin" />
            @foreach($resume['education'] as $edu)
                <div class="education-item">
                    <table class="education-table">
                        <tr>
                            <td class="education-degree">{{ $edu['degree'] }}</td>
                            <td class="education-dates">{{ $edu['startDate'] }} - {{ $edu['endDate'] }}</td>
                        </tr>
                    </table>
                    <div class="education-school">{{ $edu['school'] }} — {{ $edu['location'] }}</div>
                    @if(!empty($edu['description']))
                        <ul class="education-description-list">
                            <li class="education-description">{{ $edu['description'] }}</li>
                        </ul>
                    @endif
                </div>
            @endforeach
        </div>
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
                    <li>
                        <span class="additional-label">Certification:</span>
                        @foreach($resume['certifications'] as $index => $cert)
                            {{ $cert['title'] }}@if($index < count($resume['certifications']) - 1), @endif
                        @endforeach
                    </li>
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
