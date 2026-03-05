import { useNavigate } from 'react-router-dom'
import { useTheme } from '../ThemeContext'
import { auth } from '../lib/firebase/config'
import {
  Brain, Smartphone, MapPin, Building2, Siren, BarChart3,
  Sun, Moon, ArrowRight, Play, Users, Clock, CheckCircle2,
  ChevronRight, Zap, Shield, Star, HeartPulse
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

export default function Landing() {
  const navigate = useNavigate()

  const goProtected = (path: string) => {
    if (auth.currentUser) {
      navigate(path)
    } else {
      navigate('/login', { state: { from: path } })
    }
  }

  const features = [
    { Icon: Brain,      title: 'AI Wait Prediction',  desc: 'Know your exact wait time before leaving home',  bg: 'var(--teal-light)',   accent: 'var(--teal-primary)', path: '/chat' },
    { Icon: Smartphone, title: 'WhatsApp Updates',    desc: 'Real-time notifications when your turn is near', bg: 'var(--sky-light)',    accent: 'var(--sky-accent)',   path: '/queue' },
    { Icon: MapPin,     title: 'GPS Auto Check-In',   desc: 'Auto check-in when you arrive at hospital',     bg: 'var(--violet-light)', accent: 'var(--violet)',       path: '/book' },
    { Icon: Building2,  title: 'Govt Schemes',        desc: 'Auto-apply PM-JAY, Ayushman Bharat, CGHS',     bg: 'var(--amber-light)',  accent: 'var(--amber)',        path: '/schemes' },
    { Icon: Siren,      title: 'Emergency Priority',  desc: 'Emergency patients get instant queue jump',     bg: 'var(--red-light)',    accent: 'var(--red-emergency)',path: '/book' },
    { Icon: BarChart3,  title: 'Live Queue Tracker',  desc: 'See real-time position from your phone',        bg: 'var(--teal-light)',   accent: 'var(--teal-primary)', path: '/queue' },
  ]

  const steps = [
    { step: '01', Icon: Smartphone, title: 'Book Online',  desc: 'Select hospital, department, doctor and time slot in under 2 minutes' },
    { step: '02', Icon: MapPin,     title: 'GPS Check-In', desc: 'Arrive at hospital, auto check-in activates when you enter 200m radius' },
    { step: '03', Icon: Zap,        title: 'Get Notified', desc: 'Receive WhatsApp alerts when your turn is near, walk in on time' },
  ]

  const schemes = [
    { name: 'PM-JAY',             accent: 'var(--amber)',         bg: 'var(--amber-light)' },
    { name: 'Ayushman Bharat',    accent: 'var(--teal-primary)',  bg: 'var(--teal-light)' },
    { name: 'CGHS',               accent: 'var(--sky-accent)',    bg: 'var(--sky-light)' },
    { name: 'ESIC',               accent: 'var(--violet)',        bg: 'var(--violet-light)' },
    { name: 'MJPJAY Maharashtra', accent: 'var(--red-emergency)', bg: 'var(--red-light)' },
  ]

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="mesh-bg medical-bg">

      {/* Navbar */}
      <nav className="navbar sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
              <HeartPulse size={18} color="white" />
            </div>
            <span className="font-bold text-xl" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--teal-primary)' }}>
              CarePulse <span style={{ color: 'var(--text-primary)' }}>AI</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'Features',  id: 'features' },
              { label: 'Hospitals', id: 'how-it-works' },
              { label: 'Schemes',   id: 'schemes-section' },
              { label: 'About',     id: 'about' },
            ].map(link => (
              <button key={link.label} onClick={() => scrollTo(link.id)}
                className="text-sm font-medium transition-colors hover:opacity-100 bg-transparent border-0 cursor-pointer"
                style={{ color: 'var(--text-muted)' }}>
                {link.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button onClick={() => navigate('/login')} className="btn-outline" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>Login</button>
            <button onClick={() => navigate('/register')} className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 text-center md:text-left page-transition">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8"
            style={{ background: 'var(--teal-light)', color: 'var(--teal-primary)', border: '1px solid var(--border)' }}>
            <Zap size={14} /> AI-Powered Healthcare Queue System
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6"
            style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>
            Skip the Queue,<br />
            <span style={{ background: 'var(--gradient-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Not the Care
            </span>
          </h1>
          <p className="text-lg mb-10 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            CarePulse AI reduces hospital waiting time from hours to minutes using real-time queue tracking, AI predictions, and WhatsApp notifications.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => goProtected('/book')} className="btn-primary flex items-center justify-center gap-2 text-base" style={{ padding: '14px 32px' }}>
              Book Appointment Free <ArrowRight size={18} />
            </button>
            <button onClick={() => scrollTo('features')} className="btn-outline flex items-center justify-center gap-2 text-base" style={{ padding: '14px 32px' }}>
              <Play size={16} /> See Features
            </button>
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="relative w-80 float-anim">
            <div className="absolute inset-0 rounded-3xl opacity-60"
              style={{ background: 'var(--gradient-hero)', transform: 'rotate(6deg) scale(0.97)', filter: 'blur(2px)' }} />
            <div className="relative card rounded-3xl p-8 flex flex-col items-center" style={{ background: 'var(--bg-surface)' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'var(--gradient-hero)' }}>
                <HeartPulse size={32} color="white" />
              </div>
              <div className="text-center mb-5">
                <div className="text-4xl font-extrabold token-mono mb-1" style={{ color: 'var(--teal-primary)' }}>Token #24</div>
                <div className="text-sm" style={{ color: 'var(--text-faint)' }}>Your position in queue</div>
              </div>
              <div className="w-full mb-3">
                <div className="progress-bar"><div className="progress-fill" style={{ width: '65%' }} /></div>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--teal-primary)' }}>
                <div className="w-2 h-2 rounded-full pulse-ring" style={{ background: 'var(--teal-primary)' }} />
                ~14 minutes remaining
              </div>
              <div className="mt-4 w-full p-3 rounded-2xl text-xs font-medium"
                style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)', border: '1px solid var(--border-muted)' }}>
                <div className="flex items-center gap-2"><Brain size={13} style={{ color: 'var(--teal-primary)' }} />AI Prediction: Low congestion today</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-4xl mx-auto px-6 mb-20">
        <div className="grid grid-cols-3 gap-5">
          {[
            { number: '10,000+', label: 'Patients Served', Icon: Users },
            { number: '50+',     label: 'Hospitals',       Icon: Building2 },
            { number: '4 min',   label: 'Avg Wait Time',   Icon: Clock },
          ].map((stat) => (
            <div key={stat.label} className="card rounded-2xl text-center p-6 stagger-item">
              <div className="w-11 h-11 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'var(--teal-light)' }}>
                <stat.Icon size={20} style={{ color: 'var(--teal-primary)' }} />
              </div>
              <div className="text-3xl font-extrabold mb-1 token-mono" style={{ color: 'var(--teal-primary)' }}>{stat.number}</div>
              <div className="text-sm" style={{ color: 'var(--text-faint)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features — clickable, auth-gated */}
      <div id="features" className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-extrabold mb-3" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>Everything You Need</h2>
          <p style={{ color: 'var(--text-muted)' }}>Click any card to explore the feature</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((f) => (
            <button key={f.title} onClick={() => goProtected(f.path)}
              className="card rounded-2xl p-6 stagger-item text-left group cursor-pointer">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ background: f.bg }}>
                <f.Icon size={22} style={{ color: f.accent }} />
              </div>
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>
                {f.title}
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--teal-primary)' }} />
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Government Schemes */}
      <div id="schemes-section" className="py-16 my-8" style={{ background: 'var(--bg-subtle)', borderTop: '1px solid var(--border-muted)', borderBottom: '1px solid var(--border-muted)' }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield size={20} style={{ color: 'var(--teal-primary)' }} />
            <h2 className="text-4xl font-extrabold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>Government Scheme Integration</h2>
          </div>
          <p className="mb-10" style={{ color: 'var(--text-muted)' }}>Auto-detect your eligible schemes and apply them instantly</p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {schemes.map((s) => (
              <div key={s.name} className="px-5 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2"
                style={{ background: s.bg, color: s.accent, border: `1.5px solid ${s.accent}30` }}>
                <CheckCircle2 size={14} /> {s.name}
              </div>
            ))}
          </div>
          <button onClick={() => goProtected('/schemes')} className="btn-primary inline-flex items-center gap-2">
            View All Schemes <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* How it Works */}
      <div id="how-it-works" className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-extrabold mb-3" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>How It Works</h2>
          <p style={{ color: 'var(--text-muted)' }}>3 simple steps to skip the queue</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item) => (
            <div key={item.step} className="card rounded-2xl text-center p-8">
              <div className="text-5xl font-extrabold mb-4 token-mono" style={{ color: 'var(--border)' }}>{item.step}</div>
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
                <item.Icon size={24} color="white" />
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* About / CTA */}
      <div id="about" className="py-20 text-center" style={{ background: 'var(--gradient-hero)' }}>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Star size={20} color="rgba(255,255,255,0.8)" />
          <h2 className="text-4xl font-extrabold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>Ready to Skip the Queue?</h2>
          <Star size={20} color="rgba(255,255,255,0.8)" />
        </div>
        <p className="text-white/80 mb-8 text-lg">Join 10,000+ patients already using CarePulse AI</p>
        <button onClick={() => navigate('/register')}
          className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-bold text-lg transition-all hover:shadow-2xl hover:scale-105"
          style={{ background: 'var(--bg-surface)', color: 'var(--teal-primary)' }}>
          Get Started Free <ChevronRight size={20} />
        </button>
      </div>

      {/* Footer */}
      <div className="py-8 text-center" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-muted)' }}>
        <p className="text-sm flex items-center justify-center gap-3" style={{ color: 'var(--text-faint)' }}>
          <span>Emergency? Call <span className="font-bold" style={{ color: 'var(--red-emergency)' }}>108</span></span>
          <span>|</span><span>CarePulse AI © 2026</span><span>|</span>
          <span className="flex items-center gap-1">Made with <HeartPulse size={13} style={{ color: 'var(--red-emergency)' }} /> for India</span>
        </p>
      </div>

    </div>
  )
}