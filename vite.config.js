import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Custom plugin for serving skeletons endpoint
const skeletonsPlugin = {
  name: 'skeletons-api',
  configureServer(server) {
    server.middlewares.use('/api/skeletons', (req, res) => {
      try {
        const skeletonsDir = path.join(__dirname, 'public', 'skeletons')
        
        if (!fs.existsSync(skeletonsDir)) {
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 200
          res.end(JSON.stringify([]))
          return
        }

        const files = fs.readdirSync(skeletonsDir)
          .filter(f => f.endsWith('.json'))
          .map(f => {
            const filePath = path.join(skeletonsDir, f)
            const data = fs.readFileSync(filePath, 'utf-8')
            try {
              return JSON.parse(data)
            } catch (e) {
              console.error(`Invalid JSON in ${f}:`, e.message)
              return null
            }
          })
          .filter(f => f !== null)

        res.setHeader('Content-Type', 'application/json')
        res.statusCode = 200
        res.end(JSON.stringify(files))
      } catch (error) {
        console.error('Error reading skeletons:', error)
        res.setHeader('Content-Type', 'application/json')
        res.statusCode = 500
        res.end(JSON.stringify({ error: 'Failed to load skeletons', details: error.message }))
      }
    })
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [skeletonsPlugin, react(), tailwindcss()],
  // base: "/Image_Annotation/",
})