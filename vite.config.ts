import { defineConfig } from 'vite'
import path from 'node:path'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // @eventconnect/dec ships with react as both a peerDependency AND a
    // regular dependency, which causes npm to install a nested copy of React
    // inside node_modules/@eventconnect/dec/node_modules/ when the host
    // project's React version doesn't satisfy the dep range. Two Reacts
    // breaks hooks ("Invalid hook call"). Alias both to the host copy.
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
    dedupe: ['react', 'react-dom'],
  },
})
