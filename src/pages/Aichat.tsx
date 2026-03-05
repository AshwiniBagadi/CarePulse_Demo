import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../ThemeContext'
import {
  ChevronLeft, Sun, Moon, Brain,
  Send, Loader2, User, RefreshCw
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

type Message = { role: 'user' | 'assistant'; text: string }

const QUICK_PROMPTS = [
  'I have chest pain and shortness of breath',
  'My child has a high fever for 2 days',
  'I have severe knee pain',
  'I feel dizzy and have headaches',
]

// Simple rule-based symptom checker (no API needed)
function analyzeSymptoms(input: string): string {
  const lower = input.toLowerCase()
  if (lower.includes('chest') || lower.includes('heart') || lower.includes('palpitation'))
    return `Based on your symptoms, I suggest visiting **Cardiology**.\n\nChest pain and heart-related symptoms need prompt attention. Please book an appointment with a cardiologist as soon as possible. If the pain is severe or sudden, please call **108** immediately.\n\n*This is not a medical diagnosis. Always consult a qualified doctor.*`
  if (lower.includes('fever') || lower.includes('cold') || lower.includes('cough') || lower.includes('flu'))
    return `Based on your symptoms, I suggest visiting **General Medicine**.\n\nFever, cold and cough are commonly handled by a general physician. Stay hydrated and rest. If fever exceeds 103°F or persists beyond 3 days, seek immediate care.\n\n*This is not a medical diagnosis. Always consult a qualified doctor.*`
  if (lower.includes('child') || lower.includes('baby') || lower.includes('infant') || lower.includes('kid'))
    return `Based on your symptoms, I suggest visiting **Pediatrics**.\n\nFor children's health concerns, a pediatrician is the best choice. Bring the child's vaccination records if available.\n\n*This is not a medical diagnosis. Always consult a qualified doctor.*`
  if (lower.includes('knee') || lower.includes('bone') || lower.includes('joint') || lower.includes('fracture') || lower.includes('back'))
    return `Based on your symptoms, I suggest visiting **Orthopedics**.\n\nBone and joint issues are handled by orthopedic specialists. Avoid putting weight on painful areas until examined.\n\n*This is not a medical diagnosis. Always consult a qualified doctor.*`
  if (lower.includes('eye') || lower.includes('vision') || lower.includes('blind') || lower.includes('blur'))
    return `Based on your symptoms, I suggest visiting **Ophthalmology**.\n\nEye and vision symptoms should be evaluated by an ophthalmologist. Avoid rubbing your eyes.\n\n*This is not a medical diagnosis. Always consult a qualified doctor.*`
  if (lower.includes('skin') || lower.includes('rash') || lower.includes('acne') || lower.includes('allergy') || lower.includes('itch'))
    return `Based on your symptoms, I suggest visiting **Dermatology**.\n\nSkin conditions are treated by dermatologists. Avoid scratching or applying unknown creams.\n\n*This is not a medical diagnosis. Always consult a qualified doctor.*`
  if (lower.includes('ear') || lower.includes('nose') || lower.includes('throat') || lower.includes('hearing') || lower.includes('tonsil'))
    return `Based on your symptoms, I suggest visiting **ENT (Ear, Nose & Throat)**.\n\nENT specialists handle ear, nose and throat conditions. Steam inhalation may offer temporary relief.\n\n*This is not a medical diagnosis. Always consult a qualified doctor.*`
  if (lower.includes('brain') || lower.includes('seizure') || lower.includes('memory') || lower.includes('migraine') || lower.includes('dizzy') || lower.includes('headache'))
    return `Based on your symptoms, I suggest visiting **Neurology**.\n\nHeadaches and neurological symptoms need evaluation by a neurologist. Rest in a quiet, dark room if you have a migraine.\n\n*This is not a medical diagnosis. Always consult a qualified doctor.*`
  return `Thank you for describing your symptoms. Based on what you've shared, I recommend visiting **General Medicine** first — they can assess your condition and refer you to a specialist if needed.\n\nWould you like to book an appointment now?\n\n*This is not a medical diagnosis. Always consult a qualified doctor.*`
}

export default function AIChat() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: "Hi! I'm CarePulse AI. Describe your symptoms and I'll suggest which department to visit. Remember, I'm here to guide you — always consult a real doctor for diagnosis." }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', text: text.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setTimeout(() => {
      const reply = analyzeSymptoms(text)
      setMessages(prev => [...prev, { role: 'assistant', text: reply }])
      setLoading(false)
    }, 900)
  }

  const reset = () => {
    setMessages([{ role: 'assistant', text: "Hi! I'm CarePulse AI. Describe your symptoms and I'll suggest which department to visit." }])
    setInput('')
  }

  return (
    <div className="mesh-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
              <Brain size={16} color="white" />
            </div>
            <span className="font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--teal-primary)' }}>
              AI Symptom Check
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={reset} className="p-2 rounded-xl hover:opacity-70 transition"
              style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>
              <RefreshCw size={14} />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 flex flex-col gap-4" style={{ maxHeight: 'calc(100vh - 130px)' }}>

        {/* Quick prompts */}
        {messages.length === 1 && (
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-faint)' }}>QUICK PROMPTS</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map(p => (
                <button key={p} onClick={() => sendMessage(p)}
                  className="text-xs px-3 py-1.5 rounded-full font-medium transition-all hover:opacity-80"
                  style={{ background: 'var(--teal-light)', color: 'var(--teal-primary)', border: '1px solid var(--border)' }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: msg.role === 'assistant' ? 'var(--gradient-hero)' : 'var(--bg-muted)' }}>
                {msg.role === 'assistant'
                  ? <Brain size={14} color="white" />
                  : <User size={14} style={{ color: 'var(--text-muted)' }} />}
              </div>
              <div className="max-w-xs sm:max-w-sm">
                <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                  style={{
                    background: msg.role === 'assistant' ? 'var(--bg-surface)' : 'var(--gradient-hero)',
                    color: msg.role === 'assistant' ? 'var(--text-primary)' : 'white',
                    border: msg.role === 'assistant' ? '1px solid var(--border-muted)' : 'none',
                    borderRadius: msg.role === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                    boxShadow: 'var(--shadow-card)'
                  }}>
                  {msg.text.split('\n').map((line, j) => (
                    <p key={j} className={j > 0 ? 'mt-1' : ''}>
                      {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                    </p>
                  ))}
                </div>
                {msg.role === 'assistant' && msg.text.includes('department') && messages.indexOf(msg) > 0 && (
                  <button onClick={() => navigate('/book')}
                    className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-full transition-all hover:opacity-80"
                    style={{ background: 'var(--teal-light)', color: 'var(--teal-primary)', border: '1px solid var(--border)' }}>
                    Book Appointment →
                  </button>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'var(--gradient-hero)' }}>
                <Brain size={14} color="white" />
              </div>
              <div className="px-4 py-3 rounded-2xl flex items-center gap-2"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-muted)' }}>
                <Loader2 size={14} className="animate-spin" style={{ color: 'var(--teal-primary)' }} />
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Analyzing...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2 pt-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            placeholder="Describe your symptoms..."
            className="input-field flex-1"
          />
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
            className="btn-primary shrink-0 flex items-center justify-center"
            style={{ padding: '12px 16px', borderRadius: '12px' }}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}