import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import matter from "gray-matter";
import { marked } from "marked";
import sanitize from "sanitize-html";

export default defineConfig({
  build: { assetsDir: "site-assets" },
  plugins: [
    react(),
    {
      name: "react-shell",
      transformIndexHtml: {
        order: "pre",
        handler: () => readFileSync("scripts/shell.html", "utf8"),
      },
      load(id) {
        if (!id.endsWith("/_pages/about.md")) return;
        const { content } = matter(readFileSync(id, "utf8"));
        return (
          "export default " +
          JSON.stringify({ html: sanitize(marked.parse(content)) })
        );
      },
    },
  ],
});
