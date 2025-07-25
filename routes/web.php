<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\AuthenticatedSessionController;

Route::get('/', function () {
    return Inertia::render('HomePage');
});

Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');


