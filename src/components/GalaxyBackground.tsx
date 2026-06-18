import { useMemo } from 'react'

interface Star {
  id: number
  x: number
  y: number
  size: number
  delay: number
  opacity: number
}

export default function GalaxyBackground() {
  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: 120 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.7 + 0.3,
    }))
  }, [])

  const shootingStars = useMemo(() => {
    return Array.from({ length: 3 }, (_, i) => ({
      id: i,
      top: 10 + Math.random() * 40,
      left: Math.random() * 60,
      delay: i * 8 + Math.random() * 5,
    }))
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(76, 29, 149, 0.35) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 80%, rgba(244, 114, 182, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse 50% 50% at 10% 60%, rgba(34, 211, 238, 0.08) 0%, transparent 50%),
            linear-gradient(180deg, #0a0118 0%, #110828 40%, #0a0118 100%)
          `,
        }}
      />

      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            animationDelay: `${star.delay}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
          }}
        />
      ))}

      {shootingStars.map((ss) => (
        <div
          key={ss.id}
          className="absolute h-px w-24 opacity-0"
          style={{
            top: `${ss.top}%`,
            left: `${ss.left}%`,
            background: 'linear-gradient(90deg, transparent, rgba(196,181,253,0.8), transparent)',
            animation: `shoot ${6}s ease-in-out ${ss.delay}s infinite`,
          }}
        />
      ))}

      <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl bg-purple-600 animate-pulse" />
      <div className="absolute bottom-1/3 left-1/6 w-48 h-48 rounded-full opacity-10 blur-3xl bg-cyan-400 animate-pulse" style={{ animationDelay: '2s' }} />

      <style>{`
        @keyframes shoot {
          0%, 85%, 100% { opacity: 0; transform: translateX(0) rotate(-30deg); }
          90% { opacity: 1; }
          95% { opacity: 0; transform: translateX(200px) rotate(-30deg); }
        }
      `}</style>
    </div>
  )
}
