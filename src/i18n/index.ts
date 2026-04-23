import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import fr from './locales/fr.json'
import en from './locales/en.json'
import he from './locales/he.json'

const LANG_KEY = 'lang'

function applyDirection(lang: string) {
  const dir = lang === 'he' ? 'rtl' : 'ltr'
  document.documentElement.lang = lang
  document.documentElement.dir = dir
}

const savedLang = localStorage.getItem(LANG_KEY) ?? 'fr'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
      he: { translation: he },
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

applyDirection(savedLang)

i18n.on('languageChanged', (lang) => {
  localStorage.setItem(LANG_KEY, lang)
  applyDirection(lang)
})

export default i18n
