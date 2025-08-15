<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Resume</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 16px;
            background: white;
            color: #1f2937;
            line-height: 1.2;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
        }
        .header {
            margin-bottom: 16px;
        }
        .name {
            font-size: 24px;
            font-weight: bold;
            color: #000;
            margin-bottom: 4px;
            letter-spacing: 0.025em;
            text-transform: uppercase;
        }
        .job-title {
            font-size: 14px;
            font-weight: bold;
            color: #000;
            margin-bottom: 6px;
            text-transform: uppercase;
        }
        .contact-info {
            font-size: 11px;
            color: #374151;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 0;
        }
        .contact-info span, .contact-info a {
            white-space: nowrap;
        }
        .contact-sep {
            margin: 0;
            color: #6b7280;
        }
        .section {
            margin-bottom: 14px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            page-break-inside: avoid;
        }
        .section-header {
            background-color: #e5e7eb;
            padding: 6px 12px;
            margin-bottom: 8px;
            border-radius: 9999px;
            page-break-after: avoid;
        }
        .section-title {
            font-size: 13px;
            font-weight: bold;
            font-style: italic;
            color: #1f2937;
            margin: 0;
        
        }
        .summary-text {
            font-size: 12px;
            color: #1f2937;
            margin: 0;
            line-height: 1.4;
            word-break: break-word;
            overflow-wrap: anywhere;
            text-align: justify;
            text-justify: inter-word;
            -webkit-hyphens: auto;
            -ms-hyphens: auto;
            hyphens: auto;
            text-align-last: left;
        }
        
        .experience-item, .education-item {
            margin-bottom: 12px;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        .experience-header, .education-header {
            display: grid;  
            grid-template-columns: 1fr 1fr;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 4px;
        }
        .experience-title, .education-title {
            font-weight: 700;
            color: #000;
            margin-right: 12px;
            font-size: 12px;
            min-width: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            display: flex;
            align-items: center;
        }
        .dates {
            font-size: 12px;
            color: #000;
            justify-self: end;
            font-weight: 700; /* match title weight */
            margin-left: 16px; /* spacing when inline with title */
            padding-right: 8px;
        }
        .company, .school, .location {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 4px;
        }
        .description {
            font-size: 12px;
            color: #1f2937;
            margin-top: 4px;
        }
        .bullet-point {
            display: flex;
            align-items: flex-start;
            gap: 4px;
            margin-bottom: 4px;
        }
        .bullet {
            color: #1f2937;
            font-weight: bold;
            margin-top: 0;
            flex-shrink: 0;
        }
        .bullet-text {
            flex: 1;
            min-width: 0;
            word-break: break-word;
            line-height: 1.3;
        }
        .additional-info {
            margin-top: 0;
        }
        .info-item {
            margin-bottom: 6px;
        }
        .info-label {
            font-weight: 600;
            font-size: 12px;
            color: #1f2937;
        }
        .info-content {
            font-size: 12px;
            color: #1f2937;
        }
        .references-item {
            margin-bottom: 4px;
        }
        .reference-name {
            font-weight: 600;
            font-size: 12px;
            color: #1f2937;
        }
        .custom-section {
            margin-bottom: 12px;
        }
        .custom-section-content {
            font-size: 12px;
            color: #1f2937;
            word-break: break-word;
            white-space: pre-line;
        }
		/* Skills layout: keep name and dots on one line */
		.skills-grid {
			display: grid;
			grid-template-columns: repeat(3, minmax(0, 1fr));
			column-gap: 24px;
			row-gap: 6px;
			align-items: center;
		}
		.skill-row {
			display: inline-flex;
			align-items: center;
			gap: 6px;
			white-space: nowrap;
			break-inside: avoid;
		}
		.skill-dots {
			display: inline-block;
			white-space: nowrap;
			line-height: 1;
		}
		.skill-name {
			display: inline-block;
			margin-right: 6px;
			font-weight: 600;
			font-size: 11px;
			white-space: nowrap;
		}
		.skill-dot {
			display: inline-block;
			width: 5px;
			height: 5px;
			border-radius: 50%;
			margin-right: 2px;
			text-align: center;
		}
		/* Table-based skills layout to guarantee exactly 3 columns per row across browsers and PDF renderers */
		.skills-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
		.skills-table td { width: 33.333%; padding: 2px 16px 2px 0; vertical-align: middle; white-space: nowrap; }
        
        @media print {
            html, body {
                width: 100%;
                height: 100%;
                padding: 0;
                margin: 0;
                font-size: 9px;
            }
            .container {
                max-width: none;
                width: 100%;
                margin: 0;
            }
            .section, .custom-section {
                page-break-inside: avoid;
            }
            .header {
                margin-bottom: 10px;
            }
            .section {
                margin-bottom: 8px;
            }
            .experience-item, .education-item {
                margin-bottom: 8px;
            }
            .name {
                font-size: 22px;
                margin-bottom: 3px;
            }
            .job-title {
                font-size: 13px;
                margin-bottom: 5px;
            }
            .contact-info {
                font-size: 10px;
                gap: 6px;
            }
            .section-header {
                padding: 3px 8px;
                margin-bottom: 5px;
            }
            .section-title {
                font-size: 12px;
            }
            .summary-text, .experience-title, .education-title, .dates, .company, .school, .location, .description, .bullet-text, .info-label, .info-content, .reference-name, .custom-section-content {
                font-size: 10px;
            }
          
        }

        /* Enhanced page break and overflow prevention */
        .info-item, .references-item, .custom-section, .skill-row {
            page-break-inside: avoid;
            break-inside: avoid;
        }
        
        /* Ensure proper page breaks for all elements */
        h1, h2, .section-title, .section-header {
            page-break-after: avoid;
            break-after: avoid;
        }
        
        /* Prevent text overflow and ensure proper wrapping */
        .info-content, .reference-name, .custom-section-content, .bullet-text {
            word-wrap: break-word;
            overflow-wrap: break-word;
            hyphens: auto;
        }
        
        /* Force page breaks when content exceeds page height */
        .section:last-child {
            page-break-inside: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1 class="name">{{ strtoupper($resume['contact']['firstName'] ?? '') }} {{ strtoupper($resume['contact']['lastName'] ?? '') }}</h1>
            <p class="job-title">{{ $resume['contact']['desiredJobTitle'] ?? '' }}</p>
            <div class="contact-info">
                @php
                    $contactParts = [];
                    // Address
                    if (!empty($resume['contact']['address']) || !empty($resume['contact']['city']) || !empty($resume['contact']['country']) || !empty($resume['contact']['postCode'])) {
                        $contactParts[] = collect([
                            $resume['contact']['address'] ?? '',
                            $resume['contact']['city'] ?? '',
                            $resume['contact']['country'] ?? '',
                            $resume['contact']['postCode'] ?? ''
                        ])->filter()->implode(', ');
                    }
                    // Phone
                    if (!empty($resume['contact']['phone'])) $contactParts[] = $resume['contact']['phone'];
                    // Email
                    if (!empty($resume['contact']['email'])) $contactParts[] = $resume['contact']['email'];
                    // Websites
                    if (!empty($resume['websites']) && is_array($resume['websites'])) {
                        foreach ($resume['websites'] as $site) {
                            if (!empty($site['url'])) $contactParts[] = '<a href="' . e($site['url']) . '" target="_blank" class="underline text-blue-700 hover:text-blue-900">' . e($site['label'] ?? $site['url']) . '</a>';
                        }
                    }
                    // Socials
                    if (!empty($resume['contact']['socials']) && is_array($resume['contact']['socials'])) {
                        foreach ($resume['contact']['socials'] as $social) {
                            if (!empty($social['url'])) $contactParts[] = '<a href="' . e($social['url']) . '" target="_blank" class="underline text-blue-700 hover:text-blue-900">' . e($social['label'] ?? $social['url']) . '</a>';
                        }
                    }
                @endphp
                {!! implode('<span class="contact-sep">|</span>', $contactParts) !!}
            </div>
        </div>

        <!-- Summary -->
        @if(!empty($resume['summary']))
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">SUMMARY</h2>
                </div>
                <p class="summary-text">{{ $resume['summary'] }}</p>
            </div>
        @endif

				{{-- Skills --}}
				@if (!empty($resume['skills']))
				<div class="section">
					<div class="section-header">
						<h2 class="section-title">TECHNICAL SKILLS</h2>
					</div>
					<table class="skills-table">
						<tbody>
							@php $skillsList = $resume['skills']; @endphp
							@foreach(array_chunk($skillsList, 3) as $skillsRow)
								<tr>
									@for ($col = 0; $col < 3; $col++)
										<td>
											@if(isset($skillsRow[$col]))
												@php $skill = $skillsRow[$col]; @endphp
												<div class="skill-row">
													<span class="skill-name">{{ $skill['name'] }}</span>
													@if (isset($skill['level']) && ($resume['showExperienceLevel'] ?? false))
														<span class="skill-dots">
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
																<span class="skill-dot" style="background-color: {{ $i < $bulletCount ? '#000000' : '#cccccc' }};"></span>
															@endfor
														</span>
													@endif
												</div>
											@endif
										</td>
									@endfor
								</tr>
							@endforeach
						</tbody>
					</table>
				</div>
			@endif
        <!-- Experience -->
        @if(!empty($resume['experiences']) && is_array($resume['experiences']) && count($resume['experiences']) > 0)
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">PROFESSIONAL EXPERIENCE</h2>
                </div>
                <div class="space-y-4">
                    @foreach($resume['experiences'] as $exp)
                        <div class="experience-item">
                            <div class="experience-header">
                                <h3 class="experience-title">{{ $exp['jobTitle'] ?? '' }}{{ isset($exp['company']) ? ', ' . $exp['company'] : '' }}    
                                    <span class="dates">{{ $exp['startDate'] ?? '' }} - {{ $exp['endDate'] ?? '' }}</span>
                                </h3>
                                
                            </div>
                            @if(!empty($exp['location']))
                                <p class="location">{{ $exp['location'] }}</p>
                            @endif
                            @if(!empty($exp['description']))
                                <div class="description">
                                    @if(trim($exp['description']) !== '')
                                        <div class="bullet-point">
                                            <span class="bullet">•</span>
                                            <span class="bullet-text">{{ trim($exp['description']) }}</span>
                                        </div>
                                    @endif
                                </div>
                            @endif
                        </div>
                    @endforeach
                </div>
            </div>
        @endif

        <!-- Education -->
        @if(!empty($resume['education']) && is_array($resume['education']) && count($resume['education']) > 0)
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">EDUCATION</h2>
                </div>
                <div class="space-y-4">
                    @foreach($resume['education'] as $edu)
                        <div class="education-item">
                            <div class="education-header">
                                <h3 class="education-title">{{ $edu['degree'] ?? '' }}
                                    <span class="dates">{{ $edu['startDate'] ?? '' }} - {{ $edu['endDate'] ?? '' }}</span>
                                </h3>
                            </div>
                            <p class="school">{{ $edu['school'] ?? '' }}</p>
                            @if(!empty($edu['location']))
                                <p class="location">{{ $edu['location'] }}</p>
                            @endif
                            @if(!empty($edu['description']))
                                <div class="description">
                                    @if(trim($edu['description']) !== '')
                                        <div class="bullet-point">
                                            <span class="bullet">•</span>
                                            <span class="bullet-text">{{ trim($edu['description']) }}</span>
                                        </div>
                                    @endif
                                </div>
                            @endif
                        </div>
                    @endforeach
                </div>
            </div>
        @endif

        <!-- Additional Information -->
        @if(
            (!empty($resume['languages']) && is_array($resume['languages']) && count($resume['languages']) > 0) || 
            (!empty($resume['certifications']) && is_array($resume['certifications']) && count($resume['certifications']) > 0) || 
            (!empty($resume['awards']) && is_array($resume['awards']) && count($resume['awards']) > 0) || 
            (!empty($resume['hobbies']) && is_array($resume['hobbies']) && count($resume['hobbies']) > 0)
        )
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">ADDITIONAL INFORMATION</h2>
                </div>
                <div class="additional-info">
                    @if(!empty($resume['languages']) && is_array($resume['languages']) && count($resume['languages']) > 0)
                        <div class="info-item">
                            <span class="info-content">• <span class="info-label">Languages:</span> {{ collect($resume['languages'])->pluck('name')->implode(', ') }}</span>
                        </div>
                    @endif

                    @if(!empty($resume['certifications']) && is_array($resume['certifications']) && count($resume['certifications']) > 0)
                        <div class="info-item">
                            <span class="info-content">• <span class="info-label">Certifications:</span> {{ collect($resume['certifications'])->pluck('title')->implode(', ') }}</span>
                        </div>
                    @endif

                    @if(!empty($resume['awards']) && is_array($resume['awards']) && count($resume['awards']) > 0)
                        <div class="info-item">
                            <span class="info-content">• <span class="info-label">Awards/Activities:</span> {{ collect($resume['awards'])->pluck('title')->implode(', ') }}</span>
                        </div>
                    @endif

                    @if(!empty($resume['hobbies']) && is_array($resume['hobbies']) && count($resume['hobbies']) > 0)
                        <div class="info-item">
                            <span class="info-content">• <span class="info-label">Hobbies:</span> {{ collect($resume['hobbies'])->pluck('name')->implode(', ') }}</span>
                        </div>
                    @endif
                </div>
            </div>
        @endif

        <!-- References -->
        @if(!empty($resume['references']) && is_array($resume['references']) && count($resume['references']) > 0)
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">REFERENCES</h2>
                </div>
                <div class="space-y-2">
                    @foreach($resume['references'] as $ref)
                        <div class="references-item">
                            <span class="reference-name">{{ $ref['name'] ?? '' }}</span>
                            @if(!empty($ref['relationship']))
                                — {{ $ref['relationship'] }}
                            @endif
                            @if(!empty($ref['contactInfo']))
                                <span class="text-gray-600"> — {{ $ref['contactInfo'] }}</span>
                            @endif
                        </div>
                    @endforeach
                </div>
            </div>
        @endif

        <!-- Custom Sections -->
        @if(!empty($resume['customSections']) && is_array($resume['customSections']) && count($resume['customSections']) > 0)
            <div class="space-y-6">
                @foreach($resume['customSections'] as $custom)
                    <div class="custom-section">
                        <div class="section-header">
                            <h2 class="section-title">{{ strtoupper($custom['title'] ?? '') }}</h2>
                        </div>
                        <p class="custom-section-content">{{ $custom['content'] ?? '' }}</p>
                    </div>
                @endforeach
            </div>
        @endif
    </div>
</body>
</html>