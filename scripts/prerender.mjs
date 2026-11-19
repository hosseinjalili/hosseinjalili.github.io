import { readFile, writeFile, mkdir, cp, readdir, unlink } from "node:fs/promises";
import { join, dirname, extname, posix, resolve } from "node:path";
import { createServer } from "vite";
import { marked } from "marked";
import sanitize from "sanitize-html";
import sharp from "sharp";
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
let fontCss = [...css.matchAll(fontFaces)].map(([face]) => face).join("\n");
const fontFiles = [...new Set(
  Array.from(fontCss.matchAll(/\/site-assets\/[\w-]+\.woff2/g), ([file]) => file),
)];
const dataUrl = (type, bytes) => `data:${type};base64,${bytes.toString("base64")}`;
for (const file of fontFiles) {
  fontCss = fontCss.replaceAll(file, dataUrl("font/woff2", await readFile(join(output, file))));
}
const layoutCss = css.replace(fontFaces, "");
const scriptPath = join(output, script[1]);
const javascript = (await readFile(scriptPath, "utf8")).replace(/<\/script/gi, "<\\/script");
const icon = dataUrl("image/svg+xml", await readFile("public/favicon.svg"));
const portrait = dataUrl("image/webp", await readFile("public/media/hossein.webp"));
const template = shell
  .replace('href="/favicon.svg"', () => `href="${icon}"`)
  .replace(stylesheet[0], () => `<style>${layoutCss}</style>`)
  .replace(script[0], "")
  .replace("</body>", () => "<!--embedded-site-->\n</body>");
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
const imageTypes = {
  ".avif": "image/avif", ".gif": "image/gif", ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

async function encodeImage(key) {
  const type = imageTypes[extname(key).toLowerCase()];
  if (!type || posix.normalize(key) !== key) return null;
  const uploaded = key.startsWith("/media/uploads/");
  const bundled = key.startsWith("/media/recommendations/");
  const legacy = key.startsWith("/assets/images/");
  if (!uploaded && !bundled && !legacy) return null;
  const file = bundled ? "public" + key : key.slice(1);
  let bytes;
  try {
    bytes = await readFile(file);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
  if (uploaded && bytes.length > 200_000 && [".jpg", ".jpeg", ".png", ".webp", ".avif"].includes(extname(key).toLowerCase())) {
    const image = sharp(bytes);
    const { pages = 1 } = await image.metadata();
    if (pages === 1) {
      const smaller = await image
        .autoOrient()
        .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      if (smaller.length < bytes.length) return dataUrl("image/webp", smaller);
    }
  }
  return dataUrl(type, bytes);
}
try {
  const { default: App } = await server.ssrLoadModule("/src/App.jsx");
  const { routes, metadata, profile } =
    await server.ssrLoadModule("/src/content.js");
  const { recommendations } = await server.ssrLoadModule("/src/resume.js");
  const { mediaId, mediaKey } = await server.ssrLoadModule("/src/media.jsx");
  const journal = JSON.parse(await readFile("content/journal.json", "utf8"));
  const renderBody = (body) =>
    sanitize(marked.parse(body), {
      allowedTags: [...sanitize.defaults.allowedTags, "img", "del"],
      allowedAttributes: {
        ...sanitize.defaults.allowedAttributes,
        img: ["src", "alt", "title", "height", "width", "loading"],
      },
    });
  const posts = articleRecords(journal, renderBody);
  const postsByLanguage = { fa: posts, en: articleRecords(journal, renderBody, "en") };
  const sources = new Set(recommendations.map((recommendation) => recommendation.photo));
  for (const post of [...posts, ...postsByLanguage.en]) {
    if (post.cover) sources.add(post.cover);
    for (const [, src] of post.html.matchAll(/<img\b[^>]*?\ssrc="([^"]+)"/gi)) sources.add(src);
  }
  const mediaEntries = await Promise.all(
    [...new Set(Array.from(sources, mediaKey).filter(Boolean))].map(async (key) =>
      [key, await encodeImage(key)],
    ),
  );
  const media = Object.fromEntries(mediaEntries.filter(([, encoded]) => encoded));
  await cp("content", join(output, "content"), { recursive: true });
  await cp("media/uploads", join(output, "media/uploads"), { recursive: true });
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
    const localPosts = postsByLanguage[lang];
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
      createElement(App, { path, posts: localPosts, lang, media }),
    );
    // Images already present in the prerendered page are reused by React.
    const otherMedia = Object.fromEntries(Object.entries(media).filter(
      ([key]) => !content.includes(`data-site-media="${mediaId(key)}"`),
    ));
    const siteData = JSON.stringify({ posts: postsByLanguage, media: otherMedia }).replaceAll("<", "\\u003c");
    await writeFile(
      file,
      template
        .replace(
          'lang="fa" dir="rtl"',
          lang === "en" ? 'lang="en" dir="ltr"' : 'lang="fa" dir="rtl"',
        )
        .replace("<!--page-meta-->", () => meta)
        .replace("<!--page-content-->", () => content)
        .replace("<!--embedded-site-->", () =>
          `<style>:root{--portrait:url(${portrait})}\n${fontCss}</style>\n` +
          `<script type="application/json" id="site-data">${siteData}</script>\n` +
          `<script type="module">${javascript}</script>`,
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
  await Promise.all([stylesheetPath, scriptPath, ...fontFiles.map((file) => join(output, file))].map(unlink));
  if (process.argv.includes("--copy-to-root")) {
    for (const name of await readdir(output)) {
      if (name !== "content" && name !== "media")
        await cp(join(output, name), resolve(name), { recursive: true });
    }
  }
} finally {
  await server.close();
}
