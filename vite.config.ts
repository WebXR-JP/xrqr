import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

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
    }
  }
})
