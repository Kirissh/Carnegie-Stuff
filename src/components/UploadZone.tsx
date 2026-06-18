import { useCallback, useState } from 'react'

interface UploadZoneProps {
  onUpload: (file: File) => Promise<void>
  isProcessing: boolean
}

export default function UploadZone({ onUpload, isProcessing }: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback(
    async (file: File) => {
      setError(null)
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setError('Please upload a PDF file.')
        return
      }
      if (file.size > 50 * 1024 * 1024) {
        setError('File too large (max 50MB).')
        return
      }
      try {
        await onUpload(file)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to process PDF')
      }
    },
    [onUpload],
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !isProcessing && document.getElementById('pdf-input')?.click()}
        className={`card p-8 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-blue-400 bg-blue-50' : ''
        } ${isProcessing ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          id="pdf-input"
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ''
          }}
        />
        {isProcessing ? (
          <p className="text-sm text-muted">Extracting text…</p>
        ) : (
          <>
            <p className="text-sm font-medium mb-1">Drop PDF here or click to browse</p>
            <p className="text-xs text-muted">Text-based PDFs work best</p>
          </>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
