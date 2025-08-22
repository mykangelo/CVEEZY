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
        'template_name',
        'status',
        'resume_data',
        'settings',
        'is_paid',
        'last_paid_at',
        'last_modified_at',
        'needs_payment',
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
            'needs_payment' => 'boolean',
            'last_paid_at' => 'datetime',
            'last_modified_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Resume status constants
     */
    public const STATUS_DRAFT = 'draft';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_PUBLISHED = 'published';

    /**
     * Get status constants from config
     */
    public static function getStatuses(): array
    {
        return config('resume.statuses', [
            self::STATUS_DRAFT,
            self::STATUS_IN_PROGRESS,
            self::STATUS_COMPLETED,
            self::STATUS_PUBLISHED,
        ]);
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

    /**
     * Mark resume as paid and set payment timestamp
     */
    public function markAsPaidWithTimestamp(): bool
    {
        return $this->update([
            'is_paid' => true,
            'last_paid_at' => now(),
            'needs_payment' => false,
        ]);
    }

    /**
     * Mark resume as modified after payment
     */
    public function markAsModified(): bool
    {
        // Only mark as needing payment if it was previously paid
        // If resume is paid but doesn't have last_paid_at, set it first
        if ($this->is_paid && !$this->last_paid_at) {
            $this->update(['last_paid_at' => now()]);
        }
        
        $needsPayment = $this->is_paid;
        
        return $this->update([
            'last_modified_at' => now(),
            'needs_payment' => $needsPayment,
            // Reset payment status if it was previously paid
            'is_paid' => false,
        ]);
    }

    /**
     * Check if resume is available for download (paid and not modified)
     */
    public function isDownloadable(): bool
    {
        return $this->is_paid && !$this->needs_payment;
    }

    /**
     * Check if resume needs payment due to modifications
     */
    public function needsPayment(): bool
    {
        return $this->needs_payment === true;
    }

    /**
     * Check if resume was modified after payment
     */
    public function wasModifiedAfterPayment(): bool
    {
        if (!$this->last_paid_at || !$this->last_modified_at) {
            return false;
        }

        return $this->last_modified_at->isAfter($this->last_paid_at);
    }

    /**
     * Get the payment status for dashboard display
     */
    public function getPaymentStatus(): string
    {
        $latestPaymentProof = $this->getLatestPaymentProof();
        
        // If there's a payment proof, check if it's relevant to current resume state
        if ($latestPaymentProof) {
            // If resume was modified after the payment proof was created, the proof is outdated
            if ($this->last_modified_at && $this->last_modified_at->isAfter($latestPaymentProof->created_at)) {
                // Payment proof is outdated, check if this is a modified paid resume
                if ($this->last_paid_at && $this->wasModifiedAfterPayment()) {
                    return 'needs_payment_modified';
                }
                return 'needs_payment';
            }
            
            // Payment proof is current, return its status
            return $latestPaymentProof->status;
        }
        
        // No payment proof exists - check if this is a modified paid resume
        if ($this->last_paid_at && $this->wasModifiedAfterPayment()) {
            return 'needs_payment_modified';
        }
        
        if ($this->needs_payment) {
            return 'needs_payment';
        }
        
        if ($this->is_paid) {
            return 'approved';
        }
        
        return 'unpaid';
    }

    /**
     * Check if user can edit this resume
     */
    public function canBeEdited(): bool
    {
        // Users can always edit resumes, even if they're paid
        return true;
    }
} 