import { useTranslations } from 'next-intl';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'about' });
  return {
    title: `${t('title')} - CauseWay Financial Consulting`,
    description: t('subtitle'),
  };
}

export default function AboutPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('about');

  const values = [
    { key: 'integrity', icon: '🤝' },
    { key: 'excellence', icon: '⭐' },
    { key: 'innovation', icon: '💡' },
    { key: 'partnership', icon: '🤲' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-800 to-primary-700 text-white">
        <div className="container-page py-16 lg:py-24">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">{t('title')}</h1>
          <p className="text-lg text-primary-200 max-w-2xl">{t('subtitle')}</p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-white">
        <div className="container-page py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-primary-500 mb-4">{t('mission.title')}</h2>
              <p className="text-gray-600 leading-relaxed">{t('mission.text')}</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-accent-500 mb-4">{t('vision.title')}</h2>
              <p className="text-gray-600 leading-relaxed">{t('vision.text')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-causeway-cream">
        <div className="container-page py-16 lg:py-24">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">{t('values.title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.key} className="card p-6 text-center">
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t(`values.${v.key}`)}</h3>
                <p className="text-sm text-gray-500">{t(`values.${v.key}Desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
