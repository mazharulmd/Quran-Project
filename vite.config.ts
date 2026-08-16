import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Relative base + HashRouter keeps the build hostable from any static path
// (S3 sub-folders, `file://` previews). GitHub Pages project sites set
// VITE_BASE=/<repo>/ so assets resolve even without a trailing slash.
export default defineConfig({
  base: process.env.VITE_BASE || './',
  plugins: [react(), tailwindcss()],
})
