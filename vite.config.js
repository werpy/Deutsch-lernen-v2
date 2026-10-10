import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Deutsch-lernen-v2/', // Обов'язково з косими рисками по боках!
})