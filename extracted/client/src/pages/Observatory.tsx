import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Mail, Globe, ExternalLink, ChevronLeft, ChevronRight, Database, BarChart3, Brain, FileText, Lightbulb, BookOpen, Users, Building2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

/*
 * CauseWay Observatory Page - YETO Platform Showcase
 * Design: Animated carousel with YETO mockups and team profiles
 * 
 * EXACT Brand Colors from Logo:
 * - Deep Forest Green: #2C3424
 * - Teal/Dark Green: #1E4D47
 * - Olive: #8B9A6D
 * - Gold: #D4A84B
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

export default function Observatory() {
  const { t, isRTL, language } = useLanguage();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // YETO Mockup Images for carousel
  const yetoMockups = [
    {
      src: '/images/yeto/01_homepage_arabic(4).jpeg',
      title: language === 'ar' ? 'الصفحة الرئيسية' : 'Homepage',
      desc: language === 'ar' ? 'واجهة المستخدم الرئيسية بالعربية' : 'Main user interface in Arabic',
    },
    {
      src: '/images/yeto/bilingual_dashboard_comparison(1).png',
      title: language === 'ar' ? 'لوحة المعلومات ثنائية اللغة' : 'Bilingual Dashboard',
      desc: language === 'ar' ? 'مقارنة بين الواجهة العربية والإنجليزية' : 'Arabic and English interface comparison',
    },
    {
      src: '/images/yeto/30_complete_system_overview(5).png',
      title: language === 'ar' ? 'نظرة شاملة على النظام' : 'Complete System Overview',
      desc: language === 'ar' ? 'جميع مكونات المنصة في نظرة واحدة' : 'All platform components at a glance',
    },
    {
      src: '/images/yeto/27_mobile_responsive_dashboard.png',
      title: language === 'ar' ? 'لوحة المعلومات المتجاوبة' : 'Responsive Dashboard',
      desc: language === 'ar' ? 'تصميم متجاوب لجميع الأجهزة' : 'Responsive design for all devices',
    },
    {
      src: '/images/yeto/17_system_overview_arabic(1).png',
      title: language === 'ar' ? 'نظرة عامة على النظام' : 'System Overview',
      desc: language === 'ar' ? 'بنية النظام والمكونات الرئيسية' : 'System architecture and main components',
    },
    {
      src: '/images/yeto/16_data_pipeline_arabic(2).png',
      title: language === 'ar' ? 'خط أنابيب البيانات' : 'Data Pipeline',
      desc: language === 'ar' ? 'تدفق البيانات من المصادر إلى التحليل' : 'Data flow from sources to analysis',
    },
    {
      src: '/images/yeto/15_news_feed_section.png',
      title: language === 'ar' ? 'قسم الأخبار' : 'News Feed Section',
      desc: language === 'ar' ? 'آخر الأخبار والتحديثات الاقتصادية' : 'Latest economic news and updates',
    },
    {
      src: '/images/yeto/22_glossary_interface(5).png',
      title: language === 'ar' ? 'واجهة المصطلحات' : 'Glossary Interface',
      desc: language === 'ar' ? 'قاموس المصطلحات الاقتصادية' : 'Economic terms dictionary',
    },
    {
      src: '/images/yeto/08_mobile_responsive.png',
      title: language === 'ar' ? 'تصميم الجوال' : 'Mobile Design',
      desc: language === 'ar' ? 'تجربة مستخدم محسنة للهواتف' : 'Optimized mobile user experience',
    },
  ];

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % yetoMockups.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, yetoMockups.length]);

  const nextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % yetoMockups.length);
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + yetoMockups.length) % yetoMockups.length);
  };

  // YETO Team Members
  const teamMembers = [
    {
      name: language === 'ar' ? 'زكريا' : 'Zakaria',
      role: language === 'ar' ? 'المنسق العام للمنصة' : 'Platform General Coordinator',
      image: '/images/team/IMG_3922.PNG',
    },
    {
      name: language === 'ar' ? 'صادق' : 'Sadiq',
      role: language === 'ar' ? 'مسؤول جودة المنصة' : 'Platform Quality Manager',
      image: '/images/team/IMG_3924.PNG',
    },
  ];

  // Key Indicators
  const yetoIndicators = [
    {
      label: language === 'ar' ? 'سعر الصرف' : 'Exchange Rate',
      value: '1,620',
      unit: language === 'ar' ? 'ريال/دولار' : 'YER/USD',
    },
    {
      label: language === 'ar' ? 'نمو الناتج المحلي' : 'GDP Growth',
      value: '+2.0%',
      unit: '',
      positive: true,
    },
    {
      label: language === 'ar' ? 'معدل التضخم' : 'Inflation Rate',
      value: '15.0%',
      unit: language === 'ar' ? 'سنوي' : 'Annual',
    },
    {
      label: language === 'ar' ? 'الاحتياطيات الأجنبية' : 'Foreign Reserves',
      value: '$1.2B',
      unit: '',
    },
  ];

  // Platform Features with Icons
  const platformFeatures = [
    {
      icon: Database,
      title: language === 'ar' ? 'مستودع البيانات' : 'Data Repository',
      desc: language === 'ar' 
        ? 'أكثر من 2000 نقطة بيانات مع تتبع كامل للمصادر'
        : 'Over 2,000 data points with full source tracking',
    },
    {
      icon: BarChart3,
      title: language === 'ar' ? 'لوحات تفاعلية' : 'Interactive Dashboards',
      desc: language === 'ar' 
        ? 'استكشف البيانات من خلال لوحات معلومات قابلة للتخصيص'
        : 'Explore data through customizable dashboards',
    },
    {
      icon: Brain,
      title: language === 'ar' ? 'المساعد الذكي' : 'AI Assistant',
      desc: language === 'ar' 
        ? 'اطرح أسئلة بلغة طبيعية واحصل على إجابات مدعومة بالأدلة'
        : 'Ask questions in natural language and get evidence-backed answers',
    },
    {
      icon: FileText,
      title: language === 'ar' ? 'منشئ التقارير' : 'Report Builder',
      desc: language === 'ar' 
        ? 'إنشاء تقارير احترافية مع المؤشرات والرسوم البيانية'
        : 'Create professional reports with indicators and charts',
    },
    {
      icon: Lightbulb,
      title: language === 'ar' ? 'محاكي السيناريوهات' : 'Scenario Simulator',
      desc: language === 'ar' 
        ? 'نمذجة تأثيرات السياسات والتنبؤ بالنتائج الاقتصادية'
        : 'Model policy impacts and forecast economic outcomes',
    },
    {
      icon: BookOpen,
      title: language === 'ar' ? 'مكتبة الأبحاث' : 'Research Library',
      desc: language === 'ar' 
        ? 'تصفح التقارير والمنشورات من أكثر من 50 مصدر'
        : 'Browse reports and publications from 50+ sources',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F0]" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      
      {/* Hero Banner with Yemen Map */}
      <section className="pt-20 lg:pt-24 relative">
        <div className="relative h-[50vh] lg:h-[60vh] overflow-hidden">
          <img 
            src="/images/yemen-map-banner.png" 
            alt="Yemen Economic Data Map"
            className="w-full h-full object-cover"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2C3424] via-[#2C3424]/60 to-transparent" />
          
          {/* Banner Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12">
            <div className="container mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-3xl"
              >
                <div className="inline-flex items-center gap-2 bg-[#D4A84B] text-[#1E4D47] px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  <Globe size={16} />
                  {language === 'ar' ? 'المرصد اليمني للشفافية الاقتصادية' : 'Yemen Economic Transparency Observatory'}
                </div>
                <h1 
                  className="text-2xl lg:text-5xl font-bold text-white mb-3 leading-tight"
                  style={{ fontFamily: isRTL ? "'Noto Kufi Arabic', sans-serif" : 'Playfair Display, serif' }}
                >
                  {language === 'ar' 
                    ? 'لعقد من الزمن، اتُخذت القرارات في الظلام.'
                    : 'For a decade, decisions have been made in the dark.'
                  }
                </h1>
                <p className="text-lg lg:text-2xl text-[#D4A84B] font-medium">
                  {language === 'ar' 
                    ? 'شيء ما على وشك التغيير.'
                    : 'Something is about to change.'
                  }
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Mockup Carousel Section */}
      <section className="py-12 lg:py-20 bg-[#2C3424]">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10"
          >
            <h2 
              className="text-2xl lg:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: isRTL ? "'Noto Kufi Arabic', sans-serif" : 'Playfair Display, serif' }}
            >
              {language === 'ar' ? 'استكشف المنصة' : 'Explore the Platform'}
            </h2>
            <p className="text-[#DADED8] max-w-2xl mx-auto">
              {language === 'ar' 
                ? 'تصفح واجهات وميزات المرصد اليمني للشفافية الاقتصادية'
                : 'Browse the interfaces and features of YETO'
              }
            </p>
          </motion.div>

          {/* Carousel */}
          <div className="relative max-w-5xl mx-auto">
            {/* Main Carousel Container */}
            <div className="relative overflow-hidden rounded-2xl shadow-2xl border-4 border-[#D4A84B]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <img 
                    src={yetoMockups[currentSlide].src}
                    alt={yetoMockups[currentSlide].title}
                    className="w-full h-auto"
                  />
                  {/* Caption Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1E4D47] to-transparent p-6">
                    <h3 className="text-xl lg:text-2xl font-bold text-white mb-1">
                      {yetoMockups[currentSlide].title}
                    </h3>
                    <p className="text-[#D4A84B]">{yetoMockups[currentSlide].desc}</p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows */}
              <button 
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-[#D4A84B] hover:bg-[#C9A227] text-[#1E4D47] p-3 rounded-full shadow-lg transition-all z-10"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#D4A84B] hover:bg-[#C9A227] text-[#1E4D47] p-3 rounded-full shadow-lg transition-all z-10"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {yetoMockups.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setCurrentSlide(index);
                  }}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide 
                      ? 'bg-[#D4A84B] w-8' 
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>

            {/* Thumbnail Strip */}
            <div className="hidden lg:flex justify-center gap-3 mt-6 overflow-x-auto pb-2">
              {yetoMockups.map((mockup, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setCurrentSlide(index);
                  }}
                  className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentSlide 
                      ? 'border-[#D4A84B] scale-110' 
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={mockup.src} 
                    alt={mockup.title}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Key Indicators Section */}
      <section className="py-12 lg:py-16 bg-[#F5F5F0]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {yetoIndicators.map((indicator, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white border border-[#DADED8] p-6 rounded-xl shadow-sm text-center"
              >
                <p className="text-[#768064] text-sm mb-2">{indicator.label}</p>
                <p className={`text-2xl lg:text-3xl font-bold ${
                  indicator.positive ? 'text-green-600' : 'text-[#1E4D47]'
                }`}>
                  {indicator.value}
                </p>
                {indicator.unit && (
                  <p className="text-xs text-[#768064] mt-1">{indicator.unit}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-12 lg:py-20 bg-[#1E4D47]">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 
              className="text-2xl lg:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: isRTL ? "'Noto Kufi Arabic', sans-serif" : 'Playfair Display, serif' }}
            >
              {language === 'ar' ? 'أدوات وميزات المنصة' : 'Platform Tools & Features'}
            </h2>
            <p className="text-[#DADED8] max-w-2xl mx-auto">
              {language === 'ar' 
                ? 'استفد من مجموعة شاملة من الأدوات لتحليل البيانات الاقتصادية'
                : 'Leverage a comprehensive suite of tools for economic data analysis'
              }
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-[#2C3424] p-6 rounded-xl hover:bg-[#4C583E] transition-colors group"
                >
                  <div className="w-12 h-12 bg-[#D4A84B] rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon size={24} className="text-[#1E4D47]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-[#DADED8] text-sm">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* YETO Team Section */}
      <section className="py-12 lg:py-20 bg-[#F5F5F0]">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 text-[#D4A84B] mb-4">
              <Users size={20} />
              <span className="text-sm font-semibold uppercase tracking-wider">
                {language === 'ar' ? 'فريق المنصة' : 'Platform Team'}
              </span>
            </div>
            <h2 
              className="text-2xl lg:text-4xl font-bold text-[#1E4D47] mb-4"
              style={{ fontFamily: isRTL ? "'Noto Kufi Arabic', sans-serif" : 'Playfair Display, serif' }}
            >
              {language === 'ar' ? 'فريق المرصد' : 'YETO Team'}
            </h2>
            <p className="text-[#4C583E] max-w-2xl mx-auto">
              {language === 'ar' 
                ? 'فريق متخصص يعمل على تطوير وإدارة المنصة'
                : 'A dedicated team working on platform development and management'
              }
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-8 lg:gap-12">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="text-center group"
              >
                <div className="relative w-40 h-40 lg:w-48 lg:h-48 mx-auto mb-4">
                  <div className="absolute inset-0 bg-[#D4A84B] rounded-full transform rotate-6 group-hover:rotate-12 transition-transform" />
                  <img 
                    src={member.image}
                    alt={member.name}
                    className="relative w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
                  />
                </div>
                <h3 className="text-xl font-bold text-[#1E4D47] mb-1">{member.name}</h3>
                <p className="text-[#8B9A6D] text-sm">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Partnership Section */}
      <section className="py-12 lg:py-20 bg-[#2C3424]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - CTA */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 
                className="text-2xl lg:text-4xl font-bold text-white mb-6"
                style={{ fontFamily: isRTL ? "'Noto Kufi Arabic', sans-serif" : 'Playfair Display, serif' }}
              >
                {language === 'ar' 
                  ? 'انضم إلينا في بناء الشفافية الاقتصادية'
                  : 'Join Us in Building Economic Transparency'
                }
              </h2>
              <p className="text-[#DADED8] mb-8 text-lg">
                {language === 'ar' 
                  ? 'نرحب بالشراكات مع المنظمات الدولية والمؤسسات البحثية والجهات الحكومية لتعزيز الشفافية الاقتصادية في اليمن.'
                  : 'We welcome partnerships with international organizations, research institutions, and government entities to enhance economic transparency in Yemen.'
                }
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="https://yeto.causewaygrp.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#D4A84B] hover:bg-[#C9A227] text-[#1E4D47] px-8 py-4 rounded-md font-semibold transition-colors"
                >
                  {language === 'ar' ? 'استكشف المنصة' : 'Explore Platform'}
                  <ExternalLink size={18} />
                </a>
                <a 
                  href="mailto:partnerships@causewaygrp.com"
                  className="inline-flex items-center justify-center gap-2 border-2 border-[#D4A84B] text-[#D4A84B] hover:bg-[#D4A84B] hover:text-[#1E4D47] px-8 py-4 rounded-md font-semibold transition-colors"
                >
                  <Building2 size={18} />
                  {language === 'ar' ? 'شراكات' : 'Partnerships'}
                </a>
              </div>
            </motion.div>

            {/* Right - Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-[#4C583E] rounded-2xl p-8"
            >
              <h3 className="text-xl font-bold text-white mb-6">
                {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
              </h3>
              
              <div className="space-y-4">
                <a 
                  href="mailto:partnerships@causewaygrp.com"
                  className="flex items-center gap-4 text-white hover:text-[#D4A84B] transition-colors"
                >
                  <div className="w-10 h-10 bg-[#D4A84B] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail size={18} className="text-[#1E4D47]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#DADED8]">{language === 'ar' ? 'الشراكات' : 'Partnerships'}</p>
                    <p className="font-medium">partnerships@causewaygrp.com</p>
                  </div>
                </a>
                
                <a 
                  href="mailto:info@causewaygrp.com"
                  className="flex items-center gap-4 text-white hover:text-[#D4A84B] transition-colors"
                >
                  <div className="w-10 h-10 bg-[#8B9A6D] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-[#DADED8]">{language === 'ar' ? 'معلومات عامة' : 'General Info'}</p>
                    <p className="font-medium">info@causewaygrp.com</p>
                  </div>
                </a>
                
                <a 
                  href="mailto:yeto@causewaygrp.com"
                  className="flex items-center gap-4 text-white hover:text-[#D4A84B] transition-colors"
                >
                  <div className="w-10 h-10 bg-[#1E4D47] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-[#DADED8]">{language === 'ar' ? 'المرصد' : 'YETO'}</p>
                    <p className="font-medium">yeto@causewaygrp.com</p>
                  </div>
                </a>
                
                <div className="pt-4 border-t border-white/20">
                  <a 
                    href="https://yeto.causewaygrp.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 text-white hover:text-[#D4A84B] transition-colors"
                  >
                    <div className="w-10 h-10 bg-[#D4A84B] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Globe size={18} className="text-[#1E4D47]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#DADED8]">{language === 'ar' ? 'موقع المرصد' : 'YETO Website'}</p>
                      <p className="font-medium">yeto.causewaygrp.com</p>
                    </div>
                  </a>
                  
                  <a 
                    href="https://finance.causewaygrp.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 text-white hover:text-[#D4A84B] transition-colors mt-4"
                  >
                    <div className="w-10 h-10 bg-[#8B9A6D] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Globe size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-[#DADED8]">{language === 'ar' ? 'الموقع الرئيسي' : 'Main Website'}</p>
                      <p className="font-medium">finance.causewaygrp.com</p>
                    </div>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
