import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Clock } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { GeometricPattern } from '@/components/GeometricPattern';

/*
 * CauseWay Insights Page
 * Design: Matching mockup with quote section, category filters, and featured article layout
 * 
 * Brand Colors:
 * - Moss Green: #2C3424
 * - Cypress: #4C583E
 * - Olive: #768064
 * - Cedar: #959581
 * - Aloe: #DADED8
 * - Old Gold: #C9A227
 */

export default function Insights() {
  const { t, isRTL, language } = useLanguage();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const articles = [
    {
      id: 'governance-fragile-markets',
      title: language === 'ar' ? 'الحوكمة في الأسواق الهشة: بناء أنظمة جاهزة للتدقيق' : 'Governance in Fragile Markets: Building Audit-Ready Systems',
      excerpt: language === 'ar' 
        ? 'نظرة عميقة في أطر الامتثال للبيئات عالية المخاطر وكيفية بناء أنظمة مرنة.'
        : 'A deep dive into compliance frameworks for high-risk environments and how to build resilient systems.',
      category: language === 'ar' ? 'الحوكمة' : 'Governance',
      readTime: '8 min',
      featured: true,
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    },
    {
      id: 'islamic-finance-engineering',
      title: language === 'ar' ? 'هندسة منتجات التمويل الإسلامي: من المفهوم إلى التنفيذ' : 'Islamic Finance Product Engineering: From Concept to Execution',
      excerpt: language === 'ar'
        ? 'هيكلة حلول مالية مبتكرة ومتوافقة مع الشريعة الإسلامية.'
        : 'Structuring innovative, compliant financial solutions.',
      category: language === 'ar' ? 'التمويل الإسلامي' : 'Islamic Finance',
      readTime: '6 min',
      featured: false,
      image: null,
    },
    {
      id: 'aml-cft-frameworks',
      title: language === 'ar' ? 'مكافحة غسل الأموال وتمويل الإرهاب في التمويل التنموي: أطر عملية' : 'AML/CFT in Development Finance: Practical Frameworks',
      excerpt: language === 'ar'
        ? 'تنفيذ استراتيجيات قوية لمكافحة غسل الأموال في سياقات التنمية.'
        : 'Implementing robust anti-money laundering strategies.',
      category: language === 'ar' ? 'الامتثال' : 'Compliance',
      readTime: '7 min',
      featured: false,
      image: null,
    },
    {
      id: 'treasury-governance',
      title: language === 'ar' ? 'حوكمة الخزينة للبنوك في الأسواق الناشئة' : 'Treasury Governance for Emerging Market Banks',
      excerpt: language === 'ar'
        ? 'تحسين السيولة وإدارة المخاطر في البيئات المصرفية الصعبة.'
        : 'Optimizing liquidity and risk management.',
      category: language === 'ar' ? 'إدارة المخاطر' : 'Risk Management',
      readTime: '5 min',
      featured: false,
      image: null,
    },
  ];

  const categories = [
    { key: 'all', label: language === 'ar' ? 'الكل' : 'All' },
    { key: 'governance', label: language === 'ar' ? 'الحوكمة' : 'Governance' },
    { key: 'islamic-finance', label: language === 'ar' ? 'التمويل الإسلامي' : 'Islamic Finance' },
    { key: 'compliance', label: language === 'ar' ? 'الامتثال' : 'Compliance' },
    { key: 'risk', label: language === 'ar' ? 'إدارة المخاطر' : 'Risk Management' },
  ];

  const featuredArticle = articles.find(a => a.featured);
  const sideArticles = articles.filter(a => !a.featured);

  return (
    <div className="min-h-screen bg-[#F5F5F0]" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      
      {/* Hero Section - Matching mockup with olive green background */}
      <section className="relative pt-24 md:pt-32 pb-12 md:pb-16 bg-[#4C583E] overflow-hidden">
        {/* Decorative geometric elements in top right */}
        <div className="absolute top-20 right-8 hidden lg:block">
          <div className="flex flex-col items-end gap-2">
            <div className="w-12 h-12 border-2 border-[#768064] rounded-sm" />
            <div className="w-8 h-8 border-2 border-[#C9A227] rotate-45 -mt-2 mr-2" />
            <div className="flex gap-1 mt-1">
              <div className="w-3 h-3 bg-[#768064]" />
              <div className="w-3 h-3 bg-[#C9A227]" />
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div 
            className="max-w-3xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 
              className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4" 
              style={{ fontFamily: isRTL ? 'Tajawal, sans-serif' : 'Playfair Display, serif' }}
            >
              {t('insights.title')}
            </h1>
            <p className="text-base md:text-lg text-[#DADED8]">
              {t('insights.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quote Section - Matching mockup exactly */}
      <section className="py-12 bg-[#F5F5F0]">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div 
            className="bg-white rounded-lg p-6 md:p-8 lg:p-12 shadow-sm max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <blockquote 
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-[#2C3424] italic text-center leading-relaxed" 
              style={{ fontFamily: isRTL ? 'Tajawal, sans-serif' : 'Playfair Display, serif' }}
            >
              "{t('insights.quote')}"
            </blockquote>
            <p className="text-[#959581] text-center mt-6 text-sm">
              — {t('insights.quoteAuthor')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filters - Matching mockup with pill buttons */}
      <section className="py-6 bg-[#F5F5F0]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((cat, index) => (
              <button
                key={cat.key}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                  index === 0 
                    ? 'bg-[#2C3424] text-white border-[#2C3424]' 
                    : 'bg-white text-[#4C583E] border-[#959581] hover:border-[#C9A227] hover:text-[#C9A227]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Article with Side Articles - Matching mockup layout */}
      <section className="py-12 bg-[#F5F5F0]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Featured Article - Large card on left */}
            {featuredArticle && (
              <motion.div
                className="lg:col-span-2"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Link href={`/insights/${featuredArticle.id}`}>
                  <div className="relative h-[350px] md:h-[450px] lg:h-[500px] rounded-lg overflow-hidden group">
                    <img 
                      src={featuredArticle.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80'} 
                      alt={featuredArticle.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2C3424] via-[#2C3424]/40 to-transparent" />
                    
                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <h2 
                        className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-[#C9A227] transition-colors" 
                        style={{ fontFamily: isRTL ? 'Tajawal, sans-serif' : 'Playfair Display, serif' }}
                      >
                        {featuredArticle.title}
                      </h2>
                      <p className="text-[#DADED8] mb-4 leading-relaxed max-w-2xl">
                        {featuredArticle.excerpt}
                      </p>
                      <span className="inline-flex items-center gap-2 text-[#C9A227] font-semibold group-hover:gap-3 transition-all">
                        {t('insights.readAnalysis')}
                        <Arrow size={18} />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Side Articles - Stacked on right */}
            <div className="flex flex-col gap-6">
              {sideArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={`/insights/${article.id}`}>
                    <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group border-l-4 border-transparent hover:border-[#C9A227]">
                      <h3 
                        className="text-lg font-bold text-[#2C3424] mb-2 group-hover:text-[#C9A227] transition-colors" 
                        style={{ fontFamily: isRTL ? 'Tajawal, sans-serif' : 'Playfair Display, serif' }}
                      >
                        {article.title}
                      </h3>
                      <p className="text-[#768064] text-sm mb-3 line-clamp-2">
                        {article.excerpt}
                      </p>
                      <span className="inline-flex items-center gap-2 text-[#C9A227] text-sm font-medium group-hover:gap-3 transition-all">
                        {language === 'ar' ? 'اقرأ المزيد' : 'Read More'}
                        <Arrow size={14} />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-[#2C3424]">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div 
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 
              className="text-3xl font-bold text-white mb-4" 
              style={{ fontFamily: isRTL ? 'Tajawal, sans-serif' : 'Playfair Display, serif' }}
            >
              {language === 'ar' ? 'ابق على اطلاع' : 'Stay Informed'}
            </h2>
            <p className="text-[#DADED8] mb-8">
              {language === 'ar' 
                ? 'اشترك في نشرتنا الإخبارية للحصول على أحدث الرؤى والتحليلات.'
                : 'Subscribe to our newsletter for the latest insights and analysis.'
              }
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder={language === 'ar' ? 'بريدك الإلكتروني' : 'Your email'}
                className="flex-1 px-4 py-3 rounded-md bg-white/10 border border-[#768064] text-white placeholder-[#959581] focus:outline-none focus:border-[#C9A227]"
              />
              <button 
                type="submit"
                className="px-6 py-3 bg-[#C9A227] hover:bg-[#B8922A] text-[#2C3424] font-semibold rounded-md transition-colors"
              >
                {language === 'ar' ? 'اشترك' : 'Subscribe'}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
