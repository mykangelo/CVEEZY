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

    public function generateText($prompt, $model = 'gemini-1.5-flash')
    {
        $url = "{$this->baseUrl}/{$model}:generateContent?key={$this->apiKey}";

        $response = Http::post($url, [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt]
                    ]
                ]
            ]
        ]);

        if ($response->successful()) {
            return $response->json();
        }

        return [
            'error' => $response->status(),
            'message' => $response->body()
        ];
    }

}
