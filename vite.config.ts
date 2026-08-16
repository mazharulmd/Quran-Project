import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Relative base + HashRouter keeps the build hostable from any static path
// (GitHub Pages project sites, S3 sub-folders, `file://` previews).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
