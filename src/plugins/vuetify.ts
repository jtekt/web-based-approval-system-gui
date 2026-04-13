import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

const savedLocale = localStorage.getItem('theme') ?? 'light'

const vuetify = createVuetify({
  theme: {
    defaultTheme: savedLocale,
    themes: {
      light: {
        colors: {
          primary: '#C00000',
          'on-primary': '#ffffff',
        },
      },
      dark: {
        colors: {
          primary: '#C00000',
          'on-primary': '#ffffff',
        },
      },
    },
  },
})

export default vuetify
