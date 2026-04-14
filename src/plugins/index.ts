import type { App } from 'vue'
import vuetify from './vuetify'
import i18n from './i18n'
import router from '@/router'

export function registerPlugins(app: App) {
  app.use(vuetify)
  app.use(i18n)
  app.use(router)
}
