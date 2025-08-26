<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Professional Resume</title>
<style>
  /* DOMPDF safe defaults */
  @page { margin: 18mm 16mm; }
  body {
    font-family: 'Inter', DejaVu Sans, Arial, sans-serif;
    color: #111827;
    font-size: 14px;       /* match text-sm in React */
    line-height: 1.5;
    margin: 0;
    padding: 0;
  }
  .container { width: 100%; }

  /* Header */
  h1 { font-size: 30px; font-weight: 800; margin: 0; }   /* text-3xl */
  .role { font-size: 18px; margin-top: 2px; }            /* text-lg */
  .contact { font-size: 10px; color: #374151; margin-top: 6px; }

  /* Divider */
  .divider { border-top: 1px solid #c2410c; margin: 10px 0; }

  /* Section Titles */
  .section-title {
    font-size: 16px;       /* text-lg */
    font-weight: 600;
    font-family: 'Inter', DejaVu Sans, Arial, sans-serif;
    text-transform: uppercase;
    margin: 6px 0 4px 0;
    page-break-after: avoid;
  }

  /* Tables for left/right alignment */
  .row-table { width: 100%; border-collapse: collapse; }
  .row-table td { vertical-align: top; }
  .cell-left { width: 70%; font-size: 14px; font-weight: 600; }
  .cell-right { width: 30%; text-align: right; font-size: 14px; font-weight: 600; }

  /* Lists */
  ul { margin: 4px 0 8px 18px; padding: 0; font-size: 14px; }
  li { margin-bottom: 2px; }

  /* Skills */
  .skills-table { width: 100%; border-collapse: collapse; font-size: 14px; }
  .skills-table td { width: 50%; vertical-align: top; padding: 2px 12px 2px 0; }
  .skill-line { white-space: nowrap; }
  .skill-name { font-weight: 600; }
  /* Force DejaVu Sans for dots so they don’t break */
  .skill-dots { 
    font-family: DejaVu Sans, sans-serif;
    letter-spacing: 2px;
    color: #374151;
    font-size: 14px;
  }
  .skill-level { font-size: 12px; color: #6b7280; font-style: italic; margin-left: 6px; }

  /* Muted placeholders */
  .muted { color: #9ca3af; font-style: italic; }

  /* Keep blocks together */
  .keep { page-break-inside: avoid; }

  /* Prevent text overflow */
  p, li, .contact { word-wrap: break-word; overflow-wrap: break-word; }
</style>
</head>
<body>
<div class="container">

  @php
    $resume = $resume ?? [];

    $contact = $resume['contact'] ?? [
      'firstName' => '', 'lastName' => '', 'desiredJobTitle' => '',
      'address' => '', 'city' => '', 'phone' => '', 'email' => '',
    ];

    $summary = $resume['summary'] ?? '';

    $experiences = $resume['experiences'] ?? [];
    if (empty($experiences)) {
      $experiences = [[
        'jobTitle' => '', 'company' => '', 'startDate' => '', 'endDate' => '',
        'location' => '', 'description' => "Sample Text"
      ]];
    }

    $education = $resume['education'] ?? [];
    if (empty($education)) {
      $education = [[
        'degree' => '', 'school' => '', 'startDate' => '', 'endDate' => '',
        'location' => '', 'description' => ''
      ]];
    }

    $skills = $resume['skills'] ?? [];
    if (empty($skills)) {
      $skills = [
        ['name' => '', 'level' => 'Experienced'],
        ['name' => '', 'level' => 'Experienced'],
        ['name' => '', 'level' => 'Experienced'],
        ['name' => '', 'level' => 'Experienced'],
      ];
    }

    $languages = $resume['languages'] ?? [];
    $certifications = $resume['certifications'] ?? [];
    $awards = $resume['awards'] ?? [];
    $websites = $resume['websites'] ?? [];
    $hobbies = $resume['hobbies'] ?? [];
    $customSections = $resume['customSections'] ?? [];
    $references = $resume['references'] ?? [];

    $levels = ['Novice','Beginner','Skillful','Experienced','Expert'];

    // Contact line
    $contactParts = [];
    $addrCity = trim(($contact['address'] ?? '').( (!empty($contact['address']) && !empty($contact['city'])) ? ', ' : '' ).($contact['city'] ?? ''));
    if ($addrCity !== '') { $contactParts[] = $addrCity; }
    if (!empty($contact['phone'])) { $contactParts[] = $contact['phone']; }
    if (!empty($contact['email'])) { $contactParts[] = $contact['email']; }
    if (!empty($websites)) {
      foreach ($websites as $site) {
        if (!empty($site['url'])) {
          $label = $site['label'] ?? 'Website';
          $contactParts[] = $label.': '.$site['url'];
        }
      }
    }

    $languagesLine = !empty($languages)
      ? implode(', ', array_map(fn($l)=> trim(($l['name'] ?? '').( ($l['proficiency'] ?? '') ? " ({$l['proficiency']})" : '' )), $languages))
      : 'English, French, Mandarin';

    $certsLine = !empty($certifications)
      ? implode(', ', array_map(fn($c)=>$c['title'] ?? '', $certifications))
      : 'Professional Design Engineer (PDE), Project Management Tech (PMT), Structural Process Design (SPD)';

    $awardsLine = !empty($awards)
      ? implode(', ', array_map(fn($a)=>$a['title'] ?? '', $awards))
      : 'Most Innovative Intern of the Year (2022), Overall Best Intern (2022), Onboarding Project Lead (2024)';

    $skillRows = array_chunk($skills, 2);
  @endphp

  {{-- Header --}}
  <h1>{{ trim(($contact['firstName'] ?? '').' '.($contact['lastName'] ?? '')) ?: 'YOUR NAME' }}</h1>
  <div class="role">{{ ($contact['desiredJobTitle'] ?? '') ?: 'JOB TITLE' }}</div>
  <div class="contact">
    {{ !empty($contactParts) ? implode(' ┃ ', $contactParts) : '123 Anywhere St, Any City ┃ (123) 456-7890 ┃ email@example.com' }}
  </div>

  {{-- Summary --}}
  <div class="divider"></div>
  <div class="section-title">Summary</div>
  <p>
    {{ trim($summary) !== '' ? $summary
      : 'Use this section to give recruiters a quick glimpse of your professional profile. In just 3–4 lines, highlight your background, education and main skills.' }}
  </p>

  {{-- Experience --}}
  <div class="divider"></div>
  <div class="section-title">Professional Experience</div>
  @foreach ($experiences as $exp)
    <div class="keep">
      <table class="row-table">
        <tr>
          <td class="cell-left">
            {{ !empty($exp['jobTitle']) || !empty($exp['company'])
                ? trim(($exp['jobTitle'] ?? '').( (!empty($exp['jobTitle']) && !empty($exp['company'])) ? ', ' : '' ).($exp['company'] ?? ''))
                : 'Job Title, Company' }}
          </td>
          <td class="cell-right">
            {{ (!empty($exp['startDate']) || !empty($exp['endDate']))
                ? trim(($exp['startDate'] ?? '').' - '.($exp['endDate'] ?? ''))
                : '2017 — 2020' }}
          </td>
        </tr>
      </table>

      @if (!empty($exp['location']))
        <div style="font-size:12px;color:#6b7280;font-style:italic;margin-top:2px;">
          {{ $exp['location'] }}
        </div>
      @else
        <div class="muted" style="font-size:12px;margin-top:2px;">Employer</div>
      @endif

      @php
        $desc = $exp['description'] ?? '';
        $points = (trim((string)$desc) !== '') ? explode("\n", (string)$desc) : ['Sample Text'];
        $isPlaceholder = (trim((string)$desc) === '');
      @endphp
      <ul>
        @foreach ($points as $p)
          @if (trim($p) !== '')
            <li class="{{ $isPlaceholder ? 'muted' : '' }}">{{ $p }}</li>
          @endif
        @endforeach
      </ul>
    </div>
  @endforeach

  {{-- Projects --}}
  @if (!empty($customSections))
    <div class="divider"></div>
    <div class="section-title">Projects</div>
    @foreach ($customSections as $section)
      <div class="keep">
        <table class="row-table">
          <tr>
            <td class="cell-left">{{ $section['title'] ?? '' }}</td>
            <td class="cell-right">{{ $section['date'] ?? '' }}</td>
          </tr>
        </table>
        @php
          $content = (string)($section['content'] ?? '');
          $points = array_filter(array_map('trim', explode("\n", $content)));
        @endphp
        @if (!empty($points))
          <ul>
            @foreach ($points as $p)
              <li>{{ $p }}</li>
            @endforeach
          </ul>
        @endif
      </div>
    @endforeach
  @endif

  {{-- Education --}}
  <div class="divider"></div>
  <div class="section-title">Education</div>
  @foreach ($education as $edu)
    <div class="keep">
      <table class="row-table">
        <tr>
          <td class="cell-left">
            {{ (!empty($edu['degree']) || !empty($edu['school']))
                ? trim(($edu['degree'] ?? '').( (!empty($edu['degree']) && !empty($edu['school'])) ? ', ' : '' ).($edu['school'] ?? ''))
                : 'Degree in Field of study, School Name' }}
          </td>
          <td class="cell-right">
            {{ (!empty($edu['startDate']) || !empty($edu['endDate']))
                ? trim(($edu['startDate'] ?? '').' - '.($edu['endDate'] ?? ''))
                : '2013 — 2017' }}
          </td>
        </tr>
      </table>
      @if (!empty($edu['location']))
        <div style="font-size:12px;color:#6b7280;margin:2px 0;">{{ $edu['location'] }}</div>
      @endif
      @if (!empty($edu['description']))
        <p>{{ $edu['description'] }}</p>
      @endif
    </div>
  @endforeach

  {{-- Skills --}}
  <div class="divider"></div>
  <div class="section-title">Skills</div>
  <table class="skills-table">
    @foreach ($skillRows as $row)
      <tr class="keep">
        @for ($i = 0; $i < 2; $i++)
          @php
            $skill = $row[$i] ?? null;
          @endphp
          <td>
            @if ($skill)
              @php
                $name = trim((string)($skill['name'] ?? ''));
                $level = (string)($skill['level'] ?? '');
                $idx = array_search($level, $levels, true);
                if ($idx === false) { $idx = 3; }
                $active = $idx + 1;
                if ($active < 1) $active = 1;
                if ($active > 5) $active = 5;
                $dots = str_repeat('●', $active) . str_repeat('○', 5 - $active);
                $muted = ($name === '');
              @endphp
              <div class="skill-line">
                <span class="skill-name {{ $muted ? 'muted' : '' }}">{{ $name !== '' ? $name : 'Skill' }}</span>
                <span class="skill-dots">{{ $dots }}</span>
                <span class="skill-level">{{ $levels[$idx] }}</span>
              </div>
            @endif
          </td>
        @endfor
      </tr>
    @endforeach
  </table>

  {{-- Additional Info --}}
  <div class="divider"></div>
  <div class="section-title">Additional Information</div>
  <div class="keep">
    <p><strong>Languages:</strong> {{ $languagesLine }}</p>
    <p><strong>Certifications:</strong> {{ $certsLine }}</p>
    <p><strong>Awards/Activities:</strong> {{ $awardsLine }}</p>

    @if (!empty($websites))
      @php
        $sitesLine = implode(', ', array_map(fn($w)=> trim(($w['label'] ?? 'Website').': '.($w['url'] ?? '')), $websites));
      @endphp
      <p><strong>Websites:</strong> {{ $sitesLine }}</p>
    @endif

    @if (!empty($hobbies))
      @php
        $hobbiesLine = implode(', ', array_map(fn($h)=>$h['name'] ?? '', $hobbies));
      @endphp
      <p><strong>Hobbies:</strong> {{ $hobbiesLine }}</p>
    @endif
  </div>

  {{-- References --}}
  @if (!empty($references))
    <div class="divider"></div>
    <div class="section-title">References</div>
    @foreach ($references as $ref)
      <div class="keep">
        <table class="row-table">
          <tr>
            <td class="cell-left">{{ $ref['name'] ?? '' }}</td>
            <td class="cell-right">@if (!empty($ref['relationship'])) ({{ $ref['relationship'] }}) @endif</td>
          </tr>
        </table>
        @if (!empty($ref['contactInfo']))
          <div style="font-size:12px;color:#374151;">{{ $ref['contactInfo'] }}</div>
        @endif
      </div>
    @endforeach
  @endif

</div>
</body>
</html>
