<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'provider_id',
        'provider_name',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_login_at' => 'datetime',
        ];
    }

    /**
     * Check if user has a password set
     */
    public function hasPassword(): bool
    {
        return !empty($this->password);
    }

    /**
     * Check if user was created via social login
     */
    public function isSocialUser(): bool
    {
        return !empty($this->provider_id) && !empty($this->provider_name);
    }

    /**
     * User roles constants
     */
    public const ROLE_USER = 'user';
    public const ROLE_ADMIN = 'admin';

    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    /**
     * Check if user is regular user
     */
    public function isUser(): bool
    {
        return $this->role === self::ROLE_USER;
    }

    /**
     * Check if email verification is recommended (not required)
     */
    public function isEmailVerificationRecommended(): bool
    {
        return !$this->hasVerifiedEmail() && !$this->isSocialUser();
    }

    /**
     * Get email verification status with recommendation
     */
    public function getEmailVerificationStatusAttribute(): array
    {
        if ($this->hasVerifiedEmail()) {
            return [
                'verified' => true,
                'status' => 'verified',
                'message' => 'Email verified',
                'recommended' => false
            ];
        }

        if ($this->isSocialUser()) {
            return [
                'verified' => false,
                'status' => 'social_user',
                'message' => 'Social login user - email verification not required',
                'recommended' => false
            ];
        }

        return [
            'verified' => false,
            'status' => 'unverified',
            'message' => 'Email not verified - recommended for security',
            'recommended' => true
        ];
    }

    /**
     * Scope to get only admin users
     */
    public function scopeAdmins(Builder $query): Builder
    {
        return $query->where('role', self::ROLE_ADMIN);
    }

    /**
     * Scope to get only regular users
     */
    public function scopeUsers(Builder $query): Builder
    {
        return $query->where('role', self::ROLE_USER);
    }

    /**
     * Get user's full name for display
     */
    public function getDisplayNameAttribute(): string
    {
        return trim($this->name) ?: $this->email;
    }

    /**
     * Update last login timestamp
     */
    public function updateLastLogin(): void
    {
        $this->update(['last_login_at' => now()]);
    }

    /**
     * Get user's resumes
     */
    public function resumes()
    {
        return $this->hasMany(Resume::class);
    }

    /**
     * Get user's payment proofs
     */
    public function paymentProofs()
    {
        return $this->hasMany(PaymentProof::class);
    }

    /**
     * Get user's completed resumes count
     */
    public function getCompletedResumesCountAttribute(): int
    {
        return $this->resumes()->where('status', Resume::STATUS_COMPLETED)->count();
    }

    /**
     * Get user's total resumes count
     */
    public function getTotalResumesCountAttribute(): int
    {
        return $this->resumes()->count();
    }

    /**
     * Send the password reset notification.
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new \App\Notifications\ResetPasswordNotification($token));
    }
}
