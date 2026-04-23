import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import PdfUpload from '@/components/PdfUpload'
import SalaryForm from '@/components/SalaryForm'
import SalaryResult from '@/components/SalaryResult'
import { calculateNetSalary } from '@/lib/salaryCalculator'
import type { SalaryInputs, SalaryResult as SalaryResultType } from '@/lib/salaryCalculator'

const DEFAULT_VALUES: SalaryInputs = {
  gross: 0,
  children: 0,
  childrenUnder5: 0,
  maritalStatus: 'single',
  age: 30,
  pensionRate: 6,
  isOleh: false,
  olehYears: 0,
  hasDisability: false,
}

export default function App() {
  const { t } = useTranslation()
  const [formValues, setFormValues] = useState<SalaryInputs>(DEFAULT_VALUES)
  const [autoFilledKeys, setAutoFilledKeys] = useState<Set<keyof SalaryInputs>>(new Set())
  const [result, setResult] = useState<SalaryResultType | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  function handleParsed(fields: Partial<SalaryInputs>) {
    setFormValues((prev) => ({ ...prev, ...fields }))
    setAutoFilledKeys(new Set(Object.keys(fields) as (keyof SalaryInputs)[]))
  }

  function handleClear() {
    setAutoFilledKeys(new Set())
  }

  function handleChange(field: keyof SalaryInputs, value: unknown) {
    setFormValues((prev) => ({ ...prev, [field]: value }))
    setAutoFilledKeys((prev) => {
      const next = new Set(prev)
      next.delete(field)
      return next
    })
  }

  function handleCalculate() {
    setIsCalculating(true)
    // Synchronous, but wrapped in setTimeout to allow loading state to render
    setTimeout(() => {
      setResult(calculateNetSalary(formValues))
      setIsCalculating(false)
    }, 0)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('app.title')}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t('app.subtitle')}</p>
          </div>
          <LanguageSwitcher />
        </header>

        {/* PDF upload */}
        <PdfUpload onParsed={handleParsed} onClear={handleClear} />

        {/* Salary form */}
        <SalaryForm
          values={formValues}
          autoFilledKeys={autoFilledKeys}
          onChange={handleChange}
          onCalculate={handleCalculate}
          isCalculating={isCalculating}
        />

        {/* Result — shown only after calculation */}
        {result !== null && <SalaryResult result={result} />}
      </div>
    </div>
  )
}
