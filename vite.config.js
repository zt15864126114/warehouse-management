import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/warehouse-management/',
  server: {
    port: 3000
  }
}) 
 