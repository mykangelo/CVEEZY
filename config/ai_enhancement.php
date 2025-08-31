<?php

return [
    /*
    |--------------------------------------------------------------------------
    | AI Enhancement Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains all AI-related configuration including prompts,
    | model parameters, content variations, and validation rules.
    |
    */

    /*
    |--------------------------------------------------------------------------
    | AI Prompt Templates
    |--------------------------------------------------------------------------
    |
    | Note: All prompt templates have been moved to config/prompts.php
    | for better organization and maintainability.
    |
    */

    'model_parameters' => [
        'max_output_tokens' => [
            'summary' => 2048,
            'description' => 512,
            'suggestions' => 2048,
            'improvement' => 768
        ],
        
        'temperature' => [
            'initial' => 0.7,
            'regenerate' => 0.9,
            'polish' => 0.3,
            'suggestions' => 0.8
        ],
        
        'topP' => [
            'initial' => 0.95,
            'regenerate' => 0.98,
            'polish' => 0.9,
            'suggestions' => 0.96
        ],
        
        'topK' => [
            'initial' => 50,
            'regenerate' => 60,
            'polish' => 40,
            'suggestions' => 55
        ]
    ],

    'content_variations' => [
        'education_approaches' => [
            "highlight academic achievements and relevant coursework",
            "emphasize practical skills gained and projects completed", 
            "focus on honors, awards, and standout accomplishments"
        ],
        
        'experience_focuses' => [
            "quantify achievements and measurable outcomes",
            "emphasize leadership, collaboration, and team impact",
            "highlight technical skills and problem-solving abilities",
            "showcase innovation, efficiency improvements, and process optimization"
        ],
        
        'summary_styles' => [
            "achievement-focused and quantitative",
            "skills-forward and technical",
            "leadership-oriented and strategic",
            "results-driven and action-oriented",
            "client-impact oriented",
            "efficiency-focused"
        ]
    ],

    'validation' => [
        'min_text_length' => [
            'education' => 10,
            'experience' => 10,
            'summary' => 20
        ],
        
        'generic_phrases' => [
            "sample text",
            "lorem ipsum",
            "placeholder",
            "text here",
            "description here",
            "enter description",
            "Computer Science",
            "Information Technology",
            "IT"
        ],
        
        'prevent_generic_content' => true
    ],

    'quality_control' => [
        'similarity_thresholds' => [
            'text_similarity' => 70.0,
            'jaccard_similarity' => 0.60,
            'phrase_duplicate' => 80.0,
            'sentence_duplicate' => 75.0
        ],
        
        'max_retries' => 5,
        'fallback_to_local' => false,
        'prevent_json_artifacts' => true,
        'max_summary_length' => 85,
        'min_summary_length' => 35,
        'force_variety' => true,
        'min_diversity_score' => 0.7
    ],

    'summary_generation_limits' => [
        'length' => [
            'min_words' => 35,
            'max_words' => 85,
            'max_sentences' => 5,
            'sanitize_max_words' => 85
        ],
        
        'context' => [
            'max_years_experience' => 30,
            'max_experiences' => 5,
            'max_education' => 3,
            'max_skills_display' => 6
        ]
    ],

    'random_seed_range' => [
        'min' => 1000,
        'max' => 9999
    ],

    /*
    |--------------------------------------------------------------------------
    | Regeneration Parameters
    |--------------------------------------------------------------------------
    |
    | These parameters control the AI behavior when regenerating content.
    | Users can adjust these to get different styles and variations.
    |
    */
    
    'regeneration_parameters' => [
        'temperature' => [
            'conservative' => 0.3,      // More focused, consistent output
            'balanced' => 0.7,          // Balanced creativity and consistency
            'creative' => 0.9,          // More creative, varied output
            'experimental' => 1.2       // Maximum creativity, may be less focused
        ],
        
        'topP' => [
            'focused' => 0.8,           // More focused on top responses
            'balanced' => 0.9,          // Balanced diversity
            'diverse' => 0.95,          // More diverse responses
            'exploratory' => 0.98       // Maximum diversity exploration
        ],
        
        'topK' => [
            'narrow' => 20,             // Fewer token choices
            'standard' => 40,           // Standard diversity
            'wide' => 60,               // More token choices
            'maximum' => 80             // Maximum token diversity
        ],
        
        'max_tokens' => [
            'concise' => 100,           // Shorter outputs
            'standard' => 150,          // Standard length
            'detailed' => 250,          // More detailed
            'comprehensive' => 400      // Very detailed
        ],
        
        'presets' => [
            'professional' => [
                'temperature' => 0.4,
                'topP' => 0.85,
                'topK' => 30,
                'max_tokens' => 150,
                'description' => 'Conservative, professional tone'
            ],
            'creative' => [
                'temperature' => 0.9,
                'topP' => 0.95,
                'max_tokens' => 200,
                'topK' => 60,
                'description' => 'Creative and varied outputs'
            ],
            'balanced' => [
                'temperature' => 0.7,
                'topP' => 0.9,
                'topK' => 40,
                'max_tokens' => 150,
                'description' => 'Balanced creativity and consistency'
            ],
            'focused' => [
                'temperature' => 0.3,
                'topP' => 0.8,
                'topK' => 25,
                'max_tokens' => 120,
                'description' => 'Focused and consistent'
            ]
        ],
        
        'content_type_adjustments' => [
            'summary' => [
                'default_preset' => 'balanced',
                'temperature_boost' => 0.1,    // Slightly more creative for summaries
                'max_tokens_boost' => 50       // Allow longer summaries
            ],
            'experience' => [
                'default_preset' => 'professional',
                'temperature_boost' => 0.0,    // Keep professional for experience
                'max_tokens_boost' => 100      // Allow detailed experience descriptions
            ],
            'education' => [
                'default_preset' => 'focused',
                'temperature_boost' => 0.0,    // Keep focused for education
                'max_tokens_boost' => 30       // Moderate length for education
            ]
        ],
        
        'regeneration_strategies' => [
            'progressive_creativity' => [
                'enabled' => true,
                'steps' => [
                    'first_attempt' => 'balanced',
                    'second_attempt' => 'creative',
                    'third_attempt' => 'experimental'
                ],
                'max_attempts' => 3
            ],
            'content_aware_adjustment' => [
                'enabled' => true,
                'detect_repetitive' => true,
                'increase_diversity_on_repeat' => true,
                'temperature_increment' => 0.2,
                'topP_increment' => 0.05
            ],
            'fallback_strategies' => [
                'on_low_quality' => 'focused',
                'on_repetitive' => 'creative',
                'on_too_short' => 'detailed',
                'on_too_long' => 'concise'
            ]
        ]
    ],
    
    'user_preferences' => [
        'allow_parameter_override' => true,
        'default_user_preset' => 'balanced',
        'save_user_preferences' => true,
        'parameter_constraints' => [
            'temperature' => [
                'min' => 0.1,
                'max' => 2.0,
                'step' => 0.1
            ],
            'topP' => [
                'min' => 0.5,
                'max' => 1.0,
                'step' => 0.05
            ],
            'topK' => [
                'min' => 10,
                'max' => 100,
                'step' => 5
            ],
            'max_tokens' => [
                'min' => 50,
                'max' => 1000,
                'step' => 25
            ]
        ],
        'quick_presets' => [
            'more_creative' => [
                'temperature' => '+0.3',
                'topP' => '+0.05',
                'description' => 'Increase creativity by 30%'
            ],
            'more_focused' => [
                'temperature' => '-0.2',
                'topP' => '-0.05',
                'description' => 'Increase focus by 20%'
            ],
            'longer_output' => [
                'max_tokens' => '+100',
                'description' => 'Allow 100 more tokens'
            ],
            'shorter_output' => [
                'max_tokens' => '-50',
                'description' => 'Reduce by 50 tokens'
            ]
        ]
    ]
];
