import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

export async function extractTextFromPdf(file: File): Promise<{ text: string; pageCount: number }> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const pages: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
    pages.push(pageText)
  }

  const text = pages
    .join('\n\n')
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim()

  return { text, pageCount: pdf.numPages }
}

export function deriveTitle(fileName: string, text: string): string {
  const baseName = fileName.replace(/\.pdf$/i, '').replace(/[_-]/g, ' ')
  const firstLine = text.split('\n').find((line) => line.trim().length > 10)?.trim()
  if (firstLine && firstLine.length < 120) return firstLine
  return baseName
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}
