<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentProof extends Model
{
    protected $fillable = [
        'user_id',
        'resume_id',
        'file_path',
        'status',
    ];

    // Optional: define casts
    protected $casts = [
        'status' => 'string',
    ];

    // Optional: relationships

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function resume()
    {
        return $this->belongsTo(Resume::class);
    }
}
