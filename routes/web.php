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
Route::get('/privacy-policy', [App\Http\Controllers\StaticPageController::class, 'renderPage'])->defaults('pageName', 'PrivacyPolicy')->name('privacy.policy');
Route::get('/contact', [App\Http\Controllers\ContactController::class, 'index'])->name('contact');
Route::post('/contact-submit', [ContactController::class, 'submit'])->name('contact.submit');

/*
|--------------------------------------------------------------------------
| Resume Builder Flow Routes
|--------------------------------------------------------------------------
*/

// Resume builder pages - require authentication for data persistence
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/choose-template', [ChooseTemplateController::class, 'index'])->name('choose.template');
    Route::get('/uploader', [App\Http\Controllers\UploaderController::class, 'index'])->name('uploader');
    Route::get('/builder', [App\Http\Controllers\BuilderController::class, 'index'])->name('builder');
});

// Resume creation routes with pending payment check
Route::middleware(['auth', 'verified', 'check.pending.payments'])->group(function () {
    Route::get('/choose-resume-maker', [App\Http\Controllers\ChooseResumeMakerController::class, 'index'])->name('choose.resume.maker');
});

// Public route for template selection
Route::get('/choose-resume-maker', [App\Http\Controllers\ChooseResumeMakerController::class, 'index'])->name('choose.resume.maker');

/*
|--------------------------------------------------------------------------
| Static Routes
|--------------------------------------------------------------------------
*/

Route::get('/terms-and-conditions', [App\Http\Controllers\StaticPageController::class, 'renderPage'])->defaults('pageName', 'TermsAndConditions')->name('terms.conditions');
Route::get('/cookie-policy', [App\Http\Controllers\StaticPageController::class, 'renderPage'])->defaults('pageName', 'CookiePolicy')->name('cookie.policy');
Route::get('/payment-terms', [App\Http\Controllers\PaymentTermController::class, 'index'])->name('payment.terms');

// Contact form submission
Route::post('/contact', [ContactController::class, 'contactPost'])->name('contact.post');

/*
|--------------------------------------------------------------------------
| Authenticated User Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {
    // User Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Resume Management
    Route::post('/resumes', [DashboardController::class, 'store'])->name('resumes.store');
    Route::get('/resumes/{resume}', [DashboardController::class, 'show'])->name('resumes.show');
    Route::patch('/resumes/{resume}', [DashboardController::class, 'update'])->name('resumes.update');
    Route::delete('/resumes/bulk-delete', [DashboardController::class, 'destroyMultiple'])->name('resumes.bulk-delete');
    Route::get('/resumes/{resume}/download', [DashboardController::class, 'download'])->name('resumes.download');
    Route::post('/resumes/{resume}/duplicate', [DashboardController::class, 'duplicate'])->name('resumes.duplicate');
    
    // Dashboard API
    Route::get('/dashboard/data', [DashboardController::class, 'getDashboardData'])->name('dashboard.data');
    
    // New Resume Routes
    Route::get('/create-resume', [App\Http\Controllers\BuilderController::class, 'index'])->name('resume.builder');
    Route::post('/save-resume', [ResumeController::class, 'store'])->name('resume.save');
    Route::get('/user/resume-status', [ResumeController::class, 'status'])->name('resume.status');
    Route::get('/resume/{id}', [ResumeController::class, 'show'])->name('resume.show');

    


    // Payment Proof Management
    Route::post('/upload-payment-proof', [PaymentProofController::class, 'store'])->middleware(['auth', 'verified'])->name('payment.upload');
    Route::get('/user/payment-proofs', [PaymentProofController::class, 'userPayments'])->name('payment.proofs');
    Route::get('/payment-upload', [PaymentUploadController::class, 'index'])->name('payment.upload.page');
    Route::get('/final-check', [FinalCheckController::class, 'index'])->name('final.check');
    Route::inertia('/payment', 'Payment')->name('payment.page');

    // Profile Management
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Payment proof routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/upload-payment-proof', [PaymentProofController::class, 'store'])->name('payment-proof.store');
    Route::get('/user/payment-proofs', [PaymentProofController::class, 'getUserPaymentProofs'])->name('payment-proof.user');
});

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/admin/dashboard-data', [AdminController::class, 'dashboardData'])->name('admin.dashboard.data');
    Route::get('/admin/payments', [AdminController::class, 'index'])->name('admin.payments');
    Route::post('/admin/payment/{id}/approve', [AdminController::class, 'approve'])->name('admin.payment.approve');
    Route::post('/admin/payment/{id}/reject', [AdminController::class, 'reject'])->name('admin.payment.reject');
    
    // User and Resume Management
    Route::get('/admin/users/{id}', [AdminController::class, 'viewUser'])->name('admin.user.view');
    Route::get('/admin/resumes/{id}', [AdminController::class, 'viewResume'])->name('admin.resume.view');
    Route::get('/admin/resumes/{id}/download', [AdminController::class, 'downloadResume'])->name('admin.resume.download');
    Route::delete('/admin/resumes/{id}', [AdminController::class, 'deleteResume'])->name('admin.resume.delete');
    
    // API endpoints for admin dashboard
    Route::get('/admin/users', [AdminController::class, 'users'])->name('admin.users');
    Route::get('/admin/resumes', [AdminController::class, 'resumes'])->name('admin.resumes');
    Route::get('/admin/statistics', [AdminController::class, 'statistics'])->name('admin.statistics');
});

// New Admin Panel Routes
Route::middleware(['auth'])->group(function () {
    Route::get('/admin', function () {
        $user = Auth::user();
        if (!$user || !$user->is_admin) {
            abort(403, 'Unauthorized');
        }
        return Inertia::render('AdminPanel', ['user' => $user]);
    })->name('admin.panel');

    // API routes for admin actions
    Route::get('/admin/payments', [AdminController::class, 'index']);
    Route::get('/admin/payment/{id}/view', [AdminController::class, 'viewPaymentProof']);
    Route::post('/admin/payment/{id}/approve', [AdminController::class, 'approve']);
    Route::post('/admin/payment/{id}/reject', [AdminController::class, 'reject']);
});

/*
|--------------------------------------------------------------------------
| Social Login Routes
|--------------------------------------------------------------------------
*/

Route::get('/auth/{provider}/redirect', [SocialAuthController::class, 'redirectToProvider'])->name('social.redirect');
Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'handleProviderCallback'])->name('social.callback');

// Test route to check Google OAuth configuration
Route::get('/test-google-config', function () {
    try {
        $config = config('services.google');
        return response()->json([
            'client_id' => $config['client_id'] ? 'Set' : 'Not set',
            'client_secret' => $config['client_secret'] ? 'Set' : 'Not set',
            'redirect' => $config['redirect'],
            'provider' => 'google'
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()]);
    }
});

// Test route to simulate Google callback
Route::get('/test-callback', function () {
    return response()->json([
        'message' => 'Callback route is accessible',
        'url' => request()->url(),
        'method' => request()->method()
    ]);
});

// Test route to check if callback is being called
Route::get('/auth/google/test', function () {
    return response()->json([
        'message' => 'Google callback test route',
        'provider' => 'google',
        'timestamp' => now()->toISOString()
    ]);
});

// Test route to verify Google OAuth flow
Route::get('/test-google-flow', function () {
    try {
        $config = config('services.google');
        $redirectUrl = route('social.redirect', ['provider' => 'google']);
        
        return response()->json([
            'status' => 'success',
            'config' => [
                'client_id' => $config['client_id'] ? 'Set' : 'Not set',
                'client_secret' => $config['client_secret'] ? 'Set' : 'Not set',
                'redirect' => $config['redirect'],
            ],
            'redirect_url' => $redirectUrl,
            'callback_url' => route('social.callback', ['provider' => 'google']),
            'dashboard_url' => route('dashboard'),
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage()
        ]);
    }
});

// Test route to check authentication
Route::get('/test-auth', function () {
    return response()->json([
        'authenticated' => auth()->check(),
        'user' => auth()->user(),
        'session_id' => session()->getId(),
    ]);
});

// Test route to debug payment upload
Route::post('/test-payment-upload', function (Request $request) {
    \Log::info('Test payment upload', [
        'request_data' => $request->all(),
        'files' => $request->allFiles(),
        'headers' => $request->headers->all()
    ]);
    
    return response()->json([
        'message' => 'Test upload received',
        'data' => $request->all(),
        'files' => $request->allFiles()
    ]);
})->middleware(['auth', 'verified']);

// Test route to check authentication and resume creation
Route::post('/test-resume-creation', function (Request $request) {
    \Log::info('Test resume creation', [
        'user_id' => auth()->id(),
        'user' => auth()->user(),
        'request_data' => $request->all(),
        'headers' => $request->headers->all()
    ]);
    
    return response()->json([
        'message' => 'Test resume creation received',
        'user_id' => auth()->id(),
        'user_authenticated' => auth()->check(),
        'data' => $request->all()
    ]);
})->middleware(['auth', 'verified']);


/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

require __DIR__.'/auth.php';
