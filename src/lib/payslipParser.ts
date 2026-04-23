import type { SalaryInputs } from './salaryCalculator'

/**
 * Parses an Israeli payslip text using regex heuristics — no API key required.
 *
 * IMPORTANT: pdfjs-dist extracts Hebrew RTL text in visual left-to-right order,
 * so every multi-word phrase appears with words REVERSED in the extracted string.
 *   e.g.  "סה"כ תשלומים"  →  extracted as  "תשלומים   סה"כ"
 *         "שכר מבוטח"     →  extracted as  "מבוטח   שכר"
 *         "מצב משפחתי: נ6+" → extracted as  "נ+6   משפחתי:   מצב"
 * All regexes below are written for this reversed word order.
 */
export async function parsePayslip(text: string): Promise<Partial<SalaryInputs>> {
  const result: Partial<SalaryInputs> = {}

  // Normalise whitespace (keep numbers intact)
  const t = text.replace(/,/g, '').replace(/\s+/g, ' ')

  // ---------------------------------------------------------------------------
  // Gross salary
  // Michpal line (reversed): "תשלומים   סה"כ  [שווי-למס]  [total-payments]"
  // We want the SECOND number (total payments column).
  // ---------------------------------------------------------------------------
  const grossMatch = t.match(/תשלומים\s+סה.כ\s+([\d.]+)\s+([\d.]+)/)
  if (grossMatch) {
    const v = parseFloat(grossMatch[2])
    if (v > 1000) result.gross = v
  }

  // ---------------------------------------------------------------------------
  // Marital status + children
  // Michpal encodes as a code letter + '+' + count:
  //   נ = נשוי, ר = רווק, ג = גרוש, א = אלמן
  // In extracted text the value appears BEFORE the label:
  //   "נ+6   משפחתי:   מצב"
  // The pattern is [letter]+[digits] anywhere near "משפחתי"
  // ---------------------------------------------------------------------------
  const statusMatch = t.match(/([נרגא])\+(\d+)/)
  if (statusMatch) {
    const code = statusMatch[1]
    const count = parseInt(statusMatch[2], 10)

    switch (code) {
      case 'נ': result.maritalStatus = 'married'; break
      case 'ר': result.maritalStatus = 'single'; break
      case 'ג': result.maritalStatus = 'divorced'; break
      case 'א': result.maritalStatus = 'widowed'; break
    }

    if (!isNaN(count) && count >= 0 && count <= 15) {
      result.children = count
    }
  }

  // ---------------------------------------------------------------------------
  // Pension rate
  // Strategy: derive from cumulative figures.
  //   1. Find monthly taxable salary and cumulative taxable salary
  //      (both appear as "מס   חייב   שכר  [amount]", first = monthly, second = cumul)
  //   2. Month count = round(cumul / monthly)
  //   3. Monthly employee pension = cumulative pension / month count
  //   4. Rate = monthly pension / insured salary × 100
  //
  // Reversed patterns:
  //   "שכר חייב מס [x]"  → "מס   חייב   שכר [x]"
  //   "שכר מבוטח [x]"    → "מבוטח   שכר [x]"
  //   "הראל פנסיה [x]"   → "פנסיה   הראל [x]"  (employee cumul deduction)
  // ---------------------------------------------------------------------------
  const taxableMatches = [...t.matchAll(/מס\s+חייב\s+שכר\s+([\d.]+)/g)]
  const insuredMatch = t.match(/מבוטח\s+שכר\s+([\d.]+)/)
  // Cumulative employee pension — "פנסיה [company-name] [amount]" in cumul section
  const pensionCumMatch = t.match(/פנסיה\s+[\u05D0-\u05EA\u05F0-\u05F4"' ]{1,20}\s+([\d.]+)/)

  if (taxableMatches.length >= 2 && insuredMatch && pensionCumMatch) {
    const monthlyTaxable = parseFloat(taxableMatches[0][1])
    const cumTaxable = parseFloat(taxableMatches[1][1])
    const insuredSalary = parseFloat(insuredMatch[1])
    const cumPension = parseFloat(pensionCumMatch[1])

    if (monthlyTaxable > 0 && insuredSalary > 0) {
      const monthCount = Math.round(cumTaxable / monthlyTaxable)
      if (monthCount >= 1 && monthCount <= 12) {
        const monthlyPension = cumPension / monthCount
        const rate = (monthlyPension / insuredSalary) * 100
        if (rate >= 2 && rate <= 10) {
          result.pensionRate = Math.round(rate * 10) / 10
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Oleh hadash
  // ---------------------------------------------------------------------------
  if (/עולה/.test(t)) {
    result.isOleh = true
  }

  // ---------------------------------------------------------------------------
  // Disability
  // ---------------------------------------------------------------------------
  if (/נכות|נכה/.test(t)) {
    result.hasDisability = true
  }

  return result
}
