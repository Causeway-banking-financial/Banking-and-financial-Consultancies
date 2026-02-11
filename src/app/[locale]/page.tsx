import { useTranslations } from 'next-intl';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'home.hero' });
  return {
    title: `CauseWay Financial Consulting - ${t('title')}`,
    description: t('subtitle'),
    alternates: {
      languages: { en: '/en', ar: '/ar' },
    },
  };
}

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('home');
  const ts = useTranslations('services');
  const tc = useTranslations('common');

  const services = [
    { key: 'regulatory', icon: '📋' },
    { key: 'strategy', icon: '📊' },
    { key: 'risk', icon: '🛡️' },
    { key: 'digital', icon: '💻' },
    { key: 'governance', icon: '🏛️' },
    { key: 'training', icon: '🎓' },
  ];

  const stats = [
    { value: '15+', label: t('stats.years') },
    { value: '200+', label: t('stats.clients') },
    { value: '12', label: t('stats.countries') },
    { value: '500+', label: t('stats.reports') },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-accent-400 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-400 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="container-page relative py-20 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-lg lg:text-xl text-primary-200 mb-8 max-w-2xl">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href={`/${locale}/services`} className="btn-accent text-base px-8 py-4">
                {t('hero.cta')}
              </Link>
              <Link href={`/${locale}/resources`} className="inline-flex items-center justify-center rounded-lg px-8 py-4 text-base font-semibold text-white ring-1 ring-white/30 hover:bg-white/10 transition-all">
                {t('hero.secondaryCta')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="container-page py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl lg:text-4xl font-bold text-primary-500">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-causeway-cream">
        <div className="container-page py-16 lg:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">{t('services.title')}</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">{t('services.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc) => (
              <div key={svc.key} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-4">{svc.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {ts(`${svc.key}.title`)}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {ts(`${svc.key}.description`)}
                </p>
                <Link href={`/${locale}/services`} className="inline-block mt-4 text-sm font-medium text-primary-500 hover:text-primary-600">
                  {tc('learnMore')} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-500">
        <div className="container-page py-16 lg:py-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{t('cta.title')}</h2>
          <p className="text-primary-200 mb-8 max-w-2xl mx-auto">{t('cta.subtitle')}</p>
          <Link href={`/${locale}/contact`} className="btn-accent text-base px-8 py-4">
            {t('cta.button')}
          </Link>
        </div>
      </section>
    </div>
  );
}
