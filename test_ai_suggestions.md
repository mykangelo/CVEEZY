# AI Suggestions System Test Guide

## Overview

This document outlines how to test the newly implemented AI suggestion system across Experience, Education, and Summary sections.

## What Was Implemented

### 1. SuggestionModal Component ✅

-   **Location**: `resources/js/Components/SuggestionModal.tsx`
-   **Features**:
    -   Displays 3 AI-generated suggestions
    -   Smooth animations and modern UI
    -   Copy to clipboard functionality
    -   Loading states with skeleton UI

### 2. Backend Endpoints ✅

-   **Experience Suggestions**: `POST /generate-experience-suggestions`
-   **Education Suggestions**: `POST /generate-education-suggestions`
-   **Summary Suggestions**: `POST /generate-summary-suggestions`

### 3. Frontend Integration ✅

-   **Experience Section**: Single "Generate with AI" button
-   **Education Section**: Single "Generate with AI" button
-   **Summary Section**: Single "Generate Summary with AI" button

### 4. Centralized Configuration ✅

-   **AI Enhancement Config**: `config/ai_enhancement.php` - Model parameters, validation rules, content variations
-   **Prompt Templates**: `config/prompts.php` - All AI prompt templates with placeholders
-   **Service Class**: `app/Services/AIConfigService.php` - Helper for accessing configuration
-   **Benefits**: Easy to modify AI behavior and prompts without code changes

### 5. Consolidated Prompt Template System ✅

-   **Single Main Prompt**: Each section (Experience, Education, Summary) uses one consolidated prompt
-   **Dynamic Content Generation**: Automatically generates focus requirements, approach variations, and style requirements
-   **Smart Regeneration**: Automatically adjusts prompts for regeneration vs. initial generation
-   **Consistent Structure**: All prompts follow the same unified format and requirements
-   **Easy Customization**: Modify prompts without touching application code

## Testing Steps

### Prerequisites

1. Ensure Laravel server is running: `php artisan serve`
2. Ensure frontend is running: `npm run dev`
3. Make sure you have a valid Gemini API key configured

### Test 1: Experience Section

1. Navigate to the resume builder
2. Add a new experience entry
3. Fill in:
    - Job Title: "Software Developer"
    - Company: "Tech Corp"
    - Description: "Developed web applications using React and Node.js"
4. Click "✨ Generate with AI"
5. **Expected Result**: Modal opens showing 3 different AI-generated suggestions
6. Click on a suggestion to apply it
7. Test copy functionality

### Test 2: Education Section

1. Add a new education entry
2. Fill in:
    - Degree: "Bachelor of Computer Science"
    - School: "University of Technology"
    - Description: "Studied programming and software engineering"
3. Click "✨ Generate with AI"
4. **Expected Result**: Modal opens with 3 education-focused suggestions
5. Select a suggestion and verify it's applied

### Test 3: Summary Section

1. Fill in "Desired job title" field
2. Click "✨ Generate Summary with AI"
3. **Expected Result**: Modal opens with 3 different summary styles
4. Each summary should have a different approach (achievement-focused, skills-forward, etc.)

### Test 4: Error Handling

1. Try to generate suggestions without filling required fields
2. **Expected Result**: Appropriate error message displayed
3. Verify validation prevents generation

### Test 5: Loading States

1. Click generate button
2. **Expected Result**: Modal opens with skeleton loading animation
3. Verify smooth transition to suggestions

## Configuration Testing

### Modify AI Behavior

1. Edit `config/ai_enhancement.php`
2. Change temperature values, validation rules, or content variations
3. Test to see changes take effect immediately

### Modify AI Prompts

1. Edit `config/prompts.php`
2. Change prompt templates, requirements, or tone
3. Test to see prompt changes take effect immediately

### Example: Change Experience Focus

```php
// In config/ai_enhancement.php
'experience_focuses' => [
    "emphasize technical achievements and code quality",  // New focus
    "highlight team collaboration and project delivery",
    "showcase problem-solving and innovation"
],
```

### Example: Modify Experience Prompt

```php
// In config/prompts.php
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
```

## Troubleshooting

### Common Issues

1. **Modal not opening**

    - Check browser console for JavaScript errors
    - Verify SuggestionModal component is imported

2. **AI generation failing**

    - Check Laravel logs: `tail -f storage/logs/laravel.log`
    - Verify Gemini API key is valid
    - Check network tab for failed requests

3. **Suggestions not diverse enough**
    - Adjust temperature in config
    - Modify focus variations
    - Check AI prompts for clarity

### Debug Commands

```bash
# Check Laravel logs
tail -f storage/logs/laravel.log

# Test API endpoints
curl -X POST http://localhost:8000/generate-experience-suggestions \
  -H "Content-Type: application/json" \
  -d '{"text":"test","jobTitle":"Developer","company":"Tech"}'

# Check configuration
php artisan tinker
>>> config('ai_enhancement.prompts.experience.suggestions')
```

## Performance Notes

-   **Response Time**: AI suggestions typically take 2-5 seconds
-   **Fallback**: Local variations used if AI fails
-   **Caching**: Consider implementing Redis caching for repeated requests

## Future Enhancements

1. **User Preferences**: Save user's preferred suggestion style
2. **Batch Generation**: Generate suggestions for multiple sections at once
3. **Custom Prompts**: Allow users to modify AI behavior
4. **Analytics**: Track which suggestions are most popular

## Success Criteria

✅ Modal opens smoothly with animations  
✅ 3 diverse suggestions are generated  
✅ Suggestions can be applied to fields  
✅ Copy functionality works  
✅ Loading states display correctly  
✅ Error handling works for invalid inputs  
✅ Configuration changes take effect immediately  
✅ All three sections (Experience, Education, Summary) work consistently
