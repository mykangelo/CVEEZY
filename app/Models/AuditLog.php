<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class AuditLog extends Model
{
    protected $fillable = [
        'event_type',
        'user_email',
        'user_id',
        'ip_address',
        'user_agent',
        'route_name',
        'context',
        'status',
        'created_at',
    ];

    protected $casts = [
        'context' => 'array',
        'created_at' => 'datetime',
    ];

    // Event type constants
    public const EVENT_LOGIN_SUCCESS = 'login_success';
    public const EVENT_LOGIN_FAILED = 'login_failed';
    public const EVENT_LOGOUT = 'logout';
    public const EVENT_ACCOUNT_LOCKOUT = 'account_lockout';
    public const EVENT_PASSWORD_RESET_REQUEST = 'password_reset_request';
    public const EVENT_PASSWORD_RESET_COMPLETED = 'password_reset_completed';
    public const EVENT_EMAIL_VERIFIED = 'email_verified';
    public const EVENT_SOCIAL_LOGIN = 'social_login';
    public const EVENT_SUSPICIOUS_ACTIVITY = 'suspicious_activity';
    public const EVENT_RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded';

    // Status constants
    public const STATUS_INFO = 'info';
    public const STATUS_WARNING = 'warning';
    public const STATUS_ALERT = 'alert';
    public const STATUS_ERROR = 'error';

    /**
     * Relationship: Audit log belongs to a user
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope: Get logs by event type
     */
    public function scopeByEventType(Builder $query, string $eventType): Builder
    {
        return $query->where('event_type', $eventType);
    }

    /**
     * Scope: Get logs by status
     */
    public function scopeByStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    /**
     * Scope: Get logs by user
     */
    public function scopeByUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope: Get logs by IP address
     */
    public function scopeByIpAddress(Builder $query, string $ipAddress): Builder
    {
        return $query->where('ip_address', $ipAddress);
    }

    /**
     * Scope: Get logs from specific date range
     */
    public function scopeDateRange(Builder $query, string $startDate, string $endDate): Builder
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Scope: Get recent logs (last 24 hours)
     */
    public function scopeRecent(Builder $query): Builder
    {
        return $query->where('created_at', '>=', now()->subDay());
    }

    /**
     * Scope: Get suspicious activity logs
     */
    public function scopeSuspicious(Builder $query): Builder
    {
        return $query->whereIn('status', [self::STATUS_WARNING, self::STATUS_ALERT, self::STATUS_ERROR]);
    }

    /**
     * Get formatted event type for display
     */
    public function getFormattedEventTypeAttribute(): string
    {
        return ucwords(str_replace('_', ' ', $this->event_type));
    }

    /**
     * Get formatted status for display
     */
    public function getFormattedStatusAttribute(): string
    {
        return ucfirst($this->status);
    }

    /**
     * Get short user agent (first 50 characters)
     */
    public function getShortUserAgentAttribute(): string
    {
        return strlen($this->user_agent) > 50 
            ? substr($this->user_agent, 0, 50) . '...' 
            : $this->user_agent;
    }

    /**
     * Check if this is a security event
     */
    public function isSecurityEvent(): bool
    {
        return in_array($this->status, [self::STATUS_WARNING, self::STATUS_ALERT, self::STATUS_ERROR]);
    }

    /**
     * Get context data as formatted string
     */
    public function getContextSummaryAttribute(): string
    {
        if (empty($this->context)) {
            return '';
        }

        $summary = [];
        foreach ($this->context as $key => $value) {
            if (is_string($value) && strlen($value) < 100) {
                $summary[] = ucfirst($key) . ': ' . $value;
            }
        }

        return implode(', ', $summary);
    }
}
