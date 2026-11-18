import React from "react";
import { createRoot } from "react-dom/client";
import { marked } from "marked";
import DOMPurify from "dompurify";
import App from "./App";
import { articleRecords } from "./records";
import snapshot from "../content/journal.json";
import "./style.css";

let path;
try {
  path = decodeURIComponent(location.pathname);
} catch {
  path = "/404.html";
}
if (!path.endsWith("/") && !path.endsWith(".html")) path += "/";
const article = new URLSearchParams(location.search).get("article");
if (path === "/posts/" && article)
  path += "?article=" + encodeURIComponent(article);

const root = createRoot(document.getElementById("root"));
function render(journal) {
  const posts = articleRecords(journal, (body) =>
    DOMPurify.sanitize(marked.parse(body)),
  );
  root.render(<App path={path} posts={posts} />);
}

// The CMS commits this public document. Fetch it independently of the JS bundle
// so publication works with the repository's branch-based Pages settings.
fetch("/content/journal.json", { cache: "no-cache" })
  .then((response) => {
    if (!response.ok) throw new Error("Journal unavailable");
    return response.json();
  })
  .then(render)
  .catch(() => render(snapshot));
