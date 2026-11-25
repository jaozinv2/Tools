import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// base './' + HashRouter => works at https://user.github.io/repo/ and survives refresh
export default defineConfig({ base: './', plugins: [react()] })
