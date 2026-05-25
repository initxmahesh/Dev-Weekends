import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    // Vite 8 defaults to lightningcss which doesn't understand @tailwind directives.
    // Force PostCSS so tailwindcss processes directives before any minification step.
    transformer: 'postcss',
  },
})
