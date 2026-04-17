import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

const savedTheme = localStorage.getItem('theme') ?? 'light'

export default createVuetify({
  icons: {
    defaultSet: "mdi",
  },
  defaults: {
    VSwitch: {
      color: "primary",
    },
    VTextField: {
      variant: "underlined",
    },
    VTextarea: {
      variant: "underlined",
    },
    VCombobox: {
      variant: "outlined",
    },
    VAutocomplete: {
      variant: "outlined",
    },
    VSelect: {
      variant: "outlined",
    },
    VFileInput: {
      variant: "outlined",
    },
    VTabs: {
      color: "primary",
    },
  },
  theme: {
    defaultTheme: savedTheme,
    themes: {
      light: {
        colors: {
          primary: "#b00000",
          background: "#f5f5f5",
        },
      },
      dark: {
        colors: {
          primary: "#b02222",
        },
      },
    },
  },
});
