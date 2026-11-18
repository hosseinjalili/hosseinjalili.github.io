const givenName = "سید حسین";
const familyName = "جلیلی حسن کیاده";
export const profile = {
  givenName,
  familyName,
  name: givenName + " " + familyName,
  englishName: "Hossein Jalili HasanKiadeh",
  linkedin: "https://www.linkedin.com/in/hossein-jalili/",
  github: "https://github.com/hosseinjalili",
  email: "hossein.jalili@outlook.com",
};
export const formatDate = (value, lang = "fa") =>
  new Intl.DateTimeFormat(lang === "en" ? "en" : "fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value + "T12:00:00Z"));

const pages = {
  "/": profile.name,
  "/resume/": "رزومه",
  "/posts/": "روزمرگی‌ها",
  "/about/": "دربارهٔ من",
  "/categories/": "دسته‌بندی نوشته‌ها",
  "/tags/": "برچسب نوشته‌ها",
};
export const routes = [
  ...Object.keys(pages),
  ...["Yonus88", "Swallow", "Hope"].map((slug) => "/life/" + slug + "/"),
  "/404.html",
];
export function metadata(path, posts, lang = "fa") {
  const post = posts.find((p) => p.url === path);
  if (lang === "en") {
    const labels = {
      "/": "Senior Full Stack Developer",
      "/resume/": "Résumé",
      "/posts/": "Journal",
      "/about/": "About",
      "/categories/": "Categories",
      "/tags/": "Tags",
    };
    return {
      title:
        (post?.title || labels[path] || "Page not found") +
        " | " +
        profile.englishName,
      description:
        post?.excerpt ||
        "The work, résumé and personal journal of " + profile.englishName + ".",
    };
  }
  const title = post?.title || pages[path] || "صفحه پیدا نشد";
  return {
    title:
      path === "/"
        ? profile.name + " | توسعه‌دهندهٔ ارشد فول‌استک"
        : title + " | " + profile.name,
    description:
      post?.excerpt ||
      "پروفایل، رزومه و یادداشت‌های شخصی " +
        profile.name +
        "، توسعه‌دهندهٔ ارشد فول‌استک.",
  };
}
