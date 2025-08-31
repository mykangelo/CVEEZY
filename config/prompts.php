<?php

return [
    /*
    |--------------------------------------------------------------------------
    | AI Prompt Templates
    |--------------------------------------------------------------------------
    |
    | This file contains all AI prompt templates used across the application.
    | Use placeholders like :focus, :seed, :text, etc. to make prompts dynamic.
    |
    */

    'experience' => [
        'main' => "Create :count CONCISE and DIVERSE professional experience descriptions (25-35 words each) based on the provided text.

VARIATIONS REQUIRED:
:focus_requirements

CRITICAL REQUIREMENTS FOR ALL:
- Each variation must be different in tone and structure
- Focus ONLY on the specific role and key responsibilities
- Use simple, clear language that is easy to read
- Keep it concise and to the point
- Do NOT invent specific metrics or skills not mentioned in the original text
- Do NOT use overly complex or powerful language
- :regeneration_note

Return ONLY JSON in this exact format: 
{\"suggestions\": [{\"revised_text\": string}, {\"revised_text\": string}, {\"revised_text\": string}]}

TEXT:
:text"
    ],

    'education' => [
        'main' => "Create :count CONCISE and DIVERSE professional education descriptions (25-40 words each) based on the provided text.

VARIATIONS REQUIRED:
:approach_requirements

CRITICAL REQUIREMENTS FOR ALL:
- Each variation must be different in tone and structure
- Focus ONLY on the specific degree, school, and relevant achievements
- Include ONLY technical skills and tools that are directly relevant
- Use professional language that matches the original context
- Keep it concise and to the point
- Do NOT add generic achievements or skills not mentioned in the original
- :regeneration_note

Return ONLY JSON in this exact format: 
{\"suggestions\": [{\"revised_text\": string}, {\"revised_text\": string}, {\"revised_text\": string}]}

TEXT:
:text"
    ],

    'summary' => [
        'main' => "Create :count COMPLETELY DIFFERENT and compelling resume summaries for the role: :job_title.
Write 3-5 powerful, impactful sentences (:min_words–:max_words words) for each.

VARIATIONS REQUIRED:
:style_requirements

CRITICAL REQUIREMENTS FOR ALL:
- Each summary must be COMPLETELY DIFFERENT in approach, structure, and vocabulary
- Lead with different achievements, skills, or value propositions
- Use different sentence structures and paragraph organization
- Use alternative professional vocabulary and phrasing
- Each should be compelling and interview-worthy
- :regeneration_note
- Focus ONLY on the provided context - do NOT invent or fabricate information
- Keep summaries concise, professional, and specific to the role
- Avoid generic phrases, clichés, and repetitive language
- Ensure each summary has a unique opening sentence and conclusion

Use the comprehensive context below. Seed: :seed.
Return ONLY JSON in this exact format: 
{\"suggestions\": [{\"revised_text\": string}, {\"revised_text\": string}, {\"revised_text\": string}]}

:context"
    ],

    'improvement' => [
        'experience' => "Transform this professional experience description into polished, impactful language:

IMPROVEMENT REQUIREMENTS:
- Improve clarity and readability
- Enhance professional tone
- Fix grammar and punctuation
- Make it more concise and impactful
- Keep the same meaning and context
- Use active voice where appropriate
- Maintain the original achievements and skills

Return ONLY JSON: {\"improved_text\": string}.

TEXT:
:text",

        'education' => "Transform this education description into polished, academic language:

IMPROVEMENT REQUIREMENTS:
- Improve clarity and readability
- Enhance academic tone
- Fix grammar and punctuation
- Make it more concise and impactful
- Keep the same meaning and context
- Highlight relevant skills and achievements
- Maintain the original degree and school information

Return ONLY JSON: {\"improved_text\": string}.

TEXT:
:text",

        'summary' => "Transform this professional summary into polished, compelling language:

IMPROVEMENT REQUIREMENTS:
- Improve clarity and readability
- Enhance professional tone
- Fix grammar and punctuation
- Make it more concise and impactful
- Keep the same meaning and context
- Strengthen key value propositions
- Maintain the original achievements and skills

Return ONLY JSON: {\"improved_text\": string}.

TEXT:
:text"
    ],

    'local_variations' => [
        'experience' => [
            'technical' => "Developed and maintained :tech_stack applications, collaborating with cross-functional teams to deliver high-quality software solutions. Implemented best practices and coding standards to ensure maintainable codebase.",
            'leadership' => "Led development initiatives and mentored junior developers while delivering :tech_stack solutions. Coordinated with stakeholders to gather requirements and ensure project success.",
            'achievement' => "Successfully delivered :tech_stack applications on time and within budget. Improved system performance and user experience through iterative development and testing."
        ],
        'education' => [
            'academic' => "Completed :degree with focus on :field, maintaining strong academic performance. Participated in relevant coursework and academic projects.",
            'practical' => "Gained hands-on experience with :tech_stack through coursework and projects. Developed problem-solving skills and technical expertise.",
            'achievement' => "Graduated with honors from :school, demonstrating excellence in :field. Completed capstone project showcasing technical skills."
        ]
    ]
];
