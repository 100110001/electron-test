import { resolve } from 'path'
import {
  defineConfig,
  externalizeDepsPlugin,
  splitVendorChunkPlugin,
  bytecodePlugin
} from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'
import { vitePluginForArco } from '@arco-plugins/vite-vue'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), bytecodePlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin(), bytecodePlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [
      vue(),
      viteCompression(),
      vitePluginForArco({ style: 'css' }),
      splitVendorChunkPlugin(),
      visualizer({ open: true, gzipSize: true, brotliSize: true, filename: 'visualizer.html' })
    ]
  }
})
