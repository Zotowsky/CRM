import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,       // Всегда запускать на 5173
    strictPort: true, // Если порт занят — выдать ошибку, а не менять адрес
  }
});