<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Resume</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            margin: 40px;
            font-size: 14px;
            color: #333;
        }

        h1, h2, h3 {
            margin: 0;
            padding: 0;
        }

        h1 {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
        }

        h2 {
            font-size: 18px;
            margin-top: 30px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
            color: #34495e;
        }

        .section {
            margin-bottom: 20px;
        }

        .subsection {
            margin-bottom: 10px;
        }

        .label {
            font-weight: bold;
            color: #555;
        }

        .small-text {
            font-size: 12px;
            color: #666;
        }

        ul {
            padding-left: 20px;
        }
    </style>
</head>
<body>
    <h1>This is Minimal Template</h1>

    {{-- Contact Info --}}
    <h1>{{ $resume['contact']['firstName'] ?? '' }} {{ $resume['contact']['lastName'] ?? '' }}</h1>
    <p><strong>{{ $resume['contact']['desiredJobTitle'] ?? '' }}</strong></p>
    <p class="small-text">
        {{ $resume['contact']['email'] ?? '' }} |
        {{ $resume['contact']['phone'] ?? '' }}<br>
        {{ $resume['contact']['address'] ?? '' }},
        {{ $resume['contact']['city'] ?? '' }},
        {{ $resume['contact']['country'] ?? '' }},
        {{ $resume['contact']['postCode'] ?? '' }}
    </p>

    {{-- Summary --}}
    @if (!empty($resume['summary']))
        <div class="section">
            <h2>Professional Summary</h2>
            <p>{{ $resume['summary'] }}</p>
        </div>
    @endif

    {{-- Skills --}}
    @if (!empty($resume['skills']))
        <div class="section">
            <h2>Skills</h2>
            <ul>
                @foreach ($resume['skills'] as $skill)
                    <li>{{ $skill['name'] }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    {{-- Experience --}}
    @if (!empty($resume['experiences']))
        <div class="section">
            <h2>Experience</h2>
            @foreach ($resume['experiences'] as $exp)
                <div class="subsection">
                    <p><span class="label">{{ $exp['jobTitle'] ?? '' }}</span>, {{ $exp['company'] ?? '' }} – {{ $exp['location'] ?? '' }}</p>
                    <p class="small-text">{{ $exp['startDate'] ?? '' }} – {{ $exp['endDate'] ?? '' }}</p>
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
                    <p><span class="label">{{ $edu['degree'] ?? '' }}</span>, {{ $edu['school'] ?? '' }} – {{ $edu['location'] ?? '' }}</p>
                    <p class="small-text">{{ $edu['startDate'] ?? '' }} – {{ $edu['endDate'] ?? '' }}</p>
                    <p>{{ $edu['description'] ?? '' }}</p>
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
                    <li>{{ $lang['name'] }} ({{ $lang['proficiency'] ?? 'Unknown' }})</li>
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
            <h2>Awards</h2>
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
            <h2>Websites</h2>
            <ul>
                @foreach ($resume['websites'] as $site)
                    <li>{{ $site['label'] }}: {{ $site['url'] }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    {{-- References --}}
    @if (!empty($resume['references']))
        <div class="section">
            <h2>References</h2>
            @foreach ($resume['references'] as $ref)
                <div class="subsection">
                    <p><strong>{{ $ref['name'] }}</strong></p>
                    <p>{{ $ref['relationship'] ?? '' }}</p>
                    <p>{{ $ref['contactInfo'] ?? '' }}</p>
                </div>
            @endforeach
        </div>
    @endif

    {{-- Hobbies --}}
    @if (!empty($resume['hobbies']))
        <div class="section">
            <h2>Hobbies</h2>
            <ul>
                @foreach ($resume['hobbies'] as $hobby)
                    <li>{{ $hobby['name'] }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    {{-- Custom Sections --}}
    @if (!empty($resume['customSections']))
        <div class="section">
            <h2>Additional Sections</h2>
            @foreach ($resume['customSections'] as $custom)
                <div class="subsection">
                    <p><strong>{{ $custom['title'] }}</strong></p>
                    <p>{{ $custom['content'] }}</p>
                </div>
            @endforeach
        </div>
    @endif

</body>
</html>