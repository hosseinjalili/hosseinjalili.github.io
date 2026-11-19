import { readFile, writeFile, mkdir, cp, readdir, unlink } from "node:fs/promises";
import { join, dirname, resolve } from "node:path";
import { createServer } from "vite";
import { marked } from "marked";
import sanitize from "sanitize-html";
import { articleRecords } from "../src/records.js";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

const origin = "https://hosseinjalili.com";
const output = resolve("dist");
const shell = await readFile(join(output, "index.html"), "utf8");
const stylesheet = shell.match(
  /<link rel="stylesheet" crossorigin href="(\/site-assets\/[^"]+\.css)">/,
);
const script = shell.match(
  /<script type="module" crossorigin src="(\/site-assets\/[^"]+\.js)"><\/script>/,
);
if (!stylesheet) throw new Error("The built page is missing its stylesheet");
if (!script) throw new Error("The built page is missing its script");
const stylesheetPath = join(output, stylesheet[1]);
const css = await readFile(stylesheetPath, "utf8");
const fontFaces = /@font-face\s*\{[^{}]*\}/g;
const fonts = [...css.matchAll(fontFaces)].map(([face]) => face);
// Inner pages reuse the local fonts without carrying them in every document.
const linkedFontCss = fonts.filter((face) => !face.includes("data:")).join("\n");
const inlineFontCss = fonts.join("\n");
const layoutCss = css.replace(fontFaces, "");
// The prerendered page can finish loading before React's network request.
const enhancement = `<script>
  addEventListener("DOMContentLoaded", () => {
    import(${JSON.stringify(script[1])}).catch(console.error);
  }, { once: true });
</script>`;
const template = shell
  .replace(stylesheet[0], () => `<style>${layoutCss}</style>`)
  .replace(script[0], "")
  .replace("</body>", () => `<!--page-fonts-->\n${enhancement}\n</body>`);
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[c],
  );
const server = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
});
try {
  const { default: App } = await server.ssrLoadModule("/src/App.jsx");
  const { routes, metadata, profile } =
    await server.ssrLoadModule("/src/content.js");
  const journal = JSON.parse(await readFile("content/journal.json", "utf8"));
  const renderBody = (body) =>
    sanitize(marked.parse(body), {
      allowedTags: [...sanitize.defaults.allowedTags, "img", "del"],
    });
  const posts = articleRecords(journal, renderBody);
  await cp("content", join(output, "content"), { recursive: true });
  const paths = [...new Set([...routes, ...posts.map((post) => post.url)])]
    .filter((path) => !path.includes("?"));
  const pages = ["fa", "en"].flatMap((lang) =>
    paths.map((path) => ({
      lang,
      path,
      urlPath: (lang === "en" ? "/en" : "") + path,
    })),
  );
  for (const { path, lang, urlPath } of pages) {
    const localPosts =
      lang === "en" ? articleRecords(journal, renderBody, lang) : posts;
    const { title, description } = metadata(path, localPosts, lang);
    const url = escape(new URL(urlPath, origin).href);
    const meta = [
      "<title>" + escape(title) + "</title>",
      '<meta name="description" content="' + escape(description) + '">',
      '<meta property="og:title" content="' + escape(title) + '">',
      '<meta property="og:description" content="' + escape(description) + '">',
      '<meta property="og:image" content="' + origin + '/media/hossein.webp">',
      '<link rel="canonical" href="' + url + '">',
    ].join("\n");
    const file = join(output, urlPath, path.endsWith("/") ? "index.html" : "");
    if (!file.startsWith(output + "/"))
      throw new Error("Invalid route: " + path);
    await mkdir(dirname(file), { recursive: true });
    const content = renderToString(
      createElement(App, { path, posts: localPosts, lang }),
    );
    await writeFile(
      file,
      template
        .replace(
          'lang="fa" dir="rtl"',
          lang === "en" ? 'lang="en" dir="ltr"' : 'lang="fa" dir="rtl"',
        )
        .replace("<!--page-meta-->", () => meta)
        .replace("<!--page-content-->", () => content)
        .replace("<!--page-fonts-->", () =>
          `<style>${path === "/" ? inlineFontCss : linkedFontCss}</style>`,
        ),
    );
  }
  const sitemap = pages
    .filter((p) => p.path !== "/404.html")
    .map((p) => p.urlPath)
    .map((p) => "<url><loc>" + escape(new URL(p, origin).href) + "</loc></url>")
    .join("");
  await writeFile(
    join(output, "sitemap.xml"),
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
      sitemap +
      "</urlset>",
  );
  const entries = posts.map((p) => {
    const url = escape(new URL(p.url, origin).href);
    return (
      "<entry><title>" +
      escape(p.title) +
      "</title><id>" +
      url +
      '</id><link href="' +
      url +
      '"/><updated>' +
      p.date +
      'T12:00:00Z</updated><content type="html">' +
      escape(p.html) +
      "</content></entry>"
    );
  });
  await writeFile(
    join(output, "feed.xml"),
    '<feed xmlns="http://www.w3.org/2005/Atom"><title>روزمرگی‌ها</title><author><name>' +
      escape(profile.name) +
      "</name></author><id>" +
      origin +
      '/</id><link rel="self" href="' +
      origin +
      '/feed.xml"/><updated>' +
      new Date().toISOString() +
      "</updated>" +
      entries.join("") +
      "</feed>",
  );
  // This Pages site serves master directly. Only copy the public build output.
  await unlink(stylesheetPath);
  for (const name of await readdir(output)) {
    if (name !== "content")
      await cp(join(output, name), resolve(name), { recursive: true });
  }
} finally {
  await server.close();
}
