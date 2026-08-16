import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Inlines the entry chunk into index.html instead of linking it.
 *
 * A separate <script src> is the one request whose failure turns the app into
 * a blank page: the HTML and its <title> still arrive, so the tab looks right
 * while nothing renders. Inlining removes that failure mode — if the HTML
 * loads at all, the app runs. The stylesheet stays external on purpose; if it
 * fails the page is ugly but still readable, and keeping it out of the HTML
 * leaves its font URLs resolving against assets/ where they belong.
 */
function inlineEntryScript(): Plugin {
  return {
    name: 'inline-entry-script',
    apply: 'build',
    enforce: 'post',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const bundle = ctx.bundle
        if (!bundle) return html

        // The chunk is inlined, so preloading it is pointless.
        const out = html.replace(/\s*<link[^>]+rel="modulepreload"[^>]*>/g, '')

        let inlined = 0
        const result = out.replace(
          /<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g,
          (whole, src: string) => {
            // Bundle keys are paths relative to outDir ("assets/index-x.js"),
            // so strip the leading "./" the HTML uses rather than the dirname.
            const key = src.replace(/^\.?\//, '')
            const chunk = bundle[key]
            if (!chunk || chunk.type !== 'chunk') return whole
            inlined += 1
            // A literal </script> inside the code would close the tag early.
            const code = chunk.code.replace(/<\/script/gi, '<\\/script')
            return `<script type="module">\n${code}\n</script>`
          },
        )

        // Failing here is far better than shipping a build that silently
        // reverted to an external script — the exact bug this guards against.
        if (inlined === 0) {
          throw new Error(
            `inline-entry-script: matched no entry script. Bundle keys: ${Object.keys(bundle).join(', ')}`,
          )
        }
        return result
      },
    },
  }
}

/**
 * GitHub Pages serves 404.html for any path it cannot find. Shipping a copy of
 * index.html there means a mistyped or deep-linked URL still boots the app
 * rather than showing GitHub's 404.
 */
function spaFallback(): Plugin {
  return {
    name: 'spa-404-fallback',
    apply: 'build',
    closeBundle() {
      const dir = resolve(__dirname, 'dist')
      copyFileSync(resolve(dir, 'index.html'), resolve(dir, '404.html'))
    },
  }
}

// Relative base + HashRouter keeps the build hostable from any path — a GitHub
// Pages project site, a custom domain sub-path, S3, or a local `file://` open.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), inlineEntryScript(), spaFallback()],
})
