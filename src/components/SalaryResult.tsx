import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { SalaryResult } from '@/lib/salaryCalculator'

interface SalaryResultProps {
  result: SalaryResult
}

/** Formats a number as ILS currency with 2 decimal places */
function formatILS(amount: number): string {
  return amount.toLocaleString('he-IL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' ₪'
}

/** A single result row: label on one side, value on the other, RTL-aware */
function ResultRow({
  label,
  value,
  className = '',
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={`flex justify-between items-center py-1.5 ${className}`}>
      <span className="text-sm text-muted-foreground rtl:text-right">{label}</span>
      <span className="text-sm font-medium tabular-nums rtl:text-left">{value}</span>
    </div>
  )
}

export default function SalaryResult({ result }: SalaryResultProps) {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{t('result.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {/* Gross + pension */}
        <ResultRow label={t('result.gross')} value={formatILS(result.gross)} />
        <ResultRow
          label={t('result.pensionDeduction')}
          value={`− ${formatILS(result.pensionDeduction)}`}
          className="text-muted-foreground"
        />
        <ResultRow label={t('result.taxableIncome')} value={formatILS(result.taxableIncome)} />

        <Separator className="my-2" />

        {/* Income tax */}
        <ResultRow
          label={t('result.incomeTaxBeforeCredits')}
          value={`− ${formatILS(result.incomeTaxBeforeCredits)}`}
          className="text-muted-foreground"
        />
        <ResultRow
          label={t('result.creditPointsValue')}
          value={`+ ${formatILS(result.creditPointsValue)}`}
          className="text-green-700"
        />
        <ResultRow
          label={t('result.finalIncomeTax')}
          value={`− ${formatILS(result.finalIncomeTax)}`}
        />

        <Separator className="my-2" />

        {/* Social contributions */}
        <ResultRow
          label={t('result.bituachLeumi')}
          value={`− ${formatILS(result.bituachLeumi)}`}
          className="text-muted-foreground"
        />
        <ResultRow
          label={t('result.masBriut')}
          value={`− ${formatILS(result.masBriut)}`}
          className="text-muted-foreground"
        />

        <Separator className="my-2" />

        {/* Totals */}
        <ResultRow
          label={t('result.totalDeductions')}
          value={`− ${formatILS(result.totalDeductions)}`}
          className="font-bold text-red-600 [&_span]:text-red-600 [&_span]:font-bold"
        />

        {/* Net salary — most prominent element */}
        <div className="flex justify-between items-center py-3 mt-2 rounded-lg bg-green-50 px-3">
          <span className="text-base font-bold text-green-800">{t('result.netSalary')}</span>
          <span className="text-xl font-bold text-green-700 tabular-nums">
            {formatILS(result.netSalary)}
          </span>
        </div>

        {/* Effective tax rate */}
        <ResultRow
          label={t('result.effectiveTaxRate')}
          value={`${result.effectiveTaxRate.toFixed(2)} %`}
          className="text-muted-foreground pt-2"
        />
      </CardContent>
    </Card>
  )
}
