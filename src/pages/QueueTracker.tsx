import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../lib/firebase/config'
import { useTheme } from '../ThemeContext'
import {
  HeartPulse, ChevronLeft, Sun, Moon, Clock, Users,
  CheckCircle2, Timer, Activity, CalendarCheck, AlertCircle, RefreshCw
} from 'lucide-react'

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme()
  return (
    <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
      <span className="theme-toggle-thumb">
        {isDark ? <Moon size={11} color="white" /> : <Sun size={11} color="white" />}
      </span>
    </button>
  )
}

const statusConfig: Record<string, { label: string; bg: string; color: string; Icon: any; step: number }> = {
  booked:    { label: 'Booked',     bg: 'var(--sky-light)',    color: 'var(--sky-accent)',    Icon: CalendarCheck, step: 1 },
  checkedIn: { label: 'Checked In', bg: 'var(--teal-light)',   color: 'var(--teal-primary)',  Icon: CheckCircle2,  step: 2 },
  waiting:   { label: 'Waiting',    bg: 'var(--amber-light)',  color: 'var(--amber)',          Icon: Timer,         step: 3 },
  serving:   { label: 'Now Serving',bg: 'var(--violet-light)', color: 'var(--violet)',         Icon: Activity,      step: 4 },
  completed: { label: 'Completed',  bg: 'var(--teal-light)',   color: 'var(--teal-primary)',  Icon: CheckCircle2,  step: 5 },
  cancelled: { label: 'Cancelled',  bg: 'var(--red-light)',    color: 'var(--red-emergency)', Icon: AlertCircle,   step: 0 },
}

const STEPS = ['Booked', 'Checked In', 'Waiting', 'Serving', 'Done']

export default function QueueTracker() {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser: any) => {
      if (!firebaseUser) { navigate('/login'); return }
      const q = query(collection(db, 'appointments'), where('patientId', '==', firebaseUser.uid))
      onSnapshot(q, (snapshot) => {
        const all = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        setAppointments(all)
        setLastUpdated(new Date())
        setLoading(false)
      })
    })
    return () => unsubscribe()
  }, [])

  const activeAppts = appointments.filter(a =>
    ['booked', 'checkedIn', 'waiting', 'serving'].includes(a.status)
  )
  const pastAppts = appointments.filter(a =>
    ['completed', 'cancelled'].includes(a.status)
  )

  return (
    <div className="mesh-bg" style={{ minHeight: '100vh' }}>
      <nav className="navbar sticky top-0 z-50 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm font-medium hover:opacity-80"
            style={{ color: 'var(--teal-primary)' }}>
            <ChevronLeft size={18} /> Dashboard
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--gradient-hero)' }}>
              <HeartPulse size={16} color="white" />
            </div>
            <span className="font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--teal-primary)' }}>
              My Queue
            </span>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 page-transition">

        {/* Live indicator */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>
            Queue Status
          </h1>
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full"
            style={{ background: 'var(--teal-light)', color: 'var(--teal-primary)', border: '1px solid var(--border)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 pulse-ring" />
            Live · {lastUpdated.toLocaleTimeString()}
          </div>
        </div>

        {loading ? (
          <div className="card rounded-2xl p-10 text-center">
            <RefreshCw size={28} className="animate-spin mx-auto mb-3" style={{ color: 'var(--teal-primary)' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading queue data...</p>
          </div>
        ) : activeAppts.length === 0 && pastAppts.length === 0 ? (
          <div className="card rounded-3xl p-10 text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'var(--teal-light)' }}>
              <Users size={28} style={{ color: 'var(--teal-primary)' }} />
            </div>
            <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>No Queue Entries</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Book an appointment to join a queue</p>
            <button onClick={() => navigate('/book')} className="btn-primary">
              Book Appointment
            </button>
          </div>
        ) : (
          <div className="space-y-5">

            {/* Active appointments */}
            {activeAppts.map(appt => {
              const s = statusConfig[appt.status] || statusConfig.booked
              return (
                <div key={appt.id} className="card rounded-3xl overflow-hidden">
                  {/* Gradient header */}
                  <div className="p-5 text-white relative overflow-hidden"
                    style={{ background: 'var(--gradient-hero)' }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 translate-x-8 -translate-y-8"
                      style={{ background: 'white' }} />
                    <div className="flex items-center justify-between relative">
                      <div>
                        <div className="text-white/75 text-xs font-medium mb-1 flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-300 pulse-ring" />
                          Active
                        </div>
                        <div className="text-3xl font-extrabold token-mono">
                          Token #{appt.tokenNumber || '—'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-extrabold token-mono">
                          {appt.estimatedWait ?? '—'}
                        </div>
                        <div className="text-white/70 text-xs">mins wait</div>
                      </div>
                    </div>
                  </div>

                  {/* Step tracker */}
                  <div className="p-5">
                    <div className="flex items-center gap-1 mb-4">
                      {STEPS.map((step, i) => (
                        <div key={step} className="flex items-center flex-1">
                          <div className="flex flex-col items-center flex-1">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1"
                              style={{
                                background: s.step > i ? 'var(--teal-primary)' : s.step === i + 1 ? 'var(--gradient-hero)' : 'var(--bg-muted)',
                                color: s.step >= i + 1 ? 'white' : 'var(--text-faint)'
                              }}>
                              {s.step > i ? <CheckCircle2 size={12} /> : i + 1}
                            </div>
                            <span className="text-xs text-center hidden sm:block"
                              style={{ color: s.step === i + 1 ? 'var(--teal-primary)' : 'var(--text-faint)', fontSize: '0.65rem' }}>
                              {step}
                            </span>
                          </div>
                          {i < STEPS.length - 1 && (
                            <div className="flex-1 h-0.5 mb-4 rounded"
                              style={{ background: s.step > i + 1 ? 'var(--teal-primary)' : 'var(--border-muted)' }} />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Status badge */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                        style={{ background: s.bg, color: s.color }}>
                        <s.Icon size={11} /> {s.label}
                      </span>
                      {appt.symptoms && (
                        <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                          {appt.symptoms}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Past appointments */}
            {pastAppts.length > 0 && (
              <div>
                <h2 className="font-bold text-sm mb-3 flex items-center gap-2"
                  style={{ color: 'var(--text-faint)', fontFamily: 'Sora, sans-serif' }}>
                  <Clock size={14} /> Past Visits
                </h2>
                <div className="space-y-3">
                  {pastAppts.map(appt => {
                    const s = statusConfig[appt.status] || statusConfig.completed
                    return (
                      <div key={appt.id} className="card rounded-2xl p-4 flex items-center justify-between stagger-item">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'var(--teal-light)' }}>
                            <HeartPulse size={18} style={{ color: 'var(--teal-primary)' }} />
                          </div>
                          <div>
                            <div className="font-semibold token-mono text-sm" style={{ color: 'var(--text-primary)' }}>
                              Token #{appt.tokenNumber || '—'}
                            </div>
                            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                              {appt.symptoms || 'No symptoms noted'}
                            </div>
                          </div>
                        </div>
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: s.bg, color: s.color }}>
                          <s.Icon size={10} /> {s.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}