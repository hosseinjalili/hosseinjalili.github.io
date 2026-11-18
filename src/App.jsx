import React, { useEffect, useState } from "react";
import { profile, formatDate, metadata } from "./content";
import about from "../_pages/about.md";

const arrow = <i className="arrow" aria-hidden="true" />;
const nav = [
  ["/", "خانه"],
  ["/resume/", "رزومه"],
  ["/posts/", "بلاگ"],
  ["/about/", "درباره"],
];

function Theme() {
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
      aria-label="حالت تیره"
      aria-pressed={dark}
    >
      <span aria-hidden="true" />
    </button>
  );
}
function Header({ path, posts }) {
  const active =
    posts.some((p) => p.url === path) ||
    ["/categories/", "/tags/"].includes(path)
      ? "/posts/"
      : path;
  return (
    <header className="header wrap">
      <a className="brand" href="/" aria-label={profile.name + "، خانه"}>
        <b dir="ltr">
          hj<span>.</span>
        </b>
      </a>
      <nav aria-label="منوی اصلی">
        {nav.map(([url, label]) => (
          <a
            key={url}
            aria-current={active === url ? "page" : undefined}
            href={url}
          >
            {label}
          </a>
        ))}
      </nav>
      <Theme />
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
  return (
    <div className="cards">
      {items.map((p) => (
        <a className="card" key={p.url} href={p.url}>
          <Art slug={p.slug} />
          <time dateTime={p.date}>{formatDate(p.date)}</time>
          <div className="card-title">
            <h3>{p.title}</h3>
            {arrow}
          </div>
        </a>
      ))}
    </div>
  );
}
function Portrait() {
  return (
    <figure className="poster">
      <div className="poster-grid" />
      <div className="orbit" />
      <div className="photo">
        <img
          src="/media/hossein.webp"
          width="906"
          height="920"
          alt={profile.name + " در طبیعت"}
        />
      </div>
      <figcaption dir="ltr" lang="en">{profile.englishName}</figcaption>
    </figure>
  );
}
function Home({ posts }) {
  return (
    <>
      <section className="hero wrap">
        <div className="hero-copy">
          <p className="eyebrow">
            <b />
            توسعه‌دهندهٔ نرم‌افزار
          </p>
          <h1>
            {profile.givenName}{" "}
            <em>{profile.familyName}</em>
            <span className="name-dot">.</span>
          </h1>
          <p className="intro">
            از طراحی رابط تا توسعهٔ نرم‌افزار، به تجربهٔ آدم‌ها فکر می‌کنم.
            اینجا از کارم و روزمرگی‌هام می‌نویسم.
          </p>
          <div className="actions">
            <a className="button" href="/resume/">
              رزومهٔ من {arrow}
            </a>
            <a className="textlink" href="/posts/">
              بلاگ شخصی {arrow}
            </a>
          </div>
        </div>
        <Portrait />
      </section>
      <section className="journal wrap">
        <div className="section-head">
          <h2>
            روزمرگی‌ها<span>.</span>
          </h2>
          <a className="textlink" href="/posts/">
            همهٔ نوشته‌ها {arrow}
          </a>
        </div>
        <Cards items={posts.slice(0, 3)} />
      </section>
    </>
  );
}
function Archive({ path, posts }) {
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
        بلاگ شخصی
      </p>
      <h1>
        {grouping
          ? grouping === "tags"
            ? "برچسب نوشته‌ها"
            : "دسته‌بندی نوشته‌ها"
          : "روزمرگی‌ها"}
        <em>.</em>
      </h1>
      <div className="archive-tools">
        <input
          aria-label="جست‌وجوی نوشته‌ها"
          placeholder="جست‌وجوی نوشته‌ها…"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <a href="/posts/">همه</a>
        <a href="/categories/">دسته‌بندی</a>
        <a href="/tags/">برچسب</a>
      </div>
      {!items.length && <p role="status">نوشته‌ای با این عبارت پیدا نشد.</p>}
      {grouping ? (
        groups.map((g) => (
          <section key={g} id={g}>
            <h2>{{ life: "زندگی", hope: "امید" }[g] || g}</h2>
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
  return (
    <article className="wrap inner reading">
      <a className="textlink" href="/posts/">
        روزمرگی‌ها {arrow}
      </a>
      <h1>
        {post.title}
        <em>.</em>
      </h1>
      <time dateTime={post.date}>{formatDate(post.date)}</time>
      <Art slug={post.slug} />
      <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />
      <a className="textlink" href="/posts/">
        همهٔ نوشته‌ها {arrow}
      </a>
    </article>
  );
}
function Resume() {
  return (
    <section className="wrap inner">
      <p className="eyebrow">
        <b />
        رزومه
      </p>
      <h1>
        کار و تجربه<em>.</em>
      </h1>
      <p className="lead">{profile.name}</p>
      <p>توسعه‌دهندهٔ نرم‌افزار · تهران</p>
      <div className="actions">
        <a className="button" href={profile.linkedin}>
          پروفایل لینکدین {arrow}
        </a>
        <button className="textlink" onClick={() => window.print()}>
          چاپ یا ذخیرهٔ PDF
        </button>
      </div>
      <dl className="resume-list">
        <dt>تجربهٔ کاری</dt>
        <dd>
          <strong>فیوسافت</strong>
          <a href="https://fusoft-co.com/" className="textlink">
            وب‌سایت شرکت {arrow}
          </a>
        </dd>
        <dt>مهارت‌ها</dt>
        <dd className="skills">
          {[
            "UI/UX",
            "React",
            "Angular",
            "Node.js",
            "NestJS",
            ".NET",
            "Scrum",
          ].map((x) => (
            <span dir="ltr" key={x}>
              {x}
            </span>
          ))}
        </dd>
        <dt>تحصیلات</dt>
        <dd>
          <strong>کارشناسی ارشد</strong>
          <p>دانشگاه آزاد اسلامی، واحد علوم و تحقیقات</p>
          <p>۱۳۹۴ تا ۱۳۹۹</p>
        </dd>
      </dl>
    </section>
  );
}
function Admin() {
  return (
    <section className="wrap inner reading">
      <p className="eyebrow">
        <b />
        مدیریت سایت
      </p>
      <h1>
        نوشته‌های من<em>.</em>
      </h1>
      <p className="lead">نوشتن و انتشار</p>
      <p>
        با حساب گیت‌هاب وارد Pages CMS شو. برای اتصال اول، دسترسی برنامه را برای
        مخزن hosseinjalili.github.io فعال کن.
      </p>
      <p>
        از بخش «نوشته‌ها» مطلب تازه بساز یا یکی از نوشته‌ها را برای ویرایش باز
        کن. با ذخیره، مطلب در گیت‌هاب ثبت می‌شود و انتشار سایت شروع می‌شود.
      </p>
      <div className="actions">
        <a
          className="button"
          href="https://app.pagescms.org/hosseinjalili/hosseinjalili.github.io/master/file/posts"
        >
          ورود به ویرایشگر با GitHub {arrow}
        </a>
      </div>
    </section>
  );
}
function About() {
  return (
    <section className="wrap inner about">
      <div>
        <p className="eyebrow">
          <b />
          دربارهٔ من
        </p>
        <h1>
          {profile.name}<em>.</em>
        </h1>
        <p className="lead">یک برنامه‌نویس، یک گیمر خسته</p>
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: about.html }}
        />
        <a className="textlink" href="/resume/">
          رزومهٔ من {arrow}
        </a>
      </div>
      <Portrait />
    </section>
  );
}
export default function App({ path, posts }) {
  const post = posts.find((p) => p.url === path);
  useEffect(() => {
    const { title, description } = metadata(path, posts);
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', new URL(path, 'https://hosseinjalili.com').href);
  }, [path, posts]);
  let page;
  if (post) page = <Article post={post} />;
  else if (path === "/") page = <Home posts={posts} />;
  else if (path === "/admin/") page = <Admin />;
  else if (path === "/resume/") page = <Resume />;
  else if (path === "/about/") page = <About />;
  else if (["/posts/", "/categories/", "/tags/"].includes(path))
    page = <Archive path={path} posts={posts} />;
  else
    page = (
      <section className="wrap inner">
        <h1>صفحه پیدا نشد</h1>
        <a className="button" href="/">
          بازگشت به خانه {arrow}
        </a>
      </section>
    );
  return (
    <>
      <a href="#main" className="skip">
        رفتن به محتوا
      </a>
      <Header path={path} posts={posts} />
      <main id="main">{page}</main>
      <footer className="wrap">
        <a className="footer-name" href="/">
          {profile.name}<span>.</span>
        </a>
        <div>
          <a href="/admin/">مدیریت نوشته‌ها</a>
          <a href={profile.github}>GitHub</a>
          <a href={profile.linkedin}>LinkedIn</a>
          <a href={"mailto:" + profile.email}>ایمیل</a>
        </div>
      </footer>
    </>
  );
}
