<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Resume Parser Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains all configuration for the resume parsing service,
    | including section mappings, field mappings, and other parsing rules.
    |
    */

    'section_mappings' => [
        'contact' => [
            'aliases' => ['contact', 'personal', 'personal information', 'details', 'info', 'profile', 'header'],
            'priority' => 1,
            'required_fields' => ['firstName', 'lastName', 'email'],
            'optional_fields' => ['phone', 'address', 'city', 'country', 'postCode', 'desiredJobTitle']
        ],
        'summary' => [
            'aliases' => ['summary', 'profile', 'objective', 'overview', 'about', 'introduction', 'executive summary'],
            'priority' => 2,
            'required_fields' => [],
            'optional_fields' => ['content']
        ],
        'experiences' => [
            'aliases' => ['experience', 'work experience', 'employment', 'professional experience', 'career', 'work history', 'positions'],
            'priority' => 3,
            'required_fields' => ['jobTitle', 'company'],
            'optional_fields' => ['location', 'startDate', 'endDate', 'description']
        ],
        'education' => [
            'aliases' => ['education', 'academic', 'academics', 'qualifications', 'degrees', 'schooling', 'academic background'],
            'priority' => 4,
            'required_fields' => ['school', 'degree'],
            'optional_fields' => ['location', 'startDate', 'endDate', 'description']
        ],
        'skills' => [
            'aliases' => ['skills', 'technical skills', 'competencies', 'expertise', 'capabilities', 'proficiencies'],
            'priority' => 5,
            'required_fields' => ['name'],
            'optional_fields' => ['level', 'category']
        ],
        'languages' => [
            'aliases' => ['languages', 'language skills', 'bilingual', 'multilingual'],
            'priority' => 6,
            'required_fields' => ['name'],
            'optional_fields' => ['level']
        ],
        'certifications' => [
            'aliases' => ['certifications', 'certificates', 'credentials', 'accreditations', 'licenses'],
            'priority' => 7,
            'required_fields' => ['title'],
            'optional_fields' => ['issuer', 'date', 'description']
        ],
        'awards' => [
            'aliases' => ['awards', 'honors', 'achievements', 'recognition', 'accolades'],
            'priority' => 8,
            'required_fields' => ['title'],
            'optional_fields' => ['issuer', 'date', 'description']
        ],
        'websites' => [
            'aliases' => ['websites', 'links', 'portfolio', 'social media'],
            'priority' => 9,
            'required_fields' => ['url'],
            'optional_fields' => ['title', 'description']
        ],
        'references' => [
            'aliases' => ['references', 'referees', 'testimonials'],
            'priority' => 10,
            'required_fields' => ['name'],
            'optional_fields' => ['title', 'company', 'phone', 'email']
        ],
        'hobbies' => [
            'aliases' => ['interests', 'hobbies', 'personal interests'],
            'priority' => 11,
            'required_fields' => [],
            'optional_fields' => ['name', 'description']
        ]
    ],

    'field_mappings' => [
        'experiences' => [
            'jobTitle' => ['jobTitle', 'title', 'position', 'role', 'job_title', 'job_title'],
            'company' => ['company', 'employer', 'organization', 'institution', 'firm', 'corp'],
            'location' => ['location', 'city', 'place', 'area', 'region'],
            'startDate' => ['startDate', 'start_date', 'from', 'begin', 'start'],
            'endDate' => ['endDate', 'end_date', 'to', 'until', 'end', 'current'],
            'description' => ['description', 'summary', 'details', 'responsibilities', 'achievements']
        ],
        'education' => [
            'school' => ['school', 'university', 'college', 'institution', 'academy'],
            'degree' => ['degree', 'qualification', 'certificate', 'diploma', 'major'],
            'location' => ['location', 'city', 'place', 'area', 'region'],
            'startDate' => ['startDate', 'start_date', 'from', 'begin', 'start'],
            'endDate' => ['endDate', 'end_date', 'to', 'until', 'end', 'current'],
            'description' => ['description', 'summary', 'details', 'achievements']
        ],
        'skills' => [
            'name' => ['name', 'skill', 'technology', 'tool', 'language'],
            'level' => ['level', 'proficiency', 'expertise', 'rating', 'skill_level'],
            'category' => ['category', 'type', 'group', 'domain']
        ],
        'contact' => [
            'firstName' => ['firstName', 'first_name', 'firstname', 'given_name', 'first'],
            'lastName' => ['lastName', 'last_name', 'lastname', 'family_name', 'surname', 'last'],
            'email' => ['email', 'e-mail', 'mail', 'email_address'],
            'phone' => ['phone', 'telephone', 'mobile', 'cell', 'phone_number'],
            'address' => ['address', 'street', 'location', 'residence'],
            'city' => ['city', 'town', 'municipality'],
            'country' => ['country', 'nation', 'state'],
            'postCode' => ['postCode', 'post_code', 'zip', 'postal_code', 'zipcode'],
            'desiredJobTitle' => ['desiredJobTitle', 'desired_job_title', 'target_position', 'job_objective']
        ]
    ],

    'known_section_headings' => [
        'contact' => ['contact', 'personal', 'personal information', 'details', 'info', 'profile', 'header'],
        'summary' => ['summary', 'profile', 'objective', 'overview', 'about', 'introduction', 'executive summary'],
        'experience' => ['experience', 'work experience', 'employment', 'professional experience', 'career', 'work history', 'positions'],
        'education' => ['education', 'academic', 'academics', 'qualifications', 'degrees', 'schooling', 'academic background'],
        'skills' => ['skills', 'technical skills', 'competencies', 'expertise', 'capabilities', 'proficiencies'],
        'languages' => ['languages', 'language skills', 'bilingual', 'multilingual'],
        'certifications' => ['certifications', 'certificates', 'credentials', 'accreditations', 'licenses'],
        'awards' => ['awards', 'honors', 'achievements', 'recognition', 'accolades'],
        'projects' => ['projects', 'portfolio', 'work samples', 'case studies'],
        'references' => ['references', 'referees', 'testimonials'],
        'activities' => ['activities', 'involvement', 'extracurricular', 'volunteer', 'community'],
        'interests' => ['interests', 'hobbies', 'personal interests']
    ],

    'skill_keywords' => [
        'php', 'laravel', 'react', 'javascript', 'python', 'java', 'html', 'css',
        'sql', 'mysql', 'mongodb', 'git', 'docker', 'aws', 'azure', 'linux',
        'design', 'canva', 'photoshop', 'illustrator', 'figma', 'sketch'
    ],

    'job_title_keywords' => [
        'developer', 'engineer', 'manager', 'director', 'specialist', 'analyst',
        'designer', 'consultant', 'coordinator', 'supervisor', 'assistant',
        'associate', 'lead', 'senior', 'junior', 'principal', 'architect'
    ],

    'education_keywords' => [
        'university', 'college', 'institute', 'school', 'academy', 'academic',
        'bachelor', 'master', 'phd', 'mba', 'degree', 'diploma', 'certificate',
        'graduation', 'student', 'freshman', 'sophomore', 'junior', 'senior',
        'high school', 'elementary', 'middle school', 'kindergarten'
    ],

    'common_first_names' => [
        'john', 'jane', 'michael', 'sarah', 'david', 'emily', 'james', 'jennifer',
        'robert', 'lisa', 'william', 'amanda', 'richard', 'jessica', 'thomas',
        'ashley', 'christopher', 'kimberly', 'daniel', 'nicole', 'matthew',
        'elizabeth', 'anthony', 'helen', 'mark', 'samantha', 'donald', 'stephanie'
    ],

    'regex_patterns' => [
        'email' => '/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/',
        'phone' => '/\+?[\d\s\(\)\.\-]{7,15}/',
        'name_patterns' => [
            '/^([A-Z][a-z]+)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)$/',
            '/^([A-Z][a-z]+)\s+([A-Z]\.)\s+([A-Z][a-z]+)$/',
            '/^([A-Z][a-z]+)\s+([A-Z][a-z]+)\s+([A-Z][a-z]+)$/',
            '/^([A-Z]+)\s+([A-Z]+)$/',
            '/^(Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)\s+([A-Z][a-z]+)\s+([A-Z][a-z]+)$/i'
        ],
        'skill_patterns' => [
            '/^[A-Za-z]+(?:\s*[+\-]\s*[A-Za-z]+)*$/',
            '/^[A-Za-z]+\s+\d+\.?\d*$/',
            '/^[A-Za-z]+\s*\([A-Za-z\s]+\)$/',
            '/^[A-Za-z]+\s+(?:Framework|Library|Tool|Technology|Language|Platform)/i'
        ]
    ],

    'content_validation' => [
        'max_skill_length' => 100,
        'min_skill_length' => 3,
        'max_summary_length' => 200,
        'min_summary_length' => 30,
        'max_name_length' => 50,
        'min_name_length' => 3
    ]
];
