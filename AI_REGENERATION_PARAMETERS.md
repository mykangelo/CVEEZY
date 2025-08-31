# AI Regeneration Parameters Guide

## Overview
This document explains how to use the new AI regeneration parameters in the `config/ai_enhancement.php` file to control AI content generation behavior.

## Quick Start

### 1. Using Presets
The easiest way to control AI generation is through predefined presets:

```php
// In your controller
$params = $this->getRegenerationParameters('summary', 'creative');
// Returns: temperature: 0.9, topP: 0.95, topK: 60, max_tokens: 200
```

### 2. Available Presets
- **professional**: Conservative, professional tone (temperature: 0.4)
- **creative**: Creative and varied outputs (temperature: 0.9)
- **balanced**: Balanced creativity and consistency (temperature: 0.7)
- **focused**: Focused and consistent (temperature: 0.3)

## Parameter Details

### Temperature
Controls randomness and creativity:
- **0.1-0.3**: Very focused, consistent output
- **0.4-0.6**: Balanced, professional
- **0.7-0.9**: Creative, varied
- **1.0+**: Experimental, maximum creativity

### TopP (Nucleus Sampling)
Controls diversity of token selection:
- **0.8**: More focused on top responses
- **0.9**: Balanced diversity
- **0.95**: More diverse responses
- **0.98**: Maximum diversity exploration

### TopK
Controls number of token choices:
- **20**: Fewer token choices (more focused)
- **40**: Standard diversity
- **60**: More token choices
- **80**: Maximum token diversity

### Max Tokens
Controls output length:
- **100**: Concise outputs
- **150**: Standard length
- **250**: More detailed
- **400**: Very detailed

## Content Type Adjustments

Different content types automatically get optimized parameters:

### Summary Generation
- Default preset: `balanced`
- Temperature boost: +0.1 (more creative)
- Max tokens boost: +50 (longer summaries)

### Experience Descriptions
- Default preset: `professional`
- Temperature boost: +0.0 (keep professional)
- Max tokens boost: +100 (detailed descriptions)

### Education Descriptions
- Default preset: `focused`
- Temperature boost: +0.0 (keep focused)
- Max tokens boost: +30 (moderate length)

## Usage Examples

### 1. Basic Usage in Controller
```php
class AIController extends Controller
{
    public function generateSummary(Request $request)
    {
        // Get parameters for summary generation
        $params = $this->getRegenerationParameters('summary', 'creative');
        
        // Use in AI generation
        $result = $gemini->generateEnhancedContent($prompt, [
            'temperature' => $params['temperature'],
            'topP' => $params['topP'],
            'topK' => $params['topK'],
            'maxOutputTokens' => $params['max_tokens']
        ]);
    }
}
```

### 2. User Customization
```php
// Allow users to override parameters
$userParams = [
    'temperature' => 0.8,
    'max_tokens' => 200
];

$params = $this->getRegenerationParameters('summary', 'balanced', $userParams);
```

### 3. Progressive Creativity Strategy
```php
// Automatically increase creativity on retries
$strategies = config('ai_enhancement.regeneration_parameters.regeneration_strategies');
if ($strategies['progressive_creativity']['enabled']) {
    $attempt = 1; // Track attempt number
    $preset = $strategies['progressive_creativity']['steps']["attempt_{$attempt}"] ?? 'balanced';
    $params = $this->getRegenerationParameters('summary', $preset);
}
```

## Configuration File Structure

```php
'regeneration_parameters' => [
    'temperature' => [
        'conservative' => 0.3,
        'balanced' => 0.7,
        'creative' => 0.9,
        'experimental' => 1.2
    ],
    'presets' => [
        'professional' => [
            'temperature' => 0.4,
            'topP' => 0.85,
            'topK' => 30,
            'max_tokens' => 150,
            'description' => 'Conservative, professional tone'
        ]
    ],
    'content_type_adjustments' => [
        'summary' => [
            'default_preset' => 'balanced',
            'temperature_boost' => 0.1,
            'max_tokens_boost' => 50
        ]
    ]
]
```

## Best Practices

### 1. Start with Presets
- Use predefined presets for consistent results
- Only customize when you need specific behavior

### 2. Content Type Awareness
- Let the system automatically adjust for content type
- Override only when necessary

### 3. Progressive Enhancement
- Start with conservative parameters
- Gradually increase creativity if needed
- Use the progressive creativity strategy for retries

### 4. Monitor Quality
- Use the quality control settings
- Adjust parameters based on output quality
- Log parameter usage for optimization

## Troubleshooting

### Common Issues

1. **Too Repetitive Output**
   - Increase temperature (0.7-0.9)
   - Increase topP (0.95-0.98)
   - Use 'creative' preset

2. **Too Generic Output**
   - Decrease temperature (0.3-0.5)
   - Decrease topP (0.8-0.9)
   - Use 'focused' preset

3. **Output Too Long/Short**
   - Adjust max_tokens parameter
   - Use 'concise' or 'detailed' presets

4. **Inconsistent Quality**
   - Use 'balanced' preset
   - Enable progressive creativity strategy
   - Check content type adjustments

## Advanced Features

### 1. Quick Presets
```php
'quick_presets' => [
    'more_creative' => [
        'temperature' => '+0.3',
        'topP' => '+0.05',
        'description' => 'Increase creativity by 30%'
    ]
]
```

### 2. Content-Aware Adjustment
```php
'content_aware_adjustment' => [
    'enabled' => true,
    'detect_repetitive' => true,
    'increase_diversity_on_repeat' => true,
    'temperature_increment' => 0.2
]
```

### 3. Fallback Strategies
```php
'fallback_strategies' => [
    'on_low_quality' => 'focused',
    'on_repetitive' => 'creative',
    'on_too_short' => 'detailed'
]
```

## Integration with Frontend

To use these parameters in the frontend, you can:

1. **Pass preset names** in API requests
2. **Allow user customization** of parameters
3. **Show parameter effects** in the UI
4. **Save user preferences** for future use

Example API call:
```javascript
fetch('/generate-summary-suggestions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        preset: 'creative',
        custom_params: {
            temperature: 0.8,
            max_tokens: 200
        }
    })
});
```

## Conclusion

The new regeneration parameters provide fine-grained control over AI content generation while maintaining ease of use through presets. Start with the default presets and gradually customize based on your specific needs and content types.
