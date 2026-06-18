import { Sparkles, Library, Upload, Settings, Orbit } from 'lucide-react'
import type { View } from '../types'

interface NavbarProps {
  currentView: View
  onNavigate: (view: View) => void
  onOpenSettings: () => void
  paperCount: number
}

const navItems: { view: View; label: string; icon: typeof Upload }[] = [
  { view: 'home', label: 'Home', icon: Orbit },
  { view: 'upload', label: 'Upload', icon: Upload },
  { view: 'library', label: 'Library', icon: Library },
]

export default function Navbar({ currentView, onNavigate, onOpenSettings, paperCount }: NavbarProps) {
  return (
    <nav className="glass sticky top-0 z-50 border-b border-purple-500/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 group"
        >
          <div className="relative">
            <Sparkles className="w-7 h-7 text-purple-400 group-hover:text-purple-300 transition-colors" />
            <div className="absolute inset-0 blur-md bg-purple-500/30 group-hover:bg-purple-400/40 transition-all" />
          </div>
          <span className="font-display text-xl font-bold tracking-wider glow-text">
            QUASAR
          </span>
        </button>

        <div className="flex items-center gap-1">
          {navItems.map(({ view, label, icon: Icon }) => (
            <button
              key={view}
              onClick={() => onNavigate(view)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === view
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/30'
                  : 'text-purple-300/70 hover:text-purple-200 hover:bg-purple-900/30'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
              {view === 'library' && paperCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cosmic-pink text-[10px] font-bold flex items-center justify-center">
                  {paperCount > 99 ? '99+' : paperCount}
                </span>
              )}
            </button>
          ))}

          <button
            onClick={onOpenSettings}
            className="ml-2 p-2 rounded-lg text-purple-300/70 hover:text-purple-200 hover:bg-purple-900/30 transition-all"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  )
}
