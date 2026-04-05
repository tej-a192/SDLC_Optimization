import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Upload, FileText, Sparkles, Server, Globe, ArrowLeft,
    Palette, Code2, TestTube, Rocket, CheckCircle2, Clock,
    Database, Brain, Layers
} from 'lucide-react'
import { createProject } from '../services/api'

const LLM_PROVIDERS = [
    {
        id: 'gemini',
        name: 'Google Gemini',
        model: 'gemini-2.0-flash',
        context: '1M tokens',
        icon: Globe,
        color: '#4285f4',
        description: 'Best for large SRS documents',
    },
    {
        id: 'openai',
        name: 'OpenAI',
        model: 'gpt-4o',
        context: '128K tokens',
        icon: Sparkles,
        color: '#10b981',
        description: 'High-quality code generation',
    },
    {
        id: 'ollama',
        name: 'Ollama (Local)',
        model: 'llama3',
        context: 'Depends on model',
        icon: Server,
        color: '#f59e0b',
        description: 'Runs locally, no API key required',
    },
]

// RAG pre-processing steps — happens BEFORE Phase 1
const RAG_STEPS = [
    { key: 'preprocess', label: 'SRS Text Preprocessing',    icon: FileText  },
    { key: 'chunk',      label: 'Document Chunking',          icon: Layers    },
    { key: 'embed',      label: 'Vector Embedding Generation',icon: Brain     },
    { key: 'store',      label: 'Vector Store Indexing',      icon: Database  },
]

// The 5 real SDLC phases executed by the backend orchestrators
const PIPELINE_PHASES = [
    {
        key: 'requirement_analysis',
        label: 'Requirements Analysis',
        description: 'LLM analyzes SRS → extracts FRs, NFRs, entities → generates RA Document + PDF',
        icon: FileText,
        color: '#6366f1',
        estimatedMs: 25000,
    },
    {
        key: 'design',
        label: 'System Design',
        description: 'LLM generates Design Document with Class, Sequence, ER & Architecture Mermaid diagrams',
        icon: Palette,
        color: '#8b5cf6',
        estimatedMs: 30000,
    },
    {
        key: 'implementation',
        label: 'Code Generation',
        description: 'LLM plans folder structure → generates each source file (FastAPI backend + React/Vite frontend)',
        icon: Code2,
        color: '#06b6d4',
        estimatedMs: 45000,
    },
    {
        key: 'testing',
        label: 'Testing & QA',
        description: 'LLM generates pytest backend tests + vitest frontend tests + API integration tests',
        icon: TestTube,
        color: '#10b981',
        estimatedMs: 20000,
    },
    {
        key: 'deployment',
        label: 'Cloud Deployment',
        description: 'LLM generates Dockerfiles, docker-compose, GitHub Actions CI/CD pipeline, Nginx config',
        icon: Rocket,
        color: '#f59e0b',
        estimatedMs: 18000,
    },
]

// RAG finishes in ~3–4s, then phases start
const RAG_STEP_INTERVAL_MS = 800

function buildPhaseTimeline(phases) {
    let cumulative = 0
    return phases.map(p => {
        const start = cumulative
        cumulative += p.estimatedMs
        return { ...p, start, end: cumulative }
    })
}

// ── RAG Pre-processing Panel ──────────────────────────────────────────────────
function RagPreprocessPanel({ ragStep, ragDone }) {
    return (
        <div className="glass-card overflow-hidden mb-4">
            <div className="px-5 py-3 flex items-center justify-between"
                style={{ borderBottom: '1px solid var(--color-border)' }}>
                <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                        RAG Pre-processing
                    </span>
                    <span className="text-xs ml-1" style={{ color: 'var(--color-text-muted)' }}>
                        — runs on SRS before Phase 1
                    </span>
                </div>
                {ragDone ? (
                    <span className="text-xs px-2 py-0.5 rounded-lg font-medium"
                        style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--color-success)' }}>
                        ✓ Complete
                    </span>
                ) : (
                    <span className="text-xs px-2 py-0.5 rounded-lg"
                        style={{ background: 'rgba(6,182,212,0.1)', color: 'var(--color-accent)' }}>
                        {ragStep}/{RAG_STEPS.length} steps
                    </span>
                )}
            </div>

            <div className="px-5 py-3 flex items-center gap-0">
                {RAG_STEPS.map((step, idx) => {
                    const StepIcon = step.icon
                    const done  = idx < ragStep
                    const active = idx === ragStep && !ragDone

                    return (
                        <div key={step.key} className="flex items-center">
                            {/* Step bubble */}
                            <div className="flex flex-col items-center">
                                <div className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-400"
                                    style={{
                                        background: done
                                            ? 'rgba(16,185,129,0.2)'
                                            : active
                                            ? 'rgba(6,182,212,0.2)'
                                            : 'var(--color-surface-lighter)',
                                        border: active ? '1px solid var(--color-accent)' : '1px solid transparent',
                                    }}>
                                    {done ? (
                                        <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} />
                                    ) : (
                                        <StepIcon className="w-3 h-3"
                                            style={{
                                                color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
                                                ...(active && { animation: 'spin 2s linear infinite' }),
                                            }} />
                                    )}
                                </div>
                                <span className="text-xs mt-1 text-center max-w-16 leading-tight"
                                    style={{
                                        color: done
                                            ? 'var(--color-success)'
                                            : active
                                            ? 'var(--color-accent)'
                                            : 'var(--color-text-muted)',
                                        fontSize: '0.6rem',
                                    }}>
                                    {step.label}
                                </span>
                            </div>

                            {/* Connector */}
                            {idx < RAG_STEPS.length - 1 && (
                                <div className="flex-1 h-px mx-2 transition-all duration-500 mb-4"
                                    style={{
                                        background: idx < ragStep - 1
                                            ? 'var(--color-success)'
                                            : 'var(--color-surface-lighter)',
                                        minWidth: 24,
                                    }} />
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// ── Execution View ────────────────────────────────────────────────────────────
function ExecutionView({ ragStep, ragDone, activePhaseIndex, completedPhaseCount, elapsedSeconds }) {
    const overallPct = Math.min(100, Math.round(
        (ragDone ? (completedPhaseCount / 5) * 100 : (ragStep / RAG_STEPS.length) * 10)
    ))

    return (
        <div className="animate-fade-in-up">
            {/* Progress Header */}
            <div className="glass-card p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold gradient-text">Running SDLC Pipeline</h2>
                        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                            AI is generating your full project — this may take a few minutes
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        <Clock className="w-4 h-4" />
                        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:
                            {String(elapsedSeconds % 60).padStart(2, '0')}
                        </span>
                    </div>
                </div>

                <div className="mb-1 flex items-center justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    <span>Overall Progress</span>
                    <span style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}>{overallPct}%</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-lighter)' }}>
                    <div className="h-full rounded-full transition-all duration-1000"
                        style={{
                            width: `${overallPct}%`,
                            background: 'linear-gradient(90deg, var(--color-accent), var(--color-primary), var(--color-secondary))',
                        }} />
                </div>
                <p className="mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {!ragDone
                        ? `RAG pre-processing — step ${ragStep} of ${RAG_STEPS.length}`
                        : `${completedPhaseCount} of 5 SDLC phases complete`}
                </p>
            </div>

            {/* RAG Pre-processing */}
            <RagPreprocessPanel ragStep={ragStep} ragDone={ragDone} />

            {/* Phase Tracker */}
            <div className="glass-card overflow-hidden">
                <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                        SDLC Pipeline — Phase Execution
                    </h3>
                </div>
                <div>
                    {PIPELINE_PHASES.map((phase, idx) => {
                        const Icon = phase.icon
                        const isDone    = idx < completedPhaseCount
                        const isRunning = ragDone && idx === activePhaseIndex && !isDone
                        const rowClass  = isDone
                            ? 'phase-row-done'
                            : isRunning
                            ? 'phase-row-running'
                            : 'phase-row-pending'

                        return (
                            <div key={phase.key}
                                className={`flex items-center gap-4 px-6 py-4 transition-all duration-500 ${rowClass}`}
                                style={{ borderBottom: idx < 4 ? '1px solid var(--color-border)' : 'none' }}>

                                {/* Badge */}
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
                                    style={{
                                        background: isDone
                                            ? 'rgba(16,185,129,0.15)'
                                            : isRunning
                                            ? `${phase.color}20`
                                            : 'var(--color-surface-lighter)',
                                        color: isDone
                                            ? 'var(--color-success)'
                                            : isRunning
                                            ? phase.color
                                            : 'var(--color-text-muted)',
                                    }}>
                                    {isDone ? (
                                        <CheckCircle2 className="w-5 h-5" />
                                    ) : isRunning ? (
                                        <Icon className="w-5 h-5" style={{ animation: 'spin 2s linear infinite' }} />
                                    ) : (
                                        <span>{idx + 1}</span>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm font-medium block" style={{
                                        color: isDone ? 'var(--color-success)' : isRunning ? 'white' : 'var(--color-text-muted)',
                                    }}>
                                        Phase {idx + 1}: {phase.label}
                                    </span>
                                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
                                        {phase.description}
                                    </p>
                                </div>

                                {/* Status */}
                                <div className="flex-shrink-0">
                                    {isDone ? (
                                        <span className="text-xs px-2 py-1 rounded-lg font-medium"
                                            style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--color-success)' }}>
                                            ✓ Done
                                        </span>
                                    ) : isRunning ? (
                                        <span className="text-xs px-2 py-1 rounded-lg font-medium"
                                            style={{ background: `${phase.color}20`, color: phase.color, border: `1px solid ${phase.color}40` }}>
                                            ⚡ Running
                                        </span>
                                    ) : (
                                        <span className="text-xs px-2 py-1 rounded-lg"
                                            style={{ background: 'var(--color-surface-lighter)', color: 'var(--color-text-muted)' }}>
                                            Pending
                                        </span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

// ── Main Wizard ───────────────────────────────────────────────────────────────
export default function ProjectWizard() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)

    const [projectName, setProjectName]   = useState('')
    const [inputMethod, setInputMethod]   = useState('text')
    const [srsText, setSrsText]           = useState('')
    const [srsFile, setSrsFile]           = useState(null)
    const [llmProvider, setLlmProvider]   = useState('gemini')
    const [ollamaUrl, setOllamaUrl]       = useState('http://localhost:11434')

    const [loading, setLoading]                   = useState(false)
    const [error, setError]                       = useState('')
    const [ragStep, setRagStep]                   = useState(0)
    const [ragDone, setRagDone]                   = useState(false)
    const [activePhaseIndex, setActivePhaseIndex] = useState(0)
    const [completedPhaseCount, setCompletedPhaseCount] = useState(0)
    const [elapsedSeconds, setElapsedSeconds]     = useState(0)

    const timerRef    = useRef(null)
    const ragTimerRef = useRef(null)
    const phaseTimerRef = useRef(null)
    const startTimeRef  = useRef(null)

    const canProceedStep1 = projectName.trim().length > 0
    const canProceedStep2 = inputMethod === 'text' ? srsText.trim().length > 0 : srsFile !== null

    useEffect(() => {
        if (loading) {
            startTimeRef.current = Date.now()

            // Clock
            timerRef.current = setInterval(() => {
                setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000))
            }, 1000)

            // RAG steps — advance every RAG_STEP_INTERVAL_MS ms
            let ragCount = 0
            ragTimerRef.current = setInterval(() => {
                ragCount += 1
                setRagStep(ragCount)
                if (ragCount >= RAG_STEPS.length) {
                    clearInterval(ragTimerRef.current)
                    setRagDone(true)
                    startPhaseSimulation()
                }
            }, RAG_STEP_INTERVAL_MS)
        } else {
            clearInterval(timerRef.current)
            clearInterval(ragTimerRef.current)
            clearInterval(phaseTimerRef.current)
        }

        return () => {
            clearInterval(timerRef.current)
            clearInterval(ragTimerRef.current)
            clearInterval(phaseTimerRef.current)
        }
    }, [loading])

    const startPhaseSimulation = () => {
        const timeline = buildPhaseTimeline(PIPELINE_PHASES)
        const scaled   = timeline.map(p => ({
            ...p,
            start: p.start * 0.85,
            end:   p.end   * 0.85,
        }))

        const simStart = Date.now()
        phaseTimerRef.current = setInterval(() => {
            const elapsed = Date.now() - simStart
            let completed = 0
            let active    = 0
            for (let i = 0; i < scaled.length; i++) {
                if (elapsed >= scaled[i].end) {
                    completed = i + 1
                    active    = i + 1
                } else if (elapsed >= scaled[i].start) {
                    active = i
                    break
                }
            }
            setActivePhaseIndex(Math.min(active, PIPELINE_PHASES.length - 1))
            setCompletedPhaseCount(Math.min(completed, PIPELINE_PHASES.length - 1))
        }, 500)
    }

    const handleSubmit = async () => {
        try {
            setLoading(true)
            setError('')
            setRagStep(0)
            setRagDone(false)
            setActivePhaseIndex(0)
            setCompletedPhaseCount(0)
            setElapsedSeconds(0)

            const result = await createProject({
                projectName,
                srsText: inputMethod === 'text' ? srsText : null,
                srsFile: inputMethod === 'pdf' ? srsFile : null,
                llmProvider,
                ollamaUrl: llmProvider === 'ollama' ? ollamaUrl : null,
            })

            // Mark everything done
            setRagStep(RAG_STEPS.length)
            setRagDone(true)
            setCompletedPhaseCount(5)
            setActivePhaseIndex(4)

            setTimeout(() => navigate(`/project/${result.project_id}`), 1200)
        } catch (err) {
            setError(err.response?.data?.detail || 'An error occurred while creating the project.')
            setLoading(false)
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file && file.type === 'application/pdf') {
            setSrsFile(file)
            setError('')
        } else {
            setError('Please upload a valid PDF file.')
        }
    }

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold gradient-text mb-2">Generating Project</h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        {projectName} — {llmProvider.toUpperCase()} pipeline running
                    </p>
                </div>
                <ExecutionView
                    ragStep={ragStep}
                    ragDone={ragDone}
                    activePhaseIndex={activePhaseIndex}
                    completedPhaseCount={completedPhaseCount}
                    elapsedSeconds={elapsedSeconds}
                />
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8 animate-fade-in-up">
                <button onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-sm mb-4 cursor-pointer transition-colors duration-200"
                    style={{ color: 'var(--color-text-muted)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary-light)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>
                <h1 className="text-3xl font-bold gradient-text mb-2">Create New Project</h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>Configure and generate your SDLC project</p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-4 mb-10 animate-fade-in-up delay-100" style={{ opacity: 0 }}>
                {['Project Info', 'SRS Input', 'LLM Provider'].map((label, i) => (
                    <div key={label} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                            style={{
                                background: step > i + 1 ? 'var(--color-success)' : step === i + 1 ? 'var(--color-primary)' : 'var(--color-surface-lighter)',
                                color: 'white',
                            }}>
                            {step > i + 1 ? '✓' : i + 1}
                        </div>
                        <span className="text-sm hidden md:inline"
                            style={{ color: step === i + 1 ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                            {label}
                        </span>
                        {i < 2 && (
                            <div className="w-12 h-0.5 mx-2"
                                style={{ background: step > i + 1 ? 'var(--color-success)' : 'var(--color-surface-lighter)' }} />
                        )}
                    </div>
                ))}
            </div>

            {/* Step 1 */}
            {step === 1 && (
                <div className="glass-card p-8 animate-fade-in-up delay-200" style={{ opacity: 0 }}>
                    <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>Project Information</h2>
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Project Name</label>
                        <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)}
                            placeholder="e.g. E-Commerce Platform"
                            className="w-full px-4 py-3 rounded-xl placeholder-gray-500 outline-none transition-all duration-200"
                            style={{ background: 'var(--color-surface-light)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
                            onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                            onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
                    </div>
                    <button onClick={() => canProceedStep1 && setStep(2)} disabled={!canProceedStep1}
                        className="w-full py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer"
                        style={{
                            background: canProceedStep1 ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' : 'var(--color-surface-lighter)',
                            color: canProceedStep1 ? 'white' : 'var(--color-text-primary)',
                            opacity: canProceedStep1 ? 1 : 0.5,
                        }}>
                        Continue
                    </button>
                </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
                <div className="glass-card p-8 animate-fade-in-up">
                    <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>SRS Document Input</h2>
                    <div className="flex gap-3 mb-6">
                        {[{ id: 'text', label: 'Paste Text', icon: FileText }, { id: 'pdf', label: 'Upload PDF', icon: Upload }].map(({ id, label, icon: Icon }) => (
                            <button key={id} onClick={() => setInputMethod(id)}
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
                                style={{
                                    background: inputMethod === id ? 'rgba(99,102,241,0.15)' : 'var(--color-surface-light)',
                                    border: `1px solid ${inputMethod === id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                    color: inputMethod === id ? 'var(--color-primary-light)' : 'var(--color-text-secondary)',
                                }}>
                                <Icon className="w-4 h-4" /> {label}
                            </button>
                        ))}
                    </div>
                    {inputMethod === 'text' ? (
                        <textarea value={srsText} onChange={e => setSrsText(e.target.value)}
                            placeholder="Paste your Software Requirements Specification here..."
                            rows={12} className="w-full px-4 py-3 rounded-xl placeholder-gray-500 resize-none outline-none transition-all duration-200"
                            style={{ background: 'var(--color-surface-light)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
                            onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                            onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
                    ) : (
                        <div className="p-8 rounded-xl text-center cursor-pointer transition-all duration-200"
                            style={{ border: '2px dashed var(--color-border)', background: 'var(--color-surface-light)' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                            onClick={() => document.getElementById('pdf-upload').click()}>
                            <Upload className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
                            {srsFile ? (
                                <p className="text-sm" style={{ color: 'var(--color-success)' }}>✓ {srsFile.name} ({(srsFile.size / 1024).toFixed(1)} KB)</p>
                            ) : (
                                <>
                                    <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>Click to upload SRS document</p>
                                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>PDF format only</p>
                                </>
                            )}
                            <input id="pdf-upload" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                        </div>
                    )}
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl font-medium cursor-pointer"
                            style={{ background: 'var(--color-surface-lighter)', color: 'var(--color-text-secondary)' }}>Back</button>
                        <button onClick={() => canProceedStep2 && setStep(3)} disabled={!canProceedStep2}
                            className="flex-1 py-3 rounded-xl font-medium cursor-pointer"
                            style={{
                                background: canProceedStep2 ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' : 'var(--color-surface-lighter)',
                                color: canProceedStep2 ? 'white' : 'var(--color-text-primary)',
                                opacity: canProceedStep2 ? 1 : 0.5,
                            }}>Continue</button>
                    </div>
                </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
                <div className="glass-card p-8 animate-fade-in-up">
                    <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>Select AI Provider</h2>
                    <div className="space-y-3 mb-6">
                        {LLM_PROVIDERS.map(({ id, name, model, context, icon: Icon, color, description }) => (
                            <button key={id} onClick={() => setLlmProvider(id)}
                                className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200 cursor-pointer"
                                style={{
                                    background: llmProvider === id ? `${color}15` : 'var(--color-surface-light)',
                                    border: `1px solid ${llmProvider === id ? color : 'var(--color-border)'}`,
                                }}>
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                                    <Icon className="w-5 h-5" style={{ color }} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{name}</span>
                                        <span className="px-2 py-0.5 rounded text-xs" style={{ background: `${color}20`, color }}>{model}</span>
                                    </div>
                                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{description} • {context}</p>
                                </div>
                                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                                    style={{ borderColor: llmProvider === id ? color : 'var(--color-surface-lighter)' }}>
                                    {llmProvider === id && <div className="w-3 h-3 rounded-full" style={{ background: color }} />}
                                </div>
                            </button>
                        ))}
                    </div>

                    {llmProvider === 'ollama' && (
                        <div className="mb-6 animate-fade-in-up">
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Ollama Server URL</label>
                            <input type="text" value={ollamaUrl} onChange={e => setOllamaUrl(e.target.value)}
                                placeholder="http://localhost:11434"
                                className="w-full px-4 py-3 rounded-xl placeholder-gray-500 outline-none transition-all duration-200"
                                style={{ background: 'var(--color-surface-light)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
                                onFocus={e => e.target.style.borderColor = 'var(--color-warning)'}
                                onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)' }}>
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl font-medium cursor-pointer"
                            style={{ background: 'var(--color-surface-lighter)', color: 'var(--color-text-secondary)' }}>Back</button>
                        <button onClick={handleSubmit}
                            className="flex-1 py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2 cursor-pointer"
                            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}>
                            <Sparkles className="w-4 h-4" /> Generate Project
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
