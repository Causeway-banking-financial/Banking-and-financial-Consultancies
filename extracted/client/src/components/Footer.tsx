import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, Phone, Globe, MapPin, Linkedin, Twitter } from 'lucide-react';

/*
 * CauseWay Footer Component
 * =========================
 * 
 * EXACT Brand Colors from Logo (IMG_3866(8)):
 * - Deep Forest Green Background: #2D3A2D
 * - Teal Bracket: #1E5F5C
 * - Olive Square: #7A8B69
 * - Gold Accent: #D4A84B
 * 
 * Contact Emails:
 * - partnerships@causewaygrp.com
 * - info@causewaygrp.com
 * - yeto@causewaygrp.com
 * 
 * Sites:
 * - finance.causewaygrp.com
 * - yeto.causewaygrp.com
 */

export default function Footer() {
  const { t, isRTL, language } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#2D3A2D] text-[#DADED8]" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Gold accent line */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#D4A84B] to-transparent" />
      
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <CauseWayLogo />
            </Link>
            <p className="text-[#959581] text-sm leading-relaxed mb-6">
              {language === 'ar' 
                ? 'مجموعة استشارية مستقلة تبني أنظمة مالية قائمة على الشريعة وآمنة للحوكمة.'
                : 'An independent advisory group building Sharia-grounded, governance-safe financial systems.'
              }
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              <a href="#" className="text-[#959581] hover:text-[#D4A84B] transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-[#959581] hover:text-[#D4A84B] transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[#D4A84B] font-semibold mb-6 text-base" style={{ fontFamily: isRTL ? "'Noto Kufi Arabic', sans-serif" : "'Playfair Display', serif" }}>
              {language === 'ar' ? 'روابط سريعة' : 'Quick Links'}
            </h4>
            <ul className="space-y-3">
              {[
                { key: 'nav.about', href: '/about' },
                { key: 'nav.services', href: '/services' },
                { key: 'nav.observatory', href: '/observatory' },
                { key: 'nav.insights', href: '/insights' },
                { key: 'nav.resources', href: '/resources' },
                { key: 'nav.contact', href: '/contact' },
              ].map((item) => (
                <li key={item.key}>
                  <Link href={item.href} className="text-[#959581] hover:text-[#DADED8] transition-colors text-sm">
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-[#D4A84B] font-semibold mb-6 text-base" style={{ fontFamily: isRTL ? "'Noto Kufi Arabic', sans-serif" : "'Playfair Display', serif" }}>
              {t('services.title')}
            </h4>
            <ul className="space-y-3">
              {[
                { key: 'services.islamicFinance.title', href: '/services#islamic-finance' },
                { key: 'services.productDev.title', href: '/services#product-development' },
                { key: 'services.wealth.title', href: '/services#wealth-advisory' },
                { key: 'services.transformation.title', href: '/services#transformation' },
                { key: 'services.branding.title', href: '/services#branding' },
                { key: 'services.policies.title', href: '/services#policies' },
              ].map((item) => (
                <li key={item.key}>
                  <Link href={item.href} className="text-[#959581] hover:text-[#DADED8] transition-colors text-sm">
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-[#D4A84B] font-semibold mb-6 text-base" style={{ fontFamily: isRTL ? "'Noto Kufi Arabic', sans-serif" : "'Playfair Display', serif" }}>
              {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[#D4A84B] mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-[#DADED8]">{language === 'ar' ? 'عدن، اليمن' : 'Aden, Yemen'}</p>
                  <p className="text-[#959581]">{language === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt'}</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-[#D4A84B] flex-shrink-0" />
                <a href="tel:+9672236655" className="text-[#959581] hover:text-[#DADED8] transition-colors text-sm">
                  +967 2 236655
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-[#D4A84B] flex-shrink-0 mt-0.5" />
                <div className="text-sm space-y-1">
                  <a href="mailto:info@causewaygrp.com" className="text-[#959581] hover:text-[#DADED8] transition-colors block">
                    info@causewaygrp.com
                  </a>
                  <a href="mailto:partnerships@causewaygrp.com" className="text-[#959581] hover:text-[#DADED8] transition-colors block">
                    partnerships@causewaygrp.com
                  </a>
                  <a href="mailto:yeto@causewaygrp.com" className="text-[#959581] hover:text-[#DADED8] transition-colors block">
                    yeto@causewaygrp.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Globe size={18} className="text-[#D4A84B] flex-shrink-0 mt-0.5" />
                <div className="text-sm space-y-1">
                  <a href="https://finance.causewaygrp.com" target="_blank" rel="noopener noreferrer" className="text-[#959581] hover:text-[#DADED8] transition-colors block">
                    finance.causewaygrp.com
                  </a>
                  <a href="https://yeto.causewaygrp.com" target="_blank" rel="noopener noreferrer" className="text-[#959581] hover:text-[#DADED8] transition-colors block">
                    yeto.causewaygrp.com
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 lg:mt-12 pt-8 border-t border-[#4C583E]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#959581] text-sm">
              © {currentYear} CauseWay. {language === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-[#959581] hover:text-[#DADED8] transition-colors text-sm">
                {t('footer.privacy')}
              </Link>
              <Link href="/terms" className="text-[#959581] hover:text-[#DADED8] transition-colors text-sm">
                {t('footer.terms')}
              </Link>
              <Link href="/cookies" className="text-[#959581] hover:text-[#DADED8] transition-colors text-sm">
                {t('footer.cookies')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// CauseWay Logo Component - SVG for transparency
function CauseWayLogo() {
  return (
    <div className="flex items-center gap-3">
      {/* Logo Icon */}
      <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Teal C-bracket */}
        <path 
          d="M20 15 L20 85 L60 85 L60 75 L30 75 L30 25 L60 25 L60 15 Z" 
          fill="#1E5F5C"
        />
        {/* Olive square */}
        <rect x="45" y="35" width="22" height="22" rx="3" fill="#7A8B69"/>
        {/* Gold square */}
        <rect x="70" y="35" width="18" height="18" rx="3" fill="#D4A84B"/>
        {/* Small teal square */}
        <rect x="70" y="15" width="12" height="12" rx="2" fill="#1E5F5C"/>
      </svg>
      
      {/* Text */}
      <div className="flex flex-col leading-none">
        <span className="text-white text-base font-semibold tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>
          CauseWay
        </span>
        <span className="text-[#7A8B69] text-sm" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
          كوزواي
        </span>
      </div>
    </div>
  );
}
