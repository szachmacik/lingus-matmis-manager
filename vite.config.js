// HOLON-META: {
//   purpose: "lingus-matmis-manager",
//   morphic_field: "agent-state:4c67a2b1-6830-44ec-97b1-7c8f93722add",
//   startup_protocol: "READ morphic_field + biofield_external + em_grid",
//   wiki: "32d6d069-74d6-8164-a6d5-f41c3d26ae9b"
// }

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
