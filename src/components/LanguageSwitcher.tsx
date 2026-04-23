import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

const LANGUAGES = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'he', label: 'עב' },
] as const

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  function handleChange(lang: string) {
    void i18n.changeLanguage(lang)
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr'
  }

  return (
    <div className="flex gap-1">
      {LANGUAGES.map(({ code, label }) => (
        <Button
          key={code}
          variant={i18n.language === code ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleChange(code)}
          aria-pressed={i18n.language === code}
        >
          {label}
        </Button>
      ))}
    </div>
  )
}
