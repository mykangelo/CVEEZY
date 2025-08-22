<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Resume Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains configuration options for resume building, templates,
    | file uploads, and other resume-related functionality.
    |
    */

    // Available resume templates
    'templates' => [
        'classic' => [
            'name' => 'Classic',
            'description' => 'Traditional professional layout',
            'icon' => 'classic.png',
        ],
        'creative' => [
            'name' => 'Creative',
            'description' => 'Modern and visually appealing',
            'icon' => 'creative.jpg',
        ],
        'elegant' => [
            'name' => 'Elegant',
            'description' => 'Sophisticated and refined',
            'icon' => 'elegant.jpg',
        ],
        'minimal' => [
            'name' => 'Minimal',
            'description' => 'Clean and simple design',
            'icon' => 'minimal.jpg',
        ],
        'modern' => [
            'name' => 'Modern',
            'description' => 'Contemporary and stylish',
            'icon' => 'modern.jpg',
        ],
        'professional' => [
            'name' => 'Professional',
            'description' => 'Corporate and business-focused',
            'icon' => 'professional.png',
        ],
    ],

    // File upload settings
    'uploads' => [
        'max_file_size' => 10240, // 10MB in KB
        'allowed_extensions' => ['pdf', 'doc', 'docx', 'txt', 'html', 'htm'],
        'payment_proof' => [
            'max_file_size' => 2048, // 2MB in KB
            'allowed_extensions' => ['jpg', 'jpeg', 'png', 'pdf'],
        ],
    ],

    // Resume status constants
    'statuses' => [
        'draft' => 'draft',
        'in_progress' => 'in_progress',
        'completed' => 'completed',
        'published' => 'published',
    ],

    // Progress calculation weights
    'progress_weights' => [
        'contact' => 20,      // 20% of total progress
        'summary' => 20,      // 20% of total progress
        'experiences' => 25,  // 25% of total progress
        'education' => 20,    // 20% of total progress
        'skills' => 15,       // 15% of total progress
    ],

    // Final check settings
    'final_check' => [
        'max_text_length' => 20000,
    ],

    // AI enhancement settings
    'ai_enhancement' => [
        'enabled' => env('AI_ENHANCEMENT_ENABLED', true),
        'max_retries' => 6,
        'validation' => [
            'min_text_length' => [
                'education' => 10,
                'experience' => 10, // Reduced from 15 for more focused content
                'summary' => 20
            ],
            'required_fields' => [
                'education' => ['degree', 'school'],
                'experience' => ['jobTitle', 'company'],
                'summary' => ['job_title']
            ],
            'prevent_generic_content' => true,
            'generic_phrases' => [
                'Software Developer',
                'Web Developer',
                'Full Stack Developer',
                'Software Engineer',
                'Computer Science',
                'Information Technology'
            ]
        ],
        'temperature_range' => [
            'min' => 0.8,    // Increased from 0.7 for more creativity
            'max' => 1.2,    // Increased from 1.0 for maximum creativity
        ],
        'summary_length' => [
            'min_words' => 100,     // Increased for Gemini 2.5 Flash
            'max_words' => 200,     // Increased for Gemini 2.5 Flash
            'max_sentences' => 6,   // Increased for Gemini 2.5 Flash
            'sanitize_max_words' => 200, // Increased for Gemini 2.5 Flash
        ],
        'max_output_tokens' => [
            'education_description' => 2048,    // Increased for Gemini 2.5 Flash
            'experience_description' => 4096,   // Increased for Gemini 2.5 Flash
            'summary_generation' => 6144,      // Increased for Gemini 2.5 Flash
        ],
        'max_skills_display' => 5,
        'random_seed_range' => [
            'min' => 1000,
            'max' => 9999,
        ],
        'temperature_increment' => 0.15,  // Increased from 0.05 for more variation
        'similarity_thresholds' => [
            'phrase_duplicate' => 95.0,
            'sentence_duplicate' => 92.0,
            'text_similarity' => 88.0,
            'jaccard_similarity' => 0.80,
        ],
                        'content_variations' => [
                    'approaches' => [
                        "focus on technical skills and tools",
                        "emphasize academic achievements and certifications",
                        "highlight leadership and project management",
                        "showcase research and analytical abilities",
                        "demonstrate problem-solving and critical thinking",
                        "illustrate hands-on experience and practical application",
                        "emphasize innovation and creative solutions",
                        "highlight cross-functional collaboration and communication",
                        "showcase strategic thinking and business impact",
                        "demonstrate adaptability and continuous learning"
                    ],
                    'focuses' => [
                        "quantify achievements and measurable outcomes",
                        "emphasize leadership, collaboration, and team impact",
                        "highlight technical skills and problem-solving abilities",
                        "showcase innovation, efficiency improvements, and process optimization",
                        "demonstrate client satisfaction and stakeholder management",
                        "illustrate continuous learning and skill development",
                        "emphasize strategic planning and execution",
                        "highlight risk management and quality assurance",
                        "showcase cost reduction and revenue generation",
                        "demonstrate scalability and performance optimization"
                    ],
                    'styles' => [
                        "professional and corporate",
                        "confident and achievement-oriented",
                        "collaborative and team-focused",
                        "innovative and forward-thinking",
                        "results-driven and metrics-focused",
                        "strategic and business-oriented",
                        "dynamic and growth-focused",
                        "analytical and data-driven",
                        "entrepreneurial and risk-taking",
                        "consultative and client-focused"
                    ]
                ],
        'summary_context_limits' => [
            'max_experiences' => 4,
            'max_education' => 2,
            'max_years_experience' => 60,
            'min_token_length' => 3,
        ],
    ],

    // PDF generation settings
    'pdf' => [
        'paper_size' => 'A4',
        'orientation' => 'portrait',
        'dpi' => 150,
        'temp_directory' => 'temp/resumes',
    ],

    // Payment settings
    'payment' => [
        'auto_approval' => env('PAYMENT_AUTO_APPROVAL', false),
        'approval_timeout' => env('PAYMENT_APPROVAL_TIMEOUT', 24), // hours
        'proof_retention_days' => env('PAYMENT_PROOF_RETENTION', 365), // days
    ],

    // Resume parsing settings
    'parsing' => [
        'enabled' => env('RESUME_PARSING_ENABLED', true),
        'max_file_size' => 10240, // 10MB
        'supported_formats' => ['pdf', 'doc', 'docx', 'txt', 'html', 'htm'],
        'ai_parsing' => [
            'enabled' => env('AI_PARSING_ENABLED', true),
            'chunk_size' => 10000,
            'overlap' => 800,
            'max_chunks' => 5,
            'max_output_tokens' => 2048,
            'temperature' => 0.1,
            'top_p' => 0.1,
        ],
    ],

    // Cleanup settings
    'cleanup' => [
        'temp_files' => [
            'enabled' => env('CLEANUP_TEMP_FILES', true),
            'max_age_hours' => env('TEMP_FILES_MAX_AGE', 24),
        ],
        'unfinished_resumes' => [
            'enabled' => env('CLEANUP_UNFINISHED_RESUMES', true),
            'max_age_days' => env('UNFINISHED_RESUMES_MAX_AGE', 30),
        ],
    ],
];
