import { useRef, useState } from 'react'
import { Upload, X, FileText, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { extractTextFromPdf } from '@/lib/pdfExtractor'
import { parsePayslip } from '@/lib/payslipParser'
import type { SalaryInputs } from '@/lib/salaryCalculator'

type UploadState = 'idle' | 'loading' | 'success' | 'error'

interface PdfUploadProps {
  onParsed: (fields: Partial<SalaryInputs>) => void
  onClear: () => void
}

export default function PdfUpload({ onParsed, onClear }: PdfUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<UploadState>('idle')
  const [fileName, setFileName] = useState<string | null>(null)
  const [detectedCount, setDetectedCount] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  async function handleFile(file: File) {
    if (!file.name.endsWith('.pdf')) {
      setState('error')
      return
    }

    setState('loading')
    setFileName(file.name)

    try {
      const text = await extractTextFromPdf(file)
      console.log('[PdfUpload] Extracted text:', text)
      const fields = await parsePayslip(text)
      console.log('[PdfUpload] Parsed fields:', fields)
      const count = Object.keys(fields).length

      if (count === 0) {
        setState('error')
        return
      }

      setDetectedCount(count)
      setState('success')
      onParsed(fields)
    } catch (err) {
      console.error('[PdfUpload] Error analyzing payslip:', err)
      setState('error')
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) void handleFile(file)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) void handleFile(file)
  }

  function handleClear() {
    setState('idle')
    setFileName(null)
    setDetectedCount(0)
    if (inputRef.current) inputRef.current.value = ''
    onClear()
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">Fiche de paie (optionnel)</p>

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors
          ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'}
          ${state === 'loading' ? 'pointer-events-none opacity-70' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleInputChange}
        />

        {state === 'loading' ? (
          <>
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Analyse en cours...</p>
          </>
        ) : state === 'success' && fileName ? (
          <>
            <FileText className="h-8 w-8 text-green-600" />
            <p className="text-sm font-medium text-foreground truncate max-w-xs">{fileName}</p>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Glissez-déposez votre fiche de paie PDF ou cliquez pour parcourir</p>
          </>
        )}
      </div>

      {/* Status messages */}
      {state === 'success' && (
        <Alert variant="success">
          <AlertDescription className="flex items-center justify-between gap-2">
            <span>{detectedCount} champ(s) détecté(s) depuis votre fiche de paie</span>
            <Badge variant="secondary" className="shrink-0">
              Depuis la fiche
            </Badge>
          </AlertDescription>
        </Alert>
      )}

      {state === 'error' && (
        <Alert variant="destructive">
          <AlertDescription>Impossible d'analyser ce fichier. Vérifiez qu'il s'agit bien d'une fiche de paie.</AlertDescription>
        </Alert>
      )}

      {/* Clear button */}
      {(state === 'success' || state === 'error') && (
        <Button variant="outline" size="sm" onClick={handleClear} className="gap-2">
          <X className="h-4 w-4" />
          Supprimer
        </Button>
      )}
    </div>
  )
}
