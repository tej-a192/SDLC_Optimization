import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FolderOpen, Trash2, Clock, Layers, Sparkles, ArrowRight } from 'lucide-react'
import { getProjects, deleteProject } from '../services/api'

export default function Dashboard() {
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchProjects = async () => {
        try {
            setLoading(true)
            const data = await getProjects()
            setProjects(data.projects || [])
        } catch (err) {
            console.error('Failed to fetch projects:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProjects()
    }, [])

    const handleDelete = async (projectId) => {
        if (!window.confirm('Are you sure you want to delete this project?')) return
        try {
            await deleteProject(projectId)
            fetchProjects()
        } catch (err) {
            console.error('Failed to delete project:', err)
        }
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-10 animate-fade-in-up">
                <h1 className="text-4xl font-bold gradient-text mb-2">Dashboard</h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                    Manage your AI-generated SDLC projects
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {[
                    { label: 'Total Projects', value: projects.length, icon: Layers, color: '#6366f1' },
                    { label: 'Completed', value: projects.filter(p => p.phases).length, icon: Sparkles, color: '#10b981' },
                    { label: 'Recent', value: projects.length > 0 ? '1' : '0', icon: Clock, color: '#f59e0b' },
                ].map(({ label, value, icon: Icon, color }, i) => (
                    <div key={label}
                        className={`glass-card p-6 animate-fade-in-up delay-${(i + 1) * 100}`}
                        style={{ opacity: 0 }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm mb-1" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                                <p className="text-3xl font-bold" style={{ color }}>{value}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                                style={{ background: `${color}20` }}>
                                <Icon className="w-6 h-6" style={{ color }} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* New Project CTA */}
            <Link to="/new"
                className="glass-card p-6 mb-10 flex items-center justify-between cursor-pointer transition-all duration-300 block"
                style={{ borderColor: 'var(--color-primary)', borderStyle: 'dashed' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-glow)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-card)'}
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}>
                        <Sparkles className="w-6 h-6" style={{ color: 'white' }} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Create New Project</h3>
                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                            Upload SRS document and generate a full project
                        </p>
                    </div>
                </div>
                <ArrowRight className="w-5 h-5" style={{ color: 'var(--color-primary-light)' }} />
            </Link>

            {/* Projects List */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map(i => (
                        <div key={i} className="glass-card p-6 shimmer" style={{ height: 160 }} />
                    ))}
                </div>
            ) : projects.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <FolderOpen className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
                    <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                        No projects yet
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        Create your first project to get started
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {projects.map((project, i) => (
                        <div key={project.project_id || i}
                            className={`glass-card p-6 animate-fade-in-up delay-${(i + 1) * 100} transition-all duration-300`}
                            style={{ opacity: 0 }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
                                        <FolderOpen className="w-5 h-5" style={{ color: 'var(--color-primary-light)' }} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{project.project_name}</h3>
                                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                            ID: {project.project_id}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(project.project_id)}
                                    className="p-2 rounded-lg transition-colors duration-200 cursor-pointer"
                                    style={{ color: 'var(--color-text-muted)' }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.color = 'var(--color-danger)'
                                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.color = 'var(--color-text-muted)'
                                        e.currentTarget.style.background = 'transparent'
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Phase badges */}
                            {project.phases && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {Object.keys(project.phases).map(phase => (
                                        <span key={phase}
                                            className="px-2 py-1 rounded-lg text-xs font-medium"
                                            style={{
                                                background: 'rgba(16, 185, 129, 0.15)',
                                                color: 'var(--color-success)',
                                            }}
                                        >
                                            {phase.replace(/_/g, ' ')}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                    {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
                                </p>
                                <Link to={`/project/${project.project_id}`}
                                    className="text-sm font-medium flex items-center gap-1 transition-colors duration-200"
                                    style={{ color: 'var(--color-primary-light)' }}
                                >
                                    View <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
