import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import { createPinia } from 'pinia'
import App from './App.vue'
import 'vuetify/styles'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { loadFonts } from './plugins/webfontloader'

loadFonts()

const app = createApp(App);

const pinia = createPinia()

const lightTheme = {
    dark: true,
    colors: {
        background: '#FFFFFF',
        surface: '#FFFFFF',
        primary: '#3f51b5',
        'primary-darken-1': '#3949ab',
        secondary: '#03DAC6',
        'secondary-darken-1': '#018786',
        error: '#B00020',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FB8C00',
    }
}

const vuetify = createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: 'lightTheme',
        themes: {
            lightTheme,
        }
    }
})

app.use(pinia)
app.use(vuetify)
app.mount('#app')
