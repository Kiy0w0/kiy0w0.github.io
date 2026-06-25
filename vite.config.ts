import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Zero-config Vercel deploy: Vercel auto-detects Vite and runs `npm run build`.
export default defineConfig({
  plugins: [react()],
});
