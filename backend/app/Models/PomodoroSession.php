<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PomodoroSession extends Model
{
    protected $fillable = [
        'session_type',
        'duration_seconds',
        'session_number',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'completed_at' => 'datetime',
        ];
    }
}
