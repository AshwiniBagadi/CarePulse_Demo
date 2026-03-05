import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase/config'
import { useTheme } from '../ThemeContext'
import {
  HeartPulse, Mail, Lock, User, Phone, ChevronDown,
  Zap, Brain, Smartphone, Building2, AlertCircle,
  Sun, Moon, ArrowRight, Loader2
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

export default function Auth() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from || null
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    role: 'patient' as 'patient' | 'doctor' | 'admin'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const redirectByRole = (role: string) => {
    if (from) { navigate(from); return }
    navigate(role === 'doctor' ? '/doctor' : role === 'admin' ? '/admin' : '/dashboard')
  }

  const handleEmailAuth = async () => {
    setLoading(true); setError('')
    try {
      if (isLogin) {
        const result = await signInWithEmailAndPassword(auth, form.email, form.password)
        const userDoc = await getDoc(doc(db, 'users', result.user.uid))
        redirectByRole(userDoc.exists() ? userDoc.data().role : 'patient')
      } else {
        const result = await createUserWithEmailAndPassword(auth, form.email, form.password)
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid, name: form.name, email: form.email,
          phone: form.phone, role: form.role, createdAt: new Date()
        })
        redirectByRole(form.role)
      }
    } catch (err: any) {
      setError(err.message.replace('Firebase: ', '').replace(/\(auth.*\)/, ''))
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const userRef = doc(db, 'users', result.user.uid)
      const userDoc = await getDoc(userRef)
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: result.user.uid, name: result.user.displayName,
          email: result.user.email, phone: '', role: 'patient', createdAt: new Date()
        })
      }
      redirectByRole(userDoc.exists() ? userDoc.data().role : 'patient')
    } catch (err: any) { setError(err.message) }
    setLoading(false)
  }

  const perks = [
    { Icon: Zap,       text: 'Real-time queue tracking' },
    { Icon: Brain,     text: 'AI wait time prediction' },
    { Icon: Smartphone,text: 'WhatsApp notifications' },
    { Icon: Building2, text: 'Government scheme auto-apply' },
  ]

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>

      {/* Left Panel */}
      <div className="hidden md:flex flex-1 flex-col justify-center px-12 relative overflow-hidden"
        style={{ background: 'var(--gradient-hero)' }}>
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-20" style={{ background: 'rgba(255,255,255,0.15)' }} />
        <div className="absolute bottom-16 -left-16 w-48 h-48 rounded-full opacity-10" style={{ background: 'rgba(255,255,255,0.2)' }} />

        <div className="relative text-white mb-10">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
              <HeartPulse size={20} color="white" />
            </div>
            <span className="font-bold text-2xl" style={{ fontFamily: 'Sora, sans-serif' }}>CarePulse AI</span>
          </div>
          <h2 className="text-4xl font-extrabold mb-4 leading-tight" style={{ fontFamily: 'Sora, sans-serif' }}>
            Skip the Queue,<br />Not the Care
          </h2>
          <p className="text-white/75 text-lg leading-relaxed">
            AI-powered hospital queue management that saves hours of your precious time.
          </p>
        </div>

        <div className="space-y-4 relative">
          {perks.map((item) => (
            <div key={item.text} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(255,255,255,0.15)' }}>
                <item.Icon size={16} color="white" />
              </div>
              <span className="text-white/90 font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12" style={{ background: 'var(--bg-base)' }}>
        <div className="w-full max-w-md page-transition">

          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="md:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--gradient-hero)' }}>
                <HeartPulse size={16} color="white" />
              </div>
              <span className="font-bold text-lg" style={{ color: 'var(--teal-primary)', fontFamily: 'Sora, sans-serif' }}>
                CarePulse AI
              </span>
            </div>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </div>

          <div className="card rounded-3xl p-8" style={{ background: 'var(--bg-surface)' }}>
            <h2 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'Sora, sans-serif' }}>
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              {isLogin ? 'Sign in to your CarePulse account' : 'Join CarePulse AI today'}
            </p>

            {/* Tabs */}
            <div className="flex rounded-2xl p-1 mb-6" style={{ background: 'var(--bg-muted)' }}>
              {['Login', 'Register'].map((tab) => (
                <button key={tab}
                  onClick={() => { setIsLogin(tab === 'Login'); setError('') }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: (isLogin ? tab === 'Login' : tab === 'Register') ? 'var(--gradient-hero)' : 'transparent',
                    color: (isLogin ? tab === 'Login' : tab === 'Register') ? 'white' : 'var(--text-faint)',
                  }}>
                  {tab}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {!isLogin && (
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-faint)' }} />
                  <input name="name" placeholder="Full Name"
                    value={form.name} onChange={handleChange}
                    className="input-field" style={{ paddingLeft: '42px' }} />
                </div>
              )}
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-faint)' }} />
                <input name="email" type="email" placeholder="Email Address"
                  value={form.email} onChange={handleChange}
                  className="input-field" style={{ paddingLeft: '42px' }} />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-faint)' }} />
                <input name="password" type="password" placeholder="Password"
                  value={form.password} onChange={handleChange}
                  className="input-field" style={{ paddingLeft: '42px' }} />
              </div>
              {!isLogin && (
                <>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-faint)' }} />
                    <input name="phone" placeholder="Phone Number (+91)"
                      value={form.phone} onChange={handleChange}
                      className="input-field" style={{ paddingLeft: '42px' }} />
                  </div>
                  <div className="relative">
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-faint)' }} />
                    <select name="role" value={form.role} onChange={handleChange}
                      className="input-field appearance-none pr-10">
                      <option value="patient">Patient</option>
                      <option value="doctor">Doctor</option>
                      <option value="admin">Hospital Admin</option>
                    </select>
                  </div>
                </>
              )}

              {error && (
                <div className="px-4 py-3 rounded-xl text-sm flex items-start gap-2"
                  style={{ background: 'var(--red-light)', border: '1px solid var(--red-emergency)30', color: 'var(--red-emergency)' }}>
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <button onClick={handleEmailAuth} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2" style={{ padding: '13px' }}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
                {!loading && <ArrowRight size={18} />}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: 'var(--border-muted)' }} />
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>or continue with</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border-muted)' }} />
              </div>

              <button onClick={handleGoogle} disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-3"
                style={{ background: 'var(--bg-subtle)', border: '1.5px solid var(--border-muted)', color: 'var(--text-primary)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>
          </div>

          <p className="text-center text-xs mt-6" style={{ color: 'var(--text-faint)' }}>
            By continuing you agree to CarePulse AI Terms of Service
          </p>
        </div>
      </div>
    </div>
  )
}