import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { auth, db } from '../lib/firebase/config'
import { useTheme } from '../ThemeContext'
import {
  HeartPulse, Clock, LogOut, CalendarPlus, Ticket,
  Brain, Building2, Sun, Moon, ChevronRight,
  CalendarCheck, Activity, AlertCircle, CheckCircle2,
  Timer, Loader2, Users, XCircle, Home
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

const statusConfig: Record<string, { label: string; bg: string; color: string; Icon: any }> = {
  booked:    { label: 'Booked',     bg: 'var(--sky-light)',    color: 'var(--sky-accent)',    Icon: CalendarCheck },
  checkedIn: { label: 'Checked In', bg: 'var(--teal-light)',   color: 'var(--teal-primary)',  Icon: CheckCircle2 },
  waiting:   { label: 'Waiting',    bg: 'var(--amber-light)',  color: 'var(--amber)',          Icon: Timer },
  serving:   { label: 'Serving',    bg: 'var(--violet-light)', color: 'var(--violet)',         Icon: Activity },
  completed: { label: 'Completed',  bg: 'var(--teal-light)',   color: 'var(--teal-primary)',  Icon: CheckCircle2 },
  cancelled: { label: 'Cancelled',  bg: 'var(--red-light)',    color: 'var(--red-emergency)', Icon: AlertCircle },
  absent:    { label: 'Absent',     bg: 'var(--red-light)',    color: 'var(--red-emergency)', Icon: AlertCircle },
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [time, setTime] = useState(new Date())
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null)
  // Live queue count per doctor
  const [queueCounts, setQueueCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: any) => {
      if (!firebaseUser) { navigate('/login'); return }
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
      if (userDoc.exists()) setUser(userDoc.data())
      const q = query(collection(db, 'appointments'), where('patientId', '==', firebaseUser.uid))
      onSnapshot(q, (snapshot) => {
        const appts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        setAppointments(appts)
        setLoading(false)

        // For each active appointment, subscribe to live queue count for that doctor
        appts.forEach((appt: any) => {
          if (!appt.doctorId || !['booked','checkedIn','waiting','serving'].includes(appt.status)) return
          const queueQuery = query(
            collection(db, 'appointments'),
            where('doctorId', '==', appt.doctorId),
            where('status', 'in', ['booked', 'checkedIn', 'waiting', 'serving'])
          )
          onSnapshot(queueQuery, (snap) => {
            // Count patients with lower token number (ahead in queue)
            const myToken = appt.tokenNumber || 999
            const ahead = snap.docs.filter(d => {
              const data = d.data()
              return data.tokenNumber < myToken && d.id !== appt.id
            }).length
            setQueueCounts(prev => ({ ...prev, [appt.id]: ahead }))
          })
        })
      })
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto-cancel absent patients: if status=waiting and scheduledTime was 15+ min ago
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      appointments.forEach(async (appt: any) => {
        if (!['waiting', 'booked'].includes(appt.status)) return
        if (!appt.slot || !appt.date) return
        // Parse slot time  e.g. "9:00 AM"
        const slotDateTime = parseSlotDateTime(appt.date, appt.slot)
        if (!slotDateTime) return
        const minutesPast = (now.getTime() - slotDateTime.getTime()) / 60000
        if (minutesPast >= 15) {
          // Mark as absent
          try {
            await updateDoc(doc(db, 'appointments', appt.id), {
              status: 'absent',
              cancelledAt: new Date(),
              cancelReason: 'Auto-cancelled: patient not present after 15 minutes',
            })
          } catch (e) { /* silently fail */ }
        }
      })
    }, 30000) // check every 30 seconds
    return () => clearInterval(interval)
  }, [appointments])

  const parseSlotDateTime = (date: string, slot: string): Date | null => {
    try {
      const [timePart, ampm] = slot.split(' ')
      let [hours, minutes] = timePart.split(':').map(Number)
      if (ampm === 'PM' && hours !== 12) hours += 12
      if (ampm === 'AM' && hours === 12) hours = 0
      const d = new Date(date)
      d.setHours(hours, minutes, 0, 0)
      return d
    } catch { return null }
  }

  const handleLogout = async () => { await signOut(auth); navigate('/') }

  const handleCancelAppointment = async (apptId: string) => {
    setCancellingId(apptId)
    try {
      await updateDoc(doc(db, 'appointments', apptId), {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelReason: 'Cancelled by patient',
      })
    } catch (e) { console.error(e) }
    setCancellingId(null)
    setShowCancelConfirm(null)
  }

  const getGreeting = () => {
    const h = time.getHours()
    if (h < 12) return 'Good Morning'
    if (h < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const activeAppt = appointments.find(a =>
    ['booked', 'checkedIn', 'waiting', 'serving'].includes(a.status)
  )

  const quickActions = [
    { Icon: CalendarPlus, label: 'Book Appointment', path: '/book',    bg: 'var(--teal-light)',   accent: 'var(--teal-primary)' },
    { Icon: Ticket,       label: 'My Queue',         path: '/queue',   bg: 'var(--sky-light)',    accent: 'var(--sky-accent)' },
    { Icon: Brain,        label: 'AI Check',         path: '/chat',    bg: 'var(--violet-light)', accent: 'var(--violet)' },
    { Icon: Building2,    label: 'Govt Schemes',     path: '/schemes', bg: 'var(--amber-light)',  accent: 'var(--amber)' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--gradient-hero)' }}>
            <HeartPulse size={32} color="white" className="animate-pulse" />
          </div>
          <div className="flex items-center gap-2 justify-center" style={{ color: 'var(--text-muted)' }}>
            <Loader2 size={16} className="animate-spin" /> Loading your dashboard...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mesh-bg" style={{ minHeight: '100vh' }}>

      {/* Navbar */}
      <nav className="navbar sticky top-0 z-50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
              <HeartPulse size={18} color="white" />
            </div>
            <span className="font-bold text-lg" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--teal-primary)' }}>
              CarePulse AI
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')}
              className="hidden md:flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl transition-all hover:opacity-80"
              style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)', border: '1px solid var(--border-muted)' }}>
              <Home size={13} /> Home
            </button>
            <div className="hidden md:flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl"
              style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)', border: '1px solid var(--border-muted)' }}>
              <Clock size={13} /> {time.toLocaleTimeString()}
            </div>
            <ThemeToggle />
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm"
              style={{ background: 'var(--gradient-hero)' }}>
              {user?.name?.[0] || 'U'}
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
              style={{ color: 'var(--red-emergency)', border: '1.5px solid var(--red-emergency)40', background: 'var(--red-light)' }}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8 page-transition">

        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>
            {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
            {time.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Active Appointment */}
        {activeAppt ? (
          <div className="rounded-3xl p-6 mb-8 text-white relative overflow-hidden"
            style={{ background: 'var(--gradient-hero)', boxShadow: 'var(--shadow-glow)' }}>
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 translate-x-16 -translate-y-16"
              style={{ background: 'rgba(255,255,255,0.3)' }} />
            <div className="flex items-center justify-between flex-wrap gap-4 relative">
              <div>
                <div className="flex items-center gap-2 text-white/80 text-sm font-medium mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-300 pulse-ring" />
                  Active Appointment
                </div>
                <div className="text-4xl font-extrabold token-mono mb-1">Token #{activeAppt.tokenNumber || '—'}</div>
                <div className="text-white/70 text-sm capitalize">Status: {activeAppt.status}</div>
                {/* Live queue count */}
                {queueCounts[activeAppt.id] !== undefined && (
                  <div className="flex items-center gap-1.5 mt-2 text-sm text-white/80">
                    <Users size={14} />
                    {queueCounts[activeAppt.id] === 0
                      ? "You're next!"
                      : `${queueCounts[activeAppt.id]} patient${queueCounts[activeAppt.id] > 1 ? 's' : ''} ahead of you`}
                  </div>
                )}
              </div>
              <div className="text-center">
                <div className="text-6xl font-extrabold token-mono">{activeAppt.estimatedWait || '—'}</div>
                <div className="text-white/70 text-sm">mins wait</div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => navigate(`/queue/${activeAppt.id}`)}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all hover:scale-105"
                  style={{ background: 'rgba(255,255,255,0.95)', color: 'var(--teal-primary)' }}>
                  Track Live Queue <ChevronRight size={16} />
                </button>
                <button onClick={() => setShowCancelConfirm(activeAppt.id)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl font-semibold text-sm transition-all hover:scale-105"
                  style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                  <XCircle size={14} /> Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="card rounded-3xl p-8 mb-8 text-center" style={{ borderStyle: 'dashed', borderColor: 'var(--border)' }}>
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--teal-light)' }}>
              <CalendarCheck size={28} style={{ color: 'var(--teal-primary)' }} />
            </div>
            <div className="font-semibold mb-1 text-lg" style={{ color: 'var(--text-primary)' }}>No active appointments</div>
            <div className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Book an appointment to get started</div>
            <button onClick={() => navigate('/book')} className="btn-primary inline-flex items-center gap-2">
              Book Appointment <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
            <div className="card rounded-3xl p-8 max-w-sm w-full text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'var(--red-light)' }}>
                <XCircle size={28} style={{ color: 'var(--red-emergency)' }} />
              </div>
              <h3 className="text-xl font-extrabold mb-2" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>
                Cancel Appointment?
              </h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                This will cancel your appointment and free your slot. Other patients in the queue will be updated automatically.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowCancelConfirm(null)}
                  className="btn-outline flex-1" style={{ padding: '11px' }}>
                  Keep it
                </button>
                <button
                  onClick={() => handleCancelAppointment(showCancelConfirm)}
                  disabled={cancellingId === showCancelConfirm}
                  className="flex-1 font-bold rounded-2xl py-3 px-4 transition-all hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ background: 'var(--red-emergency)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>
                  {cancellingId === showCancelConfirm
                    ? <><Loader2 size={15} className="animate-spin" /> Cancelling...</>
                    : <><XCircle size={15} /> Yes, Cancel</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <h2 className="font-bold text-lg mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif' }}>Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {quickActions.map((action) => (
            <button key={action.label} onClick={() => navigate(action.path)}
              className="card rounded-2xl p-5 text-center stagger-item">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: action.bg }}>
                <action.Icon size={22} style={{ color: action.accent }} />
              </div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{action.label}</div>
            </button>
          ))}
        </div>

        {/* Appointment History */}
        <h2 className="font-bold text-lg mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif' }}>Appointment History</h2>
        {appointments.length === 0 ? (
          <div className="card rounded-2xl p-10 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--bg-muted)' }}>
              <CalendarCheck size={24} style={{ color: 'var(--text-faint)' }} />
            </div>
            <div style={{ color: 'var(--text-faint)' }}>No appointments yet</div>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appt) => {
              const s = statusConfig[appt.status] || statusConfig.booked
              const isActive = ['booked','checkedIn','waiting','serving'].includes(appt.status)
              const aheadCount = queueCounts[appt.id]
              return (
                <div key={appt.id} className="card rounded-2xl overflow-hidden stagger-item">

                  {/* Top row */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                        style={{ background: isActive ? 'var(--gradient-hero)' : 'var(--bg-muted)' }}>
                        <HeartPulse size={18} color={isActive ? 'white' : 'var(--text-faint)'} />
                      </div>
                      <div>
                        <div className="font-bold token-mono" style={{ color: 'var(--text-primary)' }}>
                          Token #{appt.tokenNumber || '—'}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {appt.slot && appt.date ? `${appt.slot} · ${appt.date}` : (appt.symptoms || 'No symptoms noted')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ background: s.bg, color: s.color }}>
                        <s.Icon size={10} /> {s.label}
                      </span>
                      {isActive && (
                        <button onClick={(e) => { e.stopPropagation(); setShowCancelConfirm(appt.id) }}
                          className="p-1.5 rounded-xl transition-all hover:opacity-80"
                          style={{ background: 'var(--red-light)', color: 'var(--red-emergency)' }}>
                          <XCircle size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Active appointment — prominent View Queue button */}
                  {isActive && (
                    <div className="px-4 pb-4">
                      <button
                        onClick={() => navigate(`/queue/${appt.id}`)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-sm transition-all hover:opacity-90 hover:scale-[1.01]"
                        style={{ background: 'var(--gradient-hero)', color: 'white' }}>
                        <div className="flex items-center gap-2">
                          <Ticket size={15} />
                          <span>View Live Queue Position</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {aheadCount !== undefined && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                              style={{ background: 'rgba(255,255,255,0.25)' }}>
                              {aheadCount === 0 ? "You're next!" : `${aheadCount} ahead`}
                            </span>
                          )}
                          <ChevronRight size={15} />
                        </div>
                      </button>
                    </div>
                  )}

                  {/* Cancellation notes */}
                  {(appt.status === 'absent' || (appt.cancelReason && appt.status === 'cancelled')) && (
                    <div className="px-4 pb-3 text-xs" style={{ color: 'var(--text-faint)' }}>
                      {appt.status === 'absent'
                        ? '⚠️ Auto-cancelled: not present within 15 minutes'
                        : appt.cancelReason}
                    </div>
                  )}

                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}