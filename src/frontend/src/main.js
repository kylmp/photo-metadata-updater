import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import App from './App.vue'
import 'vuetify/styles'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { loadFonts } from './plugins/webfontloader'
import "@mdi/font/css/materialdesignicons.css";

loadFonts()

const app = createApp(App);

const lightTheme = {
  colors: {
    background: '#FAFAFA',
    surface: '#FAFAFA',
    primary: '#3f51b5',
    'primary-darken-1': '#3949ab',
    divider: '#283593',
    error: '#B00020',
    success: '#4CAF50',
    'img-name': '#3f51b5',
    'btn-save': '#4CAF50',
    'resolution': '#757575',
    'list-load': '#3f51b5',
    header: '#3f51b5'
  }
}

const darkTheme = {
  dark: true,
  colors: {
    background: '#0e0e10',
    surface: '#1f1f23',
    primary: '#1565C0',
    'primary-darken-1': '#0D47A1',
    error: '#B00020',
    success: '#4CAF50',
    divider: '#000000',
    'img-name': '#42A5F5',
    'btn-save': '#43A047',
    'resolution': '#BDBDBD',
    'list-load': '#1E88E5',
    header: '#18181b'
  }
}

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'lightTheme',
    themes: {
      lightTheme,
      darkTheme
    }
  }
})

app.use(vuetify)
app.mount('#app')
