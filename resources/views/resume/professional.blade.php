<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Professional Resume</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            margin: 40px;
            font-size: 14px;
            color: #333;
            line-height: 1.6;
        }

        h1, h2, h3 {
            margin: 0;
            padding: 0;
        }

        h1 {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        h2 {
            font-size: 16px;
            margin-top: 25px;
            margin-bottom: 10px;
            color: #34495e;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 2px solid #3498db;
            padding-bottom: 5px;
        }

        .section {
            margin-bottom: 20px;
        }

        .subsection {
            margin-bottom: 15px;
        }

        .label {
            font-weight: bold;
            color: #2c3e50;
        }

        .small-text {
            font-size: 12px;
            color: #7f8c8d;
        }

        .contact-info {
            text-align: center;
            margin-bottom: 20px;
        }

        .job-title {
            font-size: 18px;
            color: #3498db;
            font-weight: 600;
            margin-bottom: 10px;
        }

        ul {
            padding-left: 20px;
        }

        li {
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    {{-- Contact Info --}}
    <div class="contact-info">
        <h1>{{ $resume['contact']['firstName'] ?? '' }} {{ $resume['contact']['lastName'] ?? '' }}</h1>
        <div class="job-title">{{ $resume['contact']['desiredJobTitle'] ?? '' }}</div>
        <p class="small-text">
            {{ $resume['contact']['email'] ?? '' }} | {{ $resume['contact']['phone'] ?? '' }}<br>
            {{ $resume['contact']['address'] ?? '' }}, {{ $resume['contact']['city'] ?? '' }}, {{ $resume['contact']['country'] ?? '' }} {{ $resume['contact']['postCode'] ?? '' }}
        </p>
    </div>

    {{-- Summary --}}
    @if (!empty($resume['summary']))
        <div class="section">
            <h2>Professional Summary</h2>
            <p>{{ $resume['summary'] }}</p>
        </div>
    @endif

    {{-- Experience --}}
    @if (!empty($resume['experiences']))
        <div class="section">
            <h2>Professional Experience</h2>
            @foreach ($resume['experiences'] as $exp)
                <div class="subsection">
                    <p><span class="label">{{ $exp['jobTitle'] ?? '' }}</span> | {{ $exp['company'] ?? '' }}</p>
                    <p class="small-text">{{ $exp['startDate'] ?? '' }} - {{ $exp['endDate'] ?? '' }} | {{ $exp['location'] ?? '' }}</p>
                    <p>{{ $exp['description'] ?? '' }}</p>
                </div>
            @endforeach
        </div>
    @endif

    {{-- Education --}}
    @if (!empty($resume['education']))
        <div class="section">
            <h2>Education</h2>
            @foreach ($resume['education'] as $edu)
                <div class="subsection">
                    <p><span class="label">{{ $edu['degree'] ?? '' }}</span> | {{ $edu['school'] ?? '' }}</p>
                    <p class="small-text">{{ $edu['startDate'] ?? '' }} - {{ $edu['endDate'] ?? '' }} | {{ $edu['location'] ?? '' }}</p>
                    <p>{{ $edu['description'] ?? '' }}</p>
                </div>
            @endforeach
        </div>
    @endif

    {{-- Skills --}}
    @if (!empty($resume['skills']))
        <div class="section">
            <h2>Technical Skills</h2>
            @foreach ($resume['skills'] as $skill)
                <div style="margin-bottom: 8px;">
                    <span style="font-weight: bold;">{{ $skill['name'] }}</span>
                    @if (isset($skill['level']) && ($resume['showExperienceLevel'] ?? false))
                        <span style="margin-left: 10px;">
                            @php
                                $level = $skill['level'] ?? 'Novice';
                                $bulletCount = 0;
                                switch ($level) {
                                    case 'Novice': $bulletCount = 1; break;
                                    case 'Beginner': $bulletCount = 2; break;
                                    case 'Skillful': $bulletCount = 3; break;
                                    case 'Experienced': $bulletCount = 4; break;
                                    case 'Expert': $bulletCount = 5; break;
                                    default: $bulletCount = 1;
                                }
                            @endphp
                            @for ($i = 0; $i < 5; $i++)
                                <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-right: 2px; background-color: {{ $i < $bulletCount ? '#000000' : '#cccccc' }};"></span>
                            @endfor
                        </span>
                    @endif
                </div>
            @endforeach
        </div>
    @endif

    {{-- Languages --}}
    @if (!empty($resume['languages']))
        <div class="section">
            <h2>Languages</h2>
            <ul>
                @foreach ($resume['languages'] as $lang)
                    <li><strong>{{ $lang['name'] }}</strong> - {{ $lang['proficiency'] ?? 'Unknown' }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    {{-- Certifications --}}
    @if (!empty($resume['certifications']))
        <div class="section">
            <h2>Certifications</h2>
            <ul>
                @foreach ($resume['certifications'] as $cert)
                    <li>{{ $cert['title'] }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    {{-- Awards --}}
    @if (!empty($resume['awards']))
        <div class="section">
            <h2>Awards & Honors</h2>
            <ul>
                @foreach ($resume['awards'] as $award)
                    <li>{{ $award['title'] }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    {{-- Websites --}}
    @if (!empty($resume['websites']))
        <div class="section">
            <h2>Websites & Social Media</h2>
            <ul>
                @foreach ($resume['websites'] as $site)
                    <li><strong>{{ $site['label'] }}:</strong> {{ $site['url'] }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    {{-- References --}}
    @if (!empty($resume['references']))
        <div class="section">
            <h2>Professional References</h2>
            @foreach ($resume['references'] as $ref)
                <div class="subsection">
                    <p><strong>{{ $ref['name'] }}</strong></p>
                    @if (!empty($ref['relationship']))
                        <p class="small-text">{{ $ref['relationship'] }}</p>
                    @endif
                    @if (!empty($ref['contactInfo']))
                        <p class="small-text">{{ $ref['contactInfo'] }}</p>
                    @endif
                </div>
            @endforeach
        </div>
    @endif

    {{-- Hobbies --}}
    @if (!empty($resume['hobbies']))
        <div class="section">
            <h2>Interests & Activities</h2>
            <ul>
                @foreach ($resume['hobbies'] as $hobby)
                    <li>{{ $hobby['name'] }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    {{-- Custom Sections --}}
    @if (!empty($resume['customSections']))
        @foreach ($resume['customSections'] as $custom)
            <div class="section">
                <h2>{{ $custom['title'] }}</h2>
                <p>{{ $custom['content'] }}</p>
            </div>
        @endforeach
    @endif

</body>
</html> 