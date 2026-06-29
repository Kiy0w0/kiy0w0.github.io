export const isBlogHost = typeof window !== "undefined" && window.location.host.startsWith("blog.");

export const apexUrl = typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host.replace(/^blog\./, "")}` : "/";

export const writingPath = isBlogHost ? "/" : "/blog";

export const postPath = (slug: string) => (isBlogHost ? `/${slug}` : `/blog/${slug}`);
