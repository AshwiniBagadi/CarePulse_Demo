import { useNavigate } from 'react-router-dom'
import { useTheme } from '../ThemeContext'
import {
  HeartPulse, ChevronLeft, Sun, Moon, Shield, CheckCircle2,
  Users, Building2, Heart, Baby, Stethoscope, ChevronDown, ChevronUp,
  ExternalLink
} from 'lucide-react'
import { useState } from 'react'

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

const SCHEMES = [
  {
    id: 'pmjay',
    name: 'PM-JAY',
    full: 'Pradhan Mantri Jan Arogya Yojana',
    Icon: Shield,
    accent: 'var(--teal-primary)',
    bg: 'var(--teal-light)',
    coverage: '₹5 Lakh/year',
    eligibility: 'Families listed in SECC database (Socio-Economic Caste Census), BPL families, and deprived rural/occupational urban families.',
    benefits: [
      'Free hospitalization up to ₹5 lakh per family per year',
      'Covers 1,500+ medical and surgical procedures',
      'Cashless treatment at 25,000+ empanelled hospitals',
      'Pre & post hospitalization expenses covered (3 days pre, 15 days post)',
      'No cap on family size or age',
    ],
    applyUrl: 'https://pmjay.gov.in',
    checkEligibilityUrl: 'https://mera.pmjay.gov.in',
  },
  {
    id: 'ayushman',
    name: 'Ayushman Bharat HWC',
    full: 'Ayushman Bharat Health & Wellness Centres',
    Icon: Heart,
    accent: 'var(--red-emergency)',
    bg: 'var(--red-light)',
    coverage: 'Free OPD & preventive care',
    eligibility: 'All citizens of India — no income restriction for basic services at Health & Wellness Centres.',
    benefits: [
      'Free OPD consultations at nearest HWC',
      'Free medicines & diagnostics for common conditions',
      'Maternal & child health services',
      'Mental health & palliative care services',
      'Screening for NCDs (diabetes, hypertension, cancers)',
    ],
    applyUrl: 'https://nhm.gov.in/index4.php?lang=1&level=0&linkid=311&lid=303',
    checkEligibilityUrl: 'https://abdm.gov.in',
  },
  {
    id: 'cghs',
    name: 'CGHS',
    full: 'Central Government Health Scheme',
    Icon: Building2,
    accent: 'var(--sky-accent)',
    bg: 'var(--sky-light)',
    coverage: 'Full comprehensive coverage',
    eligibility: 'Central government employees, pensioners, and their dependants in covered cities.',
    benefits: [
      'OPD treatment at CGHS wellness centres',
      'Specialist consultations at government hospitals',
      'Full hospitalization coverage (govt & empanelled pvt)',
      'Supply of medicines through CGHS dispensaries',
      'Reimbursement for non-CGHS areas',
    ],
    applyUrl: 'https://cghs.gov.in',
    checkEligibilityUrl: 'https://cghs.gov.in/index1.php?lang=1&level=1&sublinkid=88&lid=112',
  },
  {
    id: 'esic',
    name: 'ESIC',
    full: 'Employees State Insurance Corporation',
    Icon: Users,
    accent: 'var(--violet)',
    bg: 'var(--violet-light)',
    coverage: 'Full medical care for insured',
    eligibility: 'Employees in factories/establishments with 10+ workers earning up to ₹21,000/month.',
    benefits: [
      'Free comprehensive medical care for insured persons & family',
      'Sickness cash benefit (70% of wages for up to 91 days)',
      'Maternity benefit (26 weeks at full wages)',
      'Disablement & dependants benefit',
      'Funeral expenses up to ₹15,000',
    ],
    applyUrl: 'https://esic.gov.in',
    checkEligibilityUrl: 'https://esic.gov.in/establishment-search',
  },
  {
    id: 'mjpjay',
    name: 'MJPJAY',
    full: 'Mahatma Jyotiba Phule Jan Arogya Yojana',
    Icon: Stethoscope,
    accent: 'var(--amber)',
    bg: 'var(--amber-light)',
    coverage: '₹1.5 Lakh/year',
    eligibility: 'Maharashtra residents with yellow, orange, or white ration cards. Farmers in 14 drought-affected districts also eligible.',
    benefits: [
      'Cashless treatment up to ₹1.5 lakh per year',
      'Covers 971+ medical & surgical procedures',
      'Available at 488+ network hospitals in Maharashtra',
      'Kidney transplant coverage up to ₹2.5 lakh',
      'Includes pre & post hospitalization expenses',
    ],
    applyUrl: 'https://www.jeevandayee.gov.in',
    checkEligibilityUrl: 'https://www.jeevandayee.gov.in/Home/Beneficiary',
  },
  {
    id: 'rsby',
    name: 'RSBY',
    full: 'Rashtriya Swasthya Bima Yojana',
    Icon: Baby,
    accent: 'var(--teal-primary)',
    bg: 'var(--teal-light)',
    coverage: '₹30,000/year',
    eligibility: 'BPL (Below Poverty Line) families as identified by state governments.',
    benefits: [
      'Cashless hospitalization up to ₹30,000 per family per year',
      'Covers entire family (maximum 5 members)',
      'Smart card-based system — no paperwork at hospital',
      '₹100 transport allowance per hospitalization visit',
      'Pre-existing diseases covered from day one',
    ],
    applyUrl: 'https://www.india.gov.in/spotlight/rashtriya-swasthya-bima-yojana',
    checkEligibilityUrl: 'https://www.india.gov.in/spotlight/rashtriya-swasthya-bima-yojana',
  },
]

export default function GovtSchemes() {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState<string | null>(null)

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
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
              <HeartPulse size={16} color="white" />
            </div>
            <span className="font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--teal-primary)' }}>Govt Schemes</span>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 page-transition">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold mb-1" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-primary)' }}>
            Government Health Schemes
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Tap any scheme to view eligibility, benefits, and official links</p>
        </div>

        {/* Banner */}
        <div className="rounded-2xl p-4 mb-6 flex items-start gap-3" style={{ background: 'var(--gradient-hero)' }}>
          <Shield size={20} color="white" className="shrink-0 mt-0.5" />
          <div className="text-white">
            <div className="font-bold text-sm mb-0.5">Auto-Detection Active</div>
            <div className="text-white/80 text-xs">CarePulse AI automatically checks your eligibility and applies schemes during booking</div>
          </div>
        </div>

        <div className="space-y-3">
          {SCHEMES.map(scheme => (
            <div key={scheme.id} className="card rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === scheme.id ? null : scheme.id)}
                className="w-full p-4 flex items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: scheme.bg }}>
                    <scheme.Icon size={20} style={{ color: scheme.accent }} />
                  </div>
                  <div>
                    <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{scheme.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{scheme.full}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full hidden sm:block"
                    style={{ background: scheme.bg, color: scheme.accent }}>
                    {scheme.coverage}
                  </span>
                  {expanded === scheme.id
                    ? <ChevronUp size={16} style={{ color: 'var(--text-faint)' }} />
                    : <ChevronDown size={16} style={{ color: 'var(--text-faint)' }} />}
                </div>
              </button>

              {expanded === scheme.id && (
                <div className="px-4 pb-4 border-t" style={{ borderColor: 'var(--border-muted)' }}>
                  <div className="pt-4 space-y-4">

                    {/* Coverage badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                      style={{ background: scheme.bg, color: scheme.accent }}>
                      Coverage: {scheme.coverage}
                    </div>

                    {/* Eligibility */}
                    <div>
                      <div className="text-xs font-bold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>Eligibility</div>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{scheme.eligibility}</p>
                    </div>

                    {/* Benefits */}
                    <div>
                      <div className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: 'var(--text-faint)' }}>Benefits</div>
                      <div className="space-y-2">
                        {scheme.benefits.map(b => (
                          <div key={b} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <CheckCircle2 size={13} className="shrink-0 mt-0.5" style={{ color: scheme.accent }} />
                            {b}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => navigate('/book')}
                        className="btn-primary flex-1 text-sm flex items-center justify-center gap-1.5"
                        style={{ padding: '10px' }}>
                        Book with this scheme
                      </button>
                      <a href={scheme.checkEligibilityUrl} target="_blank" rel="noopener noreferrer"
                        className="flex-1 text-sm font-semibold rounded-2xl flex items-center justify-center gap-1.5 transition-all hover:opacity-80"
                        style={{ padding: '10px', background: scheme.bg, color: scheme.accent, border: `1.5px solid ${scheme.accent}40`, textDecoration: 'none' }}>
                        Check Eligibility <ExternalLink size={12} />
                      </a>
                    </div>
                    <a href={scheme.applyUrl} target="_blank" rel="noopener noreferrer"
                      className="w-full text-sm font-semibold rounded-2xl flex items-center justify-center gap-2 py-2.5 transition-all hover:opacity-80"
                      style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)', border: '1px solid var(--border-muted)', textDecoration: 'none' }}>
                      <ExternalLink size={13} /> Visit Official Website
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}