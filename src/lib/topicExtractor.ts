const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has',
  'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
  'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their', 'we', 'our',
  'can', 'not', 'also', 'such', 'than', 'then', 'when', 'where', 'which', 'who',
  'how', 'what', 'why', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
  'some', 'any', 'no', 'only', 'own', 'same', 'so', 'too', 'very', 'just', 'about',
  'using', 'used', 'use', 'based', 'show', 'shows', 'shown', 'found', 'study',
  'studies', 'paper', 'results', 'result', 'method', 'methods', 'data', 'analysis',
  'abstract', 'introduction', 'conclusion', 'references', 'figure', 'table',
])

function unique(items: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const item of items) {
    const key = item.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }
  return out
}

function looksLikeHeader(line: string): boolean {
  if (line.length < 4 || line.length > 80) return false
  if (/^\d+[\.\)]\s/.test(line)) return true
  if (line === line.toUpperCase() && /[A-Z]/.test(line)) return true
  if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+){0,5}$/.test(line)) return true
  return false
}

export function extractTopicSuggestions(text: string): string[] {
  const suggestions: string[] = []
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean)

  const titleLine = lines.find((l) => l.length >= 10 && l.length <= 150 && !l.startsWith('http'))
  if (titleLine) suggestions.push(titleLine)

  for (const line of lines) {
    if (looksLikeHeader(line) && !/^(abstract|introduction|conclusion|references)$/i.test(line)) {
      suggestions.push(line.replace(/^\d+[\.\)]\s*/, ''))
    }
  }

  const termFreq = new Map<string, number>()
  const words = text.match(/\b[A-Za-z][A-Za-z'-]{3,}\b/g) ?? []
  for (const word of words) {
    const lower = word.toLowerCase()
    if (STOP_WORDS.has(lower)) continue
    if (/^[A-Z]/.test(word) || word.length >= 6) {
      termFreq.set(word, (termFreq.get(word) ?? 0) + 1)
    }
  }

  const topTerms = [...termFreq.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([term]) => term)

  const general = ['Key concepts', 'Methods & approach', 'Main findings', 'Definitions & terms']

  return unique([...suggestions, ...topTerms, ...general]).slice(0, 8)
}

export function sentenceMatchesTopic(sentence: string, topic: string): boolean {
  const topicWords = topic
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w))

  if (topicWords.length === 0) return true

  const lower = sentence.toLowerCase()
  return topicWords.some((w) => lower.includes(w))
}

export function filterTextByTopic(text: string, topic: string): string {
  if (!topic.trim()) return text

  const sentences = text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean)
  const matching = sentences.filter((s) => sentenceMatchesTopic(s, topic))

  if (matching.length >= 4) return matching.join(' ')
  return text
}
