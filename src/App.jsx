import React, { useEffect, useState } from "react";
import { profile, formatDate, metadata } from "./content";
import about from "../_pages/about.md";

const arrow = <i className="arrow" aria-hidden="true" />;
import { Language, useLanguage, localPath, Link } from "./locale";

const nav = [
  ["/", "خانه", "Home"],
  ["/resume/", "رزومه", "Résumé"],
  ["/posts/", "بلاگ", "Journal"],
  ["/about/", "درباره", "About"],
];

function Theme() {
  const { lang, t } = useLanguage();
  const [dark, setDark] = useState(false);
  useEffect(
    () => setDark(document.documentElement.dataset.theme === "dark"),
    [],
  );
  function toggle() {
    const next = !dark;
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
    setDark(next);
  }
  return (
    <button
      className="theme"
      onClick={toggle}
      aria-label={t("حالت تیره", "Dark mode")}
      aria-pressed={dark}
    >
      <span aria-hidden="true" />
    </button>
  );
}
function Header({ path, posts }) {
  const { lang, t } = useLanguage();
  const active =
    posts.some((p) => p.url === path) ||
    ["/categories/", "/tags/"].includes(path)
      ? "/posts/"
      : path;
  return (
    <header className="header wrap">
      <Link
        className="brand"
        href="/"
        aria-label={t(profile.name + "، خانه", profile.englishName + ", home")}
      >
        <b dir="ltr">
          hj<span>.</span>
        </b>
      </Link>
      <nav aria-label={t("منوی اصلی", "Main navigation")}>
        {nav.map(([url, fa, en]) => (
          <Link
            key={url}
            aria-current={active === url ? "page" : undefined}
            href={url}
          >
            {t(fa, en)}
          </Link>
        ))}
      </nav>
      <div className="header-tools">
        <a
          lang={lang === "en" ? "fa" : "en"}
          href={localPath(path, lang === "en" ? "fa" : "en")}
        >
          {t("English", "فارسی")}
        </a>
        <Theme />
      </div>
    </header>
  );
}
function Art({ slug }) {
  return (
    <div
      aria-hidden="true"
      className={
        "art " +
        ({ Yonus88: "waves", Swallow: "flight", Hope: "kite" }[slug] || "waves")
      }
    >
      <i />
      <b />
      <em />
    </div>
  );
}
function Cards({ items }) {
  const { lang, t } = useLanguage();
  return (
    <div className="cards">
      {items.map((p) => (
        <Link className="card" key={p.url} href={p.url}>
          <Art slug={p.slug} />
          <time dateTime={p.date}>{formatDate(p.date, lang)}</time>
          <div className="card-title">
            <h3 lang={p.language} dir="auto">
              {p.title}
            </h3>
            {arrow}
          </div>
        </Link>
      ))}
    </div>
  );
}
function Portrait() {
  const { lang, t } = useLanguage();
  return (
    <figure className="poster">
      <div className="poster-grid" />
      <div className="orbit" />
      <div className="photo">
        <img
          src="/media/hossein.webp"
          width="906"
          height="920"
          alt={t(profile.name + " در طبیعت", profile.englishName + " outdoors")}
        />
      </div>
      <figcaption dir="ltr" lang="en">
        {profile.englishName}
      </figcaption>
    </figure>
  );
}
function Home({ posts }) {
  const { lang, t } = useLanguage();
  return (
    <>
      <section className="hero wrap">
        <div className="hero-copy">
          <p className="eyebrow">
            <b />
            {t("توسعه‌دهندهٔ نرم‌افزار", "Software developer")}
          </p>
          <h1>
            {t(profile.givenName, "Hossein")}{" "}
            <em>{t(profile.familyName, "Jalili HasanKiadeh")}</em>
            <span className="name-dot">.</span>
          </h1>
          <p className="intro">
            {t(
              "از طراحی رابط تا توسعهٔ نرم‌افزار، به تجربهٔ آدم‌ها فکر می‌کنم. اینجا از کارم و روزمرگی‌هام می‌نویسم.",
              "I design interfaces and develop software with the people who use them in mind. Here I write about my work and everyday life.",
            )}
          </p>
          <div className="actions">
            <Link className="button" href="/resume/">
              {t("رزومهٔ من", "My résumé")} {arrow}
            </Link>
            <Link className="textlink" href="/posts/">
              {t("بلاگ شخصی", "Personal journal")} {arrow}
            </Link>
          </div>
        </div>
        <Portrait />
      </section>
      <section className="journal wrap">
        <div className="section-head">
          <h2>
            {t("روزمرگی‌ها", "Journal")}
            <span>.</span>
          </h2>
          <Link className="textlink" href="/posts/">
            {t("همهٔ نوشته‌ها", "All entries")} {arrow}
          </Link>
        </div>
        <Cards items={posts.slice(0, 3)} />
      </section>
    </>
  );
}
function Archive({ path, posts }) {
  const { lang, t } = useLanguage();
  const [query, setQuery] = useState("");
  const grouping =
    path === "/tags/" ? "tags" : path === "/categories/" ? "categories" : null;
  const normalize = (s) =>
    s
      .normalize("NFKD")
      .replace(/[\u064b-\u065f\u200c]/g, "")
      .replace(/ي/g, "ی")
      .replace(/ك/g, "ک")
      .trim()
      .toLowerCase();
  const items = posts.filter((p) =>
    normalize(p.title + " " + p.excerpt).includes(normalize(query)),
  );
  const groups = grouping
    ? [...new Set(items.flatMap((p) => p[grouping]))]
    : [];
  return (
    <section className="wrap inner">
      <p className="eyebrow">
        <b />
        {t("بلاگ شخصی", "Personal journal")}
      </p>
      <h1>
        {grouping
          ? grouping === "tags"
            ? t("برچسب نوشته‌ها", "Journal tags")
            : t("دسته‌بندی نوشته‌ها", "Journal categories")
          : t("روزمرگی‌ها", "Journal")}
        <em>.</em>
      </h1>
      <div className="archive-tools">
        <input
          aria-label={t("جست‌وجوی نوشته‌ها", "Search entries")}
          placeholder={t("جست‌وجوی نوشته‌ها…", "Search entries…")}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Link href="/posts/">{t("همه", "All")}</Link>
        <Link href="/categories/">{t("دسته‌بندی", "Categories")}</Link>
        <Link href="/tags/">{t("برچسب", "Tags")}</Link>
      </div>
      {!items.length && (
        <p role="status">
          {t("نوشته‌ای با این عبارت پیدا نشد.", "No matching entries.")}
        </p>
      )}
      {grouping ? (
        groups.map((g) => (
          <section key={g} id={g}>
            <h2>
              {{ life: t("زندگی", "Life"), hope: t("امید", "Hope") }[g] || g}
            </h2>
            <Cards items={items.filter((p) => p[grouping].includes(g))} />
          </section>
        ))
      ) : (
        <Cards items={items} />
      )}
    </section>
  );
}
function Article({ post }) {
  const { lang, t } = useLanguage();
  return (
    <article className="wrap inner reading">
      <Link className="textlink" href="/posts/">
        {t("روزمرگی‌ها", "Journal")} {arrow}
      </Link>
      <h1>
        {post.title}
        <em>.</em>
      </h1>
      <time dateTime={post.date}>{formatDate(post.date, lang)}</time>
      <Art slug={post.slug} />
      <div
        className="prose"
        lang={post.language}
        dir={post.language === "fa" ? "rtl" : "ltr"}
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
      <Link className="textlink" href="/posts/">
        {t("همهٔ نوشته‌ها", "All entries")} {arrow}
      </Link>
    </article>
  );
}
function Resume() {
  const { lang, t } = useLanguage();
  return (
    <section className="wrap inner">
      <p className="eyebrow">
        <b />
        {t("رزومه", "Résumé")}
      </p>
      <h1>
        {t("کار و تجربه", "Experience")}
        <em>.</em>
      </h1>
      <p className="lead">{t(profile.name, profile.englishName)}</p>
      <p>
        {t("توسعه‌دهندهٔ نرم‌افزار · تهران", "Software developer · Tehran")}
      </p>
      <div className="actions">
        <Link className="button" href={profile.linkedin}>
          {t("پروفایل لینکدین", "LinkedIn profile")} {arrow}
        </Link>
        <button className="textlink" onClick={() => window.print()}>
          {t("چاپ یا ذخیرهٔ PDF", "Print or save PDF")}
        </button>
      </div>
      <dl className="resume-list">
        <dt>{t("تجربهٔ کاری", "Work experience")}</dt>
        <dd>
          <strong>{t("فیوسافت", "FuSoft")}</strong>
          <Link href="https://fusoft-co.com/" className="textlink">
            {t("وب‌سایت شرکت", "Company website")} {arrow}
          </Link>
        </dd>
        <dt>{t("مهارت‌ها", "Skills")}</dt>
        <dd className="skills">
          {[
            "UI/UX",
            "React",
            "Angular",
            "Node.js",
            "NestJS",
            ".NET",
            "Scrum",
            "C#",
            "TypeScript",
            "JavaScript",
            "HTML5",
            "CSS3",
            "Sass",
            "Python",
            "SQL Server",
            "AngularJS",
            "AWS",
            "Azure",
          ].map((x) => (
            <span dir="ltr" key={x}>
              {x}
            </span>
          ))}
        </dd>
        <dt>{t("تحصیلات", "Education")}</dt>
        <dd>
          <strong>{t("کارشناسی ارشد", "Master of Science")}</strong>
          <p>
            {t(
              "دانشگاه آزاد اسلامی، واحد علوم و تحقیقات",
              "Islamic Azad University, Science and Research Branch",
            )}
          </p>
          <p>{t("۱۳۹۴ تا ۱۳۹۹", "1394–1399 (Solar Hijri calendar)")}</p>
        </dd>
        <dt>{t("پروژه", "Project")}</dt>
        <dd>
          <strong>
            {t(
              "سامانهٔ مدیریت فرایندهای کسب‌وکار",
              "Business process management system",
            )}
          </strong>
          <Link href={profile.github} className="textlink">
            {t("معرفی پروژه در گیت‌هاب", "Project note on GitHub")} {arrow}
          </Link>
        </dd>
        <dt>{t("زبان‌ها", "Languages")}</dt>
        <dd>
          <p>
            {t(
              "فارسی · زبان مادری یا تسلط دوزبانه",
              "Persian · Native or bilingual proficiency",
            )}
          </p>
          <p>
            {t(
              "انگلیسی · مهارت کاری محدود",
              "English · Limited working proficiency",
            )}
          </p>
        </dd>
        <dt>{t("نوشته‌های فنی", "Technical writing")}</dt>
        <dd>
          <p>
            {t(
              "چه زمانی GraphRAG به کارمان می‌آید؟",
              "When is GraphRAG useful?",
            )}
          </p>
          <p>
            {t(
              "آیا هر دستیار هوش مصنوعی باید Agent باشد؟",
              "Does every AI assistant need to be an agent?",
            )}
          </p>
          <Link
            className="textlink"
            href="https://www.linkedin.com/company/fusoft/posts/"
          >
            {t("مطالعه در صفحهٔ فیوسافت", "Read on FuSoft’s LinkedIn page")}{" "}
            {arrow}
          </Link>
        </dd>
        <dt>{t("توصیه‌نامه‌ها", "Recommendations")}</dt>
        <dd>
          <Link
            className="textlink"
            href={profile.linkedin + "details/recommendations/"}
          >
            {t(
              "توصیه‌نامه‌های دریافتی در لینکدین",
              "View received recommendations on LinkedIn",
            )}{" "}
            {arrow}
          </Link>
        </dd>
        <dt>{t("تماس", "Contact")}</dt>
        <dd>
          <a dir="ltr" href={"mailto:" + profile.email}>
            {profile.email}
          </a>
        </dd>
      </dl>
    </section>
  );
}
function About() {
  const { lang, t } = useLanguage();
  return (
    <section className="wrap inner about">
      <div>
        <p className="eyebrow">
          <b />
          {t("دربارهٔ من", "About me")}
        </p>
        <h1>
          {t(profile.name, profile.englishName)}
          <em>.</em>
        </h1>
        <p className="lead">
          {t("یک برنامه‌نویس، یک گیمر خسته", "A programmer and a tired gamer")}
        </p>
        <div
          className="prose"
          dangerouslySetInnerHTML={{
            __html: t(
              about.html,
              "<p>I was born one day in Aban, in the Persian autumn.</p><p>To find my way across the ocean of life, I must board a lifeboat and reach the shore, where I may meet God.</p>",
            ),
          }}
        />
        <Link className="textlink" href="/resume/">
          {t("رزومهٔ من", "My résumé")} {arrow}
        </Link>
      </div>
      <Portrait />
    </section>
  );
}
export default function App({ path, posts, lang = "fa" }) {
  return (
    <Language.Provider value={lang}>
      <Page path={path} posts={posts} />
    </Language.Provider>
  );
}
function Page({ path, posts }) {
  const { lang, t } = useLanguage();
  const post = posts.find((p) => p.url === path);
  useEffect(() => {
    const { title, description } = metadata(path, posts, lang);
    document.title = title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description);
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute(
        "href",
        new URL(localPath(path, lang), "https://hosseinjalili.com").href,
      );
  }, [path, posts, lang]);
  let page;
  if (post) page = <Article post={post} />;
  else if (path === "/") page = <Home posts={posts} />;
  else if (path === "/resume/") page = <Resume />;
  else if (path === "/about/") page = <About />;
  else if (["/posts/", "/categories/", "/tags/"].includes(path))
    page = <Archive path={path} posts={posts} />;
  else
    page = (
      <section className="wrap inner">
        <h1>{t("صفحه پیدا نشد", "Page not found")}</h1>
        <Link className="button" href="/">
          {t("بازگشت به خانه", "Back to home")} {arrow}
        </Link>
      </section>
    );
  return (
    <>
      <Link href="#main" className="skip">
        {t("رفتن به محتوا", "Skip to content")}
      </Link>
      <Header path={path} posts={posts} />
      <main id="main">{page}</main>
      <footer className="wrap">
        <Link className="footer-name" href="/">
          {t(profile.name, profile.englishName)}
          <span>.</span>
        </Link>
        <div>
          <Link href={profile.github}>GitHub</Link>
          <Link href={profile.linkedin}>LinkedIn</Link>
          <Link href={"mailto:" + profile.email}>{t("ایمیل", "Email")}</Link>
        </div>
      </footer>
    </>
  );
}
