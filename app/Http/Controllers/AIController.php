<?php

namespace App\Http\Controllers;

use App\Services\GeminiService;
use Illuminate\Http\Request;

class AIController extends Controller
{
    public function ask(GeminiService $gemini)
    {
        $prompt = "Can you give the full 'Lorem Ipsum?'";
        $result = $gemini->generateText($prompt);

        return response()->json($result);
    }

    //Prompt handler for the summary page
    public function reviseText(Request $request, GeminiService $gemini)
    {
        $request->validate([
            'text' => 'required|string'
        ]);

        $prompt = "Revise the following resume summary to make it sound formal and professional, that also highlights the skills of the user:
            \n\n" . $request->text . "";
        $result = $gemini->generateText($prompt);

        $revised = $result['candidates'][0]['content']['parts'][0]['text'] ?? $request->text;

        return response()->json([
            'revised_text' => $revised
        ]);
    }

    // Prompt handler for the education descriptions
    public function reviseEducationDescription(Request $request, GeminiService $gemini)
    {
        $request->validate([
            'text' => 'required|string'
        ]);

        $prompt = "Revise the given Education Description (paragraph form) and turn it into something more formal and professional:
            \n\n" . $request->text . " Please also allow for revisions on the revisions you've given.";
        $result = $gemini->generateText($prompt);

        $revised = $result['candidates'][0]['content']['parts'][0]['text'] ?? $request->text;

        return response()->json([
            'revised_text' => $revised
        ]);
    }

    public function reviseExperienceDescription(Request $request, GeminiService $gemini)
    {
        $request->validate([
            'text' => 'required|string'
        ]);

        $prompt = "Revise the given Experience Description (paragraph form) and turn it into something more formal and professional:
            \n\n" . $request->text . " Please also allow for revisions on the revisions you've given.";
        $result = $gemini->generateText($prompt);

        $revised = $result['candidates'][0]['content']['parts'][0]['text'] ?? $request->text;

        return response()->json([
            'revised_text' => $revised
        ]);
    }
}
