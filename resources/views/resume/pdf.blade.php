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
        .section, h2 { margin-bottom: {{ (int)$sec }}px !important; }
        @endif
        @if(!is_null($para))
        p, li, .small-text { margin-bottom: {{ (int)$para }}px !important; }
        @endif
        @if(!is_null($lh))
        body, p, li, .small-text { line-height: {{ $lh }} !important; }
        @endif
        @if($fontStyle==='small')
        body { font-size: 12px !important; }
        @elseif($fontStyle==='large')
        body { font-size: 16px !important; }
        @endif
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
    @if (!empty($resume['skills']) && count($resume['skills']) > 0)
        <div class="section">
            <h2>Skills</h2>
            <ul>
                @foreach ($resume['skills'] as $skill)
                    @if (!empty($skill['name']))
                        <li>{{ $skill['name'] }}</li>
                    @endif
                @endforeach
            </ul>
        </div>
    @endif

    {{-- Experience --}}
    @if (!empty($resume['experiences']) && count($resume['experiences']) > 0)
        <div class="section">
            <h2>Experience</h2>
            @foreach ($resume['experiences'] as $exp)
                @if (!empty($exp['jobTitle']) || !empty($exp['company']))
                    <div class="subsection">
                        <p>
                            @if (!empty($exp['jobTitle']))
                                <span class="label">{{ $exp['jobTitle'] }}</span>
                            @endif
                            @if (!empty($exp['company']))
                                @if (!empty($exp['jobTitle'])), @endif
                                {{ $exp['company'] }}
                            @endif
                            @if (!empty($exp['location']))
                                – {{ $exp['location'] }}
                            @endif
                        </p>
                        @if (!empty($exp['startDate']) || !empty($exp['endDate']))
                            <p class="small-text">
                                @if (!empty($exp['startDate']))
                                    {{ $exp['startDate'] }}
                                @endif
                                @if (!empty($exp['endDate']))
                                    – {{ $exp['endDate'] }}
                                @endif
                            </p>
                        @endif
                        @if (!empty($exp['description']))
                            <p>{{ $exp['description'] }}</p>
                        @endif
                    </div>
                @endif
            @endforeach
        </div>
    @endif

    {{-- Education --}}
    @if (!empty($resume['education']) && count($resume['education']) > 0)
        <div class="section">
            <h2>Education</h2>
            @foreach ($resume['education'] as $edu)
                @if (!empty($edu['degree']) || !empty($edu['school']))
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
                                @if (!empty($edu['startDate']))
                                    {{ $edu['startDate'] }}
                                @endif
                                @if (!empty($edu['endDate']))
                                    – {{ $edu['endDate'] }}
                                @endif
                            </p>
                        @endif
                        @if (!empty($edu['description']))
                            <p>{{ $edu['description'] }}</p>
                        @endif
                    </div>
                @endif
            @endforeach
        </div>
    @endif

</body>
</html> 