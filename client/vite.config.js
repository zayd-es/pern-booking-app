import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path"; // by claude

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // by claude: "@/..." = src/... (feature-based architecture)
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
});
