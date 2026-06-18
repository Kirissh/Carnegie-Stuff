import type { QuizQuestion, QuizSettings } from '../types'
import { filterTextByTopic } from './topicExtractor'

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has',
  'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
  'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their', 'we', 'our',
  'can', 'not', 'also', 'such', 'than', 'then', 'when', 'where', 'which', 'who', 'whom',
  'how', 'what', 'why', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
  'some', 'any', 'no', 'nor', 'only', 'own', 'same', 'so', 'too', 'very', 'just', 'about',
  'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under',
  'again', 'further', 'once', 'here', 'there', 'while', 'although', 'however', 'therefore',
  'thus', 'using', 'used', 'use', 'based', 'show', 'shows', 'shown', 'found', 'study',
  'studies', 'paper', 'results', 'result', 'method', 'methods', 'data', 'analysis',
])

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 40 && s.length <= 400)
}

function extractKeyTerms(sentence: string): string[] {
  const words = sentence.match(/\b[A-Za-z][A-Za-z'-]{3,}\b/g) ?? []
  return words.filter((w) => !STOP_WORDS.has(w.toLowerCase()))
}

function pickBestTerm(terms: string[]): string | null {
  if (terms.length === 0) return null
  const scored = terms.map((term) => ({
    term,
    score: term.length + (/^[A-Z]/.test(term) ? 2 : 0) + (/\d/.test(term) ? 1 : 0),
  }))
  scored.sort((a, b) => b.score - a.score)
  return scored[0]?.term ?? null
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}

function generateDistractors(correct: string, pool: string[], count: number): string[] {
  const candidates = unique(
    pool.filter((t) => t.toLowerCase() !== correct.toLowerCase() && t.length >= 3),
  )
  return shuffle(candidates).slice(0, count)
}

function makeFillBlankQuestion(
  sentence: string,
  term: string,
  allTerms: string[],
  index: number,
): QuizQuestion | null {
  const blanked = sentence.replace(new RegExp(`\\b${escapeRegex(term)}\\b`, 'i'), '_______')
  if (blanked === sentence) return null

  const distractors = generateDistractors(term, allTerms, 3)
  if (distractors.length < 3) return null

  const options = shuffle([term, ...distractors])
  const correctIndex = options.findIndex((o) => o.toLowerCase() === term.toLowerCase())

  return {
    id: `q-${index}`,
    question: `Fill in the blank:\n"${blanked}"`,
    options,
    correctIndex,
    explanation: `The correct term is "${term}".`,
    sourceSentence: sentence,
  }
}

function makeTrueFalseVariant(
  sentence: string,
  allSentences: string[],
  index: number,
): QuizQuestion | null {
  const useFalse = Math.random() > 0.5
  let statement = sentence

  if (useFalse && allSentences.length > 1) {
    const other = allSentences[Math.floor(Math.random() * allSentences.length)]
    if (other !== sentence) {
      const termsA = extractKeyTerms(sentence)
      const termsB = extractKeyTerms(other)
      const swapTerm = pickBestTerm(termsB)
      const targetTerm = pickBestTerm(termsA)
      if (swapTerm && targetTerm) {
        statement = sentence.replace(new RegExp(`\\b${escapeRegex(targetTerm)}\\b`, 'i'), swapTerm)
        if (statement === sentence) return null
      } else {
        return null
      }
    } else {
      return null
    }
  }

  const isActuallyTrue = statement === sentence

  return {
    id: `tf-${index}`,
    question: `True or False?\n"${statement.length > 200 ? statement.slice(0, 200) + '…' : statement}"`,
    options: ['True', 'False'],
    correctIndex: isActuallyTrue ? 0 : 1,
    explanation: isActuallyTrue
      ? 'This statement accurately reflects the paper.'
      : 'This statement contains an inaccuracy compared to the source material.',
    sourceSentence: sentence,
  }
}

function makeDefinitionQuestion(
  sentence: string,
  term: string,
  allSentences: string[],
  index: number,
): QuizQuestion | null {
  const context = allSentences.find(
    (s) => s !== sentence && s.toLowerCase().includes(term.toLowerCase()),
  )
  if (!context) return null

  const question = `Which statement best relates to "${term}" based on the paper?`
  const correct = sentence.length > 180 ? sentence.slice(0, 180) + '…' : sentence
  const distractors = shuffle(allSentences.filter((s) => s !== sentence))
    .slice(0, 3)
    .map((s) => (s.length > 180 ? s.slice(0, 180) + '…' : s))

  if (distractors.length < 3) return null

  const options = shuffle([correct, ...distractors])
  const correctIndex = options.indexOf(correct)

  return {
    id: `def-${index}`,
    question,
    options,
    correctIndex,
    explanation: `"${term}" is discussed in the context of this finding.`,
    sourceSentence: sentence,
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function generateQuizFromText(
  text: string,
  settings: QuizSettings,
  topic?: string,
): QuizQuestion[] {
  const sourceText = topic ? filterTextByTopic(text, topic) : text
  const sentences = splitSentences(sourceText)
  if (sentences.length < 4) {
    throw new Error('Not enough readable content in this PDF to generate a quiz. Try a text-based PDF.')
  }

  const allTerms = unique(sentences.flatMap(extractKeyTerms))
  const questions: QuizQuestion[] = []
  const usedSentences = new Set<string>()

  const shuffledSentences = shuffle(sentences)

  for (const sentence of shuffledSentences) {
    if (questions.length >= settings.questionCount * 2) break
    if (usedSentences.has(sentence)) continue

    const terms = extractKeyTerms(sentence)
    const term = pickBestTerm(terms)
    if (!term || term.length < 4) continue

    const typeRoll = Math.random()
    let question: QuizQuestion | null = null

    if (typeRoll < 0.5) {
      question = makeFillBlankQuestion(sentence, term, allTerms, questions.length)
    } else if (typeRoll < 0.75) {
      question = makeTrueFalseQuestionSafe(sentence, sentences, questions.length)
    } else {
      question = makeDefinitionQuestion(sentence, term, sentences, questions.length)
    }

    if (question) {
      questions.push(question)
      usedSentences.add(sentence)
    }
  }

  let result = questions.slice(0, settings.questionCount)

  if (result.length < Math.min(3, settings.questionCount)) {
    throw new Error('Could not generate enough questions. The PDF may have limited extractable text.')
  }

  if (settings.shuffleQuestions) {
    result = shuffle(result)
  }

  if (settings.shuffleOptions) {
    result = result.map((q) => {
      const options = shuffle(q.options)
      const correctAnswer = q.options[q.correctIndex]
      return {
        ...q,
        options,
        correctIndex: options.findIndex((o) => o === correctAnswer),
      }
    })
  }

  return result
}

function makeTrueFalseQuestionSafe(
  sentence: string,
  allSentences: string[],
  index: number,
): QuizQuestion | null {
  try {
    return makeTrueFalseVariant(sentence, allSentences, index)
  } catch {
    return null
  }
}

export async function generateQuizWithAI(
  text: string,
  settings: QuizSettings,
  apiKey: string,
  topic?: string,
): Promise<QuizQuestion[]> {
  const sourceText = topic ? filterTextByTopic(text, topic) : text
  const excerpt = sourceText.slice(0, 12000)
  const topicHint = topic
    ? ` Focus questions on: "${topic}".`
    : ''

  const response = await fetch('https://api.llm7.io/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'default',
      messages: [
        {
          role: 'system',
          content: `You are a quiz generator for academic papers. Generate exactly ${settings.questionCount} multiple-choice questions based on the provided text.${topicHint} Return ONLY valid JSON array with objects: { "question": string, "options": string[4], "correctIndex": number, "explanation": string }. Questions should test comprehension, not trivia. Options should be plausible.`,
        },
        {
          role: 'user',
          content: excerpt,
        },
      ],
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    throw new Error('AI quiz generation failed. Check your LLM7.io token or use offline mode.')
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content ?? ''
  const jsonMatch = content.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('Invalid AI response format')

  const parsed = JSON.parse(jsonMatch[0]) as Array<{
    question: string
    options: string[]
    correctIndex: number
    explanation?: string
  }>

  return parsed.slice(0, settings.questionCount).map((q, i) => ({
    id: `ai-${i}`,
    question: q.question,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
  }))
}
