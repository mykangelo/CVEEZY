<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Auth\SocialAuthController;


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
    Route::inertia('/choose-template', 'ChooseTemplate')->name('choose.template');
    Route::inertia('/choose-resume-maker', 'ChooseResumeMaker')->name('choose.resume.maker');
    Route::inertia('/uploader', 'Uploader')->name('uploader');
    Route::inertia('/builder', 'Builder')->name('builder');
    Route::inertia('/final-check', 'FinalCheck')->name('final.check');
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
    Route::delete('/resumes/bulk-delete', [DashboardController::class, 'destroyMultiple'])->name('resumes.bulk-delete');
    Route::get('/resumes/{resume}/download', [DashboardController::class, 'download'])->name('resumes.download');
    Route::post('/resumes/{resume}/duplicate', [DashboardController::class, 'duplicate'])->name('resumes.duplicate');

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
    Route::get('/admin/dashboard', function () {
        return Inertia::render('AdminDashboard');
    })->name('admin.dashboard');
});

/*
|--------------------------------------------------------------------------
| Social Login Routes
|--------------------------------------------------------------------------
*/

Route::get('/auth/{provider}/redirect', [SocialAuthController::class, 'redirectToProvider']);
Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'handleProviderCallback']);


/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

require __DIR__.'/auth.php';
