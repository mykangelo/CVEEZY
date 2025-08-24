<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('event_type'); // login_success, login_failed, logout, etc.
            $table->string('user_email')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('ip_address');
            $table->text('user_agent');
            $table->string('route_name')->nullable();
            $table->json('context')->nullable(); // Additional data
            $table->string('status')->default('info'); // info, warning, alert, error
            $table->timestamp('created_at');
            
            // Indexes for better query performance
            $table->index(['event_type', 'created_at']);
            $table->index(['user_id', 'created_at']);
            $table->index(['ip_address', 'created_at']);
            $table->index(['status', 'created_at']);
            $table->index('created_at');
            
            // Foreign key to users table
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
