import { createI18n } from 'vue-i18n'
import en from '@/locales/en.json'
import ja from '@/locales/ja.json'

const savedLocale = localStorage.getItem('locale') ?? 'en'

export default createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: { en, ja },
})
