<?php

namespace App\Http\Controllers;

use App\Models\PomodoroSession;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class PomodoroController extends Controller
{
    public function log(Request $request)
    {
        $validated = $request->validate([
            'session_type' => 'required|string|in:focus,short_break,long_break',
            'duration_seconds' => 'required|integer|min:1',
            'session_number' => 'required|integer|min:1',
        ]);

        $session = PomodoroSession::create([
            'session_type' => $validated['session_type'],
            'duration_seconds' => $validated['duration_seconds'],
            'session_number' => $validated['session_number'],
            'completed_at' => now(),
        ]);

        return response()->json($session, 201);
    }

    public function history()
    {
        $sessions = PomodoroSession::orderBy('completed_at', 'desc')
            ->limit(20)
            ->get();

        return response()->json($sessions);
    }

    public function stats()
    {
        $today = Carbon::today();

        $focusSessions = PomodoroSession::where('session_type', 'focus')
            ->where('completed_at', '>=', $today)
            ->get();

        $totalSessions = $focusSessions->count();
        $totalMinutes = $focusSessions->sum('duration_seconds') / 60;

        return response()->json([
            'total_sessions' => $totalSessions,
            'total_focus_minutes' => round($totalMinutes, 1),
        ]);
    }
}
