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

        h3 {
            font-size: 16px;
            margin-top: 20px;
            color: #2c3e50;
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

        a {
            color: #2980b9;
            text-decoration: underline;
        }
    </style>
</head>
    <body>

    {{-- Contact Info --}}
    <h1>{{ $resume['contact']['firstName'] ?? '' }} {{ $resume['contact']['lastName'] ?? '' }}</h1>
    @if (!empty($resume['contact']['desiredJobTitle']))
        <p><strong>{{ $resume['contact']['desiredJobTitle'] }}</strong></p>
    @endif
    <p class="small-text">
        @if (!empty($resume['contact']['email']))
            {{ $resume['contact']['email'] }}
        @endif
        @if (!empty($resume['contact']['phone']))
            @if (!empty($resume['contact']['email'])) | @endif
            {{ $resume['contact']['phone'] }}
        @endif
        @if (!empty($resume['contact']['address']) || !empty($resume['contact']['city']) || !empty($resume['contact']['country']))
            <br>
            @if (!empty($resume['contact']['address']))
                {{ $resume['contact']['address'] }},
            @endif
            @if (!empty($resume['contact']['city']))
                {{ $resume['contact']['city'] }},
            @endif
            @if (!empty($resume['contact']['country']))
                {{ $resume['contact']['country'] }}
            @endif
            @if (!empty($resume['contact']['postCode']))
                {{ $resume['contact']['postCode'] }}
            @endif
        @endif
    </p>

    {{-- Summary --}}
    @if (!empty($resume['summary']))
        <div class="section">
            <h2>Professional Summary</h2>
            <p>{{ $resume['summary'] }}</p>
        </div>
    @endif

    {{-- Skills --}}
    @php
        $levelToCount = [
            'Beginner' => 1,
            'Novice' => 2,
            'Skillful' => 3,
            'Experienced' => 4,
            'Expert' => 5,
        ];
    @endphp

    @if (!empty($resume['skills']))
        <div class="section">
            <h2>Skills</h2>
            <ul>
                @foreach ($resume['skills'] as $skill)
                    @if (!empty($skill['name']))
                        @php
                            $level = $skill['level'] ?? '';
                            $dots = str_repeat('●', $levelToCount[$level] ?? 0) . str_repeat('○', 5 - ($levelToCount[$level] ?? 0));
                        @endphp
                        <li>{{ $skill['name'] }} {{ $dots }}</li>
                    @endif
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
                    <p>
                        @if (!empty($exp['jobTitle']))
                            <span class="label">{{ $exp['jobTitle'] }}</span>
                        @endif
                        @php
                            $company = $exp['company'] ?? '';
                            $location = $exp['location'] ?? '';
                        @endphp
                        @if (!empty($company))
                            @if (!empty($exp['jobTitle'])), @endif
                            {{ $company }}
                        @endif
                        @if (!empty($location))
                            – {{ $location }}
                        @endif
                    </p>
                    @if (!empty($exp['startDate']) || !empty($exp['endDate']))
                        <p class="small-text">
                            {{ $exp['startDate'] ?? '' }} – {{ $exp['endDate'] ?? 'Present' }}
                        </p>
                    @endif
                    @if (!empty($exp['description']))
                        <p>{{ $exp['description'] }}</p>
                    @endif
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
                    <p>
                        @if (!empty($edu['degree']))
                            <span class="label">{{ $edu['degree'] }}</span>
                        @endif
                        @if (!empty($edu['school']))
                            @if (!empty($edu['degree'])), @endif
                            {{ $edu['school'] }}
                        @endif
                        @if (!empty($edu['location']))
                            – {{ $edu['location'] }}
                        @endif
                    </p>
                    @if (!empty($edu['startDate']) || !empty($edu['endDate']))
                        <p class="small-text">
                            {{ $edu['startDate'] ?? '' }} – {{ $edu['endDate'] ?? 'Present' }}
                        </p>
                    @endif
                    @if (!empty($edu['description']))
                        <p>{{ $edu['description'] }}</p>
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
                    @if (!empty($lang['language']))
                        <li>{{ $lang['language'] }} @if (!empty($lang['level'])) - {{ $lang['level'] }} @endif</li>
                    @endif
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
                    @if (!empty($cert['name']))
                        <li>{{ $cert['name'] }} @if (!empty($cert['issuer'])) - {{ $cert['issuer'] }} @endif</li>
                    @endif
                @endforeach
            </ul>
        </div>
    @endif

    {{-- Awards --}}
    @if (!empty($resume['awards']))
        @php
            $awards = collect($resume['awards'])->filter(fn($a) => !empty($a['content']));
        @endphp
        @if ($awards->count())
            <div class="section">
                <h2>Awards</h2>
                <p>{{ $awards->map(fn($a) => '• ' . $a['content'])->implode(' ') }}</p>
            </div>
        @endif
    @endif

    {{-- Websites --}}
    @if (!empty($resume['websites']))
        <div class="section">
            <h2>Websites</h2>
            <ul>
                @foreach ($resume['websites'] as $web)
                    @if (!empty($web))
                        <li><a href="{{ $web }}" target="_blank">{{ $web }}</a></li>
                    @endif
                @endforeach
            </ul>
        </div>
    @endif

    {{-- References --}}
    @if (!empty($resume['showReferences']) && is_array($resume['showReferences']))
        <div class="mb-2">
            <h3 class="text-lg font-semibold mb-1">REFERENCES</h3>
            <ul class="list-disc ml-6 text-sm text-gray-700">
                @foreach ($resume['showReferences'] as $ref)
                    @if (!empty($ref['content']))
                        <li>{{ $ref['content'] }}</li>
                    @endif
                @endforeach
            </ul>
        </div>
    @endif

    {{-- Hobbies --}}
    @if (!empty($resume['hobbies']) && is_array($resume['hobbies']))
        <div class="mb-2">
            <h3 class="text-lg font-semibold mb-1">HOBBIES</h3>
            <ul class="list-disc ml-6 text-sm text-gray-700">
                @foreach ($resume['hobbies'] as $hobby)
                    @if (!empty($hobby['content']))
                        <li>{{ $hobby['content'] }}</li>
                    @endif
                @endforeach
            </ul>
        </div>
    @endif

    {{-- Custom Sections --}}
    @if (!empty($resume['customSections']) && is_array($resume['customSections']))
        @foreach ($resume['customSections'] as $section)
            @if (!empty($section['sectionName']) || !empty($section['description']))
                <div class="mb-2">
                    @if (!empty($section['sectionName']))
                        <h3 class="text-lg font-semibold mb-1">{{ $section['sectionName'] }}</h3>
                    @endif
                    @if (!empty($section['description']))
                        <p class="text-sm text-gray-700">{!! nl2br(e($section['description'])) !!}</p>
                    @endif
                </div>
            @endif
        @endforeach
    @endif


    </body>
</html>
