import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://finance.causewaygrp.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    '', '/about', '/services', '/observatory', '/insights', '/contact', '/resources',
  ];

  const entries: MetadataRoute.Sitemap = [];

  // Static pages in both locales
  for (const page of staticPages) {
    entries.push(
      {
        url: `${BASE_URL}/en${page}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: page === '' ? 1.0 : 0.8,
        alternates: {
          languages: {
            en: `${BASE_URL}/en${page}`,
            ar: `${BASE_URL}/ar${page}`,
          },
        },
      },
    );
  }

  // Dynamic pages from API
  try {
    const pagesRes = await fetch(`${BASE_URL}/api/pages?admin=false`, { next: { revalidate: 3600 } });
    if (pagesRes.ok) {
      const pagesData = await pagesRes.json();
      for (const page of pagesData.data || []) {
        entries.push({
          url: `${BASE_URL}/en/${page.slug}`,
          lastModified: new Date(page.updatedAt),
          changeFrequency: 'weekly',
          priority: 0.6,
          alternates: {
            languages: {
              en: `${BASE_URL}/en/${page.slug}`,
              ar: `${BASE_URL}/ar/${page.slug}`,
            },
          },
        });
      }
    }
  } catch {}

  return entries;
}
