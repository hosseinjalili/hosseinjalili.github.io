const givenName = "سید حسین";
const familyName = "جلیلی حسن کیاده";
export const profile = {
  givenName, familyName,
  name: givenName + " " + familyName,
  englishName: "Hossein Jalili HasanKiadeh",
  linkedin: "https://www.linkedin.com/in/hossein-jalili/",
  github: "https://github.com/hosseinjalili",
  email: "hossein.jalili@outlook.com",
};
export const formatDate = (value) =>
  new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value + "T12:00:00Z"));

const pages = {
  "/": profile.name,
  "/admin/": "مدیریت نوشته‌ها",
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
export function metadata(path, posts) {
  const post = posts.find((p) => p.url === path);
  const title = post?.title || pages[path] || "صفحه پیدا نشد";
  return {
    title:
      path === "/"
        ? profile.name + " | توسعه‌دهندهٔ نرم‌افزار"
        : title + " | " + profile.name,
    description:
      post?.excerpt ||
      "پروفایل، رزومه و یادداشت‌های شخصی " + profile.name + "، توسعه‌دهندهٔ نرم‌افزار.",
  };
}
