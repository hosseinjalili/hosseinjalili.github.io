const legacyArticles = new Set(["Yonus88", "Swallow", "Hope"]);

export function articleRecords(journal, renderMarkdown) {
  return journal.posts
    .map((post) => {
      const legacy = legacyArticles.has(post.slug);
      const url = legacy
        ? "/life/" + post.slug + "/"
        : "/posts/?article=" + encodeURIComponent(post.id);
      return {
        ...post,
        url,
        tags: post.tags || [],
        categories: post.categories || [],
        html: renderMarkdown(post.body),
        excerpt: post.body.trim().split(/\n\s*\n/)[0],
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}
