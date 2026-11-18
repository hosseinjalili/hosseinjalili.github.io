const legacyArticles = new Set(["Yonus88", "Swallow", "Hope"]);

export function articleRecords(journal, renderMarkdown, lang = "fa") {
  return journal.posts
    .map((post) => {
      const legacy = legacyArticles.has(post.slug);
      const url = legacy
        ? "/life/" + post.slug + "/"
        : "/posts/?article=" + encodeURIComponent(post.id);
      const translated = lang === "en" && post.englishTitle && post.englishBody;
      const body = translated ? post.englishBody : post.body;
      const cover = typeof post.cover === "string" ? post.cover.trim() : "";
      return {
        ...post,
        cover: cover.startsWith("/media/uploads/") ? cover : "",
        url,
        title: translated ? post.englishTitle : post.title,
        language: translated ? "en" : "fa",
        tags: post.tags || [],
        categories: post.categories || [],
        html: renderMarkdown(body),
        excerpt: body.trim().split(/\n\s*\n/)[0],
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}
