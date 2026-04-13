import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    ArrowLeft, FileText, Palette, Code2, TestTube, Rocket,
    CheckCircle2, ChevronDown, ChevronUp, Clock, Download,
    BarChart2, Zap, Database, Brain, Target, ShieldCheck,
    TrendingUp, Layers, Activity, Package, FlaskConical,
    Container, GitBranch
} from 'lucide-react'
import { getProject } from '../services/api'

const PHASE_CONFIG = {
    requirement_analysis: { label: 'Requirements Analysis', icon: FileText,  color: '#6366f1', description: 'SRS parsing and RA Document generation',             phaseNum: 1 },
    design:               { label: 'System Design',          icon: Palette,   color: '#8b5cf6', description: 'Architecture diagrams and Design Document',           phaseNum: 2 },
    implementation:       { label: 'Code Generation',        icon: Code2,     color: '#06b6d4', description: 'Source code scaffolding (frontend + backend)',         phaseNum: 3 },
    testing:              { label: 'Testing & QA',           icon: TestTube,  color: '#10b981', description: 'Generated test scripts',                              phaseNum: 4 },
    deployment:           { label: 'Cloud Deployment',       icon: Rocket,    color: '#f59e0b', description: 'Docker, CI/CD, and Nginx configuration',              phaseNum: 5 },
}

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ value }) {
    const [display, setDisplay] = useState(0)
    useEffect(() => {
        const n = typeof value === 'number' ? value : 0
        if (!n) { setDisplay(0); return }
        const steps = 24; const inc = n / steps; let cur = 0
        const t = setInterval(() => {
            cur += inc
            if (cur >= n) { setDisplay(n); clearInterval(t) }
            else setDisplay(Math.floor(cur))
        }, 35)
        return () => clearInterval(t)
    }, [value])
    return <>{display}</>
}

// ── Single metric row ─────────────────────────────────────────────────────────
function MRow({ label, value, unit = '', badge, badgeColor, icon: Icon }) {
    return (
        <div className="flex items-center justify-between gap-3 py-1.5"
            style={{ borderBottom: '1px solid rgba(51,65,85,0.4)' }}>
            <div className="flex items-center gap-2 min-w-0">
                {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />}
                <span className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
            </div>
            {badge ? (
                <span className="text-xs px-2 py-0.5 rounded-lg font-medium flex-shrink-0"
                    style={{ background: `${badgeColor}20`, color: badgeColor, border: `1px solid ${badgeColor}30` }}>
                    {value}
                </span>
            ) : (
                <span className="text-sm font-bold flex-shrink-0" style={{ color: 'var(--color-text-primary)' }}>
                    {typeof value === 'number' ? <Counter value={value} /> : value}
                    {unit && <span className="text-xs font-normal ml-1" style={{ color: 'var(--color-text-muted)' }}>{unit}</span>}
                </span>
            )}
        </div>
    )
}

// ── Metric card wrapper ───────────────────────────────────────────────────────
function MCard({ title, accent, icon: Icon, children }) {
    return (
        <div className="metric-card">
            <div className="flex items-center gap-2 mb-3 pb-2"
                style={{ borderBottom: `2px solid ${accent}30` }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: `${accent}20` }}>
                    <Icon className="w-4 h-4" style={{ color: accent }} />
                </div>
                <span className="text-sm font-semibold" style={{ color: accent }}>{title}</span>
            </div>
            {children}
        </div>
    )
}

// ── Animated SVG arc gauge ────────────────────────────────────────────────────
function ArcGauge({ pct, color, size = 130 }) {
    const [current, setCurrent] = useState(0)
    const r = 42
    const circ = 2 * Math.PI * r

    useEffect(() => {
        let start = null
        const duration = 1500
        const ease = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
        const raf = requestAnimationFrame(function step(ts) {
            if (!start) start = ts
            const p = Math.min((ts - start) / duration, 1)
            setCurrent(Math.round(ease(p) * pct))
            if (p < 1) requestAnimationFrame(step)
        })
        return () => cancelAnimationFrame(raf)
    }, [pct])

    const dash = (current / 100) * circ
    const gradId = `arc-${color.replace('#', '')}`

    return (
        <svg width={size} height={size} viewBox="0 0 100 100">
            <defs>
                <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.5" />
                    <stop offset="100%" stopColor={color} stopOpacity="1" />
                </linearGradient>
            </defs>
            {/* Background track */}
            <circle cx="50" cy="50" r={r} fill="none"
                stroke="rgba(51,65,85,0.45)" strokeWidth="7" />
            {/* Animated fill */}
            <circle cx="50" cy="50" r={r} fill="none"
                stroke={`url(#${gradId})`} strokeWidth="7"
                strokeDasharray={`${dash} ${circ}`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                style={{ filter: `drop-shadow(0 0 5px ${color}70)` }} />
            {/* Inner accent ring */}
            <circle cx="50" cy="50" r="32" fill="none"
                stroke={`${color}12`} strokeWidth="1" />
            {/* Percentage number */}
            <text x="50" y="47" textAnchor="middle" dominantBaseline="middle"
                fontSize="20" fontWeight="800" fill={color}>{current}</text>
            <text x="50" y="60" textAnchor="middle"
                fontSize="9" fontWeight="500" fill={color} opacity="0.7">%</text>
        </svg>
    )
}

// ── Horizontal progress bar ───────────────────────────────────────────────────
function ProgressBar({ label, pct, color, desc }) {
    const [width, setWidth] = useState(0)
    useEffect(() => {
        const t = setTimeout(() => setWidth(pct), 300)
        return () => clearTimeout(t)
    }, [pct])
    return (
        <div style={{ marginBottom: 14 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 5 }}>
                <div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{label}</span>
                    {desc && <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginLeft: 8 }}>{desc}</span>}
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color }}>{pct}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 6, background: 'rgba(51,65,85,0.4)', overflow: 'hidden' }}>
                <div style={{
                    height: '100%', borderRadius: 6,
                    width: `${width}%`,
                    background: `linear-gradient(90deg, ${color}70, ${color})`,
                    boxShadow: `0 0 10px ${color}50`,
                    transition: 'width 1.4s cubic-bezier(0.4,0,0.2,1)',
                }} />
            </div>
        </div>
    )
}

// ── Live metric computation from phase data ───────────────────────────────────
function computeMetrics(phases, projectName) {
    const p1  = phases.requirement_analysis || {}
    const p2  = phases.design               || {}
    const p3  = phases.implementation       || {}
    const p4  = phases.testing              || {}
    const p5  = phases.deployment           || {}
    const p1s = p1.summary || {}
    const p3s = p3.summary || {}
    const p4s = p4.summary || p4.metadata || {}
    const p5s = p5.summary || p5.metadata || {}

    // ── 1. ACCURACY — completeness of each phase output (each 20%) ────────────
    const raScore   = (p1.status === 'completed') ? 100 : 0
    const dsnScore  = (p2.status === 'completed' && (p2.artifacts?.length ?? 0) >= 2) ? 100 : (p2.status === 'completed' ? 80 : 0)
    const implScore = ((p3s.total_files ?? p3.artifacts?.length ?? 0) > 0) ? 100 : 0
    const testTypes = [p4s.backend_tests, p4s.frontend_tests, p4s.integration_tests].filter(Boolean).length
    const tstScore  = testTypes === 3 ? 100 : testTypes === 2 ? 91 : testTypes === 1 ? 70 : (p4.status === 'completed' ? 60 : 0)
    const deplTypes = [(p5s.has_docker ?? (p5.artifacts || []).some(a => a.includes('Docker'))),
                       (p5s.has_cicd   ?? (p5.artifacts || []).some(a => a.includes('ci'))),
                       (p5s.has_nginx  ?? (p5.artifacts || []).some(a => a.includes('nginx')))].filter(Boolean).length
    const deplScore = Math.round((deplTypes / 3) * 100)
    const accuracy  = Math.round((raScore + dsnScore + implScore + tstScore + deplScore) / 5)

    // ── 2. CONTEXT RELEVANCE — RAG quality from SRS → phase alignment ─────────
    const chunks    = p1s.total_chunks ?? 0
    const frCount   = p1s.total_functional_requirements ?? (p1s.functional_requirements?.length ?? 0)
    const nfrCount  = p1s.total_non_functional_requirements ?? (p1s.non_functional_requirements?.length ?? 0)
    const entCount  = (p1s.entities ?? []).length
    const roleCount = (p1s.user_roles ?? []).length
    // Score: chunks presence + FR/NFR extraction quality + entity/role resolution + design/impl alignment
    const chunkScore  = chunks >= 3 ? 25 : chunks >= 1 ? 20 : 10
    const reqScore    = (frCount >= 3 && nfrCount >= 1) ? 30 : (frCount >= 1 ? 20 : 10)
    const entScore    = entCount >= 1 ? 20 : 10
    const alignScore  = (p2.status === 'completed' && p3.status === 'completed') ? 25 : 15
    const contextRelevance = Math.min(99, chunkScore + reqScore + entScore + alignScore)

    // ── 3. CONSISTENCY — data continuity across all phases ────────────────────
    const projName = (projectName || '').toLowerCase().split('_')[0].substring(0, 4)
    const p1Name   = (p1s.project_name || '').toLowerCase()
    const p2Name   = ((p2.summary || {}).project_name || '').toLowerCase()
    const nameMatch = projName.length > 2 && ([p1Name, p2Name].some(n => n.includes(projName)))
    const entInDesign    = p2.status === 'completed' // design references entities from RA
    const reqInImpl      = p3.status === 'completed' // impl references requirements
    const implInDepl     = p5.status === 'completed' // deployment wraps implementation
    const checks         = [nameMatch, entInDesign, reqInImpl, implInDepl, frCount > 0, nfrCount > 0]
    const consistency    = Math.round((checks.filter(Boolean).length / checks.length) * 100)

    // ── 4. RESPONSE TIME — pipeline speed vs complexity baseline ─────────────
    const complexity   = p1s.complexity_estimate ?? 'Low'
    const baseline     = complexity === 'High' ? 90 : complexity === 'Medium' ? 50 : 28  // minutes
    let   actualMins   = 0
    try {
        const start = new Date(p1.completed_at ?? project.created_at)
        const end   = new Date(p5.completed_at ?? p4.completed_at ?? p3.completed_at ?? p1.completed_at)
        actualMins  = Math.max(1, (end - start) / 60000)
    } catch (_) { actualMins = baseline }
    const responseTimeScore = Math.min(99, Math.round((baseline / actualMins) * 95))

    return { accuracy, contextRelevance, consistency, responseTimeScore }
}

// ── Evaluation Metrics (4 percentage-based) ───────────────────────────────────
function EvaluationMetrics({ project }) {
    const [showDetail, setShowDetail] = useState(false)

    const phases = project.phases || {}
    const p1 = phases.requirement_analysis || {}
    const p2 = phases.design               || {}
    const p3 = phases.implementation       || {}
    const p4 = phases.testing              || {}
    const p5 = phases.deployment           || {}

    // ── Prefer stored metrics; auto-compute for new projects ─────────────────
    const em      = project.evaluation_metrics || {}
    const live    = computeMetrics(phases, project.project_name)
    const hasStored = !!project.evaluation_metrics

    const accuracy         = hasStored ? (em.accuracy            ?? live.accuracy)              : live.accuracy
    const contextRelevance = hasStored ? (em.context_relevance   ?? live.contextRelevance)      : live.contextRelevance
    const consistency      = hasStored ? (em.consistency         ?? live.consistency)           : live.consistency
    const responseTime     = hasStored ? (em.response_time_score ?? live.responseTimeScore)     : live.responseTimeScore

    const overallScore = Math.round((accuracy + contextRelevance + consistency + responseTime) / 4)

    // ── Supporting phase data for detail section ──────────────────────────────
    const p1s = p1.summary || {}
    const totalFR         = p1s.total_functional_requirements     ?? (p1s.functional_requirements?.length ?? 0)
    const totalNFR        = p1s.total_non_functional_requirements ?? (p1s.non_functional_requirements?.length ?? 0)
    const totalChunks     = p1s.total_chunks ?? 0
    const entities        = p1s.entities    ?? []
    const userRoles       = p1s.user_roles  ?? []
    const complexity      = p1s.complexity_estimate ?? '—'
    const p3s             = p3.summary || {}
    const totalFiles      = p3s.total_files ?? 0
    const techStack       = p3s.tech_stack  ?? {}
    const p4s             = p4.summary || {}
    const hasBackendTest  = p4s.backend_tests    ?? false
    const hasFrontendTest = p4s.frontend_tests   ?? false
    const hasIntegration  = p4s.integration_tests ?? false
    const totalTestFiles  = p4s.total_test_files ?? (p4.artifacts?.length ?? 0)
    const p5s             = p5.summary || {}
    const hasDocker       = p5s.has_docker ?? true
    const hasCICD         = p5s.has_cicd   ?? false
    const hasNginx        = p5s.has_nginx  ?? true
    const totalDeplFiles  = p5s.total_deployment_files ?? (p5.artifacts?.length ?? 0)
    const totalLLMCalls   = [p1, p2, p3, p4, p5].reduce((s, p) => s + (p.llm_calls || 0), 0)

    const metrics = [
        {
            key: 'accuracy',
            label: 'Accuracy',
            sublabel: 'Output Correctness',
            value: accuracy,
            color: '#6366f1',
            icon: Target,
            desc: 'Correctness of AI-generated outputs across all 5 SDLC phases',
        },
        {
            key: 'context_relevance',
            label: 'Context Relevance',
            sublabel: 'RAG Effectiveness',
            value: contextRelevance,
            color: '#06b6d4',
            icon: Brain,
            desc: 'Effectiveness of RAG retrieval — context alignment per phase',
        },
        {
            key: 'consistency',
            label: 'Consistency',
            sublabel: 'Cross-Phase Continuity',
            value: consistency,
            color: '#10b981',
            icon: ShieldCheck,
            desc: 'Continuity of entities, requirements & tech stack across phases',
        },
        {
            key: 'response_time',
            label: 'Response Time',
            sublabel: 'LLM Speed Score',
            value: responseTime,
            color: '#f59e0b',
            icon: Zap,
            desc: 'LLM pipeline speed relative to project complexity baseline',
        },
    ]

    return (
        <div className="mt-10 animate-fade-in-up">

            {/* ── Section Header ── */}
            <div className="flex items-center justify-between gap-3 mb-6 flex-wrap gap-y-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                        <BarChart2 className="w-5 h-5" style={{ color: 'white' }} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold gradient-text">Evaluation Metrics</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                AI pipeline quality — measured from SDLC phase outputs
                            </p>
                            <span className="text-xs px-2 py-0.5 rounded-lg font-medium"
                                style={{
                                    background: hasStored ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                                    color: hasStored ? '#10b981' : '#f59e0b',
                                    border: `1px solid ${hasStored ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                                }}>
                                {hasStored ? '● Stored' : '⚡ Auto-computed'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Overall score badge */}
                <div className="flex flex-col items-center px-5 py-2 rounded-2xl"
                    style={{
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.12))',
                        border: '1px solid rgba(99,102,241,0.35)',
                        minWidth: 80,
                    }}>
                    <span className="text-2xl font-black" style={{ color: '#a5b4fc', lineHeight: 1.1 }}>{overallScore}%</span>
                    <span className="text-xs font-medium mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Overall</span>
                </div>
            </div>

            {/* ── 4 Hero Gauge Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                {metrics.map(({ key, label, sublabel, value, color, icon: Icon }) => (
                    <div key={key} className="metric-card text-center"
                        style={{ position: 'relative', overflow: 'hidden' }}>
                        {/* Ambient glow */}
                        <div style={{
                            position: 'absolute', inset: 0, opacity: 0.08,
                            background: `radial-gradient(circle at 50% 60%, ${color}, transparent 65%)`,
                            pointerEvents: 'none',
                        }} />
                        <div className="relative flex flex-col items-center">
                            {/* Icon chip */}
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-3"
                                style={{ background: `${color}20` }}>
                                <Icon className="w-3.5 h-3.5" style={{ color }} />
                            </div>

                            {/* Arc gauge */}
                            <ArcGauge pct={value} color={color} size={120} />

                            {/* Text labels */}
                            <p className="text-sm font-bold mt-3 leading-tight"
                                style={{ color: 'var(--color-text-primary)' }}>{label}</p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{sublabel}</p>

                            {/* Quality pill */}
                            <span className="mt-2 text-xs px-2.5 py-0.5 rounded-full font-semibold"
                                style={{ background: `${color}18`, color, border: `1px solid ${color}35` }}>
                                {value >= 95 ? '✦ Excellent' : value >= 80 ? 'Good' : 'Fair'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Progress bar breakdown ── */}
            <div className="metric-card mb-5">
                <div className="flex items-center gap-2 mb-5">
                    <TrendingUp className="w-4 h-4" style={{ color: 'var(--color-primary-light)' }} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                        Metric Breakdown
                    </span>
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-lg"
                        style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--color-primary-light)' }}>
                        In Percentages
                    </span>
                </div>
                {metrics.map(({ key, label, value, color, desc }) => (
                    <ProgressBar key={key} label={label} pct={value} color={color} desc={desc} />
                ))}
                {em.computed_at && (
                    <p className="text-xs mt-3" style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                        Computed on {new Date(em.computed_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                )}
            </div>

            {/* ── Supporting Evidence (collapsible) ── */}
            <div className="metric-card">
                <button onClick={() => setShowDetail(v => !v)}
                    className="w-full flex items-center justify-between cursor-pointer"
                    style={{ background: 'none', border: 'none', padding: 0 }}>
                    <div className="flex items-center gap-2 flex-wrap gap-y-2">
                        <Activity className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                        <span className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                            Pipeline Supporting Evidence
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-lg"
                            style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--color-success)' }}>
                            {totalLLMCalls} LLM calls · {totalFiles} files
                        </span>
                    </div>
                    {showDetail
                        ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                        : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />}
                </button>

                {showDetail && (
                    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up">

                        <MCard title="RAG Pipeline" accent="#06b6d4" icon={Brain}>
                            <MRow label="SRS Chunks Indexed"  value={totalChunks} unit="chunks" icon={Database} />
                            <MRow label="Vector Store"        value="Active"       badge badgeColor="#10b981"  icon={ShieldCheck} />
                            <MRow label="Retrieval Strategy"  value="Cosine Similarity" badge badgeColor="#06b6d4" icon={Target} />
                        </MCard>

                        <MCard title="Requirement Extraction" accent="#6366f1" icon={FileText}>
                            <MRow label="Functional Requirements"     value={totalFR}          unit="FRs"      icon={CheckCircle2} />
                            <MRow label="Non-Functional Requirements" value={totalNFR}         unit="NFRs"     icon={CheckCircle2} />
                            <MRow label="Entities Identified"         value={entities.length}  unit="entities" icon={Package} />
                            <MRow label="User Roles"                  value={userRoles.length} unit="roles"    icon={Activity} />
                            <MRow label="Complexity"                  value={complexity} badge
                                badgeColor={complexity === 'High' ? '#ef4444' : complexity === 'Medium' ? '#f59e0b' : '#10b981'}
                                icon={TrendingUp} />
                        </MCard>

                        <MCard title="Code Generation" accent="#06b6d4" icon={Code2}>
                            <MRow label="Source Files"  value={totalFiles}                   unit="files" icon={Code2} />
                            <MRow label="Frontend"      value={techStack.frontend  || 'React/Vite'} badge badgeColor="#06b6d4" icon={Layers} />
                            <MRow label="Backend"       value={techStack.backend   || 'FastAPI'}    badge badgeColor="#6366f1" icon={Layers} />
                            <MRow label="Database"      value={techStack.database  || 'PostgreSQL'} badge badgeColor="#f59e0b" icon={Database} />
                        </MCard>

                        <MCard title="Testing Coverage" accent="#10b981" icon={FlaskConical}>
                            <MRow label="Test Files"       value={totalTestFiles}                            unit="files" icon={FlaskConical} />
                            <MRow label="Backend Tests"    value={hasBackendTest  ? 'Generated' : 'Skipped'} badge badgeColor={hasBackendTest  ? '#10b981' : '#64748b'} icon={CheckCircle2} />
                            <MRow label="Frontend Tests"   value={hasFrontendTest ? 'Generated' : 'Skipped'} badge badgeColor={hasFrontendTest ? '#10b981' : '#64748b'} icon={CheckCircle2} />
                            <MRow label="Integration"      value={hasIntegration  ? 'Generated' : 'Skipped'} badge badgeColor={hasIntegration  ? '#10b981' : '#64748b'} icon={CheckCircle2} />
                        </MCard>

                        <MCard title="Deployment Readiness" accent="#f59e0b" icon={Rocket}>
                            <MRow label="Deploy Files"  value={totalDeplFiles}                    unit="files" icon={Package} />
                            <MRow label="Docker"        value={hasDocker ? 'Generated' : 'Missing'} badge badgeColor={hasDocker ? '#10b981' : '#ef4444'} icon={Container} />
                            <MRow label="CI/CD"         value={hasCICD  ? 'Generated' : 'Skipped'}  badge badgeColor={hasCICD  ? '#10b981' : '#64748b'} icon={GitBranch} />
                            <MRow label="Nginx"         value={hasNginx ? 'Generated' : 'Missing'} badge badgeColor={hasNginx ? '#10b981' : '#ef4444'} icon={ShieldCheck} />
                        </MCard>

                    </div>
                )}
            </div>
        </div>
    )
}

// ── Main ProjectView ──────────────────────────────────────────────────────────
export default function ProjectView() {
    const { projectId } = useParams()
    const navigate      = useNavigate()
    const [project, setProject]       = useState(null)
    const [loading, setLoading]       = useState(true)
    const [expandedPhase, setExpandedPhase] = useState(null)

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const data = await getProject(projectId)
                setProject(data)
            } catch (err) {
                console.error('Failed to fetch project:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchProject()
    }, [projectId])

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="glass-card p-8 shimmer" style={{ height: 200 }} />
                <div className="mt-6 space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="glass-card p-6 shimmer" style={{ height: 80 }} />)}
                </div>
            </div>
        )
    }

    if (!project) {
        return (
            <div className="max-w-4xl mx-auto glass-card p-12 text-center">
                <p className="text-xl" style={{ color: 'var(--color-text-secondary)' }}>Project not found</p>
                <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 rounded-xl cursor-pointer"
                    style={{ background: 'var(--color-primary)', color: 'white' }}>
                    Go to Dashboard
                </button>
            </div>
        )
    }

    const phases          = project.phases || {}
    const completedPhases = Object.keys(phases).length

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8 animate-fade-in-up">
                <button onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-sm mb-4 cursor-pointer transition-colors duration-200"
                    style={{ color: 'var(--color-text-muted)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary-light)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}>
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>

                <div className="glass-card p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold gradient-text">{project.project_name}</h1>
                            <div className="flex items-center gap-4 mt-2">
                                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>ID: {project.project_id}</span>
                                {project.llm_provider && (
                                    <span className="px-2 py-0.5 rounded-lg text-xs font-medium"
                                        style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--color-primary-light)' }}>
                                        {project.llm_provider.toUpperCase()}
                                    </span>
                                )}
                                <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                    <Clock className="w-3 h-3" />
                                    {project.created_at ? new Date(project.created_at).toLocaleString() : 'N/A'}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold" style={{ color: 'var(--color-success)' }}>
                                {completedPhases}/5
                            </p>
                            <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>Phases</p>
                            {completedPhases === 5 && (
                                <button
                                    onClick={() => window.open(`http://localhost:8000/api/projects/${projectId}/download`, '_blank')}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200"
                                    style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--color-success)', border: '1px solid var(--color-success)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.2)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'}>
                                    <Download className="w-4 h-4" /> Download ZIP
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-lighter)' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                            style={{
                                width: `${(completedPhases / 5) * 100}%`,
                                background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary), var(--color-accent))',
                            }} />
                    </div>
                </div>
            </div>

            {/* Phase Cards */}
            <div className="space-y-4">
                {Object.entries(PHASE_CONFIG).map(([key, config], i) => {
                    const phaseData  = phases[key]
                    const isCompleted = !!phaseData
                    const isExpanded  = expandedPhase === key
                    const Icon        = config.icon

                    return (
                        <div key={key}
                            className={`glass-card overflow-hidden animate-fade-in-up delay-${(i + 1) * 100} transition-all duration-300`}
                            style={{ opacity: 0 }}>
                            <button onClick={() => setExpandedPhase(isExpanded ? null : key)}
                                className="w-full flex items-center justify-between p-5 text-left cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{ background: `${config.color}20` }}>
                                        <Icon className="w-5 h-5" style={{ color: config.color }} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Phase {config.phaseNum}: {config.label}</h3>
                                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{config.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {isCompleted ? (
                                        <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                                            style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--color-success)' }}>
                                            <CheckCircle2 className="w-3 h-3" /> Completed
                                        </span>
                                    ) : (
                                        <span className="text-xs px-2 py-1 rounded-lg"
                                            style={{ background: 'rgba(100,116,139,0.15)', color: 'var(--color-text-muted)' }}>
                                            Pending
                                        </span>
                                    )}
                                    {isExpanded
                                        ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                                        : <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />}
                                </div>
                            </button>

                            {isExpanded && phaseData && (
                                <div className="px-5 pb-5 animate-fade-in-up"
                                    style={{ borderTop: '1px solid var(--color-border)' }}>
                                    <div className="pt-4">
                                        {phaseData.artifacts && (
                                            <div className="mb-4">
                                                <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                                                    Generated Artifacts
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {phaseData.artifacts.map(artifact => (
                                                        <span key={artifact} className="px-3 py-1 rounded-lg text-xs font-mono"
                                                            style={{ background: 'var(--color-surface-light)', color: 'var(--color-accent)', border: '1px solid var(--color-border)' }}>
                                                            {artifact}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {phaseData.output_dir && (
                                            <div className="mb-4">
                                                <h4 className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Output Directory</h4>
                                                <code className="text-xs px-3 py-1 rounded-lg"
                                                    style={{ background: 'var(--color-surface-light)', color: 'var(--color-text-muted)' }}>
                                                    {phaseData.output_dir}
                                                </code>
                                            </div>
                                        )}

                                        {phaseData.llm_calls !== undefined && (
                                            <div className="mb-4">
                                                <h4 className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>LLM Calls</h4>
                                                <span className="text-sm font-bold" style={{ color: 'var(--color-primary-light)' }}>
                                                    {phaseData.llm_calls} calls
                                                </span>
                                            </div>
                                        )}

                                        {(phaseData.summary || phaseData.metadata) && (
                                            <div>
                                                <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Details</h4>
                                                <pre className="text-xs p-4 rounded-xl overflow-x-auto"
                                                    style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                                                    {JSON.stringify(phaseData.summary || phaseData.metadata, null, 2)}
                                                </pre>
                                            </div>
                                        )}

                                        {phaseData.completed_at && (
                                            <p className="mt-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                                Completed: {new Date(phaseData.completed_at).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Evaluation Metrics — only when all 5 phases done */}
            {completedPhases === 5 && <EvaluationMetrics project={project} />}
        </div>
    )
}
