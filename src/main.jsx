import React from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import App from "./App";
import { routes } from "./content";
import "./style.css";
import "./home.css";

const root = createRoot(document.getElementById("root"));
const embedded = document.getElementById("site-data");
const site = embedded && JSON.parse(embedded.textContent);
const media = site?.media ?? null;
const recordsByLanguage = new Map(Object.entries(site?.posts ?? {}));
if (media) {
  for (const image of document.querySelectorAll("img[data-site-media]")) {
    media[decodeURIComponent(image.dataset.siteMedia)] = image.getAttribute("src");
  }
}
if (import.meta.env.DEV) {
  document.documentElement.style.setProperty("--portrait", 'url("/media/hossein.webp")');
  Promise.all([
    import("marked"),
    import("dompurify"),
    import("./records"),
    import("../content/journal.json"),
  ]).then(([{ marked }, { default: DOMPurify }, { articleRecords }, { default: journal }]) => {
    for (const lang of ["fa", "en"]) {
      recordsByLanguage.set(
        lang,
        articleRecords(journal, (body) => DOMPurify.sanitize(marked.parse(body)), lang),
      );
    }
    render();
  });
}

function readPage(url) {
  let path;
  try {
    path = decodeURIComponent(url.pathname);
  } catch {
    path = "/404.html";
  }
  path = path.replace(/\/index\.html$/, "/");
  if (!path.endsWith("/") && !path.endsWith(".html")) path += "/";
  const lang = path.startsWith("/en/") ? "en" : "fa";
  if (lang === "en") path = path.slice(3);

  const posts = recordsByLanguage.get(lang) ?? [];
  const articleId = url.searchParams.get("article");
  if (path === "/posts/" && articleId) {
    const match = posts.find((post) => post.id === articleId);
    path = match?.url ?? "/posts/?article=" + encodeURIComponent(articleId);
  }
  return { lang, path, posts };
}

function render(page = readPage(new URL(location.href))) {
  document.documentElement.lang = page.lang;
  document.documentElement.dir = page.lang === "en" ? "ltr" : "rtl";
  root.render(<App {...page} media={media} />);
}

render();

document.addEventListener("click", (event) => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey ||
    event.altKey ||
    !(event.target instanceof Element)
  ) return;
  const anchor = event.target.closest("a[href]");
  if (
    !anchor ||
    anchor.origin !== location.origin ||
    anchor.hasAttribute("download") ||
    (anchor.target && anchor.target !== "_self") ||
    anchor.getAttribute("href").startsWith("#")
  ) return;
  const url = new URL(anchor.href);
  if (url.hash) return;
  const page = readPage(url);
  if (!routes.includes(page.path) && !page.posts.some((post) => post.url === page.path)) return;

  event.preventDefault();
  if (url.href !== location.href) history.pushState(null, "", url);
  flushSync(() => render(page));
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  document.getElementById("main")?.focus({ preventScroll: true });
});

window.addEventListener("popstate", () => flushSync(() => render()));
