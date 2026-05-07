<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\SuperadminController;

Route::get('/', function () {
    if (auth()->check()) {
        if (auth()->user()->role === 'superadmin') {
            return redirect()->route('superadmin.dashboard');
        }
        // Logout non-superadmin users automatically
        auth()->logout();
        return redirect()->route('login')->withErrors(['email' => 'Hanya Superadmin yang dapat mengakses sistem ini.']);
    }
    return redirect()->route('login');
});

Route::middleware(['guest'])->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
    Route::post('/firebase-login', [AuthController::class, 'firebaseLogin']);
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    
    Route::prefix('superadmin')->name('superadmin.')->middleware('superadmin')->group(function () {
        Route::get('/dashboard', [SuperadminController::class, 'dashboard'])->name('dashboard');
        Route::get('/users', [SuperadminController::class, 'users'])->name('users.index');
        Route::post('/users/{id}/apikey', [SuperadminController::class, 'generateApiKey'])->name('users.apikey');
        Route::post('/users/{id}/subscription', [SuperadminController::class, 'manageSubscription'])->name('users.subscription');

        // Kelola Akun sub-pages
        Route::get('/sekolah', [SuperadminController::class, 'sekolah'])->name('sekolah');
        Route::get('/universitas', [SuperadminController::class, 'universitas'])->name('universitas');
        Route::get('/perusahaan', [SuperadminController::class, 'perusahaan'])->name('perusahaan');
        Route::get('/pengaturan', [SuperadminController::class, 'pengaturan'])->name('pengaturan');
        Route::delete('/logs/clear', [SuperadminController::class, 'clearLogs'])->name('logs.clear');
        Route::post('/users/{id}/change-password', [SuperadminController::class, 'changePassword'])->name('users.changePassword');
        Route::delete('/users/{id}', [SuperadminController::class, 'deleteUser'])->name('users.delete');
        Route::post('/users/store', [SuperadminController::class, 'storeUser'])->name('users.store');
        Route::put('/users/{id}', [SuperadminController::class, 'updateUser'])->name('users.update');
        Route::post('/users/{id}/profile', [SuperadminController::class, 'updateProfile'])->name('users.profile');
    });
});
