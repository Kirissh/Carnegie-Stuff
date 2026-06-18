import { Search, BookOpen, Filter } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Paper } from '../types'
import PaperCard from './PaperCard'

interface LibraryProps {
  papers: Paper[]
  onQuiz: (id: string) => void
  onDelete: (id: string) => void
  onUpload: () => void
}

type SortKey = 'newest' | 'oldest' | 'title' | 'bestScore'

export default function Library({ papers, onQuiz, onDelete, onUpload }: LibraryProps) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('newest')
  const [filterQuizzed, setFilterQuizzed] = useState<'all' | 'quizzed' | 'new'>('all')

  const filtered = useMemo(() => {
    let result = [...papers]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) => p.title.toLowerCase().includes(q) || p.fileName.toLowerCase().includes(q),
      )
    }

    if (filterQuizzed === 'quizzed') result = result.filter((p) => p.quizCount > 0)
    if (filterQuizzed === 'new') result = result.filter((p) => p.quizCount === 0)

    result.sort((a, b) => {
      switch (sort) {
        case 'oldest': return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
        case 'title': return a.title.localeCompare(b.title)
        case 'bestScore': return (b.bestScore ?? -1) - (a.bestScore ?? -1)
        default: return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      }
    })

    return result
  }, [papers, search, sort, filterQuizzed])

  const stats = useMemo(() => ({
    total: papers.length,
    quizzed: papers.filter((p) => p.quizCount > 0).length,
    totalWords: papers.reduce((s, p) => s + p.wordCount, 0),
  }), [papers])

  if (papers.length === 0) {
    return (
      <div className="text-center py-20 animate-slide-up">
        <BookOpen className="w-16 h-16 text-purple-500/30 mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold text-purple-200 mb-2">Your Library is Empty</h2>
        <p className="text-purple-400/60 mb-6 max-w-md mx-auto">
          Upload research papers to build your personal quiz collection across the cosmos.
        </p>
        <button onClick={onUpload} className="btn-primary px-6 py-2.5 rounded-lg text-sm font-semibold">
          Upload Your First Paper
        </button>
      </div>
    )
  }

  return (
    <div className="animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold glow-text mb-1">Paper Library</h1>
          <p className="text-purple-400/60 text-sm">
            {stats.total} papers · {stats.quizzed} quizzed · {stats.totalWords.toLocaleString()} total words
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/50" />
          <input
            type="text"
            placeholder="Search papers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass text-sm text-purple-100 placeholder:text-purple-500/40 focus:outline-none focus:border-purple-400/40 border border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterQuizzed}
            onChange={(e) => setFilterQuizzed(e.target.value as typeof filterQuizzed)}
            className="px-3 py-2.5 rounded-xl glass text-sm text-purple-300 border border-purple-500/10 focus:outline-none"
          >
            <option value="all">All papers</option>
            <option value="quizzed">Quizzed</option>
            <option value="new">Not quizzed</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="px-3 py-2.5 rounded-xl glass text-sm text-purple-300 border border-purple-500/10 focus:outline-none"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="title">Title A-Z</option>
            <option value="bestScore">Best Score</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-purple-400/60">
          <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
          No papers match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((paper) => (
            <PaperCard
              key={paper.id}
              paper={paper}
              onQuiz={onQuiz}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
