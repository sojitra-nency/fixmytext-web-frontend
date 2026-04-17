import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 3000, host: true },
  preview: { port: 3000 },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-export': ['jspdf', 'docx'],
          'vendor-format': ['prettier'],
          'vendor-hash': [
            'blakejs',
            'whirlpool-hash',
            'xxhashjs',
            'murmurhash3js',
            'js-sha3',
            'js-sha256',
            'js-sha512',
            'blueimp-md5',
          ],
        },
      },
    },
  },
})
