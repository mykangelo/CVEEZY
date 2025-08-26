<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ResumeController;
use App\Http\Controllers\PaymentProofController;
use App\Http\Controllers\AdminController;
use App\Models\Resume;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PaymentUploadController;
use App\Http\Controllers\FinalCheckController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\Auth\SocialAuthController;
use App\Http\Controllers\ChooseTemplateController;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Homepage
Route::get('/', [App\Http\Controllers\HomeController::class, 'index'])->name('home');

// Static Pages
Route::get('/privacy-policy', [App\Http\Controllers\StaticPageController::class, 'renderPage'])
    ->defaults('pageName', 'PrivacyPolicy')
    ->name('privacy.policy');
Route::get('/terms-and-conditions', [App\Http\Controllers\StaticPageController::class, 'renderPage'])
    ->defaults('pageName', 'TermsAndConditions')
    ->name('terms.conditions');
Route::get('/cookie-policy', [App\Http\Controllers\StaticPageController::class, 'renderPage'])
    ->defaults('pageName', 'CookiePolicy')
    ->name('cookie.policy');
Route::get('/payment-terms', [App\Http\Controllers\PaymentTermController::class, 'index'])->name('payment.terms');

// Contact
Route::get('/contact', [ContactController::class, 'index'])->name('contact');
Route::post('/contact', [ContactController::class, 'contactPost'])->name('contact.post');
Route::post('/contact-submit', [ContactController::class, 'submit'])->name('contact.submit');

// Public resume maker route
Route::get('/choose-resume-maker', [App\Http\Controllers\ChooseResumeMakerController::class, 'index'])
    ->name('choose.resume.maker');

/*
|--------------------------------------------------------------------------
| Social Authentication Routes
|--------------------------------------------------------------------------
*/

Route::get('/auth/{provider}/redirect', [SocialAuthController::class, 'redirectToProvider'])
    ->name('social.redirect');
Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'handleProviderCallback'])
    ->name('social.callback');

/*
|--------------------------------------------------------------------------
| Authenticated User Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth'])->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/data', [DashboardController::class, 'getDashboardData'])->name('dashboard.data');

    // Profile Management
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/send-verification-email', [ProfileController::class, 'sendVerificationEmail'])->name('profile.send-verification-email');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Resume Builder Flow
    Route::get('/choose-template', [ChooseTemplateController::class, 'index'])->name('choose.template');
    Route::get('/uploader', [App\Http\Controllers\UploaderController::class, 'index'])->name('uploader');
    Route::get('/builder', [App\Http\Controllers\BuilderController::class, 'index'])->name('builder');
    Route::get('/create-resume', [App\Http\Controllers\BuilderController::class, 'index'])->name('resume.builder');
    Route::get('/final-check', [FinalCheckController::class, 'index'])->name('final.check');

    // Resume Management
    Route::post('/resumes', [DashboardController::class, 'store'])->name('resumes.store');
    Route::get('/resumes/{resume}', [DashboardController::class, 'show'])->name('resumes.show');
    Route::get('/resumes/{resume}/payment-status', [DashboardController::class, 'paymentStatus'])->name('resumes.payment-status');
    Route::patch('/resumes/{resume}', [DashboardController::class, 'update'])->name('resumes.update');
    Route::patch('/resumes/{resume}/rename', [DashboardController::class, 'rename'])->name('resumes.rename');
    Route::patch('/resumes/{resume}/mark-modified', [DashboardController::class, 'markAsModifiedForEdit'])->name('resumes.mark-modified');
    Route::delete('/resumes/bulk-delete', [DashboardController::class, 'destroyMultiple'])->name('resumes.bulk-delete');
    Route::get('/resumes/{resume}/download', [DashboardController::class, 'download'])->name('resumes.download');
    Route::post('/resumes/{resume}/duplicate', [DashboardController::class, 'duplicate'])->name('resumes.duplicate');

    // Resume API
    Route::post('/save-resume', [ResumeController::class, 'store'])->name('resume.save');
    Route::get('/user/resume-status', [ResumeController::class, 'status'])->name('resume.status');
    Route::get('/resume/{id}', [ResumeController::class, 'show'])->name('resume.show');

    // Payment & Payment Proof Management
    Route::get('/payment', [PaymentController::class, 'index'])->name('payment.page');
    Route::get('/payment-upload', [PaymentUploadController::class, 'index'])->name('payment.upload.page');
    Route::post('/upload-payment-proof', [PaymentProofController::class, 'store'])->name('payment.upload');
    Route::get('/user/payment-proofs', [PaymentProofController::class, 'userPayments'])->name('payment.proofs');
});

// Admin JSON API for Audit Logs
Route::middleware(['auth'])->group(function () {
    Route::get('/admin/audit-logs/recent.json', [\App\Http\Controllers\Admin\AuditLogController::class, 'recentJson'])
        ->name('admin.audit-logs.recent');
});

// Resume maker with pending payment check
Route::middleware(['auth', 'verified', 'check.pending.payments'])->group(function () {
    Route::get('/choose-resume-maker-auth', [App\Http\Controllers\ChooseResumeMakerController::class, 'index'])
        ->name('choose.resume.maker.auth');
});

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'admin'])->group(function () {

    // Admin Dashboard
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/admin/dashboard-data', [AdminController::class, 'dashboardData'])->name('admin.dashboard.data');
    Route::get('/admin', function () {
        return Inertia::render('AdminPanel', ['user' => Auth::user()]);
    })->name('admin.panel');

    // Payment Management
    Route::get('/admin/payments', [AdminController::class, 'index'])->name('admin.payments');
    Route::get('/admin/payment/{id}/view', [AdminController::class, 'viewPaymentProof'])->name('admin.payment.view');
    Route::post('/admin/payment/{id}/approve', [AdminController::class, 'approve'])->name('admin.payment.approve');
    Route::post('/admin/payment/{id}/reject', [AdminController::class, 'reject'])->name('admin.payment.reject');

    // ✅ New route for serving files directly from storage/app/public
    Route::get('/admin/payments/{id}/download', [PaymentProofController::class, 'download'])->name('admin.payments.download');

    // User Management
    Route::get('/admin/users', [AdminController::class, 'users'])->name('admin.users');
    Route::get('/admin/users/{id}', [AdminController::class, 'viewUser'])->name('admin.user.view');

    // Resume Management
    Route::get('/admin/resumes', [AdminController::class, 'resumes'])->name('admin.resumes');
    Route::get('/admin/resumes/{id}', [AdminController::class, 'viewResume'])->name('admin.resume.view');
    Route::get('/admin/resumes/{id}/download', [AdminController::class, 'downloadResume'])->name('admin.resume.download');
    Route::delete('/admin/resumes/{id}', [AdminController::class, 'deleteResume'])->name('admin.resume.delete');
    Route::delete('/admin/resumes/bulk-delete/unfinished', [AdminController::class, 'bulkDeleteUnfinishedResumes'])->name('admin.resumes.bulk-delete-unfinished');
    Route::get('/admin/resumes/debug', [AdminController::class, 'debugResumes'])->name('admin.resumes.debug');

    // Statistics
    Route::get('/admin/statistics', [AdminController::class, 'statistics'])->name('admin.statistics');

    // Audit Logs - Security Monitoring
    Route::get('/admin/audit-logs', [App\Http\Controllers\Admin\AuditLogController::class, 'index'])->name('admin.audit-logs');
    Route::get('/admin/audit-logs/{auditLog}', [App\Http\Controllers\Admin\AuditLogController::class, 'show'])->name('admin.audit-logs.show');
    Route::get('/admin/audit-logs/export', [App\Http\Controllers\Admin\AuditLogController::class, 'export'])->name('admin.audit-logs.export');
    Route::post('/admin/audit-logs/cleanup', [App\Http\Controllers\Admin\AuditLogController::class, 'cleanup'])->name('admin.audit-logs.cleanup');
});

/*
|--------------------------------------------------------------------------
| Resume Parsing API Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified', 'throttle:10,1'])->prefix('api')->group(function () {
    Route::post('/resume/parse', [App\Http\Controllers\ResumeParsingController::class, 'parseResume'])->name('api.resume.parse');
    Route::post('/resume/preview', [App\Http\Controllers\ResumeParsingController::class, 'getParsingPreview'])->name('api.resume.preview');
});

/*
|--------------------------------------------------------------------------
| Configuration API for Frontend
|--------------------------------------------------------------------------
*/

// API route for frontend config (no auth required since it's public config)
Route::get('/api/config', function () {
    return response()->json([
        'resume' => [
            'max_skills_display' => config('resume.ai_enhancement.max_skills_display', 5),
            'ai_enhancement' => [
                'max_skills_display' => config('resume.ai_enhancement.max_skills_display', 5),
                'content_variations' => config('resume.ai_enhancement.content_variations', []),
                'temperature_range' => config('resume.ai_enhancement.temperature_range', []),
                'summary_length' => config('resume.ai_enhancement.summary_length', []),
            ],
            'templates' => config('resume.templates', []),
            'uploads' => config('resume.uploads', []),
        ]
    ]);
})->name('api.config');

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| AI Routing
|--------------------------------------------------------------------------
*/
use App\Http\Controllers\AIController;

Route::get('/ask-ai', [AIController::class, 'ask']);

// AI summary generation - now accessible to all authenticated users
Route::middleware(['auth'])->group(function () {
    Route::post('/generate-summary', [AIController::class, 'generateSummary']);
    Route::post('/reviseEducationDescription', [AIController::class, 'reviseEducationDescription']);
    Route::post('/revise-experience-text', [AIController::class, 'reviseExperienceDescription']);
    Route::post('/force-regenerate-experience', [AIController::class, 'forceRegenerateExperience']);
    Route::post('/improve-description', [AIController::class, 'improveDescription']);
});

//Routing for AI assistance in education page
Route::withoutMiddleware([
    \Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class,
])->group(function () {
    Route::post('/reviseEducationDescription', [AIController::class, 'reviseEducationDescription']);
});

//Routing for AI assistance in experience page
Route::withoutMiddleware([
    \Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class,
])->group(function () {
    Route::post('/revise-experience-text', [AIController::class, 'reviseExperienceDescription']);
    Route::post('/force-regenerate-experience', [AIController::class, 'forceRegenerateExperience']);
    Route::post('/improve-description', [AIController::class, 'improveDescription']);
});

require __DIR__ . '/auth.php';