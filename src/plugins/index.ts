import type { App } from 'vue'
import { createUI } from '@jtekt/vue-feedback-kit'
import router from '@/router'
import vuetify from './vuetify'
import { i18n } from './i18n'
import { auth } from './auth'

export function registerPlugins(app: App) {
  console.log('Registering plugins...', vuetify.theme.current.value)
  app.use(vuetify)
  app.use(i18n)
  app.use(auth)
  app.use(router)
  app.use(createUI, {
    theme: () => ({
      dark: vuetify.theme.global.current.value.dark,
      colors: vuetify.theme.current.value.colors,
    }),
  })
}
