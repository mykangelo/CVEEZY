<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Resume Service Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains all configuration for the resume service,
    | including parsing, AI enhancement, templates, and upload settings.
    |
    */

    'parsing' => [
        'supported_formats' => ['pdf', 'doc', 'docx', 'txt', 'html', 'htm'],
        'ai_parsing' => [
            'enabled' => true,
            'max_output_tokens' => 4096,
            'temperature' => 0.1,
            'top_p' => 0.1,
            'timeout' => 30,
            'max_retries' => 3,
        ],
        'confidence_threshold' => 0.7,
        'max_file_size' => 10240, // 10MB
    ],

    'uploads' => [
        'max_file_size' => 10240, // 10MB
        'allowed_mime_types' => [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'text/html',
        ],
        'storage' => [
            'disk' => 'local',
            'path' => 'resumes',
        ],
    ],

    'templates' => [
        'classic' => [
            'name' => 'Classic',
            'description' => 'Traditional professional layout',
            'category' => 'professional',
        ],
        'modern' => [
            'name' => 'Modern',
            'description' => 'Contemporary design with clean lines',
            'category' => 'contemporary',
        ],
        'creative' => [
            'name' => 'Creative',
            'description' => 'Innovative and artistic design',
            'category' => 'creative',
        ],
        'elegant' => [
            'name' => 'Elegant',
            'description' => 'Sophisticated and refined design',
            'category' => 'elegant',
        ],
        'minimal' => [
            'name' => 'Minimal',
            'description' => 'Clean and simple design',
            'category' => 'minimal',
        ],
        'professional' => [
            'name' => 'Professional',
            'description' => 'Corporate and business-focused design',
            'category' => 'professional',
        ],
    ],

    'ai_enhancement' => [
        'enabled' => true,
        'max_retries' => 6,
        'max_output_tokens' => [
            'summary_generation' => 3072,
            'experience_enhancement' => 2048,
            'skill_enhancement' => 1024,
        ],
        'temperature_range' => [
            'min' => 0.8,
            'max' => 1.2,
        ],
        'summary_length' => [
            'min_words' => 60,
            'max_words' => 90,
            'min_sentences' => 3,
            'max_sentences' => 5,
            'sanitize_max_words' => 90,
        ],
        'max_skills_display' => 5,
        'similarity_thresholds' => [
            'text_similarity' => 88.0,
            'jaccard_similarity' => 0.80,
            'phrase_duplicate' => 95.0,
            'sentence_duplicate' => 92.0,
        ],
        'summary_context_limits' => [
            'max_years_experience' => 60,
            'max_experiences' => 4,
            'max_education' => 2,
            'min_token_length' => 3,
        ],
        'validation' => [
            'min_text_length' => [
                'education' => 10,
                'experience' => 10,
            ],
            'prevent_generic_content' => true,
            'generic_phrases' => [
                'responsible for',
                'duties include',
                'main responsibilities',
                'key responsibilities',
            ],
        ],
        'content_variations' => [
            'approaches' => [
                'results-driven',
                'collaborative',
                'innovative',
                'strategic',
                'analytical',
                'creative',
                'detail-oriented',
                'leadership-focused',
            ],
            'focuses' => [
                'achievement',
                'growth',
                'innovation',
                'efficiency',
                'quality',
                'collaboration',
                'leadership',
                'problem-solving',
            ],
            'styles' => [
                'professional',
                'enthusiastic',
                'confident',
                'humble',
                'assertive',
                'collaborative',
                'innovative',
                'analytical',
            ],
        ],
        'random_seed_range' => [
            'min' => 1000,
            'max' => 9999,
        ],
    ],

    'statuses' => [
        'draft' => 'Draft',
        'pending' => 'Pending',
        'approved' => 'Approved',
        'rejected' => 'Rejected',
        'completed' => 'Completed',
    ],

    'cleanup' => [
        'temp_files' => [
            'enabled' => true,
            'max_age_hours' => 24,
        ],
    ],

    'final_check' => [
        'max_text_length' => 20000,
        'enabled' => true,
    ],

    'progress_weights' => [
        'contact' => 0.15,
        'summary' => 0.20,
        'experiences' => 0.30,
        'education' => 0.15,
        'skills' => 0.20,
    ],
];
