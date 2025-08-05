<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Resume extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'name',
        'template_id',
        'status',
        'resume_data',
        'settings',
        'is_paid',
    ];

    /**
     * The attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'resume_data' => 'array',
            'settings' => 'array',
            'is_paid' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Resume status constants
     */
    public const STATUS_DRAFT = 'draft';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_PUBLISHED = 'published';

    /**
     * Get all available statuses
     */
    public static function getStatuses(): array
    {
        return [
            self::STATUS_DRAFT,
            self::STATUS_COMPLETED,
            self::STATUS_PUBLISHED,
        ];
    }

    /**
     * Relationship: Resume belongs to a user
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relationship: Resume has many payment proofs
     */
    public function paymentProofs()
    {
        return $this->hasMany(PaymentProof::class);
    }

    /**
     * Check if resume is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Check if resume is published
     */
    public function isPublished(): bool
    {
        return $this->status === self::STATUS_PUBLISHED;
    }

    /**
     * Mark resume as completed
     */
    public function markAsCompleted(): bool
    {
        return $this->update(['status' => self::STATUS_COMPLETED]);
    }

    /**
     * Get formatted creation date
     */
    public function getFormattedCreationDateAttribute(): string
    {
        return $this->created_at->format('d.m.Y');
    }

    /**
     * Scope to get user's resumes
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to get resumes by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Get resume progress percentage
     */
    public function getProgressPercentage(): int
    {
        if (!$this->resume_data) {
            return 0;
        }

        $completedSections = 0;
        $totalSections = 5; // contact, experience, education, skills, summary

        $data = $this->resume_data;

        // Check contact information
        if (isset($data['contact']) && !empty($data['contact']['firstName']) && !empty($data['contact']['email'])) {
            $completedSections++;
        }

        // Check experience
        if (isset($data['experiences']) && count($data['experiences']) > 0) {
            $completedSections++;
        }

        // Check education
        if (isset($data['educations']) && count($data['educations']) > 0) {
            $completedSections++;
        }

        // Check skills
        if (isset($data['skills']) && count($data['skills']) > 0) {
            $completedSections++;
        }

        // Check summary
        if (isset($data['summary']) && !empty($data['summary'])) {
            $completedSections++;
        }

        return intval(($completedSections / $totalSections) * 100);
    }

    /**
     * Check if resume is paid
     */
    public function isPaid(): bool
    {
        return $this->is_paid === true;
    }

    /**
     * Mark resume as paid
     */
    public function markAsPaid(): bool
    {
        return $this->update(['is_paid' => true]);
    }

    /**
     * Get latest payment proof for this resume
     */
    public function getLatestPaymentProof()
    {
        return $this->paymentProofs()->latest()->first();
    }
} 