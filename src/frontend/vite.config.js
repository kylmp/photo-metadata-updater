import path from 'path';
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
  ],
  build: {
    outDir: path.resolve(__dirname, "../../public"),
  },
  server: {
    port: 8080,
    proxy: {
      '/api': 'http://localhost:8000',
      '/img': 'http://localhost:8000'
    }
  }
})
