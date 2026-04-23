import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { SalaryInputs } from '@/lib/salaryCalculator'

interface SalaryFormProps {
  values: SalaryInputs
  autoFilledKeys: Set<keyof SalaryInputs>
  onChange: (field: keyof SalaryInputs, value: unknown) => void
  onCalculate: () => void
  isCalculating: boolean
}

/** Renders an auto-fill badge next to a label when the field was populated from a PDF */
function AutoBadge({
  show,
  label,
}: {
  show: boolean
  label: string
}) {
  const { t } = useTranslation()
  return (
    <span className="flex items-center gap-2">
      {label}
      {show && (
        <Badge variant="secondary" className="text-xs">
          {t('upload.badge')}
        </Badge>
      )}
    </span>
  )
}

/** Returns Tailwind ring classes when a field is auto-filled */
function autoRing(active: boolean) {
  return active ? 'ring-2 ring-primary ring-offset-1' : ''
}

export default function SalaryForm({
  values,
  autoFilledKeys,
  onChange,
  onCalculate,
  isCalculating,
}: SalaryFormProps) {
  const { t } = useTranslation()

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        {/* Two-column grid on desktop, one column on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Gross salary */}
          <div className="space-y-2">
            <Label htmlFor="gross">
              <AutoBadge show={autoFilledKeys.has('gross')} label={t('form.gross')} />
            </Label>
            <Input
              id="gross"
              type="number"
              min={0}
              value={values.gross || ''}
              onChange={(e) => onChange('gross', Number(e.target.value))}
              className={autoRing(autoFilledKeys.has('gross'))}
            />
          </div>

          {/* Marital status */}
          <div className="space-y-2">
            <Label>
              <AutoBadge
                show={autoFilledKeys.has('maritalStatus')}
                label={t('form.maritalStatus')}
              />
            </Label>
            <Select
              value={values.maritalStatus}
              onValueChange={(v) => onChange('maritalStatus', v)}
            >
              <SelectTrigger className={autoRing(autoFilledKeys.has('maritalStatus'))}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">{t('form.maritalStatus_single')}</SelectItem>
                <SelectItem value="married">{t('form.maritalStatus_married')}</SelectItem>
                <SelectItem value="divorced">{t('form.maritalStatus_divorced')}</SelectItem>
                <SelectItem value="widowed">{t('form.maritalStatus_widowed')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Age */}
          <div className="space-y-2">
            <Label htmlFor="age">
              <AutoBadge show={autoFilledKeys.has('age')} label={t('form.age')} />
            </Label>
            <Input
              id="age"
              type="number"
              min={0}
              max={120}
              value={values.age || ''}
              onChange={(e) => onChange('age', Number(e.target.value))}
              className={autoRing(autoFilledKeys.has('age'))}
            />
          </div>

          {/* Children under 18 */}
          <div className="space-y-2">
            <Label htmlFor="children">
              <AutoBadge show={autoFilledKeys.has('children')} label={t('form.children')} />
            </Label>
            <Input
              id="children"
              type="number"
              min={0}
              value={values.children || ''}
              onChange={(e) => onChange('children', Number(e.target.value))}
              className={autoRing(autoFilledKeys.has('children'))}
            />
          </div>

          {/* Children under 5 */}
          <div className="space-y-2">
            <Label htmlFor="childrenUnder5">
              <AutoBadge
                show={autoFilledKeys.has('childrenUnder5')}
                label={t('form.childrenUnder5')}
              />
            </Label>
            <Input
              id="childrenUnder5"
              type="number"
              min={0}
              max={values.children}
              value={values.childrenUnder5 || ''}
              onChange={(e) => onChange('childrenUnder5', Number(e.target.value))}
              className={autoRing(autoFilledKeys.has('childrenUnder5'))}
            />
          </div>

          {/* Pension rate */}
          <div className="space-y-2">
            <Label htmlFor="pensionRate">
              <AutoBadge
                show={autoFilledKeys.has('pensionRate')}
                label={t('form.pensionRate')}
              />
            </Label>
            <Input
              id="pensionRate"
              type="number"
              min={0}
              max={20}
              step={0.5}
              value={values.pensionRate}
              onChange={(e) => onChange('pensionRate', Number(e.target.value))}
              className={autoRing(autoFilledKeys.has('pensionRate'))}
            />
          </div>
        </div>

        <Separator />

        {/* Checkbox section */}
        <div className="space-y-4">
          {/* Oleh hadash */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Checkbox
                id="isOleh"
                checked={values.isOleh}
                onCheckedChange={(checked) => onChange('isOleh', Boolean(checked))}
                className={autoRing(autoFilledKeys.has('isOleh'))}
              />
              <Label htmlFor="isOleh" className="cursor-pointer">
                <AutoBadge show={autoFilledKeys.has('isOleh')} label={t('form.isOleh')} />
              </Label>
            </div>

            {values.isOleh && (
              <div className="ms-7 space-y-2">
                <Label htmlFor="olehYears">{t('form.olehYears')}</Label>
                <Input
                  id="olehYears"
                  type="number"
                  min={0}
                  max={50}
                  value={values.olehYears || ''}
                  onChange={(e) => onChange('olehYears', Number(e.target.value))}
                  className="max-w-[120px]"
                />
              </div>
            )}
          </div>

          {/* Disability */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="hasDisability"
              checked={values.hasDisability}
              onCheckedChange={(checked) => onChange('hasDisability', Boolean(checked))}
              className={autoRing(autoFilledKeys.has('hasDisability'))}
            />
            <Label htmlFor="hasDisability" className="cursor-pointer">
              <AutoBadge
                show={autoFilledKeys.has('hasDisability')}
                label={t('form.hasDisability')}
              />
            </Label>
          </div>
        </div>

        <Separator />

        {/* Calculate button */}
        <Button
          className="w-full"
          onClick={onCalculate}
          disabled={values.gross <= 0 || isCalculating}
        >
          {isCalculating ? t('form.calculating') : t('form.calculate')}
        </Button>
      </CardContent>
    </Card>
  )
}
