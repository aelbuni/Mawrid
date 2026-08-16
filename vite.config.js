import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  base: process.env.GITHUB_PAGES ? "/Mawrid/" : "/",
  build: {
    rollupOptions: {
      input: {
        main: `${root}index.html`,
        sahabaTree: `${root}sahaba-tree/index.html`,
      },
    },
  },
});
