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
        Schema::table('resumes', function (Blueprint $table) {
            $table->timestamp('last_paid_at')->nullable()->after('is_paid')->comment('When the resume was last paid for');
            $table->timestamp('last_modified_at')->nullable()->after('last_paid_at')->comment('When the resume was last modified');
            $table->boolean('needs_payment')->default(false)->after('last_modified_at')->comment('Whether resume needs payment due to modifications');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('resumes', function (Blueprint $table) {
            $table->dropColumn(['last_paid_at', 'last_modified_at', 'needs_payment']);
        });
    }
};
