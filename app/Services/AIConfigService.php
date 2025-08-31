<?php

namespace App\Services;

class AIConfigService
{
    /**
     * Get AI configuration
     */
    public static function config(string $key = null)
    {
        $config = config('ai_enhancement');
        
        if ($key === null) {
            return $config;
        }
        
        return data_get($config, $key);
    }

    /**
     * Get a prompt with placeholders replaced
     */
    public static function getPrompt(string $type, string $action = 'main', array $replacements = []): string
    {
        $prompt = config("prompts.{$type}.{$action}");
        
        if (!$prompt) {
            throw new \InvalidArgumentException("Prompt not found for type: {$type}, action: {$action}");
        }
        
        return self::replacePlaceholders($prompt, $replacements);
    }

    /**
     * Get a consolidated prompt for any type with dynamic content
     */
    public static function getConsolidatedPrompt(string $type, array $replacements = []): string
    {
        $prompt = config("prompts.{$type}.main");
        
        if (!$prompt) {
            throw new \InvalidArgumentException("Main prompt not found for type: {$type}");
        }
        
        return self::replacePlaceholders($prompt, $replacements);
    }

    /**
     * Get model parameters for a specific action
     */
    public static function getModelParameters(string $action): array
    {
        $params = [];
        
        if (self::config("model_parameters.max_output_tokens.{$action}")) {
            $params['maxOutputTokens'] = self::config("model_parameters.max_output_tokens.{$action}");
        }
        
        if (self::config("model_parameters.temperature.{$action}")) {
            $params['temperature'] = self::config("model_parameters.temperature.{$action}");
        }
        
        if (self::config("model_parameters.topP.{$action}")) {
            $params['topP'] = self::config("model_parameters.topP.{$action}");
        }
        
        if (self::config("model_parameters.topK.{$action}")) {
            $params['topK'] = self::config("model_parameters.topK.{$action}");
        }
        
        return $params;
    }

    /**
     * Get content variations for a specific type
     */
    public static function getContentVariations(string $type): array
    {
        $key = match($type) {
            'experience' => 'experience_focuses',
            'education' => 'education_approaches',
            'summary' => 'summary_styles',
            default => throw new \InvalidArgumentException("Unknown content type: {$type}")
        };
        
        return self::config("content_variations.{$key}") ?? [];
    }

    /**
     * Get random content variation
     */
    public static function getRandomVariation(string $type): string
    {
        $variations = self::getContentVariations($type);
        
        if (empty($variations)) {
            throw new \InvalidArgumentException("No variations found for type: {$type}");
        }
        
        return $variations[array_rand($variations)];
    }

    /**
     * Get validation rules
     */
    public static function getValidationRules(string $type): array
    {
        return [
            'min_length' => self::config("validation.min_text_length.{$type}"),
            'generic_phrases' => self::config('validation.generic_phrases'),
            'prevent_generic' => self::config('validation.prevent_generic_content')
        ];
    }

    /**
     * Get quality control settings
     */
    public static function getQualityControl(): array
    {
        return self::config('quality_control') ?? [];
    }

    /**
     * Get summary generation limits
     */
    public static function getSummaryLimits(): array
    {
        return self::config('summary_generation_limits') ?? [];
    }

    /**
     * Generate random seed
     */
    public static function generateRandomSeed(): int
    {
        $range = self::config('random_seed_range');
        return mt_rand($range['min'] ?? 1000, $range['max'] ?? 9999);
    }

    /**
     * Replace placeholders in prompt text
     */
    private static function replacePlaceholders(string $prompt, array $replacements): string
    {
        foreach ($replacements as $placeholder => $value) {
            $prompt = str_replace(":{$placeholder}", $value, $prompt);
        }
        
        return $prompt;
    }

    /**
     * Validate text against generic content rules
     */
    public static function validateGenericContent(string $text, string $type): array
    {
        $rules = self::getValidationRules($type);
        $minLength = $rules['min_length'] ?? 10;
        $genericPhrases = $rules['generic_phrases'] ?? [];
        $preventGeneric = $rules['prevent_generic'] ?? true;
        
        $errors = [];
        $warnings = [];
        
        // Check minimum length
        if (strlen(trim($text)) < $minLength) {
            $errors[] = "Text must be at least {$minLength} characters long";
        }
        
        // Check for generic content if enabled
        if ($preventGeneric && !empty($genericPhrases)) {
            $textLower = strtolower(trim($text));
            foreach ($genericPhrases as $phrase) {
                if (strpos($textLower, strtolower($phrase)) !== false) {
                    $warnings[] = "Consider replacing generic phrase: '{$phrase}'";
                }
            }
        }
        
        return [
            'isValid' => empty($errors),
            'errors' => $errors,
            'warnings' => $warnings
        ];
    }

    /**
     * Get improvement prompt for a specific type
     */
    public static function getImprovementPrompt(string $type): string
    {
        return self::config("prompts.improvement.{$type}");
    }

    /**
     * Generate focus requirements for experience prompts
     */
    public static function generateExperienceFocusRequirements(int $count = 3, bool $isRegeneration = false): string
    {
        $focuses = self::getContentVariations('experience');
        $requirements = [];
        
        for ($i = 0; $i < $count; $i++) {
            $focus = $focuses[array_rand($focuses)];
            $requirements[] = ($i + 1) . ". " . ($i + 1) . "th variation that {$focus}";
        }
        
        return implode("\n", $requirements);
    }

    /**
     * Generate approach requirements for education prompts
     */
    public static function generateEducationApproachRequirements(int $count = 3, bool $isRegeneration = false): string
    {
        $approaches = self::getContentVariations('education');
        $requirements = [];
        
        for ($i = 0; $i < $count; $i++) {
            $approach = $approaches[array_rand($approaches)];
            $requirements[] = ($i + 1) . ". " . ($i + 1) . "th variation that {$approach}";
        }
        
        return implode("\n", $requirements);
    }

    /**
     * Generate style requirements for summary prompts
     */
    public static function generateSummaryStyleRequirements(int $count = 3, bool $isRegeneration = false): string
    {
        $styles = self::getContentVariations('summary');
        $requirements = [];
        
        for ($i = 0; $i < $count; $i++) {
            $style = $styles[array_rand($styles)];
            $requirements[] = ($i + 1) . ". " . ($i + 1) . "th summary that is {$style}";
        }
        
        return implode("\n", $requirements);
    }

    /**
     * Generate regeneration note based on context
     */
    public static function generateRegenerationNote(bool $isRegeneration = false): string
    {
        if ($isRegeneration) {
            return "This MUST be completely different from any previous generation";
        }
        return "Ensure each variation is unique and compelling";
    }
}
