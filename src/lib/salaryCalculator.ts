// Israeli net salary calculator — Fiscal Year 2026

export interface SalaryInputs {
  gross: number
  children: number
  childrenUnder5: number
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed'
  age: number
  pensionRate: number
  isOleh: boolean
  olehYears: number
  hasDisability: boolean
}

export interface SalaryResult {
  gross: number
  pensionDeduction: number
  taxableIncome: number
  incomeTaxBeforeCredits: number
  creditPointsValue: number
  finalIncomeTax: number
  bituachLeumi: number
  masBriut: number
  totalDeductions: number
  netSalary: number
  effectiveTaxRate: number
}

// ---------------------------------------------------------------------------
// Income tax brackets — monthly, 2026
// ---------------------------------------------------------------------------
interface TaxBracket {
  upTo: number // upper limit (inclusive), Infinity for the last bracket
  rate: number // as decimal (e.g. 0.10)
}

const INCOME_TAX_BRACKETS: TaxBracket[] = [
  { upTo: 6790, rate: 0.1 },
  { upTo: 9730, rate: 0.14 },
  { upTo: 15620, rate: 0.2 },
  { upTo: 21710, rate: 0.31 },
  { upTo: 45180, rate: 0.35 },
  { upTo: 58190, rate: 0.47 },
  { upTo: Infinity, rate: 0.5 },
]

// Value of one credit point per month (nekudat zikui)
const CREDIT_POINT_VALUE = 242 // TODO: verify 2026 official value

// Pension ceiling for tax-deductible portion: 6% × 9 900 ILS
const PENSION_TAX_DEDUCTIBLE_CEILING = 594 // TODO: verify 2026 ceiling (6% × 9900)

// Bituach Leumi / Mas Briut thresholds
const BL_LOW_THRESHOLD = 7522 // TODO: verify 2026 official value
const BL_CEILING = 49030 // TODO: verify 2026 official value

// ---------------------------------------------------------------------------
// Pension deduction
// ---------------------------------------------------------------------------
export function calculatePensionDeduction(
  gross: number,
  pensionRate: number,
): { deduction: number; taxDeductible: number } {
  const deduction = round2(gross * (pensionRate / 100))
  const taxDeductible = round2(Math.min(deduction, PENSION_TAX_DEDUCTIBLE_CEILING))
  return { deduction, taxDeductible }
}

// ---------------------------------------------------------------------------
// Credit points (nekudot zikui)
// ---------------------------------------------------------------------------
export function calculateCreditPoints(inputs: SalaryInputs): number {
  const { maritalStatus, children, childrenUnder5, hasDisability, isOleh, olehYears } = inputs

  // Base points by marital status
  let points = 0
  switch (maritalStatus) {
    case 'single':
      points = 2.25
      break
    case 'married':
      points = 2.75 // assumes spouse without income; full credit
      break
    case 'divorced':
    case 'widowed':
      points = 3.25
      break
  }

  // Children under 18: 0.5 point each
  points += children * 0.5

  // Children under 5: extra 0.5 point each (total 1.0 per child under 5)
  points += childrenUnder5 * 0.5

  // Disability (necheh mukkar 100%)
  if (hasDisability) {
    points += 2.0
  }

  // Oleh hadash // TODO: verify 2026 official value
  if (isOleh && olehYears > 0) {
    if (olehYears <= 3) {
      points += 3.0
    } else if (olehYears <= 5) {
      points += 2.0
    }
    // After year 5: no bonus
  }

  return points
}

// ---------------------------------------------------------------------------
// Income tax calculation
// ---------------------------------------------------------------------------
export function calculateIncomeTax(
  taxableIncome: number,
  creditPoints: number,
): { beforeCredits: number; creditValue: number; final: number } {
  let tax = 0
  let remaining = taxableIncome
  let previousLimit = 0

  for (const bracket of INCOME_TAX_BRACKETS) {
    if (remaining <= 0) break
    const bracketSize =
      bracket.upTo === Infinity ? remaining : Math.min(remaining, bracket.upTo - previousLimit)
    tax += bracketSize * bracket.rate
    remaining -= bracketSize
    previousLimit = bracket.upTo
  }

  const beforeCredits = round2(tax)
  const creditValue = round2(creditPoints * CREDIT_POINT_VALUE)
  const final = round2(Math.max(0, beforeCredits - creditValue))

  return { beforeCredits, creditValue, final }
}

// ---------------------------------------------------------------------------
// Bituach Leumi — employee share (2026)
// ---------------------------------------------------------------------------
export function calculateBituachLeumi(gross: number): number {
  const cappedGross = Math.min(gross, BL_CEILING)

  if (cappedGross <= BL_LOW_THRESHOLD) {
    return round2(cappedGross * 0.004)
  }

  const lowPart = round2(BL_LOW_THRESHOLD * 0.004)
  const highPart = round2((cappedGross - BL_LOW_THRESHOLD) * 0.07)
  return round2(lowPart + highPart)
}

// ---------------------------------------------------------------------------
// Mas Briut — employee share (2026)
// ---------------------------------------------------------------------------
export function calculateMasBriut(gross: number): number {
  const cappedGross = Math.min(gross, BL_CEILING)

  if (cappedGross <= BL_LOW_THRESHOLD) {
    return round2(cappedGross * 0.031)
  }

  const lowPart = round2(BL_LOW_THRESHOLD * 0.031)
  const highPart = round2((cappedGross - BL_LOW_THRESHOLD) * 0.05)
  return round2(lowPart + highPart)
}

// ---------------------------------------------------------------------------
// Main calculation
// ---------------------------------------------------------------------------
export function calculateNetSalary(inputs: SalaryInputs): SalaryResult {
  const { gross, pensionRate } = inputs

  // 1. Pension
  const { deduction: pensionDeduction, taxDeductible } = calculatePensionDeduction(
    gross,
    pensionRate,
  )

  // 2. Taxable income after pension deduction
  const taxableIncome = round2(Math.max(0, gross - taxDeductible))

  // 3. Credit points
  const creditPoints = calculateCreditPoints(inputs)

  // 4. Income tax
  const { beforeCredits: incomeTaxBeforeCredits, creditValue: creditPointsValue, final: finalIncomeTax } =
    calculateIncomeTax(taxableIncome, creditPoints)

  // 5. Social contributions
  const bituachLeumi = calculateBituachLeumi(gross)
  const masBriut = calculateMasBriut(gross)

  // 6. Totals
  const totalDeductions = round2(pensionDeduction + finalIncomeTax + bituachLeumi + masBriut)
  const netSalary = round2(gross - totalDeductions)
  const effectiveTaxRate = gross > 0 ? round2((totalDeductions / gross) * 100) : 0

  return {
    gross,
    pensionDeduction,
    taxableIncome,
    incomeTaxBeforeCredits,
    creditPointsValue,
    finalIncomeTax,
    bituachLeumi,
    masBriut,
    totalDeductions,
    netSalary,
    effectiveTaxRate,
  }
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------
function round2(n: number): number {
  return Math.round(n * 100) / 100
}
