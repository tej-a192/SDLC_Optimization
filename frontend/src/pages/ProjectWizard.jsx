import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, Sparkles, Server, Globe, Cpu, ArrowLeft, Loader2 } from 'lucide-react'
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

export default function ProjectWizard() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)

    const [projectName, setProjectName] = useState('')
    const [inputMethod, setInputMethod] = useState('text') // 'text' or 'pdf'
    const [srsText, setSrsText] = useState('')
    const [srsFile, setSrsFile] = useState(null)
    const [llmProvider, setLlmProvider] = useState('gemini')
    const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434')

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [progress, setProgress] = useState('')

    const canProceedStep1 = projectName.trim().length > 0
    const canProceedStep2 = inputMethod === 'text' ? srsText.trim().length > 0 : srsFile !== null

    const handleSubmit = async () => {
        try {
            setLoading(true)
            setError('')
            setProgress('Initializing SDLC pipeline...')

            const result = await createProject({
                projectName,
                srsText: inputMethod === 'text' ? srsText : null,
                srsFile: inputMethod === 'pdf' ? srsFile : null,
                llmProvider,
                ollamaUrl: llmProvider === 'ollama' ? ollamaUrl : null,
            })

            setProgress('Pipeline complete!')
            setTimeout(() => {
                navigate(`/project/${result.project_id}`)
            }, 1000)
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

    return (
        <div className="max-w-3xl mx-auto">
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
                <h1 className="text-3xl font-bold gradient-text mb-2">Create New Project</h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                    Configure and generate your SDLC project
                </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-4 mb-10 animate-fade-in-up delay-100" style={{ opacity: 0 }}>
                {['Project Info', 'SRS Input', 'LLM Provider'].map((label, i) => (
                    <div key={label} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                            style={{
                                background: step > i + 1 ? 'var(--color-success)' : step === i + 1 ? 'var(--color-primary)' : 'var(--color-surface-lighter)',
                                color: 'white',
                            }}
                        >
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

            {/* Step 1: Project Name */}
            {step === 1 && (
                <div className="glass-card p-8 animate-fade-in-up delay-200" style={{ opacity: 0 }}>
                    <h2 className="text-xl font-semibold text-white mb-6">Project Information</h2>

                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                            Project Name
                        </label>
                        <input
                            type="text"
                            value={projectName}
                            onChange={e => setProjectName(e.target.value)}
                            placeholder="e.g. E-Commerce Platform"
                            className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                            style={{
                                background: 'var(--color-surface-light)',
                                border: '1px solid var(--color-border)',
                            }}
                            onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                            onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                        />
                    </div>

                    <button
                        onClick={() => canProceedStep1 && setStep(2)}
                        disabled={!canProceedStep1}
                        className="w-full py-3 rounded-xl text-white font-medium transition-all duration-200 cursor-pointer"
                        style={{
                            background: canProceedStep1
                                ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'
                                : 'var(--color-surface-lighter)',
                            opacity: canProceedStep1 ? 1 : 0.5,
                        }}
                    >
                        Continue
                    </button>
                </div>
            )}

            {/* Step 2: SRS Input */}
            {step === 2 && (
                <div className="glass-card p-8 animate-fade-in-up">
                    <h2 className="text-xl font-semibold text-white mb-6">SRS Document Input</h2>

                    {/* Input Method Toggle */}
                    <div className="flex gap-3 mb-6">
                        {[
                            { id: 'text', label: 'Paste Text', icon: FileText },
                            { id: 'pdf', label: 'Upload PDF', icon: Upload },
                        ].map(({ id, label, icon: Icon }) => (
                            <button key={id}
                                onClick={() => setInputMethod(id)}
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
                                style={{
                                    background: inputMethod === id ? 'rgba(99, 102, 241, 0.15)' : 'var(--color-surface-light)',
                                    border: `1px solid ${inputMethod === id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                    color: inputMethod === id ? 'var(--color-primary-light)' : 'var(--color-text-secondary)',
                                }}
                            >
                                <Icon className="w-4 h-4" /> {label}
                            </button>
                        ))}
                    </div>

                    {inputMethod === 'text' ? (
                        <textarea
                            value={srsText}
                            onChange={e => setSrsText(e.target.value)}
                            placeholder="Paste your Software Requirements Specification here..."
                            rows={12}
                            className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 resize-none outline-none transition-all duration-200"
                            style={{
                                background: 'var(--color-surface-light)',
                                border: '1px solid var(--color-border)',
                            }}
                            onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                            onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                        />
                    ) : (
                        <div
                            className="p-8 rounded-xl text-center cursor-pointer transition-all duration-200"
                            style={{
                                border: '2px dashed var(--color-border)',
                                background: 'var(--color-surface-light)',
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                            onClick={() => document.getElementById('pdf-upload').click()}
                        >
                            <Upload className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
                            {srsFile ? (
                                <p className="text-sm" style={{ color: 'var(--color-success)' }}>
                                    ✓ {srsFile.name} ({(srsFile.size / 1024).toFixed(1)} KB)
                                </p>
                            ) : (
                                <>
                                    <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                                        Click to upload SRS document
                                    </p>
                                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>PDF format only</p>
                                </>
                            )}
                            <input id="pdf-upload" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                        </div>
                    )}

                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setStep(1)}
                            className="flex-1 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer"
                            style={{ background: 'var(--color-surface-lighter)', color: 'var(--color-text-secondary)' }}
                        >
                            Back
                        </button>
                        <button
                            onClick={() => canProceedStep2 && setStep(3)}
                            disabled={!canProceedStep2}
                            className="flex-1 py-3 rounded-xl text-white font-medium transition-all duration-200 cursor-pointer"
                            style={{
                                background: canProceedStep2
                                    ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'
                                    : 'var(--color-surface-lighter)',
                                opacity: canProceedStep2 ? 1 : 0.5,
                            }}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: LLM Provider */}
            {step === 3 && (
                <div className="glass-card p-8 animate-fade-in-up">
                    <h2 className="text-xl font-semibold text-white mb-6">Select AI Provider</h2>

                    <div className="space-y-3 mb-6">
                        {LLM_PROVIDERS.map(({ id, name, model, context, icon: Icon, color, description }) => (
                            <button key={id}
                                onClick={() => setLlmProvider(id)}
                                className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200 cursor-pointer"
                                style={{
                                    background: llmProvider === id ? `${color}15` : 'var(--color-surface-light)',
                                    border: `1px solid ${llmProvider === id ? color : 'var(--color-border)'}`,
                                }}
                            >
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{ background: `${color}20` }}>
                                    <Icon className="w-5 h-5" style={{ color }} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-white">{name}</span>
                                        <span className="px-2 py-0.5 rounded text-xs"
                                            style={{ background: `${color}20`, color }}>{model}</span>
                                    </div>
                                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                                        {description} • {context}
                                    </p>
                                </div>
                                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                                    style={{ borderColor: llmProvider === id ? color : 'var(--color-surface-lighter)' }}>
                                    {llmProvider === id && (
                                        <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Ollama URL input */}
                    {llmProvider === 'ollama' && (
                        <div className="mb-6 animate-fade-in-up">
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                                Ollama Server URL
                            </label>
                            <input
                                type="text"
                                value={ollamaUrl}
                                onChange={e => setOllamaUrl(e.target.value)}
                                placeholder="http://localhost:11434"
                                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-200"
                                style={{
                                    background: 'var(--color-surface-light)',
                                    border: '1px solid var(--color-border)',
                                }}
                                onFocus={e => e.target.style.borderColor = 'var(--color-warning)'}
                                onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                            />
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 p-3 rounded-xl text-sm"
                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)' }}>
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button onClick={() => setStep(2)}
                            className="flex-1 py-3 rounded-xl font-medium transition-all duration-200 cursor-pointer"
                            style={{ background: 'var(--color-surface-lighter)', color: 'var(--color-text-secondary)' }}
                        >
                            Back
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 py-3 rounded-xl text-white font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                            style={{
                                background: loading
                                    ? 'var(--color-surface-lighter)'
                                    : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                            }}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {progress}
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Generate Project
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
