import React from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { marked } from "marked";
import DOMPurify from "dompurify";
import App from "./App";
import { routes } from "./content";
import { articleRecords } from "./records";
import snapshot from "../content/journal.json";
import "./style.css";
import "./home.css";

const root = createRoot(document.getElementById("root"));
const publishedIds = new Set(snapshot.posts.map((post) => post.id));
const recordsByLanguage = new Map();
let journal = snapshot;

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

  if (!recordsByLanguage.has(lang)) {
    recordsByLanguage.set(
      lang,
      articleRecords(
        journal,
        (body) => DOMPurify.sanitize(marked.parse(body)),
        lang,
        publishedIds,
      ),
    );
  }
  const posts = recordsByLanguage.get(lang);
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
  root.render(<App {...page} />);
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

// The CMS commits this public document. Fetch it independently of the JS bundle
// so publication works with the repository's branch-based Pages settings.
fetch("/content/journal.json", { cache: "no-cache" })
  .then((response) => {
    if (!response.ok) throw new Error("Journal unavailable");
    return response.json();
  })
  .then((freshJournal) => {
    journal = freshJournal;
    recordsByLanguage.clear();
    render();
  })
  .catch(() => {
    // The bundled snapshot keeps navigation and current-date calculations available.
  });
