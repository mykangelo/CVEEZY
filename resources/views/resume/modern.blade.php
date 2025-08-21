<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Resume</title>
<style>

/* DOMPDF Font Reset - Sans Serif Only */
* {
  font-family: sans-serif !important;
  font-style: normal !important;
}

/* Base */
html, body {
  margin: 0;
  padding: 0;
  background: #fff;
  font-family: sans-serif !important;
  color: #374151;
  font-size: 15px;
  line-height: 1.4;
}

/* A4 page */
.paper {
  width: 210mm;
  max-width: 210mm;
  margin: 0 auto;
  background: #fff;
  display: block;
  overflow: visible;
}

/* Two-column layout (table layout for PDF stability) */
.container {
  display: table;
  table-layout: fixed;
  width: 100%;
  border-collapse: collapse;
}
.left-column {
  display: table-cell;
  width: 60%;
  padding: 25px 30px 25px 30px;
  vertical-align: top;
  background: #fff;
  box-sizing: border-box;
  border-right: 1px solid #e5e7eb;
}
.right-column {
  display: table-cell;
  width: 40%;
  padding: 25px 20px 25px 20px;
  vertical-align: top;
  background: #fff;
  box-sizing: border-box;
}

/* Prevent section splits */
.section,
.timeline-item,
.skill-item,
.reference-item,
.contact-item,
.hobby-item {
  page-break-inside: avoid;
  break-inside: avoid;
}

/* Header */
.first-name, .last-name {
  font-family: sans-serif !important;
  font-size: 42px;
  font-weight: normal;
  color: #1f2937;
  margin: 0;
  letter-spacing: .2em;
  text-transform: uppercase;
  line-height: 0.9;
  display: block;
}

.job-title {
  font-family: sans-serif !important;
  font-size: 24px;
  font-weight: 400;
  color: #6b7280;
  margin: 8px 0 0 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* Section titles */
.section-title {
  font-family: sans-serif !important;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding-bottom: 6px;
  border-bottom: 1px solid #e5e7eb;
  page-break-after: avoid;
}

/* Sections */
.section {
  margin-bottom: 20px;
}
.section:last-child {
  margin-bottom: 0;
}
.right-column .section-title { 
  border-bottom: 1px solid #e5e7eb; 
  margin-bottom: 10px; 
  font-size: 14px;
  font-family: sans-serif !important;
  font-weight: 600;
}

/* Paragraphs */
.profile-text { 
  font-family: sans-serif !important;
  font-size: 15px; 
  font-weight: 400; 
  color: #1f2937; 
  line-height: 1.5; 
  text-align: justify; 
  margin: 0;
}

/* TIMELINE */
.timeline { 
  margin-left: 0;
  border-left: 2px solid #374151;
  padding-left: 15px;
}
.timeline-item {
  position: relative;
  margin-bottom: 18px;
  padding-left: 0;
}
.timeline-item:last-child { 
  margin-bottom: 0; 
}

/* Timeline dots */
.timeline-item:before {
  content: "";
  position: absolute;
  left: -20px;
  top: 5px;
  width: 6px;
  height: 6px;
  background: #374151;
  border: 1px solid #fff;
}

.timeline-dates { 
  font-family: sans-serif !important;
  font-size: 12px; 
  font-weight: 500; 
  color: #6b7280; 
  text-transform: uppercase; 
  margin-bottom: 3px; 
}
.timeline-title { 
  font-family: sans-serif !important;
  font-size: 15px; 
  font-weight: 500; 
  color: #1f2937; 
  margin: 0 0 4px; 
}
.timeline-description { 
  font-family: sans-serif !important;
  font-size: 14px; 
  font-weight: 500; 
  color: #1f2937; 
  line-height: 1.4; 
}

.timeline-location { 
  font-family: sans-serif !important;
  font-size: 13px; 
  font-weight: 300; 
  text-transform: uppercase; 
  letter-spacing: .04em; 
  color: #6b7280; 
  margin-bottom: 2px; 
}

/* Timeline employer styling */
.timeline-employer {
  font-family: sans-serif !important;
  font-style: italic !important;
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}

/* Bullet points */
.bullet-point, .list-item, .hobby-item {
  font-family: sans-serif !important;
  position: relative;
  padding-left: 12px;
  margin: 0 0 4px;
  color: #1f2937;
  font-size: 14px;
  font-weight: 400;
}

.bullet-point:before, .list-item:before, .hobby-item:before {
  content: "";
  position: absolute;
  left: 0;
  top: .5em;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #6b7280;
}

/* Skills container */
.skills-container {
  font-size: 0; /* remove inline-block whitespace */
}

.skill-item {
  display: inline-block;
  width: 48%; /* two items per row */
  vertical-align: top;
  margin-bottom: 8px;
  font-size: 14px; /* reset font size */
  box-sizing: border-box;
}

.skill-name {
  font-family: sans-serif !important;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin: 0 0 3px;
}

.skill-level {
  font-size: 0; /* removes gaps between bullets */
  white-space: nowrap; /* keep bullets in one line */
}

.skill-bullet {
  display: inline-block;
  width: 5px;
  height: 5px;
  margin-right: 2px;
  border-radius: 50%;
  border: 1px solid #374151;
}

.skill-bullet-filled {
  background: #374151;
}

/* Languages */
.language-item { 
  font-family: sans-serif !important;
  margin-bottom: 6px; 
  font-size: 14px; 
  font-weight: normal;
  color: #1f2937; 
}
.language-name { 
  font-family: sans-serif !important;
  font-weight: 500; 
}
.language-proficiency { 
  font-family: sans-serif !important;
  font-size: 13px; 
  font-weight: 300;
  color: #1f2937; 
}

/* Right-column education (no timeline) */
.right-column .education-item {
  position: relative;
  padding-left: 12px;
  margin-bottom: 15px;
}

.right-column .education-item:before {
  content: "";
  position: absolute;
  left: 0;
  top: 5px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #6b7280;
}

/* Right-column timeline */
.right-column .timeline-item { 
  padding-left: 18px; 
  margin-bottom: 15px; 
}
.right-column .timeline-item:before { 
  width: 5px; 
  height: 5px; 
  left: 0; 
  top: 5px; 
  background: #6b7280;
}
.right-column .timeline-item:not(:last-child)::after {
  content: "";
  position: absolute;
  left: 1.5px;
  top: 10px;
  height: calc(100% - 0px);
  width: 2px;
  background: #d1d5db;
}
.right-column .timeline-dates { 
  font-family: sans-serif !important;
  font-size: 12px; 
  font-weight: 500; 
}
.right-column .timeline-title { 
  font-family: sans-serif !important;
  font-size: 14px; 
  font-weight: 500; 
  line-height: 1.3; 
}
.right-column .timeline-description { 
  font-family: sans-serif !important;
  font-size: 13px; 
  font-weight: 400; 
  line-height: 1.35; 
}

/* References */
.reference-item { margin-bottom: 12px; }
.reference-name { 
  font-family: sans-serif !important;
  font-size: 14px; 
  color: #1f2937; 
  font-weight: 500; 
}
.reference-relationship, .reference-contact { 
  font-family: sans-serif !important;
  font-size: 13px; 
  font-weight: 300;
  color: #6b7280; 
  margin: 1px 0;
}

/* Contact icons */
.contact-section { margin-bottom: 18px; }

.contact-item {
  display: table;
  width: 100%;
  font-family: sans-serif !important;
  font-size: 13px;
  font-weight: 300;
  color: #1f2937;
  line-height: 1.3;
  margin-bottom: 8px;
}

.contact-icon {
  display: table-cell;
  width: 20px;
  height: 16px;
  vertical-align: middle;
  position: relative;
}

.contact-item span:last-child {
  display: table-cell;
  vertical-align: middle;
  padding-left: 8px;
  font-family: sans-serif !important;
  font-weight: 300;
  word-break: break-word;
}

/* Phone icon */
.icon-phone::before {
  content: "";
  position: absolute;
  width: 8px;
  height: 12px;
  background: #1f2937;
  border-radius: 2px;
  top: 2px;
  left: 4px;
}
.icon-phone::after {
  content: "";
  position: absolute;
  width: 4px;
  height: 1px;
  background: #fff;
  border-radius: 0.5px;
  top: 4px;
  left: 6px;
}

/* Email icon */
.icon-email::before {
  content: "";
  position: absolute;
  width: 12px;
  height: 8px;
  border: 1px solid #1f2937;
  border-radius: 1px;
  background: #fff;
  top: 4px;
  left: 2px;
}
.icon-email::after {
  content: "";
  position: absolute;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 3px solid #1f2937;
  top: 5px;
  left: 4px;
  transform: translateX(-50%);
}

/* Location icon */
.icon-location::before {
  content: "";
  position: absolute;
  width: 9px;
  height: 9px;
  background: #1f2937;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  top: 2px;
  left: 3.5px;
  box-shadow: 
    inset 2px 2px 0 #fff,
    0 2px 3px rgba(0, 0, 0, 0.1);
}
.icon-location::after {
  content: "";
  position: absolute;
  width: 3px;
  height: 3px;
  background: #fff;
  border-radius: 50%;
  top: 4.5px;
  left: 6.5px;
  box-shadow: 0 0 0 1px rgba(31, 41, 55, 0.3);
}

/* Globe/Link icon */
.icon-globe::before {
  content: "";
  position: absolute;
  width: 5px;
  height: 8px;
  border: 1px solid #1f2937;
  border-radius: 3px;
  background: transparent;
  top: 2px;
  left: 2px;
  transform: rotate(-25deg);
}
.icon-globe::after {
  content: "";
  position: absolute;
  width: 5px;
  height: 8px;
  border: 1px solid #1f2937;
  border-radius: 3px;
  background: transparent;
  top: 6px;
  left: 9px;
  transform: rotate(-25deg);
}

/* Screen optimizations */
@media screen {
  .paper {
    box-shadow: 0 0 20px rgba(0,0,0,0.1);
    margin: 20px auto;
  }
}

</style>
</head>
<body>
<div class="paper">
  <div class="container">
    <div class="left-column">
      <div class="header" style="margin-bottom:16px;">
        <div class="name-container">
          <h1 class="first-name">{{ strtoupper($resume['contact']['firstName']) }}</h1>
          <h1 class="last-name">{{ strtoupper($resume['contact']['lastName']) }}</h1>
        </div>
        <h2 class="job-title">{{ strtoupper($resume['contact']['desiredJobTitle']) }}</h2>
      </div>

      {{-- Profile --}}
      @if (!empty($resume['summary']))
        <div class="section">
          <h3 class="section-title">Profile</h3>
          <p class="profile-text">{{ $resume['summary'] }}</p>
        </div>
      @endif

     {{-- Work Experience --}}
@if (!empty($resume['experiences']) && count($resume['experiences']) > 0)
  <div class="section">
    <h3 class="section-title">Work Experience</h3>
    <div class="timeline">
      @foreach ($resume['experiences'] as $exp)
        @if (!empty($exp['jobTitle']) || !empty($exp['company']))
          
        <div class="timeline-item">
            <div class="timeline-dates">
              @if(!empty($exp['startDate'])){{ $exp['startDate'] }}@endif
              @if(!empty($exp['endDate']))
                @if(!empty($exp['startDate'])) – @endif {{ $exp['endDate'] }}
              @elseif(!empty($exp['startDate'])) – Present
              @endif
            </div>
            <h4 class="timeline-title">
              {{ trim(($exp['jobTitle'] ?? '').(!empty($exp['jobTitle']) && !empty($exp['company']) ? ' at ' : '').($exp['company'] ?? '')) }}
            </h4>
            @if (!empty($exp['employer']))
              <div class="timeline-employer" style="font-style: italic;">{{ $exp['employer'] }}</div>
            @endif
            @if (!empty($exp['location']))
              <div class="timeline-location">{{ $exp['location'] }}</div>
            @endif

            @if (!empty($exp['description']))
              <div class="timeline-description">
                @php $lines = preg_split('/\r\n|\r|\n/', $exp['description']); @endphp
                @foreach ($lines as $line)
                  @php $t = trim($line); @endphp
                  @if ($t !== '')
                    @if (preg_match('/^([•\-–\*])\s*/u', $t))
                      <div class="bullet-point">{{ preg_replace('/^([•\-–\*])\s*/u', '', $t) }}</div>
                    @else
                      <div style="margin-bottom:3px">{{ $t }}</div>
                    @endif
                  @endif
                @endforeach
              </div>
            @endif
          </div>
        @endif
      @endforeach
    </div>
  </div>
@endif

      {{-- Certifications --}}
      @if (!empty($resume['certifications']))
        <div class="section">
          <h3 class="section-title">Certifications</h3>
          @foreach ($resume['certifications'] as $cert)
            @if (!empty($cert['title'])) <div class="list-item">{{ $cert['title'] }}</div> @endif
          @endforeach
        </div>
      @endif

      {{-- Achievements --}}
      @if (!empty($resume['awards']))
        <div class="section">
          <h3 class="section-title">Achievements</h3>
          @foreach ($resume['awards'] as $award)
            @if (!empty($award['title'])) <div class="list-item">{{ $award['title'] }}</div> @endif
          @endforeach
        </div>
      @endif
    </div>

    <div class="right-column">
      <div class="contact-section">
        @if (!empty($resume['contact']['phone']))
          <div class="contact-item">
            <span class="contact-icon icon-phone"></span>
            <span>{{ $resume['contact']['phone'] }}</span>
          </div>
        @endif

        @if (!empty($resume['contact']['email']))
          <div class="contact-item">
            <span class="contact-icon icon-email"></span>
            <span>{{ $resume['contact']['email'] }}</span>
          </div>
        @endif

        @php
          $addressParts = array_filter([
            $resume['contact']['address'] ?? '',
            $resume['contact']['city'] ?? '',
            $resume['contact']['state'] ?? '',
            $resume['contact']['postalCode'] ?? '',
            $resume['contact']['country'] ?? ''
          ]);
        @endphp
        @if (!empty($addressParts))
          <div class="contact-item">
            <span class="contact-icon icon-location"></span>
            <span>{{ implode(', ', $addressParts) }}</span>
          </div>
        @endif

        @if (!empty($resume['websites']))
          @foreach ($resume['websites'] as $site)
            @if (!empty($site['url']))
              <div class="contact-item">
                <span class="contact-icon icon-globe"></span>
                <span><strong>{{ $site['label'] ?? 'Website' }}:</strong> {{ $site['url'] }}</span>
              </div>
            @endif
          @endforeach
        @endif
      </div>

      {{-- Education --}}
      @if (!empty($resume['education']))
        <div class="section">
          <h3 class="section-title">Education</h3>
          @foreach ($resume['education'] as $edu)
            @if (!empty($edu['degree']) || !empty($edu['school']))
              <div class="education-item">
                <div class="timeline-dates">
                  @if(!empty($edu['startDate'])){{ $edu['startDate'] }}@endif
                  @if(!empty($edu['endDate']))@if(!empty($edu['startDate'])) – @endif{{ $edu['endDate'] }}@endif
                </div>
                @if (!empty($edu['school']))
                  <div class="timeline-location">
                    {{ $edu['school'] }}@if(!empty($edu['location'])) — {{ $edu['location'] }}@endif
                  </div>
                @endif
                @if (!empty($edu['degree'])) <h4 class="timeline-title">{{ $edu['degree'] }}</h4> @endif

                @if (!empty($edu['description']))
                  <div class="timeline-description">
                    @php $lines = preg_split('/\r\n|\r|\n/', $edu['description']); @endphp
                    @foreach ($lines as $line)
                      @php $t = trim($line); @endphp
                      @if ($t !== '')
                        @if (preg_match('/^([•\-–\*])\s*/u', $t))
                          <div class="bullet-point">{{ preg_replace('/^([•\-–\*])\s*/u', '', $t) }}</div>
                        @else
                          <div style="margin-bottom:3px">{{ $t }}</div>
                        @endif
                      @endif
                    @endforeach
                  </div>
                @endif
              </div>
            @endif
          @endforeach
        </div>
      @endif

      {{-- Skills --}}
      @if (!empty($resume['skills']))
        <div class="section">
          <h3 class="section-title">Skills</h3>
          <div class="skills-container">
            @foreach ($resume['skills'] as $skill)
              @if (!empty($skill['name']))
                <div class="skill-item">
                  <div class="skill-name">{{ $skill['name'] }}</div>
                  @if (!empty($skill['level']) && ($resume['showExperienceLevel'] ?? true))
                    <div class="skill-level">
                      @php
                        $level = $skill['level'] ?? 'Novice';
                        $bulletCount = match($level){
                          'Novice'=>1,'Beginner'=>2,'Skillful'=>3,'Experienced'=>4,'Expert'=>5, default=>2
                        };
                      @endphp
                      @for ($i=0; $i<5; $i++)
                        <span class="skill-bullet {{ $i < $bulletCount ? 'skill-bullet-filled' : '' }}"></span>
                      @endfor
                    </div>
                  @endif
                </div>
              @endif
            @endforeach
          </div>
        </div>
      @endif

      {{-- Languages --}}
      @if (!empty($resume['languages']))
        <div class="section">
          <h3 class="section-title">Languages</h3>
          @foreach ($resume['languages'] as $lang)
            @if (!empty($lang['name']))
              <div class="language-item">
                <span class="language-name">{{ $lang['name'] }}</span>
                @if (!empty($lang['proficiency']))
                  <span class="language-proficiency"> ({{ $lang['proficiency'] }})</span>
                @endif
              </div>
            @endif
          @endforeach
        </div>
      @endif

      {{-- References --}}
      @if (!empty($resume['references']))
        <div class="section">
          <h3 class="section-title">References</h3>
          @foreach ($resume['references'] as $ref)
            @if (!empty($ref['name']))
              <div class="reference-item">
                <div class="reference-name">{{ $ref['name'] }}</div>
                @if (!empty($ref['relationship'])) <div class="reference-relationship">{{ $ref['relationship'] }}</div> @endif
                @if (!empty($ref['contactInfo'])) <div class="reference-contact">{{ $ref['contactInfo'] }}</div> @endif
              </div>
            @endif
          @endforeach
        </div>
      @endif

      {{-- Hobbies --}}
      @if (!empty($resume['hobbies']))
        <div class="section">
          <h3 class="section-title">Hobbies</h3>
          @foreach ($resume['hobbies'] as $hobby)
            @if (!empty($hobby['name'])) <div class="hobby-item">{{ $hobby['name'] }}</div> @endif
          @endforeach
        </div>
      @endif

      {{-- Custom sections --}}
      @if (!empty($resume['customSections']))
        @foreach ($resume['customSections'] as $custom)
          @if (!empty($custom['title']) || !empty($custom['content']))
            <div class="section">
              @if (!empty($custom['title'])) <h3 class="section-title">{{ $custom['title'] }}</h3> @endif
              @if (!empty($custom['content'])) <div class="profile-text" style="font-size:12px">{{ $custom['content'] }}</div> @endif
            </div>
          @endif
        @endforeach
      @endif
    </div>
  </div>
</div>
</body>
</html>