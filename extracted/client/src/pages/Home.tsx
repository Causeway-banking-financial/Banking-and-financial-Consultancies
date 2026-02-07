import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { 
  ArrowRight, ArrowLeft, Building2, Shield, TrendingUp, Users, 
  Globe, Award, ChevronRight, ExternalLink, Landmark, FileText,
  BarChart3, Briefcase, Scale, Palette
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

/*
 * CauseWay Premium Home Page
 * ==========================
 * 
 * Design Philosophy: World-class financial consultancy
 * Inspired by: McKinsey, Deloitte, top Islamic finance institutions
 * 
 * EXACT Brand Colors from Logo (IMG_3866(8)):
 * - Forest Background: #2D3A2D
 * - Teal Bracket: #1E5F5C
 * - Olive Square: #7A8B69
 * - Gold Accent: #D4A84B
 * - Cream: #F5F5F0
 */

export default function Home() {
  const { language, t, isRTL } = useLanguage();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const services = [
    {
      icon: Scale,
      titleEn: 'Islamic Finance Engineering',
      titleAr: 'هندسة التمويل الإسلامي',
      descEn: 'Sharia-compliant product design and validation with regulatory alignment',
      descAr: 'تصميم المنتجات المتوافقة مع الشريعة والتحقق منها مع المواءمة التنظيمية',
      href: '/services/islamic-finance'
    },
    {
      icon: Building2,
      titleEn: 'Institutional Transformation',
      titleAr: 'التحول المؤسسي',
      descEn: 'MFI to commercial bank transitions with full licensing support',
      descAr: 'التحول من التمويل الأصغر إلى البنوك التجارية مع دعم الترخيص الكامل',
      href: '/services/transformation'
    },
    {
      icon: Palette,
      titleEn: 'Branding & Identity',
      titleAr: 'الهوية والعلامة التجارية',
      descEn: 'Complete visual identity for banks and corporates',
      descAr: 'هوية بصرية متكاملة للبنوك والشركات',
      href: '/services/branding'
    },
    {
      icon: FileText,
      titleEn: 'Policies & Governance',
      titleAr: 'السياسات والحوكمة',
      descEn: 'Internal policies, SOPs, and compliance frameworks',
      descAr: 'السياسات الداخلية وإجراءات التشغيل وأطر الامتثال',
      href: '/services/policies'
    },
    {
      icon: TrendingUp,
      titleEn: 'Financial Product Development',
      titleAr: 'تطوير المنتجات المالية',
      descEn: 'Innovative financial products tailored to market needs',
      descAr: 'منتجات مالية مبتكرة مصممة لاحتياجات السوق',
      href: '/services/products'
    },
    {
      icon: Briefcase,
      titleEn: 'Wealth & Investment Advisory',
      titleAr: 'استشارات الثروة والاستثمار',
      descEn: 'Strategic wealth management and investment guidance',
      descAr: 'إدارة الثروات الاستراتيجية والتوجيه الاستثماري',
      href: '/services/wealth'
    }
  ];

  const stats = [
    { valueEn: '50+', valueAr: '+٥٠', labelEn: 'Projects Delivered', labelAr: 'مشروع منجز' },
    { valueEn: '20+', valueAr: '+٢٠', labelEn: 'Institutional Clients', labelAr: 'عميل مؤسسي' },
    { valueEn: '5', valueAr: '٥', labelEn: 'Countries', labelAr: 'دول' },
    { valueEn: '100%', valueAr: '١٠٠٪', labelEn: 'Sharia Compliance', labelAr: 'توافق شرعي' }
  ];

  const partners = [
    { name: 'World Bank', logo: '/images/partners/worldbank.png' },
    { name: 'IMF', logo: '/images/partners/imf.png' },
    { name: 'IFC', logo: '/images/partners/ifc.png' },
    { name: 'UNDP', logo: '/images/partners/undp.png' }
  ];

  return (
    <div className="min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src="/images/aden-hero.jpeg" 
            alt="Aden Cityscape" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2D3A2D]/95 via-[#2D3A2D]/85 to-[#2D3A2D]/70" />
          {/* Geometric Pattern Overlay */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4A84B' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10 pt-32 pb-20">
          <div className="max-w-4xl">
            {/* Arabic Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-[#D4A84B] text-lg md:text-xl mb-6"
              style={{ fontFamily: "'Noto Kufi Arabic', sans-serif" }}
            >
              حيث يصبح التمويل بنية تحتية
            </motion.p>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight"
              style={{ fontFamily: isRTL ? "'Noto Kufi Arabic', sans-serif" : "'Playfair Display', serif" }}
            >
              {language === 'ar' 
                ? 'نبني أنظمة مالية قائمة على الشريعة وآمنة للحوكمة'
                : 'Building Sharia-Grounded, Governance-Safe Financial Systems'
              }
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl leading-relaxed"
            >
              {language === 'ar'
                ? 'مجموعة استشارية مستقلة تقدم حلول هندسة المنتجات المالية والتحول المؤسسي للبنوك والمؤسسات وشركاء التنمية.'
                : 'An independent advisory group delivering financial product engineering and institutional transformation for banks, institutions, and development partners.'
              }
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                href="/services"
                className="inline-flex items-center gap-2 bg-[#D4A84B] hover:bg-[#e0b85c] text-[#2D3A2D] px-8 py-4 rounded-md text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                {language === 'ar' ? 'خدماتنا' : 'Our Services'}
                <Arrow size={18} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-white text-white px-8 py-4 rounded-md text-base font-medium transition-all duration-300 hover:bg-white/10"
              >
                {language === 'ar' ? 'تواصل معنا' : 'Get in Touch'}
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-3 bg-[#D4A84B] rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="bg-[#1E5F5C] py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#D4A84B] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {language === 'ar' ? stat.valueAr : stat.valueEn}
                </div>
                <div className="text-white/80 text-sm md:text-base">
                  {language === 'ar' ? stat.labelAr : stat.labelEn}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 lg:py-32 bg-[#F5F5F0]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-[#7A8B69] text-sm font-semibold uppercase tracking-wider mb-4 block">
                {language === 'ar' ? 'من نحن' : 'About Us'}
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#2D3A2D] mb-6" style={{ fontFamily: isRTL ? "'Noto Kufi Arabic', sans-serif" : "'Playfair Display', serif" }}>
                {language === 'ar' 
                  ? 'لماذا نحن موجودون'
                  : 'Why We Exist'
                }
              </h2>
              <p className="text-lg text-[#4C583E] mb-6 leading-relaxed">
                {language === 'ar'
                  ? 'في الأسواق الهشة وعالية المخاطر، السرعة بدون حوكمة تخلق مخاطر، والامتثال بدون قابلية التشغيل يشكل عبئاً. كوزواي تسد هذه الفجوة من خلال تصميم المنتجات والضوابط معاً، وتوفير الأدلة التي تمكن من التوسع الآمن.'
                  : 'In fragile, high-risk markets, speed without governance creates risk and compliance without operability is a drag. CauseWay bridges this gap by designing products and controls together, providing evidence that enables safe scale.'
                }
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-[#1E4D47] font-semibold hover:text-[#D4A84B] transition-colors group"
              >
                {language === 'ar' ? 'اعرف المزيد' : 'Learn More'}
                <Arrow size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="/images/yemen-1.jpeg" 
                  alt="Yemen Architecture" 
                  className="w-full h-[400px] lg:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2C3424]/60 to-transparent" />
              </div>
              {/* Floating Card */}
              <div className="absolute -bottom-6 -left-6 lg:-left-12 bg-white rounded-xl shadow-xl p-6 max-w-xs">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-[#D4A84B]/20 rounded-full flex items-center justify-center">
                    <Award className="text-[#D4A84B]" size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#2D3A2D]">100%</div>
                    <div className="text-sm text-[#7A8B69]">{language === 'ar' ? 'توافق شرعي' : 'Sharia Compliant'}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#7A8B69] text-sm font-semibold uppercase tracking-wider mb-4 block">
              {language === 'ar' ? 'خدماتنا' : 'Our Services'}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#2D3A2D] mb-6" style={{ fontFamily: isRTL ? "'Noto Kufi Arabic', sans-serif" : "'Playfair Display', serif" }}>
              {language === 'ar' 
                ? 'حلول شاملة للمؤسسات المالية'
                : 'Comprehensive Solutions for Financial Institutions'
              }
            </h2>
            <p className="text-lg text-[#4C583E] max-w-3xl mx-auto">
              {language === 'ar'
                ? 'نقدم مجموعة متكاملة من الخدمات تغطي جميع جوانب التحول المؤسسي والتطوير المالي'
                : 'We offer a comprehensive suite of services covering all aspects of institutional transformation and financial development'
              }
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={service.href}
                  className="block bg-[#F5F5F0] rounded-xl p-8 h-full transition-all duration-300 hover:bg-[#1E5F5C] group hover:shadow-xl hover:-translate-y-2"
                >
                  <div className="w-14 h-14 bg-[#1E5F5C] group-hover:bg-[#D4A84B] rounded-xl flex items-center justify-center mb-6 transition-colors">
                    <service.icon className="text-white group-hover:text-[#2D3A2D]" size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-[#2D3A2D] group-hover:text-white mb-3 transition-colors" style={{ fontFamily: isRTL ? "'Noto Kufi Arabic', sans-serif" : "'Playfair Display', serif" }}>
                    {language === 'ar' ? service.titleAr : service.titleEn}
                  </h3>
                  <p className="text-[#4C583E] group-hover:text-white/80 transition-colors">
                    {language === 'ar' ? service.descAr : service.descEn}
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-[#1E4D47] group-hover:text-[#D4A84B] font-medium transition-colors">
                    {language === 'ar' ? 'المزيد' : 'Learn More'}
                    <Arrow size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* YETO Observatory Section */}
      <section className="py-20 lg:py-32 bg-[#2D3A2D] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23D4A84B' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }} />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-[#D4A84B] text-sm font-semibold uppercase tracking-wider mb-4 block">
                {language === 'ar' ? 'المرصد الاقتصادي' : 'Economic Observatory'}
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6" style={{ fontFamily: isRTL ? "'Noto Kufi Arabic', sans-serif" : "'Playfair Display', serif" }}>
                {language === 'ar' 
                  ? 'المرصد اليمني للشفافية الاقتصادية'
                  : 'Yemen Economic Transparency Observatory'
                }
              </h2>
              <p className="text-lg text-white/80 mb-8 leading-relaxed">
                {language === 'ar'
                  ? 'منصة بيانات اقتصادية شاملة توفر مؤشرات موثوقة وتحليلات معمقة للاقتصاد اليمني، مع لوحات تحكم تفاعلية ومساعد ذكاء اصطناعي للإجابة على استفساراتك.'
                  : 'A comprehensive economic data platform providing reliable indicators and in-depth analysis of the Yemeni economy, with interactive dashboards and an AI assistant to answer your queries.'
                }
              </p>

              {/* Key Features */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { en: '2,000+ Data Points', ar: '+٢٠٠٠ نقطة بيانات' },
                  { en: 'Real-time Updates', ar: 'تحديثات فورية' },
                  { en: 'AI-Powered Insights', ar: 'رؤى مدعومة بالذكاء الاصطناعي' },
                  { en: 'Bilingual Interface', ar: 'واجهة ثنائية اللغة' }
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-white/90">
                    <div className="w-2 h-2 bg-[#D4A84B] rounded-full" />
                    <span className="text-sm">{language === 'ar' ? feature.ar : feature.en}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/observatory"
                  className="inline-flex items-center gap-2 bg-[#D4A84B] hover:bg-[#e0b85c] text-[#2D3A2D] px-6 py-3 rounded-md font-semibold transition-all duration-300"
                >
                  {language === 'ar' ? 'استكشف المنصة' : 'Explore Platform'}
                  <Arrow size={18} />
                </Link>
                <a
                  href="https://yeto.causewaygrp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-white/30 hover:border-white text-white px-6 py-3 rounded-md font-medium transition-all duration-300"
                >
                  {language === 'ar' ? 'زيارة YETO' : 'Visit YETO'}
                  <ExternalLink size={16} />
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <img 
                  src="/images/yeto/bilingual-dashboard.png" 
                  alt="YETO Dashboard" 
                  className="w-full"
                />
              </div>
              {/* Floating Stats */}
              <div className="absolute -bottom-4 -right-4 lg:-right-8 bg-[#1E5F5C] rounded-xl shadow-xl p-4 border border-[#D4A84B]/30">
                <div className="flex items-center gap-3">
                  <BarChart3 className="text-[#D4A84B]" size={24} />
                  <div>
                    <div className="text-white font-bold">50+</div>
                    <div className="text-white/60 text-xs">{language === 'ar' ? 'مصدر بيانات' : 'Data Sources'}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-[#1E5F5C] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="/images/yemen-2.jpeg" 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6" style={{ fontFamily: isRTL ? "'Noto Kufi Arabic', sans-serif" : "'Playfair Display', serif" }}>
              {language === 'ar' 
                ? 'هل أنت مستعد لبناء مؤسسة مالية أقوى؟'
                : 'Ready to Build a Stronger Financial Institution?'
              }
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              {language === 'ar'
                ? 'تواصل معنا اليوم لمناقشة كيف يمكننا مساعدتك في تحقيق أهدافك المؤسسية.'
                : 'Contact us today to discuss how we can help you achieve your institutional goals.'
              }
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-[#D4A84B] hover:bg-[#e0b85c] text-[#2D3A2D] px-8 py-4 rounded-md text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
                <Arrow size={20} />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-white text-white px-8 py-4 rounded-md text-lg font-medium transition-all duration-300"
              >
                {language === 'ar' ? 'استكشف خدماتنا' : 'Explore Services'}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
