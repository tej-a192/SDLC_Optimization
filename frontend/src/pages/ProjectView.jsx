import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    ArrowLeft, FileText, Palette, Code2, TestTube, Rocket,
    CheckCircle2, ChevronDown, ChevronUp, Clock
} from 'lucide-react'
import { getProject } from '../services/api'

const PHASE_CONFIG = {
    requirement_analysis: {
        label: 'Requirement Analysis',
        icon: FileText,
        color: '#6366f1',
        description: 'SRS parsing and RA Document generation',
    },
    design: {
        label: 'Design',
        icon: Palette,
        color: '#8b5cf6',
        description: 'Architecture diagrams and Design Document',
    },
    implementation: {
        label: 'Implementation',
        icon: Code2,
        color: '#06b6d4',
        description: 'Source code scaffolding (frontend + backend)',
    },
    testing: {
        label: 'Testing',
        icon: TestTube,
        color: '#10b981',
        description: 'Generated test scripts',
    },
    deployment: {
        label: 'Deployment',
        icon: Rocket,
        color: '#f59e0b',
        description: 'Docker, CI/CD, and Nginx configuration',
    },
}

export default function ProjectView() {
    const { projectId } = useParams()
    const navigate = useNavigate()
    const [project, setProject] = useState(null)
    const [loading, setLoading] = useState(true)
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
                    {[1, 2, 3].map(i => (
                        <div key={i} className="glass-card p-6 shimmer" style={{ height: 80 }} />
                    ))}
                </div>
            </div>
        )
    }

    if (!project) {
        return (
            <div className="max-w-4xl mx-auto glass-card p-12 text-center">
                <p className="text-xl" style={{ color: 'var(--color-text-secondary)' }}>Project not found</p>
                <button onClick={() => navigate('/')}
                    className="mt-4 px-6 py-2 rounded-xl cursor-pointer"
                    style={{ background: 'var(--color-primary)', color: 'white' }}>
                    Go to Dashboard
                </button>
            </div>
        )
    }

    const phases = project.phases || {}
    const completedPhases = Object.keys(phases).length

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8 animate-fade-in-up">
                <button onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-sm mb-4 cursor-pointer transition-colors duration-200"
                    style={{ color: 'var(--color-text-muted)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary-light)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>

                <div className="glass-card p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold gradient-text">{project.project_name}</h1>
                            <div className="flex items-center gap-4 mt-2">
                                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                    ID: {project.project_id}
                                </span>
                                {project.llm_provider && (
                                    <span className="px-2 py-0.5 rounded-lg text-xs font-medium"
                                        style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--color-primary-light)' }}>
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
                            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Phases</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 h-2 rounded-full overflow-hidden"
                        style={{ background: 'var(--color-surface-lighter)' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                            style={{
                                width: `${(completedPhases / 5) * 100}%`,
                                background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary), var(--color-accent))',
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Phase Cards */}
            <div className="space-y-4">
                {Object.entries(PHASE_CONFIG).map(([key, config], i) => {
                    const phaseData = phases[key]
                    const isCompleted = !!phaseData
                    const isExpanded = expandedPhase === key
                    const Icon = config.icon

                    return (
                        <div key={key}
                            className={`glass-card overflow-hidden animate-fade-in-up delay-${(i + 1) * 100} transition-all duration-300`}
                            style={{ opacity: 0 }}
                        >
                            {/* Phase Header */}
                            <button
                                onClick={() => setExpandedPhase(isExpanded ? null : key)}
                                className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{ background: `${config.color}20` }}>
                                        <Icon className="w-5 h-5" style={{ color: config.color }} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">{config.label}</h3>
                                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                            {config.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {isCompleted ? (
                                        <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                                            style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)' }}>
                                            <CheckCircle2 className="w-3 h-3" /> Completed
                                        </span>
                                    ) : (
                                        <span className="text-xs px-2 py-1 rounded-lg"
                                            style={{ background: 'rgba(100, 116, 139, 0.15)', color: 'var(--color-text-muted)' }}>
                                            Pending
                                        </span>
                                    )}
                                    {isExpanded ? (
                                        <ChevronUp className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                                    ) : (
                                        <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                                    )}
                                </div>
                            </button>

                            {/* Phase Details (Expanded) */}
                            {isExpanded && phaseData && (
                                <div className="px-5 pb-5 animate-fade-in-up"
                                    style={{ borderTop: '1px solid var(--color-border)' }}>
                                    <div className="pt-4">
                                        {/* Artifacts */}
                                        {phaseData.artifacts && (
                                            <div className="mb-4">
                                                <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                                                    Generated Artifacts
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {phaseData.artifacts.map(artifact => (
                                                        <span key={artifact}
                                                            className="px-3 py-1 rounded-lg text-xs font-mono"
                                                            style={{
                                                                background: 'var(--color-surface-light)',
                                                                color: 'var(--color-accent)',
                                                                border: '1px solid var(--color-border)',
                                                            }}>
                                                            {artifact}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Output Directory */}
                                        {phaseData.output_dir && (
                                            <div className="mb-4">
                                                <h4 className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                                                    Output Directory
                                                </h4>
                                                <code className="text-xs px-3 py-1 rounded-lg"
                                                    style={{ background: 'var(--color-surface-light)', color: 'var(--color-text-muted)' }}>
                                                    {phaseData.output_dir}
                                                </code>
                                            </div>
                                        )}

                                        {/* Metadata / Summary */}
                                        {(phaseData.summary || phaseData.metadata) && (
                                            <div>
                                                <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                                                    Details
                                                </h4>
                                                <pre className="text-xs p-4 rounded-xl overflow-x-auto"
                                                    style={{
                                                        background: 'var(--color-surface)',
                                                        color: 'var(--color-text-muted)',
                                                        border: '1px solid var(--color-border)',
                                                    }}>
                                                    {JSON.stringify(phaseData.summary || phaseData.metadata, null, 2)}
                                                </pre>
                                            </div>
                                        )}

                                        {/* Completed timestamp */}
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
        </div>
    )
}
