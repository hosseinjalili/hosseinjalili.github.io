const legacyArticles = new Set(["Yonus88", "Swallow", "Hope"]);

function uploadPath(value) {
  const path = typeof value === "string" ? value.trim() : "";
  return path.startsWith("/media/uploads/") ? path : "";
}

function uploadedImages(html) {
  // Match the src attribute of images in the already-sanitized article HTML.
  return Array.from(html.matchAll(/<img\b[^>]*?\ssrc="([^"]+)"/gi), ([, src]) =>
    uploadPath(src.replace(/&amp;/g, "&")),
  ).filter(Boolean);
}

export function articleRecords(
  journal,
  renderMarkdown,
  lang = "fa",
  publishedIds = new Set(journal.posts.map((post) => post.id)),
) {
  return journal.posts
    .map((post) => {
      const legacy = legacyArticles.has(post.slug);
      const prerendered = publishedIds.has(post.id) && /^[\w-]+$/.test(post.id);
      const url = legacy
        ? "/life/" + post.slug + "/"
        : prerendered
          ? "/posts/" + post.id + "/"
          : "/posts/?article=" + encodeURIComponent(post.id);
      const hasTranslation = post.englishTitle && post.englishBody;
      const translated = lang === "en" && hasTranslation;
      const body = translated ? post.englishBody : post.body;
      const html = renderMarkdown(body);
      const images = uploadedImages(html);
      const cover =
        uploadPath(post.cover) ||
        (translated
          ? uploadedImages(renderMarkdown(post.body))[0] || images[0]
          : images[0] ||
            (hasTranslation &&
              uploadedImages(renderMarkdown(post.englishBody))[0])) ||
        "";
      return {
        id: post.id,
        slug: post.slug,
        date: post.date,
        cover,
        coverInBody: images.includes(cover),
        url,
        title: translated ? post.englishTitle : post.title,
        language: translated ? "en" : "fa",
        tags: post.tags || [],
        categories: post.categories || [],
        html,
        excerpt: body.trim().split(/\n\s*\n/)[0],
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}
