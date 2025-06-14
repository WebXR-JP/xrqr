/// <reference types="vite/client" />

interface Navigator {
  xr?: {
    isSessionSupported(mode: string): Promise<boolean>
    requestSession(mode: string, options?: any): Promise<any>
  }
}
