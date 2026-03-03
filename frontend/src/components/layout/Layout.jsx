import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, PlusCircle, Cpu } from 'lucide-react'

const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/new', label: 'New Project', icon: PlusCircle },
]

export default function Layout({ children }) {
    const location = useLocation()

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-72 fixed top-0 left-0 h-screen flex flex-col"
                style={{
                    background: 'linear-gradient(180deg, #0f172a 0%, #1a1033 100%)',
                    borderRight: '1px solid var(--color-border)',
                }}
            >
                {/* Logo */}
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center animate-pulse-glow"
                        style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}>
                        <Cpu className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white tracking-tight">SDLC</h1>
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Optimization Framework</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-4 mt-4 space-y-1">
                    {navItems.map(({ path, label, icon: Icon }) => {
                        const isActive = location.pathname === path
                        return (
                            <Link
                                key={path}
                                to={path}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                                style={{
                                    background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                                    color: isActive ? 'var(--color-primary-light)' : 'var(--color-text-secondary)',
                                    borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                                }}
                                onMouseEnter={e => {
                                    if (!isActive) e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)'
                                }}
                                onMouseLeave={e => {
                                    if (!isActive) e.currentTarget.style.background = 'transparent'
                                }}
                            >
                                <Icon className="w-5 h-5" />
                                {label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 mx-4 mb-4 rounded-xl" style={{ background: 'rgba(99, 102, 241, 0.08)' }}>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        AI-Powered SDLC Pipeline
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        v1.0.0
                    </p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-72 flex-1 min-h-screen">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
