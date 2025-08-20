<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class GeminiService
{
    protected $apiKey;
    protected $baseUrl;

    public function __construct()
    {
        $this->apiKey = env('GEMINI_API_KEY');
        $this->baseUrl = env('GEMINI_API_URL', 'https://generativelanguage.googleapis.com/v1beta/models');
    }

    /**
     * Generate content from Gemini.
     * $options may include:
     * - response_mime_type: e.g. 'application/json'
     * - temperature, topK, topP, maxOutputTokens
     */
    public function generateText($prompt, $model = 'gemini-1.5-flash', array $options = [])
    {
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

        $client = Http::timeout(20);
        // Allow disabling SSL verification in local/dev to avoid cURL error 60
        $verify = filter_var(env('HTTP_CLIENT_VERIFY_SSL', true), FILTER_VALIDATE_BOOL);
        if ($verify === false) {
            $client = $client->withOptions(['verify' => false]);
        }

        $response = $client->post($url, $payload);

        if ($response->successful()) {
            return $response->json();
        }

        return [
            'error' => $response->status(),
            'message' => $response->body()
        ];
    }

}
