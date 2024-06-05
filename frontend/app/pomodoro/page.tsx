'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const API = 'http://localhost:8000/api/pomodoro'
const STORAGE_KEY = 'pomodoro-durations'

type SessionType = 'focus' | 'short_break' | 'long_break'

interface Durations {
  focus: number
  shortBreak: number
  longBreak: number
}

const DEFAULT: Durations = { focus: 25, shortBreak: 5, longBreak: 15 }

export default function Pomodoro() {
  const [seconds, setSeconds] = useState(DEFAULT.focus * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionType, setSessionType] = useState<SessionType>('focus')
  const [completedFocusCount, setCompletedFocusCount] = useState(0)
  const [durations, setDurations] = useState<Durations>(DEFAULT)
  const [showSettings, setShowSettings] = useState(false)
  const [todayStats, setTodayStats] = useState({ total_sessions: 0, total_focus_minutes: 0 })

  const completedFlag = useRef(false)
  const sessionTypeRef = useRef(sessionType)
  const countRef = useRef(completedFocusCount)
  const durRef = useRef(durations)

  useEffect(() => { sessionTypeRef.current = sessionType }, [sessionType])
  useEffect(() => { countRef.current = completedFocusCount }, [completedFocusCount])
  useEffect(() => { durRef.current = durations }, [durations])

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const p = JSON.parse(saved) as Durations
        setDurations(p)
        setSeconds(p.focus * 60)
      } catch { /* ignore */ }
    }
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const r = await fetch(`${API}/stats`)
      if (r.ok) setTodayStats(await r.json())
    } catch { /* ignore */ }
  }

  const playBeep = () => {
    try {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 800
      gain.gain.value = 0.3
      osc.start()
      osc.stop(ctx.currentTime + 0.3)
    } catch { /* ignore */ }
  }

  const notify = (title: string, msg: string) => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, { body: msg })
    }
  }

  const handleComplete = useCallback(() => {
    setIsRunning(false)
    playBeep()
    const type = sessionTypeRef.current
    const count = countRef.current
    const dur = durRef.current

    if (type === 'focus') {
      const nextCount = count + 1
      setCompletedFocusCount(nextCount)
      notify('Focus Complete!', 'Great work! Take a break.')

      fetch(`${API}/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_type: 'focus',
          duration_seconds: dur.focus * 60,
          session_number: nextCount,
        }),
      }).then(() => fetchStats()).catch(() => {})

      const next: SessionType = nextCount >= 4 ? 'long_break' : 'short_break'
      const secs = next === 'long_break' ? dur.longBreak * 60 : dur.shortBreak * 60
      setSessionType(next)
      setSeconds(secs)
    } else {
      const label = type === 'short_break' ? 'Short Break Over' : 'Long Break Over'
      notify(label, 'Time to focus!')
      if (type === 'long_break') setCompletedFocusCount(0)
      setSessionType('focus')
      setSeconds(dur.focus * 60)
    }
  }, [])

  useEffect(() => {
    if (!isRunning) {
      completedFlag.current = false
      return
    }
    const id = setInterval(() => {
      setSeconds(p => {
        if (p <= 1) {
          return 0
        }
        return p - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [isRunning])

  useEffect(() => {
    if (seconds === 0 && isRunning && !completedFlag.current) {
      completedFlag.current = true
      handleComplete()
    }
  }, [seconds, isRunning, handleComplete])

  const toggle = () => {
    if (!isRunning && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    setIsRunning(p => !p)
  }

  const reset = () => {
    setIsRunning(false)
    const dur = durRef.current
    const s = sessionType === 'focus' ? dur.focus * 60
      : sessionType === 'short_break' ? dur.shortBreak * 60
      : dur.longBreak * 60
    setSeconds(s)
  }

  const switchTab = (t: SessionType) => {
    setIsRunning(false)
    setSessionType(t)
    const dur = durRef.current
    const s = t === 'focus' ? dur.focus * 60
      : t === 'short_break' ? dur.shortBreak * 60
      : dur.longBreak * 60
    setSeconds(s)
  }

  const updateDuration = (key: keyof Durations, raw: number) => {
    if (isNaN(raw) || raw < 1) return
    const clamped = Math.min(120, Math.round(raw))
    const next = { ...durRef.current, [key]: clamped }
    setDurations(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    if (!isRunning) {
      const cur = sessionTypeRef.current
      const mapKey = cur === 'focus' ? 'focus' : cur === 'short_break' ? 'shortBreak' : 'longBreak'
      if (key === mapKey) setSeconds(clamped * 60)
    }
  }

  const fmt = (t: number) => {
    const m = Math.floor(t / 60)
    const s = t % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const tabStyle = (t: SessionType) => {
    if (sessionType !== t) return 'bg-gray-700 hover:bg-gray-600 text-gray-300'
    if (t === 'focus') return 'bg-red-500 text-white'
    if (t === 'short_break') return 'bg-green-500 text-white'
    return 'bg-blue-500 text-white'
  }

  return (
    <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md">
      <div className="flex gap-2 mb-6">
        {(['focus', 'short_break', 'long_break'] as const).map(t => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${tabStyle(t)}`}
          >
            {t === 'focus' ? 'Focus' : t === 'short_break' ? 'Short Break' : 'Long Break'}
          </button>
        ))}
      </div>

      <div className="text-7xl font-mono font-bold text-white text-center mb-4 tracking-wider">
        {fmt(seconds)}
      </div>

      <div className="text-center text-gray-400 text-sm mb-6">
        Session {Math.min(completedFocusCount + 1, 4)} of 4
      </div>

      <button
        onClick={toggle}
        className="w-full py-3 rounded-xl text-lg font-semibold transition-colors bg-blue-600 hover:bg-blue-500 text-white"
      >
        {isRunning ? 'Pause' : 'Start'}
      </button>

      <button
        onClick={reset}
        className="w-full py-2 rounded-xl text-sm transition-colors bg-gray-700 hover:bg-gray-600 text-gray-300 mt-2"
      >
        Reset
      </button>

      <button
        onClick={() => setShowSettings(p => !p)}
        className="w-full text-center text-gray-400 hover:text-white text-sm mt-4 transition-colors"
      >
        {showSettings ? '▼' : '▶'} Settings
      </button>

      {showSettings && (
        <div className="mt-4 space-y-3 p-4 bg-gray-800 rounded-xl">
          {([
            { k: 'focus' as const, label: 'Focus' },
            { k: 'shortBreak' as const, label: 'Short Break' },
            { k: 'longBreak' as const, label: 'Long Break' },
          ]).map(({ k, label }) => (
            <div key={k} className="flex items-center justify-between">
              <label className="text-gray-300 text-sm">{label} (min)</label>
              <input
                type="number"
                min={1}
                max={120}
                value={durations[k]}
                onChange={e => updateDuration(k, e.target.valueAsNumber)}
                className="w-20 text-center bg-gray-700 text-white rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
      )}

      <div className="text-center text-gray-400 text-sm mt-4">
        Today: {todayStats.total_sessions} sessions · {todayStats.total_focus_minutes} min focus
      </div>
    </div>
  )
}
