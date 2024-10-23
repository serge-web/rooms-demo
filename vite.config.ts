import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/dobosh': {
        target: 'http://localhost:7070/http-bind/ ',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/dobosh/, ''),
      }
    }
  },
  plugins: [react()],
  define: {
    // By default, Vite doesn't include shims for NodeJS/
    // necessary for segment analytics lib to work
    global: {},
  },
})
