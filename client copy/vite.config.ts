import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "node:url";

export default defineConfig(async ({ mode }) => {
  // Load env file from parent directory
  const env = loadEnv(mode, '../', '');
  
  // Get the directory of this config file (client directory)
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  
  return {
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@shared": path.resolve(__dirname, "..", "shared"),
        "@assets": path.resolve(__dirname, "src", "assets"),
      },
    },
    root: ".",
    publicDir: "public",
    build: {
      outDir: path.resolve(__dirname, "..", "dist/public"),
      emptyOutDir: true,
    },
    server: {
      port: 3000,
      host: true,
      strictPort: false,
      hmr: {
        port: 3001,
      },
    },
    define: {
      global: "globalThis",
      // Define environment variables for browser access
      'import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(env.NEXT_PUBLIC_SUPABASE_URL),
      'import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      'import.meta.env.VITE_DATABASE_URL': JSON.stringify(env.DATABASE_URL),
      // Also define them on globalThis for fallback access
      'globalThis.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(env.NEXT_PUBLIC_SUPABASE_URL),
      'globalThis.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      'globalThis.DATABASE_URL': JSON.stringify(env.DATABASE_URL),
    },
    optimizeDeps: {
      include: [],
    },
  };
}); 