import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { Menu, X, User } from 'lucide-react';

/*
 * CauseWay Header Component
 * ==========================
 * 
 * EXACT Brand Colors from Logo (IMG_3866(8)):
 * - Deep Forest Green Background: #2D3A2D
 * - Teal Bracket: #1E5F5C
 * - Olive Square: #7A8B69
 * - Gold Square: #D4A84B
 * - Small Teal Circle: #1E5F5C
 */

export default function Header() {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const navItems = [
    { key: 'nav.about', href: '/about' },
    { key: 'nav.services', href: '/services' },
    { key: 'nav.observatory', href: '/observatory' },
    { key: 'nav.insights', href: '/insights' },
    { key: 'nav.resources', href: '/resources' },
    { key: 'nav.contact', href: '/contact' },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const isActive = (href: string) => {
    if (href === '/') return location === '/';
    return location.startsWith(href);
  };

  const isHomePage = location === '/';

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled || !isHomePage || isMenuOpen
            ? 'bg-[#2D3A2D] shadow-lg' 
            : 'bg-[#2D3A2D]/90 backdrop-blur-sm'
        }`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo - SVG version for transparency */}
            <Link href="/" className="flex items-center gap-2 z-50">
              <CauseWayLogo />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`text-sm font-medium transition-all duration-200 relative group ${
                    isActive(item.href)
                      ? 'text-[#D4A84B]'
                      : 'text-white/90 hover:text-white'
                  }`}
                  style={{ fontFamily: isRTL ? "'Noto Kufi Arabic', sans-serif" : "'Inter', sans-serif" }}
                >
                  {t(item.key)}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#D4A84B] transition-all duration-300 ${
                    isActive(item.href) ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </Link>
              ))}
            </nav>

            {/* Desktop Right Side */}
            <div className="hidden lg:flex items-center gap-4">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors text-sm px-3 py-1.5 rounded border border-white/20 hover:border-white/40"
              >
                <span className={language === 'en' ? 'font-semibold text-white' : 'opacity-60'}>EN</span>
                <span className="opacity-40">|</span>
                <span 
                  className={language === 'ar' ? 'font-semibold text-white' : 'opacity-60'}
                  style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
                >
                  عربي
                </span>
              </button>

              <Link
                href="/portal"
                className="flex items-center gap-2 bg-[#D4A84B] hover:bg-[#e0b85c] text-[#2D3A2D] px-4 py-2 rounded text-sm font-semibold transition-all"
              >
                <User size={16} />
                <span>{t('nav.clientPortal')}</span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-white p-2 z-50"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Full Screen Overlay */}
      {isMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-[#2D3A2D]"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Menu Content - starts below header */}
          <div className="pt-20 px-6 pb-6 h-full overflow-y-auto">
            <nav className="space-y-1">
              {navItems.map((item, index) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block text-lg font-medium py-4 border-b border-white/10 transition-colors ${
                    isActive(item.href)
                      ? 'text-[#D4A84B]'
                      : 'text-white hover:text-[#D4A84B]'
                  }`}
                  style={{ 
                    fontFamily: isRTL ? "'Noto Kufi Arabic', sans-serif" : "'Inter', sans-serif",
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  {t(item.key)}
                </Link>
              ))}
            </nav>

            {/* Mobile Bottom Actions */}
            <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 text-white hover:text-[#D4A84B] transition-colors text-base w-full py-3"
              >
                <span className={language === 'en' ? 'font-semibold' : 'opacity-60'}>English</span>
                <span className="opacity-40">/</span>
                <span 
                  className={language === 'ar' ? 'font-semibold' : 'opacity-60'}
                  style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
                >
                  العربية
                </span>
              </button>

              <Link
                href="/portal"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center gap-2 bg-[#D4A84B] hover:bg-[#e0b85c] text-[#2D3A2D] px-6 py-4 rounded font-semibold transition-all w-full"
              >
                <User size={18} />
                <span>{t('nav.clientPortal')}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// CauseWay Logo Component - EXACT colors from IMG_3866(8)
function CauseWayLogo() {
  return (
    <div className="flex items-center gap-2">
      {/* Logo Icon - EXACT from mockup */}
      <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Teal C-bracket - #1E5F5C */}
        <path 
          d="M20 15 L20 85 L60 85 L60 75 L30 75 L30 25 L60 25 L60 15 Z" 
          fill="#1E5F5C"
        />
        {/* Olive square - #7A8B69 */}
        <rect x="45" y="35" width="22" height="22" rx="3" fill="#7A8B69"/>
        {/* Gold square - #D4A84B */}
        <rect x="70" y="35" width="18" height="18" rx="3" fill="#D4A84B"/>
        {/* Small teal circle - #1E5F5C */}
        <circle cx="76" cy="21" r="8" fill="#1E5F5C"/>
      </svg>
      
      {/* Text */}
      <div className="flex flex-col leading-none">
        <span className="text-white text-sm font-semibold tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>
          CauseWay
        </span>
        <span className="text-[#7A8B69] text-xs" style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
          كوزواي
        </span>
      </div>
    </div>
  );
}
