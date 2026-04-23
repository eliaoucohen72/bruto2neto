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

/** A single result row: label on one side, value on the other */
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
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium tabular-nums">{value}</span>
    </div>
  )
}

export default function SalaryResult({ result }: SalaryResultProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Détail du calcul</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {/* Gross + pension */}
        <ResultRow label="Salaire brut" value={formatILS(result.gross)} />
        <ResultRow
          label="Déduction pension (salarié)"
          value={`− ${formatILS(result.pensionDeduction)}`}
          className="text-muted-foreground"
        />
        <ResultRow label="Revenu imposable" value={formatILS(result.taxableIncome)} />

        <Separator className="my-2" />

        {/* Income tax */}
        <ResultRow
          label="Impôt avant points de crédit"
          value={`− ${formatILS(result.incomeTaxBeforeCredits)}`}
          className="text-muted-foreground"
        />
        <ResultRow
          label="Points de crédit (nekudot zikui)"
          value={`+ ${formatILS(result.creditPointsValue)}`}
          className="text-green-700"
        />
        <ResultRow
          label="Impôt final sur le revenu"
          value={`− ${formatILS(result.finalIncomeTax)}`}
        />

        <Separator className="my-2" />

        {/* Social contributions */}
        <ResultRow
          label="Bituach Leumi"
          value={`− ${formatILS(result.bituachLeumi)}`}
          className="text-muted-foreground"
        />
        <ResultRow
          label="Mas Briut"
          value={`− ${formatILS(result.masBriut)}`}
          className="text-muted-foreground"
        />

        <Separator className="my-2" />

        {/* Totals */}
        <ResultRow
          label="Total des déductions"
          value={`− ${formatILS(result.totalDeductions)}`}
          className="font-bold text-red-600 [&_span]:text-red-600 [&_span]:font-bold"
        />

        {/* Net salary — most prominent element */}
        <div className="flex justify-between items-center py-3 mt-2 rounded-lg bg-green-50 px-3">
          <span className="text-base font-bold text-green-800">Salaire net</span>
          <span className="text-xl font-bold text-green-700 tabular-nums">
            {formatILS(result.netSalary)}
          </span>
        </div>

        {/* Effective tax rate */}
        <ResultRow
          label="Taux d'imposition effectif"
          value={`${result.effectiveTaxRate.toFixed(2)} %`}
          className="text-muted-foreground pt-2"
        />
      </CardContent>
    </Card>
  )
}
