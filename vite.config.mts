import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import Vue from '@vitejs/plugin-vue'
import Fonts from 'unplugin-fonts/vite'
import { defineConfig, type Plugin } from 'vite'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// pdf.js needs its CMaps to render text in fonts a PDF does not embed
// (e.g. Japanese PDFs using MS Mincho/Gothic) and its standard font data.
// Serve them under /pdfjs/ in dev and copy them into the build.
const pdfjsDir = fileURLToPath(new URL('node_modules/pdfjs-dist', import.meta.url))
const pdfjsAssetDirs = ['cmaps', 'standard_fonts']

const pdfjsAssets = (): Plugin => ({
  name: 'pdfjs-assets',
  configureServer(server) {
    server.middlewares.use('/pdfjs', (req, res, next) => {
      const [dir, file] = (req.url ?? '').split('?')[0].slice(1).split('/')
      if (!pdfjsAssetDirs.includes(dir) || !file) return next()
      try {
        res.end(readFileSync(join(pdfjsDir, dir, decodeURIComponent(file))))
      } catch {
        next()
      }
    })
  },
  generateBundle() {
    for (const dir of pdfjsAssetDirs) {
      for (const file of readdirSync(join(pdfjsDir, dir))) {
        this.emitFile({
          type: 'asset',
          fileName: `pdfjs/${dir}/${file}`,
          source: readFileSync(join(pdfjsDir, dir, file)),
        })
      }
    }
  },
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    pdfjsAssets(),
    Vue({
      template: { transformAssetUrls },
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
    Vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/styles/settings.scss',
      },
    }),
    Fonts({
      fontsource: {
        families: [
          {
            name: 'Roboto',
            weights: [100, 300, 400, 500, 700, 900],
            styles: ['normal', 'italic'],
          },
        ],
      },
    }),
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    },
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_SHINSEI_MANAGER_URL ?? 'http://localhost:8000',
        rewrite: (path) => path.replace(/^\/api/, ''),
        changeOrigin: true,
      },
    },
  },
})
