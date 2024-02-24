import { defineConfig } from "vite";
import { resolve } from "path";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), dts({ insertTypesEntry: true })],
  build: {
    lib: {
      entry: resolve("src/main.ts"),
      name: "AceIpInput",
      fileName: "ace-ip-input",
    },
    rollupOptions: {
      external: ["vue"],
      input: "src/main.ts",
      output: {
        globals: { vue: "vue" },
        exports: "named",
      },
    },
  },
});
