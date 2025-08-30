<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class GeminiService
{
    protected $apiKey;
    protected $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key');
        $this->baseUrl = config('services.gemini.api_url');
    }

    /**
     * Generate content from Gemini.
     * $options may include:
     * - response_mime_type: e.g. 'application/json'
     * - temperature, topK, topP, maxOutputTokens
     */
    public function generateText($prompt, $model = null, array $options = [])
    {
        // Use Gemini 1.5 Flash as default since it has better quota and working API
        $model = $model ?: 'gemini-1.5-flash';
        $url = "{$this->baseUrl}/{$model}:generateContent?key={$this->apiKey}";

        $payload = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ],
        ];

        $genConfig = [];
        if (!empty($options['response_mime_type'])) {
            $genConfig['response_mime_type'] = $options['response_mime_type'];
        }
        foreach (['temperature','topK','topP','maxOutputTokens'] as $cfg) {
            if (array_key_exists($cfg, $options)) {
                $genConfig[$cfg] = $options[$cfg];
            }
        }
        if (!empty($genConfig)) {
            $payload['generationConfig'] = $genConfig;
        }

        $client = Http::timeout(config('resume.parsing.ai_parsing.timeout', 20));
        // Allow disabling SSL verification in local/dev to avoid cURL error 60
        $verify = filter_var(env('HTTP_CLIENT_VERIFY_SSL', true), FILTER_VALIDATE_BOOL);
        if ($verify === false) {
            $client = $client->withOptions(['verify' => false]);
        }

        $response = $client->post($url, $payload);

        if ($response->successful()) {
            $responseData = $response->json();
            
            // Debug: Log the response structure for troubleshooting
            \Log::info('Gemini API Response Structure', [
                'response_keys' => array_keys($responseData),
                'candidates_structure' => $responseData['candidates'] ?? 'no_candidates',
                'content_structure' => $responseData['candidates'][0]['content'] ?? 'no_content'
            ]);
            
            return $responseData;
        }

        return [
            'error' => $response->status(),
            'message' => $response->body()
        ];
    }

    /**
     * Generate enhanced content with Gemini 1.5 Flash for better quality
     */
    public function generateEnhancedContent($prompt, array $options = [])
    {
        $model = 'gemini-1.5-flash';
        
        $enhancedOptions = array_merge([
            'temperature' => 0.7, // Lower temperature for more focused output
            'maxOutputTokens' => 512, // Reduced for more focused output
            'topP' => 0.8, // Lower topP for more focused output
            'topK' => 30, // Lower topK for more focused output
        ], $options);

        return $this->generateText($prompt, $model, $enhancedOptions);
    }
    
    /**
     * Generate content from file using Gemini's multimodal capabilities
     */
    public function generateFromFile($prompt, $fileContent, $mimeType, $model = null, array $options = [])
    {
        // Use Gemini 1.5 Flash as default for multimodal processing
        $model = $model ?: 'gemini-1.5-flash';
        $url = "{$this->baseUrl}/{$model}:generateContent?key={$this->apiKey}";
        
        // Encode file content as base64
        $base64Content = base64_encode($fileContent);
        
        $payload = [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt],
                        [
                            'inline_data' => [
                                'mime_type' => $mimeType,
                                'data' => $base64Content
                            ]
                        ]
                    ]
                ]
            ],
        ];

        $genConfig = [];
        if (!empty($options['response_mime_type'])) {
            $genConfig['response_mime_type'] = $options['response_mime_type'];
        }
        foreach (['temperature','topK','topP','maxOutputTokens'] as $cfg) {
            if (array_key_exists($cfg, $options)) {
                $genConfig[$cfg] = $options[$cfg];
            }
        }
        if (!empty($genConfig)) {
            $payload['generationConfig'] = $genConfig;
        }

        $client = Http::timeout(config('resume.parsing.ai_parsing.timeout', 30)); // Longer timeout for file processing
        // Allow disabling SSL verification in local/dev to avoid cURL error 60
        $verify = filter_var(env('HTTP_CLIENT_VERIFY_SSL', true), FILTER_VALIDATE_BOOL);
        if ($verify === false) {
            $client = $client->withOptions(['verify' => false]);
        }

        $response = $client->post($url, $payload);

        if ($response->successful()) {
            $responseData = $response->json();
            
            // Debug: Log the response structure for troubleshooting
            \Log::info('Gemini File API Response Structure', [
                'response_keys' => array_keys($responseData),
                'candidates_structure' => $responseData['candidates'] ?? 'no_candidates',
                'content_structure' => $responseData['candidates'][0]['content'] ?? 'no_content'
            ]);
            
            return $responseData;
        }

        return [
            'error' => $response->status(),
            'message' => $response->body()
        ];
    }
}
