import { useTranslations } from 'next-intl';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'insights' });
  return {
    title: `${t('title')} - CauseWay Financial Consulting`,
    description: t('subtitle'),
  };
}

export default function InsightsPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('insights');

  // These would come from the API in production
  const insights = [
    {
      title: 'The Future of Open Banking in the GCC',
      date: '2024-01-15',
      category: 'Banking Regulations',
      excerpt: 'An analysis of open banking frameworks being developed across Gulf countries and their impact on financial innovation.',
    },
    {
      title: 'ESG Integration in MENA Financial Services',
      date: '2024-01-08',
      category: 'ESG & Sustainability',
      excerpt: 'How financial institutions in the Middle East are incorporating ESG principles into their operations and investment strategies.',
    },
    {
      title: 'Digital Transformation Trends for 2024',
      date: '2024-01-02',
      category: 'Digital Transformation',
      excerpt: 'Key technology trends that will shape the financial services industry in the coming year.',
    },
  ];

  return (
    <div>
      <section className="bg-gradient-to-br from-primary-800 to-primary-700 text-white">
        <div className="container-page py-16 lg:py-24">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">{t('title')}</h1>
          <p className="text-lg text-primary-200 max-w-2xl">{t('subtitle')}</p>
        </div>
      </section>

      <section className="bg-white">
        <div className="container-page py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {insights.map((insight, i) => (
                <article key={i} className="card p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="badge bg-primary-50 text-primary-600">{insight.category}</span>
                    <span className="text-sm text-gray-400">{new Date(insight.date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{insight.title}</h2>
                  <p className="text-gray-500 leading-relaxed">{insight.excerpt}</p>
                  <Link href="#" className="inline-block mt-4 text-sm font-medium text-primary-500 hover:text-primary-600">
                    {locale === 'ar' ? 'اقرأ المزيد' : 'Read More'} →
                  </Link>
                </article>
              ))}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('categories')}</h3>
                <div className="space-y-2">
                  {['Banking Regulations', 'ESG & Sustainability', 'Digital Transformation', 'Risk Management', 'Fintech'].map((cat) => (
                    <button key={cat} className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary-500 rounded-lg transition-colors">
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
