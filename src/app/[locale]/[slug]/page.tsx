import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getLocalizedField } from '@/lib/utils';

async function getPage(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/pages/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const page = await getPage(slug);
  if (!page) return {};

  const title = getLocalizedField(page, 'metaTitle', locale) || getLocalizedField(page, 'title', locale);
  const description = getLocalizedField(page, 'metaDesc', locale);

  return {
    title: `${title} - CauseWay Financial Consulting`,
    description,
    alternates: {
      languages: { en: `/en/${slug}`, ar: `/ar/${slug}` },
    },
  };
}

export default async function DynamicPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  const page = await getPage(slug);

  if (!page || page.status !== 'PUBLISHED') {
    notFound();
  }

  const title = getLocalizedField(page, 'title', locale);
  const content = getLocalizedField(page, 'content', locale);
  const blocks = locale === 'ar' ? page.blocksAr : page.blocksEn;

  return (
    <div>
      <section className="bg-gradient-to-br from-primary-800 to-primary-700 text-white">
        <div className="container-page py-16 lg:py-24">
          <h1 className="text-4xl lg:text-5xl font-bold">{title}</h1>
        </div>
      </section>

      <section className="bg-white">
        <div className="container-page py-16">
          {content && (
            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
          )}

          {blocks && Array.isArray(blocks) && blocks.length > 0 && (
            <div className="space-y-12 mt-8">
              {blocks.map((block: any) => (
                <div key={block.id}>
                  {block.data?.title && (
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{block.data.title}</h2>
                  )}
                  {block.data?.content && (
                    <p className="text-gray-600 leading-relaxed">{block.data.content}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
