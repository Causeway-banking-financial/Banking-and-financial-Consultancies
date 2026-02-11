import { useTranslations } from 'next-intl';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'observatory' });
  return {
    title: `${t('title')} - CauseWay Financial Consulting`,
    description: t('subtitle'),
  };
}

export default function ObservatoryPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('observatory');

  const metrics = [
    { label: 'Banking Sector Growth', value: '8.2%', trend: 'up' },
    { label: 'Regulatory Changes', value: '24', trend: 'up' },
    { label: 'Market Capitalization', value: '$1.2T', trend: 'up' },
    { label: 'Digital Adoption', value: '67%', trend: 'up' },
  ];

  const topics = [
    { title: 'Banking Regulations', count: 45 },
    { title: 'Fintech Innovation', count: 32 },
    { title: 'ESG & Sustainability', count: 28 },
    { title: 'Digital Payments', count: 24 },
    { title: 'Risk & Compliance', count: 19 },
    { title: 'Open Banking', count: 15 },
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
          <p className="text-gray-600 mb-12 max-w-3xl">{t('description')}</p>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {metrics.map((metric, i) => (
              <div key={i} className="card p-6 text-center">
                <p className="text-3xl font-bold text-primary-500">{metric.value}</p>
                <p className="text-sm text-gray-500 mt-1">{metric.label}</p>
                <span className="inline-block mt-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  ↑ Trending
                </span>
              </div>
            ))}
          </div>

          {/* Thematic Hubs */}
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Thematic Hubs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic, i) => (
              <div key={i} className="card p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
                <span className="font-medium text-gray-900">{topic.title}</span>
                <span className="badge bg-primary-50 text-primary-600">{topic.count} resources</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
