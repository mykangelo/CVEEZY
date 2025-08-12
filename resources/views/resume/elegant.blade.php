<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Resume</title>
    <style>
        @page { margin: 0.5in; }
        body {
            font-family: 'DejaVu Sans', 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            font-size: 13px;
            line-height: 1.5;
            color: #333333;
            background: #ffffff;
        }

        h1, h2, h3, p { margin: 0; padding: 0; }

        /* Header */
        .header-wrap { border-top: 1px solid #D3D3D3; padding-top: 10px; page-break-inside: avoid; }
        .header { position: relative; text-align: center; margin-bottom: 12px; overflow: hidden; }
        .signature { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: 'Brush Script MT', 'Segoe Script', 'Pacifico', cursive; font-size: 90px; line-height: 1; opacity: 0.04; transform: translateY(2px) rotate(-8deg); }
        .name { font-size: 32px; font-weight: 800; letter-spacing: 0.20em; line-height: 1.2; position: relative; z-index: 1; }
        .title { margin-top: 2px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.38em; position: relative; z-index: 1; }

        /* Grid layout */
        .grid { width: 100%; border-collapse: separate; border-spacing: 0; border-top: 1px solid #D3D3D3; border-bottom: 1px solid #D3D3D3; page-break-inside: auto; }
        .grid td { vertical-align: top; page-break-inside: avoid; }
        .grid tr { page-break-inside: avoid; page-break-after: auto; }
        .grid tr + tr td { border-top: 1px solid #D3D3D3; }
        .cell-left { width: 35%; padding: 8px 0 8px 0; border-right: 1px solid #D3D3D3; }
        .cell-right { width: 65%; padding: 8px 0 8px 16px; }
        .inner { padding-right: 16px; }

        /* Section headings without underline */
        .heading { font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.28em; margin-bottom: 6px; }

        /* Internal separators in left column that connect to the vertical divider */
        .subdivider {
            border: 0;
            border-top: 1px solid #D3D3D3;
            height: 0;
            margin: 0;
            /* Extend through the inner padding so the line touches the center vertical divider */
            margin-right: -16px;
        }
        .subdivider-right {
            border: 0;
            border-top: 1px solid #D3D3D3;
            height: 0;
            margin: 0;
            /* Pull into the left padding to connect with the vertical divider */
            margin-left: -16px;
        }
        .block { padding-top: 8px; }

        /* Text helpers */
        .small { font-size: 11px; color: #666666; }
        .bold { font-weight: 700; }
        .mb-1 { margin-bottom: 4px; }
        .mt-1 { margin-top: 6px; }

        /* Lists */
        ul { margin: 0; padding-left: 18px; }
        li { margin-bottom: 2px; }

        /* Icons */
        .icon { display: inline-block; font-size: 12px; line-height: 1; vertical-align: text-top; margin-right: 6px; }
        .contact-item { margin-bottom: 6px; }
        .contact-table { width: 100%; border-collapse: separate; border-spacing: 0; border: 0; }
        .contact-table td { font-size: 12.5px; line-height: 1.45; border: 0; }
        .contact-table tr + tr td { padding-top: 6px; }
        .icon-cell { width: 16px; padding-right: 8px; vertical-align: top; }
        .text-cell { vertical-align: top; }
        .no-underline { text-decoration: none; }
    </style>
</head>
<body>
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
        $certifications = $resume['certifications'] ?? [];
        $awards = $resume['awards'] ?? [];
        $websites = $resume['websites'] ?? [];
        $references = $resume['references'] ?? [];
        $customSections = $resume['customSections'] ?? [];
        $summary = $resume['summary'] ?? '';
    @endphp

    <!-- Header: Name and Title with top line and signature -->
    <div class="header-wrap">
        <div class="header">
            @php
                $initials = '';
                if (!empty($contact['firstName'])) { $initials .= strtoupper(substr($contact['firstName'], 0, 1)); }
                if (!empty($contact['lastName'])) { $initials .= strtoupper(substr($contact['lastName'], 0, 1)); }
            @endphp
            @if(!empty($initials))
                <div class="signature">{{ $initials }}</div>
            @endif
            <div class="name">{{ ($contact['firstName'] ?? '') }} {{ ($contact['lastName'] ?? '') }}</div>
            @if(!empty($contact['desiredJobTitle']))
                <div class="title">{{ $contact['desiredJobTitle'] }}</div>
            @endif
        </div>
    </div>

    <!-- Two-column grid with connected lines -->
    <table class="grid">
        <!-- Row 1: Contact | Profile Summary -->
        <tr>
            <td class="cell-left">
                <div class="inner">
                    <div class="heading">Contact</div>
                    <table class="contact-table">
                        <tbody>
                        @if (!empty($contact['phone']))
                            <tr>
                                <td class="icon-cell">☎</td>
                                <td class="text-cell" style="text-decoration: none;">{{ $contact['phone'] }}</td>
                            </tr>
                        @endif
                        @if (!empty($contact['email']))
                            <tr>
                                <td class="icon-cell">✉</td>
                                <td class="text-cell" style="text-decoration: none;">{{ $contact['email'] }}</td>
                            </tr>
                        @endif
                        @php
                            $locationParts = array_filter([
                                $contact['address'] ?? null,
                                $contact['city'] ?? null,
                                $contact['country'] ?? null,
                                $contact['postCode'] ?? null,
                            ]);
                        @endphp
                        @if (!empty($locationParts))
                            <tr>
                                <td class="icon-cell">⌂</td>
                                <td class="text-cell" style="text-decoration: none;">{{ implode(', ', $locationParts) }}</td>
                            </tr>
                        @endif
                        @if (!empty($websites))
                            @foreach ($websites as $site)
                                <tr>
                                    <td class="icon-cell">www</td>
                                    <td class="text-cell" style="text-decoration: none;">{{ $site['url'] }}</td>
                                </tr>
                            @endforeach
                        @endif
                        </tbody>
                    </table>
                </div>

                <!-- Left column continued in next row -->
            </td>
            <td class="cell-right">
                @if (!empty($summary))
                    <div>
                        <div class="heading">Profile Summary</div>
                        <p>{{ $summary }}</p>
                    </div>
                @endif
                <hr class="subdivider-right" />
            </td>
        </tr>

        <!-- Row 2: Education/Skills/Languages | Work Experience -->
        <tr>
            <td class="cell-left">
                <div class="inner">
                <hr class="subdivider" />
                @if (!empty($education))
                    <div>
                        <div class="heading">Education</div>
                        <div class="mt-1">
                            @foreach ($education as $edu)
                                <div class="mb-1">
                                    <p class="bold mb-1">{{ $edu['degree'] ?? '' }}</p>
                                    <p class="mb-1">{{ $edu['school'] ?? '' }}@if(!empty($edu['location'])) — {{ $edu['location'] }}@endif</p>
                                    <p class="small">{{ $formatMonthYear($edu['startDate'] ?? '') }}@if(!empty($edu['endDate'])) - {{ $formatMonthYear($edu['endDate']) }}@endif</p>
                                    @if(!empty($edu['description']))
                                        <p class="mt-1">{{ $edu['description'] }}</p>
                                    @endif
                                </div>
                            @endforeach
                        </div>
                    </div>
                @endif

                @if (!empty($skills))
                    <hr class="subdivider" />
                    <div class="block">
                        <div class="heading">Skills</div>
                        <ul class="mt-1">
                            @foreach ($skills as $skill)
                                <li>{{ $skill['name'] }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                @if (!empty($languages))
                    <hr class="subdivider" />
                    <div class="block">
                        <div class="heading">Languages</div>
                        <ul class="mt-1">
                            @foreach ($languages as $lang)
                                <li>{{ $lang['name'] }}@if(!empty($lang['proficiency'])) ({{ $lang['proficiency'] }})@endif</li>
                            @endforeach
                        </ul>
                    </div>
                @endif
                </div>
            </td>
            <td class="cell-right">
                @if (!empty($experiences))
                    <div>
                        <div class="heading">Work Experience</div>
                        <div class="mt-1">
                            @foreach ($experiences as $exp)
                                @php
                                    $desc = $exp['description'] ?? '';
                                    $items = array_values(array_filter(preg_split("/(\r\n|\n|\r)/", $desc)));
                                @endphp
                                <div class="mb-1">
                                    <p class="bold mb-1">{{ $exp['jobTitle'] ?? '' }}@if(!empty($exp['company'])), {{ $exp['company'] }}@endif @if(!empty($exp['location'])) – {{ $exp['location'] }}@endif</p>
                                    <p class="small">{{ $formatMonthYear($exp['startDate'] ?? '') }}@if(!empty($exp['endDate'])) - {{ $formatMonthYear($exp['endDate']) }}@endif</p>
                                    @if(count($items) > 0)
                                        <ul class="mt-1">
                                            @foreach ($items as $line)
                                                <li>{{ $line }}</li>
                                            @endforeach
                                        </ul>
                                    @elseif(!empty($desc))
                                        <p class="mt-1">{{ $desc }}</p>
                                    @endif
                                </div>
                            @endforeach
                        </div>
                    </div>
                @endif
            </td>
        </tr>

        @php
            $hasExtras = (!empty($certifications) || !empty($awards) || !empty($references) || !empty($customSections));
        @endphp
        @if ($hasExtras)
        <!-- Row 3: Optional extras only if present -->
        <tr>
            <td class="cell-left"></td>
            <td class="cell-right" style="border-left: 1px solid #D3D3D3;">
                @if (!empty($customSections))
                    <div class="mb-1">
                        @foreach ($customSections as $custom)
                            <p class="heading" style="margin-bottom:6px;">{{ $custom['title'] }}</p>
                            <p class="mb-1">{{ $custom['content'] }}</p>
                        @endforeach
                    </div>
                @endif
                @if (!empty($certifications))
                    <div class="mb-1">
                        <p class="heading" style="margin-bottom:6px;">Certifications</p>
                        <ul>
                            @foreach ($certifications as $cert)
                                <li>{{ $cert['title'] }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif
                @if (!empty($awards))
                    <div class="mb-1">
                        <p class="heading" style="margin-bottom:6px;">Awards</p>
                        <ul>
                            @foreach ($awards as $award)
                                <li>{{ $award['title'] }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif
                @if (!empty($references))
                    <div>
                        <p class="heading" style="margin-bottom:6px;">References</p>
                        <ul>
                            @foreach ($references as $ref)
                                <li><span class="bold">{{ $ref['name'] }}</span>@if(!empty($ref['relationship'])) — {{ $ref['relationship'] }}@endif @if(!empty($ref['contactInfo'])) — {{ $ref['contactInfo'] }}@endif</li>
                            @endforeach
                        </ul>
                    </div>
                @endif
            </td>
        </tr>
        @endif
    </table>
</body>
</html>