import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    port: Number(process.env.PORT ?? 3000),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
        crawlLinks: true,
      },
      pages: [
        {
          path: '/404',
          prerender: {
            enabled: true,
            outputPath: '/404.html',
          },
        },
      ],
    }),
    // React 插件必须排在 TanStack Start 插件之后
    viteReact(),
  ],
})
