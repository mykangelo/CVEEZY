<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Professional Resume</title>
<style>
  /* DOMPDF safe defaults */
  @page { margin: 18mm 16mm; }
  body {
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
    color: #1f2937;     
    font-size: 14px;    
    line-height: 1.5;
    margin: 0;
    padding: 16px;      
  }
  .container { 
    max-width: 768px;  
    margin: 0 auto;     
    color: #1f2937;        
  }

  /* Header */
  h1 { 
    font-size: 30px;    
    font-weight: 400;    
    line-height: 1.25;     
    margin: 0;
  }
  .role { 
    font-size: 18px;     
    margin: 0;
  }
  .contact { 
    font-size: 14px;     
    color: #4b5563;       
    margin-top: 4px;      
  }

  /* Section spacing */
  .section {
    margin-top: 16px; 
  }

  /* Divider */
  .divider { 
    height: 1px;        
    background-color: #c2410c; 
    opacity: 0.7;        
    width: 100%;          
    margin-bottom: 4px;  
  }

  /* Section Titles */
  .section-title {
    font-size: 18px;    
    font-weight: 600;   
    text-transform: uppercase;
    margin: 0;
    page-break-after: avoid;
  }

  /* Experience/Education items */
  .item {
    margin-top: 8px;      
  }

  /* Tables for left/right alignment */
  .row-table { 
    width: 100%; 
    border-collapse: collapse; 
  }
  .row-table td { 
    vertical-align: top; 
  }
  .cell-left { 
    font-size: 14px;    
    font-weight: 600;   
  }
  .cell-right { 
    text-align: right; 
    font-size: 14px;     
    font-weight: 600;   
  }

  /* Employer/Location text */
  .employer-text {
    font-size: 12px;      
    color: #4b5563;        
    font-style: italic;
    margin-top: 2px;       
    margin-bottom: 0;
  }

  /* Lists */
  ul { 
    list-style-type: disc;
    padding-left: 16px;   
    margin: 4px 0 0 0;   
    font-size: 14px;      
  }
  li { 
    margin-bottom: 2px;   
  }

  /* Skills */
  .skills-table { 
    width: 100%; 
    border-collapse: collapse; 
    font-size: 14px; 
  }
  .skills-table td { 
    width: 50%; 
    vertical-align: top; 
    padding: 2px 32px 2px 0; 
  }
  .skill-line { 
    display: flex;
    align-items: center;
    margin-bottom: 8px;   
  }
  .skill-name { 
    width: 128px;        
    display: inline-block;
  }
  .skill-dots { 
    margin-left: 4px;     
    color: #374151;       
    letter-spacing: 0.1em; 
    font-family: DejaVu Sans, sans-serif;
  }
  .skill-dots.muted {
    color: #d1d5db;    
  }

  /* Summary paragraph */
  .summary-text {
    font-size: 14px;      
    margin-top: 4px;      
    line-height: 1.625;    
    margin-bottom: 0;
  }

  /* Additional Information */
  .additional-info p {
    font-size: 14px;      
    margin-top: 4px;      
    margin-bottom: 0;
  }
  .additional-info strong {
    font-weight: 700;     
  }

  /* Muted placeholders */
  .muted { 
    color: #9ca3af;       
    font-style: italic; 
  }

  .keep { page-break-inside: avoid; }

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

    // Contact line - matching Professional.tsx format
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

  {{-- Header - exact Professional.tsx layout --}}
  <div>
    <h1>{{ trim(($contact['firstName'] ?? '').' '.($contact['lastName'] ?? '')) ?: 'YOUR NAME' }}</h1>
    <div class="role">{{ ($contact['desiredJobTitle'] ?? '') ?: 'JOB TITLE' }}</div>
    <div class="contact">
      {{ !empty($contactParts) ? implode(' | ', $contactParts) : '123 Anywhere St, Any City | (123) 456-7890 | email@example.com' }}
    </div>
  </div>

  {{-- Summary --}}
  <div class="section">
    <div class="divider"></div>
    <div class="section-title">Summary</div>
    <p class="summary-text">
      {{ trim($summary) !== '' ? $summary
        : 'Use this section to give recruiters a quick glimpse of your professional profile. In just 3–4 lines, highlight your background, education and main skills.' }}
    </p>
  </div>

  {{-- Experience --}}
  <div class="section">
    <div class="divider"></div>
    <div class="section-title">Professional Experience</div>
    @foreach ($experiences as $exp)
      <div class="item keep">
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
          <p class="employer-text">{{ $exp['location'] }}</p>
        @else
          <p class="employer-text muted">Employer</p>
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
  </div>

  {{-- Projects --}}
  @if (!empty($customSections))
    <div class="section">
      <div class="divider"></div>
      <div class="section-title">Projects</div>
      @foreach ($customSections as $section)
        <div class="item keep">
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
    </div>
  @endif

  {{-- Education --}}
  <div class="section">
    <div class="divider"></div>
    <div class="section-title">Education</div>
    @foreach ($education as $edu)
      <div class="item keep">
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
          <p class="employer-text">{{ $edu['location'] }}</p>
        @endif
        @if (!empty($edu['description']))
          <p class="summary-text">{{ $edu['description'] }}</p>
        @endif
      </div>
    @endforeach
  </div>

  {{-- Skills --}}
  <div class="section">
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
                  <span class="skill-name{{ $muted ? ' muted' : '' }}">{{ $name !== '' ? $name : 'Skill '.($i + 1 + array_search($row, $skillRows) * 2) }}</span>
                  <span class="skill-dots{{ $muted ? ' muted' : '' }}">{{ $dots }}</span>
                </div>
              @endif
            </td>
          @endfor
        </tr>
      @endforeach
    </table>
  </div>

  {{-- Additional Info --}}
  <div class="section">
    <div class="divider"></div>
    <div class="section-title">Additional Information</div>
    <div class="additional-info keep">
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
  </div>

  {{-- References --}}
  @if (!empty($references))
    <div class="section">
      <div class="divider"></div>
      <div class="section-title">References</div>
      @foreach ($references as $ref)
        <div class="item keep">
          <table class="row-table">
            <tr>
              <td class="cell-left">{{ $ref['name'] ?? '' }}</td>
              <td class="cell-right">@if (!empty($ref['relationship'])) ({{ $ref['relationship'] }}) @endif</td>
            </tr>
          </table>
          @if (!empty($ref['contactInfo']))
            <p class="employer-text">{{ $ref['contactInfo'] }}</p>
          @endif
        </div>
      @endforeach
    </div>
  @endif

</div>
</body>
</html>