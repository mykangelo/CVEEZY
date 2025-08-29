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
  @if (!empty($contact['firstName']) || !empty($contact['lastName']) || !empty($contact['desiredJobTitle']) || !empty($contactParts))
    <h1>{{ trim(($contact['firstName'] ?? '').' '.($contact['lastName'] ?? '')) }}</h1>
    @if (!empty($contact['desiredJobTitle']))
      <div class="role">{{ $contact['desiredJobTitle'] }}</div>
    @endif
    @if (!empty($contactParts))
      <div class="contact">{{ implode(' ┃ ', $contactParts) }}</div>
    @endif
  @endif


  {{-- Summary --}}
  @if (!empty(trim($summary)))
    <div class="divider"></div>
    <div class="section-title">Summary</div>
    <p>{{ $summary }}</p>
  @endif

  
  {{-- Experience --}}
  @if (!empty($experiences) && collect($experiences)->filter(fn($e)=>
      !empty($e['jobTitle']) || !empty($e['company']) || !empty($e['description'])
  )->isNotEmpty())
    <div class="divider"></div>
    <div class="section-title">Professional Experience</div>
    @foreach ($experiences as $exp)
      <div class="keep">
        <table class="row-table">
          <tr>
            <td class="cell-left">
              {{ trim(($exp['jobTitle'] ?? '').((!empty($exp['jobTitle']) && !empty($exp['company'])) ? ', ' : '').($exp['company'] ?? '')) }}
            </td>
            <td class="cell-right">
              {{ trim(($exp['startDate'] ?? '').' - '.($exp['endDate'] ?? '')) }}
            </td>
          </tr>
        </table>
        @if (!empty($exp['location']))
          <div style="font-size:12px;color:#6b7280;font-style:italic;margin-top:2px;">{{ $exp['location'] }}</div>
        @endif
        @if (!empty($exp['description']))
          @php $points = array_filter(array_map('trim', explode("\n", (string)$exp['description']))); @endphp
          @if (!empty($points))
            <ul>
              @foreach ($points as $p)
                <li>{{ $p }}</li>
              @endforeach
            </ul>
          @endif
        @endif
      </div>
    @endforeach
  @endif


  {{-- Projects --}}
  @if (!empty($customSections))
    <div class="divider"></div>
    <div class="section-title">Projects</div>
    @foreach ($customSections as $section)
      @if (!empty($section['title']) || !empty($section['content']))
        <div class="keep">
          <table class="row-table">
            <tr>
              <td class="cell-left">{{ $section['title'] ?? '' }}</td>
              <td class="cell-right">{{ $section['date'] ?? '' }}</td>
            </tr>
          </table>
          @php $points = array_filter(array_map('trim', explode("\n", (string)($section['content'] ?? '')))); @endphp
          @if (!empty($points))
            <ul>
              @foreach ($points as $p)
                <li>{{ $p }}</li>
              @endforeach
            </ul>
          @endif
        </div>
      @endif
    @endforeach
  @endif

  {{-- Education --}}
  @if (!empty($education) && collect($education)->filter(fn($e)=>
      !empty($e['degree']) || !empty($e['school'])
  )->isNotEmpty())
    <div class="divider"></div>
    <div class="section-title">Education</div>
    @foreach ($education as $edu)
      <div class="keep">
        <table class="row-table">
          <tr>
            <td class="cell-left">{{ trim(($edu['degree'] ?? '').((!empty($edu['degree']) && !empty($edu['school'])) ? ', ' : '').($edu['school'] ?? '')) }}</td>
            <td class="cell-right">{{ trim(($edu['startDate'] ?? '').' - '.($edu['endDate'] ?? '')) }}</td>
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
  @endif

  {{-- Skills --}}
  @php
    $showExperienceLevel = $resume['showExperienceLevel'] ?? true; // default true if not provided
  @endphp

  @if (!empty($skills) && collect($skills)->filter(fn($s)=>!empty($s['name']))->isNotEmpty())
    <div class="divider"></div>
    <div class="section-title">Skills</div>
    <table class="skills-table">
      @foreach ($skillRows as $row)
        <tr class="keep">
          @for ($i = 0; $i < 2; $i++)
            @php $skill = $row[$i] ?? null; @endphp
            <td>
              @if ($skill && !empty($skill['name']))
                @php
                  $name  = trim((string)($skill['name'] ?? ''));
                  $level = trim((string)($skill['level'] ?? ''));
                @endphp

                <div class="skill-line">
                  <span class="skill-name">{{ $name }}</span>

                  {{-- Show dots + level only if flag is true AND level is provided --}}
                  @if ($showExperienceLevel && $level !== '')
                    @php
                      $idx = array_search($level, $levels, true);
                      if ($idx === false) { $idx = 3; } // fallback if invalid
                      $active = max(1, min($idx + 1, 5));
                      $dots = str_repeat('●', $active) . str_repeat('○', 5 - $active);
                    @endphp
                    <span class="skill-dots">{{ $dots }}</span>
                    <span class="skill-level">{{ $levels[$idx] }}</span>
                  @endif
                </div>
              @endif
            </td>
          @endfor
        </tr>
      @endforeach
    </table>
  @endif


{{-- Additional Info --}}
@php
  // safe checks for whether any additional info exists
  $hasLanguages = false;
  $hasCerts = false;
  $hasAwards = false;
  $hasWebsites = false;
  $hasHobbies = false;

  if (!empty($languages) && is_array($languages)) {
    foreach ($languages as $l) {
      if (!empty(trim((string)($l['name'] ?? ''))) || !empty(trim((string)($l['proficiency'] ?? '')))) { $hasLanguages = true; break; }
    }
  }

  if (!empty($certifications) && is_array($certifications)) {
    foreach ($certifications as $c) {
      if (!empty(trim((string)($c['title'] ?? '')))) { $hasCerts = true; break; }
    }
  }

  if (!empty($awards) && is_array($awards)) {
    foreach ($awards as $a) {
      if (!empty(trim((string)($a['title'] ?? '')))) { $hasAwards = true; break; }
    }
  }

  if (!empty($websites) && is_array($websites)) {
    foreach ($websites as $w) {
      if (!empty(trim((string)($w['url'] ?? ''))) || !empty(trim((string)($w['label'] ?? '')))) { $hasWebsites = true; break; }
    }
  }

  if (!empty($hobbies) && is_array($hobbies)) {
    foreach ($hobbies as $h) {
      if (!empty(trim((string)($h['name'] ?? '')))) { $hasHobbies = true; break; }
    }
  }

  $showAdditional = $hasLanguages || $hasCerts || $hasAwards || $hasWebsites || $hasHobbies;

  // build lines (only when relevant)
  $languagesLine = '';
  if ($hasLanguages) {
    $parts = [];
    foreach ($languages as $l) {
      $name = trim((string)($l['name'] ?? ''));
      $prof = trim((string)($l['proficiency'] ?? ''));
      if ($name !== '') $parts[] = $name . ($prof !== '' ? " ({$prof})" : '');
    }
    $languagesLine = implode(', ', $parts);
  }

  $certsLine = '';
  if ($hasCerts) {
    $parts = [];
    foreach ($certifications as $c) {
      $title = trim((string)($c['title'] ?? ''));
      if ($title !== '') $parts[] = $title;
    }
    $certsLine = implode(', ', $parts);
  }

  $awardsLine = '';
  if ($hasAwards) {
    $parts = [];
    foreach ($awards as $a) {
      $title = trim((string)($a['title'] ?? ''));
      if ($title !== '') $parts[] = $title;
    }
    $awardsLine = implode(', ', $parts);
  }

  $sitesLine = '';
  if ($hasWebsites) {
    $parts = [];
    foreach ($websites as $w) {
      $label = trim((string)($w['label'] ?? 'Website'));
      $url = trim((string)($w['url'] ?? ''));
      if ($url !== '') $parts[] = ($label !== '' ? $label.': '.$url : $url);
      else if ($label !== '') $parts[] = $label;
    }
    $sitesLine = implode(', ', $parts);
  }

  $hobbiesLine = '';
  if ($hasHobbies) {
    $parts = [];
    foreach ($hobbies as $h) {
      $name = trim((string)($h['name'] ?? ''));
      if ($name !== '') $parts[] = $name;
    }
    $hobbiesLine = implode(', ', $parts);
  }
@endphp

  {{-- Additional Info --}}
  @if (!empty($languages) || !empty($certifications) || !empty($awards) || !empty($websites) || !empty($hobbies))
    <div class="divider"></div>
    <div class="section-title">Additional Information</div>
    <div class="keep">
      @if (!empty($languages))
        @php $languagesLine = implode(', ', array_map(fn($l)=> trim(($l['name'] ?? '').(($l['proficiency'] ?? '') ? " ({$l['proficiency']})" : '')), $languages)); @endphp
        <p><strong>Languages:</strong> {{ $languagesLine }}</p>
      @endif
      @if (!empty($certifications))
        @php $certsLine = implode(', ', array_map(fn($c)=>$c['title'] ?? '', $certifications)); @endphp
        <p><strong>Certifications:</strong> {{ $certsLine }}</p>
      @endif
      @if (!empty($awards))
        @php $awardsLine = implode(', ', array_map(fn($a)=>$a['title'] ?? '', $awards)); @endphp
        <p><strong>Awards/Activities:</strong> {{ $awardsLine }}</p>
      @endif
      @if (!empty($websites))
        @php $sitesLine = implode(', ', array_map(fn($w)=> trim(($w['label'] ?? 'Website').': '.($w['url'] ?? '')), $websites)); @endphp
        <p><strong>Websites:</strong> {{ $sitesLine }}</p>
      @endif
      @if (!empty($hobbies))
        @php $hobbiesLine = implode(', ', array_map(fn($h)=>$h['name'] ?? '', $hobbies)); @endphp
        <p><strong>Hobbies:</strong> {{ $hobbiesLine }}</p>
      @endif
    </div>
  @endif


  {{-- References --}}
  @if (!empty($references))
    <div class="divider"></div>
    <div class="section-title">References</div>
    @foreach ($references as $ref)
      @if (!empty($ref['name']) || !empty($ref['relationship']) || !empty($ref['contactInfo']))
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
      @endif
    @endforeach
  @endif


</div>
</body>
</html>
