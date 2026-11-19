import React, { createContext, useContext } from "react";

export const Media = createContext(null);

export function mediaKey(source) {
  if (typeof source !== "string" || !source.startsWith("/") || source.startsWith("//")) return null;
  try {
    return decodeURIComponent(new URL(source.replaceAll("&amp;", "&"), "https://hosseinjalili.com").pathname);
  } catch {
    return null;
  }
}

export function MediaImage({ src, ...props }) {
  const media = useContext(Media);
  const key = mediaKey(src);
  return (
    <img
      {...props}
      src={media ? media[key] : src}
      data-site-media={media?.[key] ? mediaId(key) : undefined}
    />
  );
}

export function mediaId(key) {
  return encodeURIComponent(key).replaceAll("'", "%27");
}

export function useArticleHtml(html) {
  const media = useContext(Media);
  if (!media) return html;
  return html.replace(/(<img\b[^>]*?)\ssrc="([^"]+)"/gi, (_, tag, source) => {
    const key = mediaKey(source);
    if (!media[key]) return tag;
    return `${tag} src="${media[key]}" data-site-media="${mediaId(key)}"`;
  });
}
