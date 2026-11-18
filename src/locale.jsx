import React, { createContext, useContext } from "react";

export const Language = createContext("fa");
export function useLanguage() {
  const lang = useContext(Language);
  return { lang, t: (fa, en) => (lang === "en" ? en : fa) };
}
export function localPath(path, lang) {
  return lang === "en" ? "/en" + path : path;
}
export function Link({ href, ...props }) {
  const { lang } = useLanguage();
  return (
    <a href={href.startsWith("/") ? localPath(href, lang) : href} {...props} />
  );
}
