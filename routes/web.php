<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AdminController;

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
| Authenticated User Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {
    // User Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');
    
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
| Authentication Routes
|--------------------------------------------------------------------------
*/

require __DIR__.'/auth.php';