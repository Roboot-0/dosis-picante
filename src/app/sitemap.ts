import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.dosispicante.com";
  return [
    { url: base,              lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/salsas`,  lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/historia`,lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/ciencia`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/faq`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/privacidad`, lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
  ];
}