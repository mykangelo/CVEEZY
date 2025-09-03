<?php

namespace App\Helpers;

class BulletProcessor
{
    /**
     * Process a description string to detect and format bulleted content
     */
    public static function processBulletedDescription(string $description): array
    {
        if (empty(trim($description))) {
            return [];
        }

        $lines = preg_split('/\r\n|\r|\n/', $description);
        $processedBullets = [];
        $hasBullets = false;

        // First pass: detect if we have bullets
        foreach ($lines as $line) {
            $trimmed = trim($line);
            if (!empty($trimmed) && self::isBulletLine($trimmed)) {
                $hasBullets = true;
                break;
            }
        }

        if ($hasBullets) {
            // Process as bulleted content
            foreach ($lines as $line) {
                $trimmed = trim($line);
                if (empty($trimmed)) continue;

                if (self::isBulletLine($trimmed)) {
                    // Extract content after bullet
                    $content = self::extractBulletContent($trimmed);
                    if (!empty($content)) {
                        $processedBullets[] = ['text' => $content, 'isBullet' => true];
                    }
                } else {
                    // Non-bullet line - could be continuation or separate content
                    $processedBullets[] = ['text' => $trimmed, 'isBullet' => false];
                }
            }
        } else {
            // No bullets detected, try auto-detection
            $autoDetectedLines = self::autoDetectAndAddBullets($lines);
            
            // Check if auto-detection found bullet-like content
            $hasAutoDetectedBullets = false;
            foreach ($autoDetectedLines as $line) {
                if (self::isBulletLine(trim($line))) {
                    $hasAutoDetectedBullets = true;
                    break;
                }
            }
            
            if ($hasAutoDetectedBullets) {
                // Process auto-detected bullets
                foreach ($autoDetectedLines as $line) {
                    $trimmed = trim($line);
                    if (empty($trimmed)) continue;

                    if (self::isBulletLine($trimmed)) {
                        // Extract content after bullet
                        $content = self::extractBulletContent($trimmed);
                        if (!empty($content)) {
                            $processedBullets[] = ['text' => $content, 'isBullet' => true];
                        }
                    } else {
                        // Non-bullet line
                        $processedBullets[] = ['text' => $trimmed, 'isBullet' => false];
                    }
                }
            } else {
                // No bullets detected, check if it's a long description that should be split
                $longDescription = trim($description);
                if (strlen($longDescription) > 200) {
                    // Try to split long descriptions into multiple bullets
                    $splitBullets = self::splitLongDescription($longDescription);
                    if (count($splitBullets) > 1) {
                        return array_map(function($bullet) {
                            return ['text' => $bullet, 'isBullet' => true];
                        }, $splitBullets);
                    }
                }
                
                // Return as single non-bullet item
                $processedBullets[] = ['text' => $longDescription, 'isBullet' => false];
            }
        }

        return $processedBullets;
    }

    /**
     * Check if a line looks like a bullet point
     */
    private static function isBulletLine(string $line): bool
    {
        $line = trim($line);
        return preg_match('/^[•\-\*]\s+/u', $line) ||
               preg_match('/^\d+\.\s+/', $line) ||
               preg_match('/^[a-z]\)\s+/i', $line) ||
               preg_match('/^[ivx]+\)\s+/i', $line) ||
               preg_match('/^[A-Z][\.\)]\s+/', $line) ||
               preg_match('/^\s+[•\-\*]\s+/u', $line) ||
               preg_match('/^\s+\d+\.\s+/', $line) ||
               preg_match('/^\s+[a-z]\)\s+/i', $line) ||
               preg_match('/^\s+[A-Z][\.\)]\s+/', $line) ||
               preg_match('/^\s+[ivx]+\)\s+/i', $line) ||
               preg_match('/^[▪▫▸▹▻▽▼]\s+/u', $line) ||
               preg_match('/^\s+[▪▫▸▹▻▽▼]\s+/u', $line);
    }

    /**
     * Extract content after bullet point
     */
    private static function extractBulletContent(string $line): string
    {
        // Remove bullet point and return content
        return trim(preg_replace('/^[•\-\*]\s+/', '', 
                preg_replace('/^\d+\.\s+/', '', 
                preg_replace('/^[a-z]\)\s+/i', '', 
                preg_replace('/^[A-Z][\.\)]\s+/', '', 
                preg_replace('/^[ivx]+\)\s+/i', '', 
                preg_replace('/^\s+[•\-\*]\s+/', '', 
                preg_replace('/^\s+\d+\.\s+/', '', 
                preg_replace('/^\s+[a-z]\)\s+/i', '', 
                preg_replace('/^\s+[A-Z][\.\)]\s+/', '', 
                preg_replace('/^\s+[ivx]+\)\s+/i', '', 
                preg_replace('/^[▪▫▸▹▻▽▼]\s+/', '', 
                preg_replace('/^\s+[▪▫▸▹▻▽▼]\s+/', '', $line)))))))))))));
    }

    /**
     * Split a long description into multiple bullets based on sentence structure
     */
    private static function splitLongDescription(string $description): array
    {
        $bullets = [];
        
        // Try to split on colons (common pattern for job descriptions)
        if (preg_match_all('/([A-Z][^:]*):\s*([^.!?]*[.!?]?)/', $description, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $title = trim($match[1]);
                $content = trim($match[2]);
                if (!empty($content)) {
                    $bullets[] = $title . ': ' . $content;
                }
            }
            if (count($bullets) > 1) {
                return $bullets;
            }
        }

        // Try to split on action words with better pattern matching
        $actionWords = [
            'managed', 'led', 'developed', 'implemented', 'designed', 'created', 'built', 'improved',
            'optimized', 'increased', 'reduced', 'achieved', 'delivered', 'collaborated', 'mentored',
            'trained', 'supervised', 'analyzed', 'researched', 'maintained', 'supported', 'configured',
            'deployed', 'integrated', 'automated', 'streamlined', 'enhanced', 'established', 'ensures',
            'defines', 'manages', 'tech skills', 'responsible', 'oversaw', 'coordinated', 'facilitated',
            'executed', 'administered', 'monitored', 'evaluated', 'planned', 'organized', 'directed'
        ];

        // More comprehensive action word splitting
        foreach ($actionWords as $actionWord) {
            $pattern = '/\b' . preg_quote($actionWord, '/') . '\b[:\s]+([^.!?]*[.!?]?)/i';
            if (preg_match_all($pattern, $description, $matches, PREG_SET_ORDER)) {
                if (count($matches) > 1) {
                    foreach ($matches as $match) {
                        $content = trim($match[1]);
                        if (!empty($content) && strlen($content) > 10) {
                            $bullets[] = ucfirst($actionWord) . ': ' . $content;
                        }
                    }
                    if (count($bullets) > 1) {
                        return $bullets;
                    }
                }
            }
        }

        // Try to split on common separators and patterns
        $separators = [
            '/\.\s+(?=[A-Z])/',  // Period followed by capital letter
            '/;\s+/',            // Semicolons
            '/,\s+(?=[A-Z][a-z]*\s+[a-z])/',  // Comma followed by action word
        ];

        foreach ($separators as $separator) {
            $parts = preg_split($separator, $description);
            if (count($parts) > 2) {
                $result = [];
                foreach ($parts as $part) {
                    $trimmed = trim($part);
                    if (!empty($trimmed) && strlen($trimmed) > 20) {
                        $result[] = $trimmed;
                    }
                }
                if (count($result) > 1) {
                    return $result;
                }
            }
        }

        // Try to split on sentence boundaries
        $sentences = preg_split('/([.!?])\s+/', $description, -1, PREG_SPLIT_DELIM_CAPTURE);
        if (count($sentences) > 2) {
            $result = [];
            for ($i = 0; $i < count($sentences); $i += 2) {
                $sentence = trim($sentences[$i]);
                if ($i + 1 < count($sentences)) {
                    $sentence .= $sentences[$i + 1]; // Add punctuation
                }
                if (!empty($sentence) && strlen($sentence) > 20) {
                    $result[] = $sentence;
                }
            }
            if (count($result) > 1) {
                return $result;
            }
        }

        // If no splitting worked, return original as single item
        return [$description];
    }

    /**
     * Get the text content from processed bullets
     */
    public static function getBulletTexts(array $bullets): array
    {
        return array_map(function($bullet) {
            return $bullet['text'];
        }, $bullets);
    }

    /**
     * Check if processed bullets contain any bullet points
     */
    public static function hasBullets(array $bullets): bool
    {
        foreach ($bullets as $bullet) {
            if ($bullet['isBullet']) {
                return true;
            }
        }
        return false;
    }

    /**
     * Automatically detect bullet-like content and add asterisks to sentences
     * that look like they should be bullet points
     */
    private static function autoDetectAndAddBullets(array $descriptionLines): array
    {
        if (empty($descriptionLines)) {
            return $descriptionLines;
        }
        
        $processedLines = [];
        $bulletLikeCount = 0;
        $totalLines = count($descriptionLines);
        
        foreach ($descriptionLines as $line) {
            $line = trim($line);
            if (empty($line)) {
                $processedLines[] = $line;
                continue;
            }
            
            // Check if this line looks like it should be a bullet point
            if (self::isLikelyBulletContent($line)) {
                $bulletLikeCount++;
                // Add asterisk to the beginning
                $processedLines[] = '* ' . $line;
            } else {
                $processedLines[] = $line;
            }
        }
        
        // Only return processed lines if we detected at least 2 bullet-like items
        // or if more than 50% of lines look like bullets
        if ($bulletLikeCount >= 2 || ($totalLines > 0 && $bulletLikeCount / $totalLines > 0.5)) {
            return $processedLines;
        }
        
        // Otherwise, return original lines
        return $descriptionLines;
    }

    /**
     * Check if a line looks like it should be a bullet point
     */
    private static function isLikelyBulletContent(string $line): bool
    {
        $line = trim($line);
        
        // Skip very short lines
        if (strlen($line) < 8) {
            return false;
        }
        
        // Skip lines that look like dates, locations, or other structured data
        if (self::isLikelyDate($line)) {
            return false;
        }
        
        // Skip lines that look like names or titles (all caps, short)
        if (preg_match('/^[A-Z\s]{2,30}$/', $line) && strlen($line) < 30) {
            return false;
        }
        
        // Skip lines that look like contact information
        if (preg_match('/^[\w\.-]+@[\w\.-]+\.\w+$/', $line) || 
            preg_match('/^\+?[\d\s\-\(\)]{10,}$/', $line) ||
            preg_match('/^https?:\/\//', $line)) {
            return false;
        }
        
        // Skip lines that look like addresses or locations
        if (preg_match('/^\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd)/', $line)) {
            return false;
        }
        
        // Check for action words that typically start bullet points
        $actionWords = [
            'managed', 'led', 'developed', 'implemented', 'designed', 'created', 'built', 'improved',
            'optimized', 'increased', 'reduced', 'achieved', 'delivered', 'collaborated', 'mentored',
            'trained', 'supervised', 'analyzed', 'researched', 'maintained', 'supported', 'configured',
            'deployed', 'integrated', 'automated', 'streamlined', 'enhanced', 'established', 'ensures',
            'defines', 'manages', 'responsible', 'oversaw', 'coordinated', 'facilitated', 'executed',
            'administered', 'monitored', 'evaluated', 'planned', 'organized', 'directed', 'handled',
            'processed', 'generated', 'produced', 'completed', 'accomplished', 'performed', 'conducted',
            'assisted', 'helped', 'contributed', 'participated', 'involved', 'engaged', 'worked',
            'operated', 'utilized', 'leveraged', 'applied', 'employed', 'used', 'adopted', 'spearheaded',
            'initiated', 'launched', 'established', 'founded', 'co-founded', 'coached', 'guided',
            'instructed', 'taught', 'presented', 'demonstrated', 'exhibited', 'showcased', 'highlighted',
            'emphasized', 'focused', 'specialized', 'concentrated', 'dedicated', 'committed', 'devoted',
            'solved', 'resolved', 'addressed', 'tackled', 'overcame', 'conquered', 'mastered', 'excelled',
            'exceeded', 'surpassed', 'outperformed', 'dominated', 'led', 'headed', 'chaired', 'presided',
            'governed', 'controlled', 'regulated', 'supervised', 'oversaw', 'managed', 'administered'
        ];
        
        $lineLower = strtolower($line);
        
        // Check if line starts with an action word
        foreach ($actionWords as $actionWord) {
            if (strpos($lineLower, $actionWord) === 0) {
                return true;
            }
        }
        
        // Check for common bullet patterns
        // Lines that start with capital letters and contain action-like content
        if (preg_match('/^[A-Z][a-z]+.*(?:ed|ing|s|tion|sion|ment|ance|ence)\b/', $line)) {
            return true;
        }
        
        // Lines that contain colons (common in job descriptions)
        if (strpos($line, ':') !== false && strlen($line) > 15) {
            return true;
        }
        
        // Lines that contain numbers or percentages (achievements)
        if (preg_match('/\d+%|\d+\+|\d+x|\$\d+|\d+\s*(?:years?|months?|days?|hours?|times?|fold)/', $line)) {
            return true;
        }
        
        // Lines that contain technology keywords
        $techKeywords = [
            'api', 'database', 'framework', 'library', 'tool', 'software', 'system', 'platform',
            'application', 'website', 'mobile', 'web', 'cloud', 'server', 'client', 'frontend',
            'backend', 'full-stack', 'devops', 'agile', 'scrum', 'methodology', 'process',
            'workflow', 'pipeline', 'deployment', 'testing', 'quality', 'security', 'performance',
            'javascript', 'python', 'java', 'php', 'react', 'angular', 'vue', 'node', 'sql',
            'mysql', 'postgresql', 'mongodb', 'redis', 'docker', 'kubernetes', 'aws', 'azure',
            'gcp', 'git', 'github', 'gitlab', 'jenkins', 'ci/cd', 'rest', 'graphql', 'microservices'
        ];
        
        foreach ($techKeywords as $keyword) {
            if (strpos($lineLower, $keyword) !== false) {
                return true;
            }
        }
        
        // Lines that contain business/achievement keywords
        $businessKeywords = [
            'revenue', 'profit', 'sales', 'growth', 'efficiency', 'productivity', 'cost', 'budget',
            'roi', 'kpi', 'metrics', 'analytics', 'reporting', 'dashboard', 'insights', 'strategy',
            'planning', 'execution', 'implementation', 'rollout', 'launch', 'campaign', 'project',
            'initiative', 'program', 'team', 'department', 'organization', 'company', 'client',
            'customer', 'user', 'stakeholder', 'vendor', 'partner', 'collaboration', 'cooperation'
        ];
        
        foreach ($businessKeywords as $keyword) {
            if (strpos($lineLower, $keyword) !== false) {
                return true;
            }
        }
        
        // Lines that are reasonably long and contain sentence-like structure
        if (strlen($line) > 25 && strlen($line) < 300) {
            // Check if it contains sentence-like structure
            if (preg_match('/[.!?]$/', $line) || 
                preg_match('/\b(and|or|but|with|for|in|on|at|by|to|from|of|the|a|an)\b/', $line) ||
                preg_match('/\b(that|which|who|where|when|how|why|what)\b/', $line)) {
                return true;
            }
        }
        
        // Lines that start with common bullet-like patterns
        if (preg_match('/^(Responsible|Duties|Tasks|Key|Main|Primary|Secondary|Additional|Other)/i', $line)) {
            return true;
        }
        
        return false;
    }

    /**
     * Simple date detection for filtering out date lines
     */
    private static function isLikelyDate(string $line): bool
    {
        // Common date patterns
        $datePatterns = [
            '/^\d{4}$/',  // 2020
            '/^\d{1,2}\/\d{1,2}\/\d{4}$/',  // 01/15/2020
            '/^\d{1,2}-\d{1,2}-\d{4}$/',  // 01-15-2020
            '/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}$/i',  // January 2020
            '/^\d{4}\s*-\s*\d{4}$/',  // 2020 - 2021
            '/^(Present|Current|Ongoing)$/i'
        ];
        
        foreach ($datePatterns as $pattern) {
            if (preg_match($pattern, $line)) {
                return true;
            }
        }
        
        return false;
    }
}
