import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // visualizer({
    //   filename: './stats.html',
    //   open: true,
    // })
  ],
  // server: {
  //   host: '0.0.0.0',              // so Playit can reach it
  //   allowedHosts: [
  //     'means-according.gl.at.ply.gg'  // add your Playit hostname here
  //   ]
  // }
})
