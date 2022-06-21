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
        'primary-darken-3': '#283593',
        error: '#B00020',
        success: '#4CAF50',
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

app.use(vuetify)
app.mount('#app')
