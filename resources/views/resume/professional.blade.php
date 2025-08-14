<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Professional Resume</title>
<style>
  body {
    font-family: 'Inter', Arial, sans-serif;
    color: #111827;
    margin: 0;
    padding: 0;
    font-size: 14px;
    line-height: 1.4;
  }
  .container {
    width: 100%;
    max-width: 750px;
    margin: 0 auto;
    padding: 24px;
    background: white;
    box-sizing: border-box;
  }
  h1 {
    font-size: 20px;
    font-weight: 700;
    margin: 0;
  }
  .role {
    font-size: 12px;
    text-transform: uppercase;
    margin-top: 2px;
  }
  .contact {
    font-size: 12px;
    color: #374151;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 4px;
  }
  .divider {
    border-top: 2px solid #c2410c;
    margin: 8px 0;
  }
  .section-title {
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .job {
    display: flex;
    justify-content: space-between;
    font-weight: 500;
  }
  ul {
    margin: 2px 0 6px 20px;
    padding: 0;
  }
  ul li {
    margin-bottom: 2px;
  }

  /* Updated skills section for 2-column print compatibility */
  .skills-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 30px;
    margin: 8px 0;
  }
  .skill-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: calc(50% - 15px);
    box-sizing: border-box;
  }
  .skill-name {
    flex: 1;
    font-weight: 500;
  }
  .dots {
    letter-spacing: 3px;
    color: #c2410c;
    font-size: 14px;
    white-space: nowrap;
  }
  .skill-level {
    font-size: 11px;
    color: #6b7280;
    white-space: nowrap;
    font-style: italic;
  }

  .info p {
    margin: 2px 0;
  }
  .info strong {
    font-weight: 600;
  }
  .references {
    margin-top: 4px;
  }
  .ref-contact {
    font-size: 12px;
    color: #374151;
  }

  /* Print styles */
  @media print {
    body {
      margin: 0;
      padding: 0;
    }
    .container {
      width: 100%;
      max-width: none;
      padding: 16px;
    }
    h1, .section-title {
      page-break-after: avoid;
    }
    .skills-grid {
      display: flex !important;
      flex-wrap: wrap !important;
    }
    .skill-item {
      width: 50% !important;
    }
  }

  /* Responsive adjustments */
  @media (max-width: 600px) {
    .container {
      padding: 16px;
    }
    h1 {
      font-size: 18px;
    }
    .role, .contact, .section-title {
      font-size: 10px;
    }
  }
</style>
</head>
<body>
<div class="container">

  {{-- Header --}}
  <h1>{{ $resume['contact']['firstName'] ?? '' }} {{ $resume['contact']['lastName'] ?? '' }}</h1>
  <div class="role">{{ strtoupper($resume['contact']['desiredJobTitle'] ?? '') }}</div>
  <div class="contact">
    @if(!empty($resume['contact']['address']))
      <span>{{ $resume['contact']['address'] }}</span>
    @endif
    @if(!empty($resume['contact']['phone']))
      <span>┃</span><span>{{ $resume['contact']['phone'] }}</span>
    @endif
    @if(!empty($resume['contact']['email']))
      <span>┃</span><span>{{ $resume['contact']['email'] }}</span>
    @endif
    @if(!empty($resume['websites'][0]['url']))
      <span>┃</span><span>{{ $resume['websites'][0]['url'] }}</span>
    @endif
  </div>

  {{-- Summary --}}
  @if (!empty($resume['summary']))
    <div class="divider"></div>
    <div class="section-title">Summary</div>
    <p>{{ $resume['summary'] }}</p>
  @endif

  {{-- Experience --}}
  @if (!empty($resume['experiences']))
    <div class="divider"></div>
    <div class="section-title">Professional Experience</div>
    @foreach ($resume['experiences'] as $exp)
      <div class="job">
        <span>{{ $exp['jobTitle'] ?? '' }}, {{ $exp['company'] ?? '' }}</span>
        <span>{{ $exp['startDate'] ?? '' }} - {{ $exp['endDate'] ?? '' }}</span>
      </div>
      @if (!empty($exp['description']))
        <ul>
          @foreach (explode("\n", $exp['description']) as $point)
            @if (trim($point) !== '')
              <li>{{ $point }}</li>
            @endif
          @endforeach
        </ul>
      @endif
    @endforeach
  @endif

  {{-- Education --}}
  @if (!empty($resume['education']))
    <div class="divider"></div>
    <div class="section-title">Education</div>
    @foreach ($resume['education'] as $edu)
      <div class="job">
        <span>{{ $edu['degree'] ?? '' }}, {{ $edu['school'] ?? '' }}</span>
        <span>{{ $edu['startDate'] ?? '' }} - {{ $edu['endDate'] ?? '' }}</span>
      </div>
      @if (!empty($edu['description']))
        <p>{{ $edu['description'] }}</p>
      @endif
    @endforeach
  @endif

  {{-- Skills --}}
  @if (!empty($resume['skills']))
    <div class="divider"></div>
    <div class="section-title">Skills</div>
    <div class="skills-grid">
      @foreach ($resume['skills'] as $skill)
        @php
          $levels = ['Novice', 'Beginner', 'Skillful', 'Experienced', 'Expert'];
          $index = array_search($skill['level'] ?? 'Novice', $levels);
          if ($index === false) {
              $activeDots = 1;
              $levelName = 'Novice';
          } else {
              $activeDots = $index + 1;
              $levelName = $levels[$index];
          }
          if ($activeDots < 1) $activeDots = 1;
          if ($activeDots > 5) $activeDots = 5;
          $dots = str_repeat('•', $activeDots) . str_repeat('◦', 5 - $activeDots);
        @endphp
        <div class="skill-item">
          <span class="skill-name">{{ $skill['name'] }}</span>
          <span class="dots">{{ $dots }}</span>
          <span class="skill-level">{{ $levelName }}</span>
        </div>
      @endforeach
    </div>
  @endif

  {{-- Additional Information --}}
  @if (!empty($resume['languages']) || !empty($resume['certifications']) || !empty($resume['awards']) || !empty($resume['hobbies']) || !empty($resume['websites']))
    <div class="divider"></div>
    <div class="section-title">Additional Information</div>
    <div class="info">
      @if (!empty($resume['languages']))
        <p><strong>Languages:</strong> {{ collect($resume['languages'])->map(fn($l) => $l['name'].' ('.$l['proficiency'].')')->join(', ') }}</p>
      @endif
      @if (!empty($resume['certifications']))
        <p><strong>Certifications:</strong> {{ collect($resume['certifications'])->pluck('title')->join(', ') }}</p>
      @endif
      @if (!empty($resume['awards']))
        <p><strong>Awards/Activities:</strong> {{ collect($resume['awards'])->pluck('title')->join(', ') }}</p>
      @endif
      @if (!empty($resume['hobbies']))
        <p><strong>Hobbies:</strong> {{ collect($resume['hobbies'])->pluck('name')->join(', ') }}</p>
      @endif
      @if (!empty($resume['websites']))
        <p><strong>Websites:</strong> {{ collect($resume['websites'])->map(fn($w) => $w['label'].': '.$w['url'])->join(', ') }}</p>
      @endif
    </div>
  @endif

  {{-- References --}}
  @if (!empty($resume['references']))
    <div class="divider"></div>
    <div class="section-title">References</div>
    <div class="references">
      @foreach ($resume['references'] as $ref)
        <div class="job">
          <span>{{ $ref['name'] }}</span>
          @if (!empty($ref['relationship']))
            <span>({{ $ref['relationship'] }})</span>
          @endif
        </div>
        @if (!empty($ref['contactInfo']))
          <div class="ref-contact">{{ $ref['contactInfo'] }}</div>
        @endif
      @endforeach
    </div>
  @endif

</div>
</body>
</html>
