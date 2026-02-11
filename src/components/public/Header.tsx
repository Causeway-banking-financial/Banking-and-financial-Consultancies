'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Bars3Icon, XMarkIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

const navItems = [
  { key: 'home', href: '' },
  { key: 'about', href: '/about' },
  { key: 'services', href: '/services' },
  { key: 'observatory', href: '/observatory' },
  { key: 'insights', href: '/insights' },
  { key: 'resources', href: '/resources' },
  { key: 'contact', href: '/contact' },
];

export default function PublicHeader({ locale }: { locale: string }) {
  const t = useTranslations('common');
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isRtl = locale === 'ar';
  const altLocale = locale === 'ar' ? 'en' : 'ar';
  const altLabel = locale === 'ar' ? 'English' : 'العربية';

  function getAltLocalePath() {
    const parts = pathname.split('/');
    if (locales.includes(parts[1] as any)) {
      parts[1] = altLocale;
    } else {
      parts.splice(1, 0, altLocale);
    }
    return parts.join('/') || '/';
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="container-page">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">CW</span>
            </div>
            <div>
              <span className="text-lg font-bold text-primary-500">CauseWay</span>
              <span className="hidden sm:block text-xs text-gray-400">Financial Consulting</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const href = `/${locale}${item.href}`;
              const isActive = pathname === href || (item.href && pathname.startsWith(href));
              return (
                <Link
                  key={item.key}
                  href={href}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-primary-500 hover:bg-gray-50'
                  }`}
                >
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href={getAltLocalePath()}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-500 transition-colors"
            >
              <GlobeAltIcon className="w-4 h-4" />
              {altLabel}
            </Link>

            {/* Mobile toggle */}
            <button
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="lg:hidden border-t border-gray-100 py-4 space-y-1">
            {navItems.map((item) => {
              const href = `/${locale}${item.href}`;
              const isActive = pathname === href;
              return (
                <Link
                  key={item.key}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-2.5 text-sm font-medium rounded-lg ${
                    isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}

const locales = ['en', 'ar'];
