<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PaymentProofController;
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
Route::get('/', function () {
    return Inertia::render('HomePage', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('home');

// Static Pages
Route::inertia('/privacy-policy', 'PrivacyPolicy')->name('privacy.policy');
Route::inertia('/contact', 'Contact')->name('contact');

/*
|--------------------------------------------------------------------------
| Resume Builder Flow Routes
|--------------------------------------------------------------------------
*/

// Resume builder pages - require authentication for data persistence
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/choose-template', [ChooseTemplateController::class, 'index'])->name('choose.template');
    Route::inertia('/choose-resume-maker', 'ChooseResumeMaker')->name('choose.resume.maker');
    Route::inertia('/uploader', 'Uploader')->name('uploader');
    Route::inertia('/builder', 'Builder')->name('builder');
});

/*
|--------------------------------------------------------------------------
| Static Routes
|--------------------------------------------------------------------------
*/

Route::inertia('/terms-and-conditions', 'TermsAndConditions')->name('terms.conditions');
Route::inertia('/cookie-policy', 'CookiePolicy')->name('cookie.policy');
Route::inertia('/payment-terms', 'PaymentTerm')->name('payment.terms');

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

    // Payment Proof Management
    Route::post('/upload-payment-proof', [PaymentProofController::class, 'store'])->middleware(['auth', 'verified'])->name('payment.upload');
    Route::get('/user/payment-proofs', [PaymentProofController::class, 'userPayments'])->name('payment.proofs');
    Route::get('/payment-upload', [PaymentUploadController::class, 'index'])->name('payment.upload.page');
    Route::get('/final-check', [FinalCheckController::class, 'index'])->name('final.check');
    Route::get('/payment', [PaymentController::class, 'index'])->name('payment');

    // Profile Management
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');

    // Admin Payment Management
    Route::get('/admin/payments', [AdminController::class, 'index'])->name('admin.payments');
    Route::post('/admin/payment/{id}/approve', [AdminController::class, 'approve'])->name('admin.payment.approve');
    Route::post('/admin/payment/{id}/reject', [AdminController::class, 'reject'])->name('admin.payment.reject');

    // Admin User Management
    Route::get('/admin/users/{id}', [AdminController::class, 'viewUser'])->name('admin.user.view');

    // Admin Resume Management
    Route::get('/admin/resumes/{id}', [AdminController::class, 'viewResume'])->name('admin.resume.view');
    Route::get('/admin/resumes/{id}/download', [AdminController::class, 'downloadResume'])->name('admin.resume.download');

    // Admin Data Endpoints
    Route::get('/admin/users', [AdminController::class, 'users'])->name('admin.users');
    Route::get('/admin/resumes', [AdminController::class, 'resumes'])->name('admin.resumes');
    Route::get('/admin/statistics', [AdminController::class, 'statistics'])->name('admin.statistics');
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


/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

require __DIR__.'/auth.php';
