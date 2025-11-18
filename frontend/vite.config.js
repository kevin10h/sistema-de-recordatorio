import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  
  server: {
    host: "0.0.0.0",  // 🔥 necesario para Docker
    port: 3000,
  
    watch: {
      usePolling: true, // 🔥 evita errores en Docker
    }
  }
});
