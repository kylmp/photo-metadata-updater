import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { darkTheme, lightTheme } from './themes'

export const vuetifyConfig = {
  components,
  directives,
  theme: {
    defaultTheme: 'lightTheme',
    themes: {
      lightTheme,
      darkTheme
    }
  }
}
