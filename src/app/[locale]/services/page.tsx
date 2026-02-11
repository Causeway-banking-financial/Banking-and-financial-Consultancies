import { useTranslations } from 'next-intl';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'services' });
  return {
    title: `${t('title')} - CauseWay Financial Consulting`,
    description: t('subtitle'),
  };
}

export default function ServicesPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('services');
  const tc = useTranslations('common');

  const services = [
    { key: 'regulatory', icon: '📋', color: 'bg-blue-50 text-blue-600' },
    { key: 'strategy', icon: '📊', color: 'bg-green-50 text-green-600' },
    { key: 'risk', icon: '🛡️', color: 'bg-red-50 text-red-600' },
    { key: 'digital', icon: '💻', color: 'bg-purple-50 text-purple-600' },
    { key: 'governance', icon: '🏛️', color: 'bg-amber-50 text-amber-600' },
    { key: 'training', icon: '🎓', color: 'bg-teal-50 text-teal-600' },
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
        <div className="container-page py-16 lg:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((svc) => (
              <div key={svc.key} className="card p-8 hover:shadow-lg transition-shadow">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${svc.color} text-2xl mb-6`}>
                  {svc.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{t(`${svc.key}.title`)}</h3>
                <p className="text-gray-500 leading-relaxed mb-4">{t(`${svc.key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary-500">
        <div className="container-page py-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            {locale === 'ar' ? 'هل أنت مستعد للبدء؟' : 'Ready to Get Started?'}
          </h2>
          <Link href={`/${locale}/contact`} className="btn-accent text-base px-8 py-4">
            {tc('contact')}
          </Link>
        </div>
      </section>
    </div>
  );
}
