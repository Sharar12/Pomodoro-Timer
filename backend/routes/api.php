<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PomodoroController;

Route::post('/pomodoro/log', [PomodoroController::class, 'log']);
Route::get('/pomodoro/history', [PomodoroController::class, 'history']);
Route::get('/pomodoro/stats', [PomodoroController::class, 'stats']);