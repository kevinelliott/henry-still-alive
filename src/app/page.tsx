'use client'

import { useState } from 'react'

type HealthStatus = 'alive' | 'slowing' | 'dead' | null
type PackageData = {
  name: string
  version: string
  description: string
  lastPublish: string
  daysSincePublish: number
  weeklyDownloads: number
  openIssues: number
  lastCommit: string | null
  daysSinceCommit: number | null
  status: HealthStatus
  repoUrl: string | null
  npmUrl: string
  maintainers: string[]
}

const statusConfig = {
  alive: {
    emoji: '💚',
    label: 'Alive & Kicking',
    description: 'This package is actively maintained',
    color: 'text-alive',
    bgColor: 'bg-alive/10',
    borderColor: 'border-alive/30',
    glowClass: 'glow-alive',
  },
  slowing: {
    emoji: '💛',
    label: 'On Life Support',
    description: 'Activity has slowed down - proceed with caution',
    color: 'text-slowing',
    bgColor: 'bg-slowing/10',
    borderColor: 'border-slowing/30',
    glowClass: 'glow-slowing',
  },
  dead: {
    emoji: '💀',
    label: 'Dead',
    description: 'This package appears to be abandoned',
    color: 'text-dead',
    bgColor: 'bg-dead/10',
    borderColor: 'border-dead/30',
    glowClass: 'glow-dead',
  },
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

export default function Home() {
  const [packageName, setPackageName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<PackageData | null>(null)

  const checkPackage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!packageName.trim()) return

    setLoading(true)
    setError(null)
    setData(null)

    try {
      const res = await fetch(`/api/check?package=${encodeURIComponent(packageName.trim())}`)
      const json = await res.json()
      
      if (!res.ok) {
        throw new Error(json.error || 'Failed to check package')
      }
      
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const config = data?.status ? statusConfig[data.status] : null

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            still-alive.dev
          </h1>
          <p className="text-gray-400 text-lg">
            Is your npm package still maintained?
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={checkPackage} className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              placeholder="Enter package name (e.g., lodash, react, left-pad)"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10 transition-all"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !packageName.trim()}
              className="px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Checking...
                </span>
              ) : (
                'Check'
              )}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8 text-red-400">
            {error}
          </div>
        )}

        {/* Results */}
        {data && config && (
          <div className={`${config.bgColor} ${config.borderColor} ${config.glowClass} border rounded-2xl p-8 transition-all`}>
            {/* Status Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{data.name}</h2>
                <p className="text-gray-400">v{data.version}</p>
              </div>
              <div className={`text-6xl ${data.status === 'alive' ? 'heartbeat' : data.status === 'dead' ? 'skull-shake' : ''}`}>
                {config.emoji}
              </div>
            </div>

            {/* Status Badge */}
            <div className={`inline-flex items-center gap-2 ${config.bgColor} ${config.borderColor} border rounded-full px-4 py-2 mb-6`}>
              <span className={`w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-')} animate-pulse`}></span>
              <span className={`font-semibold ${config.color}`}>{config.label}</span>
            </div>
            
            <p className="text-gray-300 mb-6">{config.description}</p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">Last Publish</p>
                <p className="text-white font-semibold">{formatDate(data.lastPublish)}</p>
                <p className="text-gray-500 text-xs">{data.daysSincePublish} days ago</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">Weekly Downloads</p>
                <p className="text-white font-semibold">{formatNumber(data.weeklyDownloads)}</p>
              </div>
              {data.lastCommit && (
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-1">Last Commit</p>
                  <p className="text-white font-semibold">{formatDate(data.lastCommit)}</p>
                  <p className="text-gray-500 text-xs">{data.daysSinceCommit} days ago</p>
                </div>
              )}
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">Open Issues</p>
                <p className="text-white font-semibold">{data.openIssues !== -1 ? data.openIssues : 'N/A'}</p>
              </div>
            </div>

            {/* Description */}
            {data.description && (
              <p className="text-gray-400 text-sm mb-6 italic">
                &ldquo;{data.description}&rdquo;
              </p>
            )}

            {/* Links */}
            <div className="flex gap-4">
              <a
                href={data.npmUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M0 0v24h24V0H0zm6.168 18.672H4.56V5.328h6.24v13.344H9.168v-12h-3v12zm9.24 0h-4.8V5.328h4.8v13.344zm-3.168-1.344h1.536v-10.68h-1.536v10.68z"/>
                </svg>
                npm
              </a>
              {data.repoUrl && (
                <a
                  href={data.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
              )}
            </div>

            {/* Maintainers */}
            {data.maintainers.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-gray-400 text-sm">
                  Maintained by: {data.maintainers.join(', ')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>
            Built with 💀 at 1 AM by{' '}
            <a href="https://twitter.com/HenryTheGreatAI" className="text-gray-400 hover:text-white transition-colors">
              @HenryTheGreatAI
            </a>
          </p>
          <p className="mt-2">
            <a href="https://github.com/kevinelliott/still-alive" className="text-gray-400 hover:text-white transition-colors">
              View source on GitHub
            </a>
          </p>
        </footer>
      </div>
    </main>
  )
}
