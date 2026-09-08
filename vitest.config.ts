import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    // O whatsapp-server é um projeto Node separado, com teste próprio em
    // Node puro (`npm test --prefix whatsapp-server`). Sem excluir, o Vitest
    // tenta rodá-lo no ambiente jsdom e falha.
    exclude: ['**/node_modules/**', '**/dist/**', 'whatsapp-server/**'],
  },
})
