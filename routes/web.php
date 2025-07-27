<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\AuthenticatedSessionController;

Route::get('/', function () {
    return Inertia::render('HomePage');
});

Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');

Route::inertia('/privacy-policy', 'PrivacyPolicy');
Route::inertia('/contact', 'Contact');
Route::inertia('/choose-template', 'ChooseTemplate');
Route::inertia('/choose-resume-maker', 'ChooseResumeMaker');
Route::inertia('/uploader', 'Uploader');
Route::inertia('/builder', 'Builder');
Route::inertia('/final-check', 'FinalCheck');


