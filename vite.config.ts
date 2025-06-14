import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // ベースパスを相対パスに設定
  base: './',
  // local ip からもアクセスできるようにする
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
  plugins: [react()],
  css: {
    modules: {
      localsConvention: 'dashes',
    },
  },
})
