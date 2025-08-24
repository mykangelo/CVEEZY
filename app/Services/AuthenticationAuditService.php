<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Request;
use App\Models\User;
use App\Models\AuditLog;

class AuthenticationAuditService
{
    /**
     * Log successful login
     */
    public function logSuccessfulLogin(User $user): void
    {
        $this->logToDatabase(
            AuditLog::EVENT_LOGIN_SUCCESS,
            $user->email,
            $user->id,
            AuditLog::STATUS_INFO,
            ['session_id' => session()->getId()]
        );

        Log::info('User logged in successfully', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'timestamp' => now()->toISOString(),
            'session_id' => session()->getId(),
        ]);
    }

    /**
     * Log failed login attempt
     */
    public function logFailedLogin(string $email, string $reason = 'Invalid credentials'): void
    {
        $this->logToDatabase(
            AuditLog::EVENT_LOGIN_FAILED,
            $email,
            null,
            AuditLog::STATUS_WARNING,
            ['reason' => $reason]
        );

        Log::warning('Failed login attempt', [
            'email' => $email,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'reason' => $reason,
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * Log account lockout
     */
    public function logAccountLockout(string $email): void
    {
        $this->logToDatabase(
            AuditLog::EVENT_ACCOUNT_LOCKOUT,
            $email,
            null,
            AuditLog::STATUS_ALERT,
            ['lockout_duration' => '60 seconds']
        );

        Log::alert('Account lockout triggered', [
            'email' => $email,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'timestamp' => now()->toISOString(),
            'lockout_duration' => '60 seconds',
        ]);
    }

    /**
     * Log password reset request
     */
    public function logPasswordResetRequest(string $email): void
    {
        $this->logToDatabase(
            AuditLog::EVENT_PASSWORD_RESET_REQUEST,
            $email,
            null,
            AuditLog::STATUS_INFO
        );

        Log::info('Password reset requested', [
            'email' => $email,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * Log password reset completion
     */
    public function logPasswordResetCompleted(User $user): void
    {
        $this->logToDatabase(
            AuditLog::EVENT_PASSWORD_RESET_COMPLETED,
            $user->email,
            $user->id,
            AuditLog::STATUS_INFO
        );

        Log::info('Password reset completed', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * Log email verification
     */
    public function logEmailVerification(User $user): void
    {
        $this->logToDatabase(
            AuditLog::EVENT_EMAIL_VERIFIED,
            $user->email,
            $user->id,
            AuditLog::STATUS_INFO
        );

        Log::info('Email verified', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * Log social login
     */
    public function logSocialLogin(User $user, string $provider): void
    {
        $this->logToDatabase(
            AuditLog::EVENT_SOCIAL_LOGIN,
            $user->email,
            $user->id,
            AuditLog::STATUS_INFO,
            ['provider' => $provider]
        );

        Log::info('Social login successful', [
            'user_id' => $user->id,
            'email' => $user->email,
            'provider' => $provider,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * Log logout
     */
    public function logLogout(User $user): void
    {
        $this->logToDatabase(
            AuditLog::EVENT_LOGOUT,
            $user->email,
            $user->id,
            AuditLog::STATUS_INFO,
            ['session_id' => session()->getId()]
        );

        Log::info('User logged out', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'timestamp' => now()->toISOString(),
            'session_id' => session()->getId(),
        ]);
    }

    /**
     * Log suspicious activity
     */
    public function logSuspiciousActivity(string $email, string $activity, array $context = []): void
    {
        $this->logToDatabase(
            AuditLog::EVENT_SUSPICIOUS_ACTIVITY,
            $email,
            null,
            AuditLog::STATUS_WARNING,
            array_merge(['activity' => $activity], $context)
        );

        Log::warning('Suspicious authentication activity detected', [
            'email' => $email,
            'activity' => $activity,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'timestamp' => now()->toISOString(),
            'context' => $context,
        ]);
    }

    /**
     * Log rate limit exceeded
     */
    public function logRateLimitExceeded(string $email, array $context = []): void
    {
        $this->logToDatabase(
            AuditLog::EVENT_RATE_LIMIT_EXCEEDED,
            $email,
            null,
            AuditLog::STATUS_WARNING,
            $context
        );

        Log::warning('Rate limit exceeded', array_merge([
            'email' => $email,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'timestamp' => now()->toISOString(),
        ], $context));
    }

    /**
     * Store audit log in database
     */
    private function logToDatabase(string $eventType, string $userEmail, ?int $userId, string $status, array $context = []): void
    {
        try {
            AuditLog::create([
                'event_type' => $eventType,
                'user_email' => $userEmail,
                'user_id' => $userId,
                'ip_address' => Request::ip(),
                'user_agent' => Request::userAgent(),
                'route_name' => Request::route()?->getName(),
                'context' => $context,
                'status' => $status,
                'created_at' => now(),
            ]);
        } catch (\Exception $e) {
            // If database logging fails, still log to Laravel logs
            Log::error('Failed to store audit log in database', [
                'error' => $e->getMessage(),
                'event_type' => $eventType,
                'user_email' => $userEmail,
            ]);
        }
    }
}
