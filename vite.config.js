import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/amrutam_ghee/', // Yahan apne GitHub Repo ka exactly wahi naam daalein jo Step 1 mein rakha tha
})