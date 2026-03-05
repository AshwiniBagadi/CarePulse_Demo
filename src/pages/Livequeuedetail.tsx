import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  collection, doc, query, where, onSnapshot
} from 'firebase/firestore'
import { auth, db } from '..//lib/firebase/config'
import { useTheme } from '../ThemeContext'
import {
  HeartPulse, ChevronLeft, Sun, Moon, Clock, Users,
  CheckCircle2, Timer, Activity, CalendarCheck, AlertCircle,
  Stethoscope, RefreshCw, TrendingDown, UserCheck
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
  booked:    { label: 'Booked',      bg: 'var(--sky-light)',    color: 'var(--sky-accent)',    Icon: CalendarCheck },
  checkedIn: { label: 'Checked In',  bg: 'var(--teal-light)',   color: 'var(--teal-primary)',  Icon: CheckCircle2 },
  waiting:   { label: 'Waiting',     bg: 'var(--amber-light)',  color: 'var(--amber)',          Icon: Timer },
  serving:   { label: 'Now Serving', bg: 'var(--violet-light)', color: 'var(--violet)',         Icon: Activity },
  completed: { label: 'Completed',   bg: 'var(--teal-light)',   color: 'var(--teal-primary)',   Icon: CheckCircle2 },
  cancelled: { label: 'Cancelled',   bg: 'var(--red-light)',    color: 'var(--red-emergency)',  Icon: AlertCircle },
  absent:    { label: 'Absent',      bg: 'var(--red-light)',    color: 'var(--red-emergency)',  Icon: AlertCircle },
}

// Average minutes per consultation
const MINS_PER_PATIENT = 8

export default function LiveQueueDetail() {
  const navigate = useNavigate()
  const { appointmentId } = useParams<{ appointmentId: string }>()
  const [myAppt, setMyAppt] = useState<any>(null)
  const [fullQueue, setFullQueue] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    if (!appointmentId) return
    const unsubAuth = auth.onAuthStateChanged(async (firebaseUser: any) => {
      if (!firebaseUser) { navigate('/login'); return }

      // 1. Subscribe to my own appointment
      const apptUnsub = onSnapshot(doc(db, 'appointments', appointmentId), (snap) => {
        if (!snap.exists()) return
        const data = { id: snap.id, ...snap.data() }
        setMyAppt(data)

        // 2. Once we have the doctorId, subscribe to ALL active queue for that doctor
        const doctorId = (data as any).doctorId
        if (!doctorId) { setLoading(false); return }

        const queueQuery = query(
          collection(db, 'appointments'),
          where('doctorId', '==', doctorId),
          where('status', 'in', ['booked', 'checkedIn', 'waiting', 'serving'])
        )

        onSnapshot(queueQuery, (qSnap) => {
          const queue = qSnap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a: any, b: any) => (a.tokenNumber ?? 999) - (b.tokenNumber ?? 999))
          setFullQueue(queue)
          setLastUpdated(new Date())
          setLoading(false)
        })
      })

      return () => apptUnsub()
    })
    return () => unsubAuth()
  }, [appointmentId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="text-center">
          <RefreshCw size={28} className="animate-spin mx-auto mb-3" style={{ color: 'var(--teal-primary)' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading live queue...</p>
        </div>
      </div>
    )
  }

  if (!myAppt) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="text-center card rounded-2xl p-8">
          <AlertCircle size={32} className="mx-auto mb-3" style={{ color: 'var(--red-emergency)' }} />
          <p style={{ color: 'var(--text-muted)' }}>Appointment not found.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary mt-4">Back to Dashboard</button>
        </div>
      </div>
    )
  }

  const myToken = myAppt.tokenNumber ?? 0
  const myIndexInQueue = fullQueue.findIndex(a => a.id === appointmentId)
  const patientsAhead = myIndexInQueue === -1 ? 0 : myIndexInQueue
  const estimatedWait = patientsAhead * MINS_PER_PATIENT
  const currentlyServing = fullQueue.find(a => a.status === 'serving')
  const s = statusConfig[myAppt.status] || statusConfig.booked

  // Progress percentage (0–100) based on position
  const totalInQueue = fullQueue.length
  const progressPct = totalInQueue > 1
    ? Math.max(5, Math.round(((totalInQueue - patientsAhead) / totalInQueue) * 100))
    : 95

  return (
    <div className="mesh-bg" style={{ minHeight: '100vh' }}>

      {/* Navbar */}
      <nav className="navbar sticky top-0 z-50 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm font-medium hover:opacity-80"
            style={{ color: 'var(--teal-primary)' }}>
            <ChevronLeft size={18} /> Dashboard
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
              <HeartPulse size={16} color="white" />
            </div>
            <span className="font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--teal-primary)' }}>
              Live Queue
            </span>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6 page-transition">

        {/* Live badge */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-extrabold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>
            Your Queue Position
          </h1>
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full font-semibold"
            style={{ background: 'var(--teal-light)', color: 'var(--teal-primary)', border: '1px solid var(--border)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" style={{ animation: 'pulseRing 2s infinite' }} />
            Live · {lastUpdated.toLocaleTimeString()}
          </div>
        </div>

        {/* My token hero card */}
        <div className="rounded-3xl p-6 mb-5 text-white relative overflow-hidden"
          style={{ background: 'var(--gradient-hero)', boxShadow: 'var(--shadow-glow)' }}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 translate-x-12 -translate-y-12"
            style={{ background: 'white' }} />
          <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full opacity-10 -translate-x-8 translate-y-8"
            style={{ background: 'white' }} />

          <div className="relative">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-white/70 text-xs font-medium mb-1 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-300" style={{ animation: 'pulseRing 2s infinite' }} />
                  Your Token
                </div>
                <div className="text-5xl font-extrabold token-mono">#{myToken}</div>
              </div>
              <div className="text-right">
                <div className="text-white/70 text-xs mb-1">Est. Wait</div>
                <div className="text-4xl font-extrabold token-mono">
                  {patientsAhead === 0 ? '~0' : estimatedWait}
                </div>
                <div className="text-white/70 text-xs">minutes</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-white/70 mb-1.5">
                <span>Queue Progress</span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${progressPct}%`, background: 'rgba(255,255,255,0.9)' }} />
              </div>
            </div>

            {/* Ahead count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Users size={15} />
                {patientsAhead === 0
                  ? "🎉 You're next! Please proceed."
                  : `${patientsAhead} patient${patientsAhead > 1 ? 's' : ''} ahead of you`}
              </div>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                <s.Icon size={10} /> {s.label}
              </span>
            </div>
          </div>
        </div>

        {/* Currently serving */}
        {currentlyServing && (
          <div className="card rounded-2xl p-4 mb-5 flex items-center gap-3"
            style={{ border: '1.5px solid var(--violet)40', background: 'var(--violet-light)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--violet)', }}>
              <Stethoscope size={18} color="white" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold mb-0.5" style={{ color: 'var(--violet)' }}>NOW BEING SERVED</div>
              <div className="font-bold token-mono" style={{ color: 'var(--text-primary)' }}>
                Token #{currentlyServing.tokenNumber}
              </div>
            </div>
            <div className="text-xs px-2.5 py-1 rounded-full font-semibold"
              style={{ background: 'var(--violet)', color: 'white' }}>
              In Progress
            </div>
          </div>
        )}

        {/* Live queue list */}
        <div className="card rounded-2xl overflow-hidden mb-5">
          <div className="px-4 py-3 flex items-center justify-between"
            style={{ borderBottom: '1px solid var(--border-muted)', background: 'var(--bg-subtle)' }}>
            <h2 className="font-bold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Users size={14} style={{ color: 'var(--teal-primary)' }} />
              Full Queue — {fullQueue.length} patient{fullQueue.length !== 1 ? 's' : ''}
            </h2>
            <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
              ~{MINS_PER_PATIENT} min/patient
            </span>
          </div>

          {fullQueue.length === 0 ? (
            <div className="p-8 text-center" style={{ color: 'var(--text-faint)' }}>
              Queue is empty
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border-muted)' }}>
              {fullQueue.map((patient: any, index: number) => {
                const isMe = patient.id === appointmentId
                const isServing = patient.status === 'serving'
                const ps = statusConfig[patient.status] || statusConfig.booked
                const waitForThis = index * MINS_PER_PATIENT

                return (
                  <div key={patient.id}
                    className="px-4 py-3 flex items-center gap-3 transition-all"
                    style={{
                      background: isMe
                        ? 'linear-gradient(90deg, var(--teal-light), var(--bg-surface))'
                        : isServing
                        ? 'var(--violet-light)'
                        : 'var(--bg-surface)',
                    }}>

                    {/* Position number */}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs"
                      style={{
                        background: isServing ? 'var(--violet)' : isMe ? 'var(--teal-primary)' : 'var(--bg-muted)',
                        color: isServing || isMe ? 'white' : 'var(--text-faint)',
                      }}>
                      {isServing ? <Activity size={13} /> : index + 1}
                    </div>

                    {/* Token */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold token-mono text-sm" style={{ color: 'var(--text-primary)' }}>
                          Token #{patient.tokenNumber}
                        </span>
                        {isMe && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: 'var(--teal-primary)', color: 'white' }}>
                            YOU
                          </span>
                        )}
                        {isServing && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: 'var(--violet)', color: 'white' }}>
                            NOW
                          </span>
                        )}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
                        {isServing ? 'Currently with doctor' : `~${waitForThis} min wait`}
                      </div>
                    </div>

                    {/* Status */}
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold shrink-0"
                      style={{ background: ps.bg, color: ps.color }}>
                      <ps.Icon size={10} /> {ps.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="card rounded-2xl p-4 text-center">
            <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center"
              style={{ background: 'var(--teal-light)' }}>
              <TrendingDown size={18} style={{ color: 'var(--teal-primary)' }} />
            </div>
            <div className="text-2xl font-extrabold token-mono mb-0.5" style={{ color: 'var(--teal-primary)' }}>
              {estimatedWait === 0 ? '<1' : estimatedWait}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-faint)' }}>Minutes Est. Wait</div>
          </div>
          <div className="card rounded-2xl p-4 text-center">
            <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center"
              style={{ background: 'var(--sky-light)' }}>
              <UserCheck size={18} style={{ color: 'var(--sky-accent)' }} />
            </div>
            <div className="text-2xl font-extrabold token-mono mb-0.5" style={{ color: 'var(--sky-accent)' }}>
              {patientsAhead}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-faint)' }}>Patients Before You</div>
          </div>
        </div>

        {/* Appointment details */}
        <div className="card rounded-2xl p-4 mb-5">
          <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif' }}>
            Your Appointment
          </h3>
          <div className="space-y-2">
            {[
              { Icon: CalendarCheck, label: 'Slot', value: myAppt.slot || '—' },
              { Icon: Clock,         label: 'Date', value: myAppt.date || '—' },
              { Icon: Stethoscope,   label: 'Dept', value: myAppt.departmentId || '—' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between text-sm py-1"
                style={{ borderBottom: '1px solid var(--border-muted)' }}>
                <span className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                  <row.Icon size={13} /> {row.label}
                </span>
                <span className="font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={() => navigate('/dashboard')} className="btn-outline w-full flex items-center justify-center gap-2">
          <ChevronLeft size={16} /> Back to Dashboard
        </button>

      </div>
    </div>
  )
}