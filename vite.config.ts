import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // ベースパスを相対パスに設定
  base: './',
  // local ip からもアクセスできるようにする
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
  plugins: [react()],
  resolve: {
    alias: {
      '~': resolve(__dirname, 'src'),
    },
  },
  css: {
    modules: {
      localsConvention: 'dashes',
    },
  },
})
