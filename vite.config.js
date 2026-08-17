import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = fileURLToPath(new URL(".", import.meta.url));

const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];

export default defineConfig({
  base: process.env.GITHUB_PAGES && repoName ? `/${repoName}/` : "/",
  build: {
    rollupOptions: {
      input: {
        main: `${root}index.html`,
        sahabaTree: `${root}sahaba-tree/index.html`,
      },
    },
  },
});
