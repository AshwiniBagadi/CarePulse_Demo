import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase/config'
import { useTheme } from '../ThemeContext'
import {
  HeartPulse, Search, Star, Clock, ChevronLeft,
  ChevronRight, Sun, Moon, MapPin, Users, Heart,
  Bone, Stethoscope, Brain, Baby, Sparkles, Eye, Ear,
  Building2, Shield, CheckCircle2, Loader2, PartyPopper,
  BedDouble, Crown, ExternalLink, ChevronDown, ChevronUp
} from 'lucide-react'

const SCHEME_DETAILS: Record<string, { name: string; coverage: string; benefit: string; eligibility: string; url: string; applyUrl: string }> = {
  opd: {
    name: 'Ayushman Bharat',
    coverage: 'Free OPD',
    benefit: 'OPD consultation may be free under Ayushman Bharat Health & Wellness Centres',
    eligibility: 'All citizens of India. Visit nearest Health & Wellness Centre.',
    url: 'https://nhm.gov.in/index4.php?lang=1&level=0&linkid=311&lid=303',
    applyUrl: 'https://abdm.gov.in',
  },
  bed: {
    name: 'PM-JAY',
    coverage: '₹5 Lakh/year',
    benefit: 'PM-JAY may cover bed & hospitalization charges up to ₹5 lakh/year',
    eligibility: 'Families listed in SECC database and BPL families. Check eligibility at mera.pmjay.gov.in',
    url: 'https://pmjay.gov.in',
    applyUrl: 'https://mera.pmjay.gov.in',
  },
}

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

const HOSPITALS = [
  { id: 'h1', name: 'CarePulse General Hospital', address: 'Pune, Maharashtra', crowd: 'low',    wait: 8,  photo: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&q=80', rating: 4.8, beds: 12 },
  { id: 'h2', name: 'City Medical Center',         address: 'Mumbai, Maharashtra', crowd: 'medium', wait: 18, photo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80', rating: 4.6, beds: 5 },
  { id: 'h3', name: 'Apollo CarePulse',            address: 'Nagpur, Maharashtra', crowd: 'high',   wait: 35, photo: 'https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=600&q=80', rating: 4.5, beds: 0 },
]

const DEPARTMENTS = [
  { id: 'cardiology',    name: 'Cardiology',       Icon: Heart,       symptoms: ['chest pain', 'heart', 'palpitation'] },
  { id: 'orthopedics',   name: 'Orthopedics',      Icon: Bone,        symptoms: ['bone', 'joint', 'fracture', 'knee'] },
  { id: 'general',       name: 'General Medicine', Icon: Stethoscope, symptoms: ['fever', 'cold', 'cough', 'headache'] },
  { id: 'neurology',     name: 'Neurology',        Icon: Brain,       symptoms: ['brain', 'seizure', 'memory', 'migraine'] },
  { id: 'pediatrics',    name: 'Pediatrics',       Icon: Baby,        symptoms: ['child', 'baby', 'infant'] },
  { id: 'dermatology',   name: 'Dermatology',      Icon: Sparkles,    symptoms: ['skin', 'rash', 'acne', 'allergy'] },
  { id: 'ophthalmology', name: 'Ophthalmology',    Icon: Eye,         symptoms: ['eye', 'vision', 'blind'] },
  { id: 'ent',           name: 'ENT',              Icon: Ear,         symptoms: ['ear', 'nose', 'throat', 'hearing'] },
]

const DOCTORS: Record<string, any[]> = {
  cardiology:    [{ id: 'd1', name: 'Dr. Priya Sharma',  rating: 4.8, exp: '12 years', slots: ['9:00 AM', '10:00 AM', '2:00 PM'],  photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&q=80' }, { id: 'd2', name: 'Dr. Rajesh Mehta',  rating: 4.6, exp: '8 years',  slots: ['11:00 AM', '3:00 PM', '4:00 PM'],  photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80' }],
  orthopedics:   [{ id: 'd3', name: 'Dr. Anita Desai',   rating: 4.9, exp: '15 years', slots: ['9:30 AM', '11:30 AM', '1:00 PM'],  photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80' }],
  general:       [{ id: 'd4', name: 'Dr. Vikram Joshi',  rating: 4.7, exp: '10 years', slots: ['8:00 AM', '10:30 AM', '3:30 PM'],  photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80' }, { id: 'd5', name: 'Dr. Sunita Patil',  rating: 4.5, exp: '6 years',  slots: ['9:00 AM', '12:00 PM', '4:00 PM'],  photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&q=80' }],
  neurology:     [{ id: 'd6', name: 'Dr. Amit Kumar',    rating: 4.8, exp: '14 years', slots: ['10:00 AM', '2:00 PM'],             photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80' }],
  pediatrics:    [{ id: 'd7', name: 'Dr. Kavita Singh',  rating: 4.9, exp: '11 years', slots: ['9:00 AM', '11:00 AM', '1:00 PM'],  photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80' }],
  dermatology:   [{ id: 'd8', name: 'Dr. Neha Gupta',    rating: 4.7, exp: '7 years',  slots: ['10:30 AM', '2:30 PM', '4:30 PM'],  photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&q=80' }],
  ophthalmology: [{ id: 'd9', name: 'Dr. Suresh Nair',   rating: 4.6, exp: '9 years',  slots: ['9:00 AM', '11:00 AM', '3:00 PM'],  photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80' }],
  ent:           [{ id: 'd10',name: 'Dr. Pooja Verma',   rating: 4.8, exp: '13 years', slots: ['8:30 AM', '12:30 PM', '4:00 PM'],  photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80' }],
}

const BED_CATEGORIES = [
  { id: 'general', name: 'General Ward',   Icon: BedDouble, price: 3500,  desc: 'Shared ward, 4–6 beds, basic nursing care',    photo: 'https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=600&q=80' },
  { id: 'twin',    name: 'Twin Sharing',   Icon: BedDouble, price: 4950,  desc: 'Semi-private room, 2 hospital beds, attached bath', photo: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&q=80' },
  { id: 'single',  name: 'Single Classic', Icon: BedDouble, price: 12000, desc: 'Private room, adjustable hospital bed, AC',     photo: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=600&q=80' },
  { id: 'deluxe',  name: 'Deluxe Single',  Icon: BedDouble, price: 16000, desc: 'Deluxe private, ICU-grade bed, sofa for attendant', photo: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80' },
  { id: 'suite',   name: 'Premium Suite',  Icon: Crown,     price: 23000, desc: 'Premium suite, advanced monitoring, attendant bed', photo: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600&q=80' },
]

const crowdCfg = (l: string) =>
  l === 'low'    ? { color: 'var(--teal-primary)',  bg: 'var(--teal-light)',  label: 'Low crowd' } :
  l === 'medium' ? { color: 'var(--amber)',          bg: 'var(--amber-light)', label: 'Moderate' } :
                   { color: 'var(--red-emergency)',  bg: 'var(--red-light)',   label: 'Busy' }

const STEPS = ['Hospital', 'Dept / Bed', 'Doctor', 'Confirm']

function SchemeInfoBlock({ mode }: { mode: 'opd' | 'bed' }) {
  const [open, setOpen] = useState(false)
  const scheme = SCHEME_DETAILS[mode]
  return (
    <div className="rounded-2xl mb-6 overflow-hidden" style={{ border: '1.5px solid var(--amber)40' }}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full p-4 flex items-start gap-3 text-left"
        style={{ background: 'var(--amber-light)' }}>
        <Shield size={18} style={{ color: 'var(--amber)', marginTop: '1px', flexShrink: 0 }} />
        <div className="flex-1">
          <div className="font-semibold text-sm flex items-center justify-between" style={{ color: 'var(--amber)' }}>
            <span>Government Scheme Detected: {scheme.name}</span>
            {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{scheme.benefit}</div>
        </div>
      </button>
      {open && (
        <div className="p-4 space-y-3" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--amber)30' }}>
          <div>
            <div className="text-xs font-bold uppercase mb-1" style={{ color: 'var(--text-faint)' }}>Coverage</div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{scheme.coverage}</div>
          </div>
          <div>
            <div className="text-xs font-bold uppercase mb-1" style={{ color: 'var(--text-faint)' }}>Eligibility</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{scheme.eligibility}</div>
          </div>
          <div className="flex gap-2 pt-1">
            <a href={scheme.applyUrl} target="_blank" rel="noopener noreferrer"
              className="flex-1 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 py-2 transition-all hover:opacity-80"
              style={{ background: 'var(--amber-light)', color: 'var(--amber)', border: '1px solid var(--amber)40', textDecoration: 'none' }}>
              Check Eligibility <ExternalLink size={11} />
            </a>
            <a href={scheme.url} target="_blank" rel="noopener noreferrer"
              className="flex-1 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 py-2 transition-all hover:opacity-80"
              style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)', border: '1px solid var(--border-muted)', textDecoration: 'none' }}>
              Official Site <ExternalLink size={11} />
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default function BookAppointment() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [mode, setMode] = useState<'opd' | 'bed'>('opd')
  const [search, setSearch] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [suggested, setSuggested] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [selected, setSelected] = useState({ hospital: '', department: '', doctor: '', slot: '', date: '', bed: '' })

  const filteredHospitals = HOSPITALS.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.address.toLowerCase().includes(search.toLowerCase())
  )

  const analyzeSymptoms = () => {
    const lower = symptoms.toLowerCase()
    const match = DEPARTMENTS.find(d => d.symptoms.some(s => lower.includes(s)))
    setSuggested(match ? match.id : 'general')
  }

  const handleBook = async () => {
    setLoading(true)
    try {
      const user = auth.currentUser
      if (!user) return
      const tokenNumber = Math.floor(Math.random() * 50) + 1
      await addDoc(collection(db, 'appointments'), {
        patientId: user.uid,
        hospitalId: selected.hospital, departmentId: selected.department,
        doctorId: selected.doctor, slot: selected.slot, date: selected.date,
        bedCategory: selected.bed, tokenNumber, status: 'booked', symptoms, mode,
        priority: 'normal',
        estimatedWait: HOSPITALS.find(h => h.id === selected.hospital)?.wait || 15,
        bookedAt: new Date(),
      })
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 3000)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="text-center card rounded-3xl p-12 max-w-md mx-4">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'var(--gradient-hero)' }}>
            <PartyPopper size={36} color="white" />
          </div>
          <h2 className="text-2xl font-extrabold mb-2" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>
            Booking Confirmed!
          </h2>
          <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
            Your appointment has been booked. You'll receive WhatsApp updates.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm font-medium" style={{ color: 'var(--teal-primary)' }}>
            <Loader2 size={15} className="animate-spin" />
            Redirecting to dashboard...
          </div>
        </div>
      </div>
    )
  }

  const maxStep = mode === 'opd' ? 4 : 3

  return (
    <div className="mesh-bg" style={{ minHeight: '100vh' }}>
      {/* Navbar */}
      <nav className="navbar sticky top-0 z-50 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm font-medium transition-all hover:opacity-80"
            style={{ color: 'var(--teal-primary)' }}>
            <ChevronLeft size={18} />
            Dashboard
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--gradient-hero)' }}>
              <HeartPulse size={16} color="white" />
            </div>
            <span className="font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--teal-primary)' }}>
              CarePulse AI
            </span>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 page-transition">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.slice(0, maxStep).map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: step > i + 1 ? 'var(--teal-primary)' : step === i + 1 ? 'var(--gradient-hero)' : 'var(--bg-muted)',
                    color: step >= i + 1 ? 'white' : 'var(--text-faint)'
                  }}>
                  {step > i + 1 ? <CheckCircle2 size={14} /> : i + 1}
                </div>
                <span className="text-xs font-medium hidden sm:block"
                  style={{ color: step === i + 1 ? 'var(--teal-primary)' : 'var(--text-faint)' }}>
                  {s}
                </span>
              </div>
              {i < STEPS.slice(0, maxStep).length - 1 && (
                <div className="flex-1 h-0.5 rounded" style={{ background: step > i + 1 ? 'var(--teal-primary)' : 'var(--border-muted)' }} />
              )}
            </div>
          ))}
        </div>

        {/* STEP 1: Hospital */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-extrabold mb-1" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>
              Choose Hospital
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Select a hospital near you</p>

            {/* Mode toggle */}
            <div className="flex rounded-2xl p-1 mb-6" style={{ background: 'var(--bg-muted)' }}>
              {(['opd', 'bed'] as const).map((m) => (
                <button key={m} onClick={() => setMode(m)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all capitalize"
                  style={{
                    background: mode === m ? 'var(--gradient-hero)' : 'transparent',
                    color: mode === m ? 'white' : 'var(--text-faint)',
                  }}>
                  {m === 'opd' ? '🩺 OPD Consultation' : '🛏️ Bed Admission'}
                </button>
              ))}
            </div>

            <div className="relative mb-5">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-faint)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search hospital or city..."
                className="input-field" style={{ paddingLeft: '42px' }} />
            </div>

            <div className="space-y-4">
              {filteredHospitals.map(h => {
                const crowd = crowdCfg(h.crowd)
                return (
                  <button key={h.id}
                    onClick={() => { setSelected({ ...selected, hospital: h.id }); setStep(2) }}
                    className="w-full card rounded-2xl overflow-hidden text-left">
                    <div className="h-40 overflow-hidden relative">
                      <img src={h.photo} alt={h.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)' }} />
                      <div className="absolute bottom-3 left-4 text-white font-bold text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>
                        {h.name}
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                          <MapPin size={13} />
                          {h.address}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--amber)' }}>
                            <Star size={13} fill="currentColor" /> {h.rating}
                          </span>
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: crowd.bg, color: crowd.color }}>
                            <Users size={11} />
                            {crowd.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-bold" style={{ color: 'var(--teal-primary)' }}>
                        <Clock size={14} />
                        ~{h.wait} min
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Department (OPD) or Bed (Bed mode) */}
        {step === 2 && mode === 'opd' && (
          <div>
            <h2 className="text-2xl font-extrabold mb-1" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>
              Select Department
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Pick your specialization or describe symptoms</p>

            {/* AI Symptom */}
            <div className="card rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Brain size={16} style={{ color: 'var(--teal-primary)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>AI Department Suggestion</span>
              </div>
              <div className="flex gap-2">
                <input value={symptoms} onChange={e => setSymptoms(e.target.value)}
                  placeholder="Describe your symptoms..."
                  className="input-field flex-1" />
                <button onClick={analyzeSymptoms}
                  className="btn-primary shrink-0" style={{ padding: '10px 16px', fontSize: '0.8rem' }}>
                  Analyze
                </button>
              </div>
              {suggested && (
                <div className="mt-3 flex items-center gap-2 text-sm font-medium"
                  style={{ color: 'var(--teal-primary)' }}>
                  <CheckCircle2 size={14} />
                  Suggested: {DEPARTMENTS.find(d => d.id === suggested)?.name}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {DEPARTMENTS.map((dept) => (
                <button key={dept.id}
                  onClick={() => { setSelected({ ...selected, department: dept.id }); setStep(3) }}
                  className={`card rounded-2xl p-4 text-left transition-all ${suggested === dept.id ? 'ring-2' : ''}`}
                  style={{ ...(suggested === dept.id ? { borderColor: 'var(--teal-primary)', boxShadow: 'var(--shadow-glow)' } : {}) }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: suggested === dept.id ? 'var(--gradient-hero)' : 'var(--teal-light)' }}>
                    <dept.Icon size={18} style={{ color: suggested === dept.id ? 'white' : 'var(--teal-primary)' }} />
                  </div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{dept.name}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="mt-4 flex items-center gap-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              <ChevronLeft size={15} /> Back
            </button>
          </div>
        )}

        {/* STEP 2: Bed selection */}
        {step === 2 && mode === 'bed' && (
          <div>
            <h2 className="text-2xl font-extrabold mb-1" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>
              Select Bed Type
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Choose a bed category that suits your needs</p>
            <div className="space-y-4">
              {BED_CATEGORIES.map(bed => (
                <button key={bed.id}
                  onClick={() => { setSelected({ ...selected, bed: bed.id }); setStep(3) }}
                  className="w-full card rounded-2xl overflow-hidden text-left">
                  <div className="h-32 overflow-hidden relative">
                    <img src={bed.photo} alt={bed.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }} />
                    <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full font-bold text-sm"
                      style={{ background: 'var(--bg-surface)', color: 'var(--teal-primary)' }}>
                      ₹{bed.price.toLocaleString()}/day
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{bed.name}</div>
                      <div className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{bed.desc}</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'var(--teal-light)' }}>
                      <bed.Icon size={18} style={{ color: 'var(--teal-primary)' }} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="mt-4 flex items-center gap-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              <ChevronLeft size={15} /> Back
            </button>
          </div>
        )}

        {/* STEP 3: Doctor & Slot (OPD only) */}
        {step === 3 && mode === 'opd' && (
          <div>
            <h2 className="text-2xl font-extrabold mb-1" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>
              Select Doctor
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Choose your preferred doctor and time</p>
            <div className="space-y-4">
              {(DOCTORS[selected.department] || DOCTORS.general).map((doc) => (
                <div key={doc.id} className="card rounded-2xl overflow-hidden">
                  <div className="p-4 flex items-center gap-4">
                    <img src={doc.photo} alt={doc.name} className="w-16 h-16 rounded-2xl object-cover" />
                    <div className="flex-1">
                      <div className="font-bold" style={{ color: 'var(--text-primary)' }}>{doc.name}</div>
                      <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{doc.exp} experience</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--amber)' }}>
                          <Star size={13} fill="currentColor" /> {doc.rating}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: 'var(--teal-light)', color: 'var(--teal-primary)' }}>
                          Available Today
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-faint)' }}>AVAILABLE SLOTS</div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {doc.slots.map((slot: string) => (
                        <button key={slot}
                          onClick={() => setSelected({ ...selected, doctor: doc.id, slot })}
                          className="px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
                          style={{
                            background: selected.slot === slot && selected.doctor === doc.id ? 'var(--gradient-hero)' : 'var(--bg-subtle)',
                            color: selected.slot === slot && selected.doctor === doc.id ? 'white' : 'var(--text-secondary)',
                            border: `1.5px solid ${selected.slot === slot && selected.doctor === doc.id ? 'transparent' : 'var(--border-muted)'}`
                          }}>
                          {slot}
                        </button>
                      ))}
                    </div>
                    <input type="date"
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setSelected({ ...selected, date: e.target.value })}
                      className="input-field" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(2)} className="btn-outline flex items-center gap-1 flex-1">
                <ChevronLeft size={16} /> Back
              </button>
              <button
                onClick={() => selected.slot && selected.date && setStep(4)}
                disabled={!selected.slot || !selected.date}
                className="btn-primary flex-1 flex items-center justify-center gap-2">
                Continue <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* CONFIRM step */}
        {((step === 3 && mode === 'bed') || (step === 4 && mode === 'opd')) && (
          <div>
            <h2 className="text-2xl font-extrabold mb-1" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>
              Confirm Booking
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Review your appointment details</p>

            <div className="card rounded-2xl p-5 mb-4 space-y-3">
              {[
                { Icon: Building2, label: 'Hospital',   value: HOSPITALS.find(h => h.id === selected.hospital)?.name },
                mode === 'bed'
                  ? { Icon: BedDouble, label: 'Bed Type', value: BED_CATEGORIES.find(b => b.id === selected.bed)?.name }
                  : { Icon: Stethoscope, label: 'Department', value: DEPARTMENTS.find(d => d.id === selected.department)?.name },
                mode === 'opd' ? { Icon: Heart, label: 'Doctor',   value: DOCTORS[selected.department]?.find((d: any) => d.id === selected.doctor)?.name } : null,
                mode === 'opd' ? { Icon: Clock, label: 'Time',     value: selected.slot } : null,
                mode === 'opd' ? { Icon: Building2, label: 'Date', value: selected.date } : null,
                mode === 'bed' ? { Icon: Crown, label: 'Price',    value: '₹' + BED_CATEGORIES.find(b => b.id === selected.bed)?.price.toLocaleString() + '/day' } : null,
                symptoms     ? { Icon: Brain, label: 'Symptoms',   value: symptoms } : null,
              ].filter(Boolean).map((item: any) => (
                <div key={item.label} className="flex justify-between items-center py-1.5" style={{ borderBottom: '1px solid var(--border-muted)' }}>
                  <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <item.Icon size={14} />
                    {item.label}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.value}</span>
                </div>
              ))}
            </div>

            <SchemeInfoBlock mode={mode} />

            <div className="flex gap-3">
              <button onClick={() => setStep(mode === 'opd' ? 3 : 2)} className="btn-outline flex items-center gap-1 flex-1">
                <ChevronLeft size={16} /> Back
              </button>
              <button onClick={handleBook} disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                {loading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}