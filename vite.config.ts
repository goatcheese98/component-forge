import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const isLib = mode === 'lib'
  
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@/components': resolve(__dirname, 'src/components'),
        '@/lib': resolve(__dirname, 'src/lib')
      }
    },
    css: {
      postcss: './postcss.config.js'
    },
    build: isLib ? {
      // Library build configuration
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'ComponentForge',
        formats: ['es', 'cjs'],
        cssFileName: 'style',
        fileName: (format) => format === 'es' ? 'index.esm.js' : 'index.cjs'
      },
      rollupOptions: {
        external: ['vue', 'tailwindcss'],
        output: {
          globals: {
            vue: 'Vue'
          }
        }
      }
    } : {
      // Development build configuration
      outDir: 'dist-dev'
    }
  }
})