'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function PublicFooter({ locale }: { locale: string }) {
  const t = useTranslations('footer');
  const tc = useTranslations('common');
  const year = new Date().getFullYear();

  const quickLinks = [
    { label: tc('about'), href: `/${locale}/about` },
    { label: tc('services'), href: `/${locale}/services` },
    { label: tc('resources'), href: `/${locale}/resources` },
    { label: tc('insights'), href: `/${locale}/insights` },
    { label: tc('contact'), href: `/${locale}/contact` },
  ];

  return (
    <footer className="bg-primary-900 text-white">
      <div className="container-page py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <span className="text-accent-400 font-bold text-lg">CW</span>
              </div>
              <span className="text-lg font-bold text-white">CauseWay</span>
            </div>
            <p className="text-primary-300 text-sm leading-relaxed">
              {t('description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-accent-400 uppercase tracking-wider mb-4">
              {t('quickLinks')}
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-accent-400 uppercase tracking-wider mb-4">
              {t('contactInfo')}
            </h3>
            <div className="space-y-2 text-sm text-primary-300">
              <p>info@causewaygrp.com</p>
              <p>+966 11 XXX XXXX</p>
              <p>Riyadh, Saudi Arabia</p>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-accent-400 uppercase tracking-wider mb-4">
              {t('newsletter')}
            </h3>
            <p className="text-sm text-primary-300 mb-3">{t('newsletterDesc')}</p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder={t('emailPlaceholder')}
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-400"
              />
              <button type="submit" className="px-4 py-2 bg-accent-500 hover:bg-accent-600 rounded-lg text-sm font-medium text-white transition-colors">
                {t('subscribe')}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-page py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-primary-400">
            {tc('copyright', { year })}
          </p>
          <div className="flex gap-4 text-xs text-primary-400">
            <Link href="#" className="hover:text-white transition-colors">{tc('privacyPolicy')}</Link>
            <Link href="#" className="hover:text-white transition-colors">{tc('termsOfService')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
