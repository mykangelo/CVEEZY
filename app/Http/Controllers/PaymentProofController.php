<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PaymentProof;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Models\Resume; // Added this import for the new validation

class PaymentProofController extends Controller
{
    public function store(Request $request)
    {
        try {
            \Log::info('Payment proof upload started', [
                'user_id' => Auth::id(),
                'request_data' => $request->all(),
                'files' => $request->allFiles(),
                'resume_id' => $request->input('resume_id'),
                'has_file' => $request->hasFile('proof')
            ]);

            // Check if file exists first
            if (!$request->hasFile('proof')) {
                \Log::error('No file uploaded');
                return response()->json(['message' => 'No file uploaded'], 400);
            }

            $request->validate([
                'resume_id' => 'required|exists:resumes,id',
                'proof' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
            ]);

            // Additional check: ensure the resume belongs to the current user
            $resume = Resume::where('id', $request->resume_id)
                           ->where('user_id', Auth::id())
                           ->first();
            
            if (!$resume) {
                \Log::error('Resume access denied', [
                    'resume_id' => $request->resume_id,
                    'user_id' => Auth::id(),
                    'resume_exists' => Resume::where('id', $request->resume_id)->exists()
                ]);
                return response()->json(['message' => 'Resume not found or access denied'], 404);
            }

            \Log::info('Validation passed');

            $file = $request->file('proof');
            \Log::info('File details', [
                'original_name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'extension' => $file->getClientOriginalExtension()
            ]);

            // Check if storage directory exists and is writable
            $storagePath = storage_path('app/public/proofs');
            if (!file_exists($storagePath)) {
                mkdir($storagePath, 0755, true);
                \Log::info('Created storage directory: ' . $storagePath);
            }

            $path = $file->store('proofs', 'public');
            \Log::info('File stored at: ' . $path);

            $paymentProof = PaymentProof::create([
                'user_id' => Auth::id(),
                'resume_id' => $request->resume_id,
                'file_path' => $path,
                'status' => 'pending',
            ]);

            \Log::info('Payment proof created', ['id' => $paymentProof->id]);

            return response()->json(['message' => 'Proof uploaded', 'id' => $paymentProof->id]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed', [
                'errors' => $e->errors(),
                'request_data' => $request->all(),
                'user_id' => Auth::id()
            ]);
            return response()->json([
                'message' => 'Validation failed', 
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Payment proof upload failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all(),
                'user_id' => Auth::id()
            ]);
            return response()->json(['message' => 'Upload failed: ' . $e->getMessage()], 500);
        }
    }

    public function userPayments()
    {
        $userId = Auth::id();

        $payments = PaymentProof::with('resume')
            ->where('user_id', $userId)
            ->latest()
            ->get()
            ->map(function ($payment) {
                $resume = $payment->resume;

                // Handle both string and already-decoded array
                $data = $resume->resume_data;
                if (is_string($data)) {
                    $data = json_decode($data, true);
                }

                $contact = $data['contact'] ?? [];

                return [
                    'id' => $payment->id,
                    'status' => $payment->status,
                    'created_at' => $payment->created_at->toDateTimeString(),
                    'resume_id' => $payment->resume_id,
                    'firstName' => $contact['firstName'] ?? '',
                    'lastName' => $contact['lastName'] ?? '',
                    'is_paid' => $resume->is_paid ?? false,
                ];
            });

        return response()->json($payments);
    }

    /**
     * Get user's payment proofs for polling
     */
    public function getUserPaymentProofs()
    {
        $user = Auth::user();
        
        $paymentProofs = $user->paymentProofs()
            ->whereIn('id', function($query) use ($user) {
                $query->selectRaw('MAX(id)')
                    ->from('payment_proofs')
                    ->where('user_id', $user->id)
                    ->groupBy('resume_id');
            })
            ->get()
            ->map(function ($proof) {
                return [
                    'id' => $proof->id,
                    'resume_id' => $proof->resume_id,
                    'status' => $proof->status,
                    'created_at' => $proof->created_at->toISOString(),
                    'updated_at' => $proof->updated_at->toISOString(),
                ];
            });

        return response()->json($paymentProofs);
    }
}
