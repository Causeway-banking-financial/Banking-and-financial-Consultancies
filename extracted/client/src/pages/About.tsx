import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Shield, Eye, Scale, Wrench, MapPin, Phone, Mail, Palette, FileText, Users, Building2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { GeometricPattern, GoldFrame } from '@/components/GeometricPattern';

/*
 * CauseWay About Page
 * Design Philosophy: Neo-Islamic Geometric Minimalism
 * Enhanced with branding, transformation, and policies capabilities
 */

export default function About() {
  const { t, isRTL, language } = useLanguage();

  const values = [
    {
      icon: Shield,
      titleKey: 'about.values.amanah',
      descKey: 'about.values.amanah.desc',
    },
    {
      icon: Eye,
      titleKey: 'about.values.clarity',
      descKey: 'about.values.clarity.desc',
    },
    {
      icon: Scale,
      titleKey: 'about.values.accountability',
      descKey: 'about.values.accountability.desc',
    },
    {
      icon: Wrench,
      titleKey: 'about.values.practicality',
      descKey: 'about.values.practicality.desc',
    },
  ];

  const approach = [
    {
      title: language === 'ar' ? 'تصميم آمن للحوكمة' : 'Governance-Safe Design',
      desc: language === 'ar' 
        ? 'نصمم المنتجات والضوابط معاً، مما يوفر أدلة تمكن من التوسع الآمن.'
        : 'We design products and controls together, providing evidence that enables safe scale.',
    },
    {
      title: language === 'ar' ? 'هندسة منتجات قائمة على الشريعة' : 'Sharia-Grounded Product Engineering',
      desc: language === 'ar'
        ? 'نبني أنظمة مالية متوافقة مع مبادئ الشريعة الإسلامية والمتطلبات التنظيمية.'
        : 'We build financial systems that comply with Islamic Sharia principles and regulatory requirements.',
    },
    {
      title: language === 'ar' ? 'التسليم العملي وبناء القدرات' : 'Practical Delivery & Capacity Building',
      desc: language === 'ar'
        ? 'نقدم حلولاً قابلة للتنفيذ تعمل في ظروف العالم الحقيقي مع بناء قدرات الفريق.'
        : 'We deliver actionable solutions that work in real-world conditions while building team capabilities.',
    },
  ];

  const capabilities = [
    {
      icon: Users,
      title: language === 'ar' ? 'التحول المؤسسي' : 'Institutional Transformation',
      desc: language === 'ar'
        ? 'نرافق المؤسسات المالية في رحلتها من التمويل الأصغر إلى البنوك التجارية المرخصة، مع تقديم الدعم الكامل في الحصول على الترخيص وإعادة هيكلة العمليات.'
        : 'We accompany financial institutions on their journey from microfinance to licensed commercial banks, providing full support in licensing and operational restructuring.',
    },
    {
      icon: Palette,
      title: language === 'ar' ? 'الهوية والعلامة التجارية' : 'Branding & Identity',
      desc: language === 'ar'
        ? 'نصمم هويات بصرية متكاملة للبنوك والشركات تشمل الشعار والمواد التسويقية الداخلية والخارجية واستراتيجية العلامة التجارية والحضور الرقمي.'
        : 'We design complete visual identities for banks and corporates including logo, internal and external marketing materials, brand strategy, and digital presence.',
    },
    {
      icon: FileText,
      title: language === 'ar' ? 'السياسات والإجراءات' : 'Policies & Procedures',
      desc: language === 'ar'
        ? 'نطور جميع السياسات الداخلية وإجراءات التشغيل القياسية وأدلة الحوكمة المؤسسية وأطر الامتثال التنظيمي التي تشكل العمود الفقري للعمليات المؤسسية.'
        : 'We develop all internal policies, standard operating procedures, corporate governance manuals, and regulatory compliance frameworks that form the backbone of institutional operations.',
    },
    {
      icon: Building2,
      title: language === 'ar' ? 'هندسة التمويل الإسلامي' : 'Islamic Finance Engineering',
      desc: language === 'ar'
        ? 'نصمم ونتحقق من المنتجات والهياكل المالية المتوافقة مع الشريعة، ونعمل مع هيئات الشريعة والجهات التنظيمية لضمان الامتثال الكامل.'
        : 'We design and validate Sharia-compliant financial products and structures, working with Sharia boards and regulators to ensure full compliance.',
    },
  ];

  const locations = [
    {
      city: language === 'ar' ? 'عدن، اليمن' : 'Aden, Yemen',
      type: language === 'ar' ? 'المقر الرئيسي' : 'Headquarters',
      status: 'active',
    },
    {
      city: language === 'ar' ? 'القاهرة، مصر' : 'Cairo, Egypt',
      type: language === 'ar' ? 'المكتب الإقليمي' : 'Regional Office',
      status: 'active',
    },
    {
      city: language === 'ar' ? 'جنيف وتالين' : 'Geneva & Tallinn',
      type: language === 'ar' ? 'مخطط 2026' : 'Planned 2026',
      status: 'planned',
    },
  ];

  return (
    <div className="min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-[#2C3424] overflow-hidden">
        <GeometricPattern variant="corner" className="top-20 right-4 lg:right-8 rotate-90" />
        <GeometricPattern variant="corner" className="bottom-10 left-4 lg:left-8 -rotate-90" />
        
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8" style={{ fontFamily: isRTL ? 'Tajawal, sans-serif' : 'Playfair Display, serif' }}>
              {t('about.title')}
            </h1>
            <p className="text-xl text-[#DADED8] leading-relaxed">
              {t('about.description')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why We Exist Section */}
      <section className="py-20 lg:py-32 bg-[#DADED8]">
        <div className="container mx-auto px-4 lg:px-8">
          <GoldFrame className="bg-white p-8 lg:p-16 rounded-lg shadow-lg">
            <motion.div
              className="max-w-4xl mx-auto text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[#2C3424] mb-8" style={{ fontFamily: isRTL ? 'Tajawal, sans-serif' : 'Playfair Display, serif' }}>
                {language === 'ar' ? 'لماذا نحن موجودون' : 'Why We Exist'}
              </h2>
              <p className="text-lg text-[#4C583E] leading-relaxed">
                {language === 'ar' 
                  ? 'في الأسواق الهشة وعالية المخاطر، السرعة بدون حوكمة تخلق مخاطر، والامتثال بدون قابلية التشغيل يشكل عبئاً. كوزواي تسد هذه الفجوة من خلال تصميم المنتجات والضوابط معاً، مما يوفر أدلة تمكن من التوسع الآمن.'
                  : 'In fragile, high-risk markets, speed without governance creates risk and compliance without operability is a drag. CauseWay bridges this gap by designing products and controls together, providing evidence that enables safe scale.'
                }
              </p>
            </motion.div>
          </GoldFrame>
        </div>
      </section>

      {/* Core Capabilities Section */}
      <section className="py-20 lg:py-32 bg-[#4C583E]">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4" style={{ fontFamily: isRTL ? 'Tajawal, sans-serif' : 'Playfair Display, serif' }}>
              {language === 'ar' ? 'قدراتنا الأساسية' : 'Our Core Capabilities'}
            </h2>
            <p className="text-lg text-[#DADED8] max-w-3xl mx-auto">
              {language === 'ar'
                ? 'نقدم مجموعة شاملة من الخدمات التي تغطي جميع جوانب التحول المؤسسي والتطوير المالي'
                : 'We offer a comprehensive suite of services covering all aspects of institutional transformation and financial development'
              }
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {capabilities.map((capability, index) => (
              <motion.div
                key={index}
                className="bg-white/10 backdrop-blur-sm p-8 rounded-lg border border-[#C9A227]/30"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="w-16 h-16 bg-[#C9A227] rounded-lg flex items-center justify-center mb-6">
                  <capability.icon className="text-[#2C3424]" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4" style={{ fontFamily: isRTL ? 'Tajawal, sans-serif' : 'Playfair Display, serif' }}>
                  {capability.title}
                </h3>
                <p className="text-[#DADED8] leading-relaxed">
                  {capability.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 lg:py-32 bg-[#2C3424]">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4" style={{ fontFamily: isRTL ? 'Tajawal, sans-serif' : 'Playfair Display, serif' }}>
              {t('about.values.title')}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.titleKey}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-[#4C583E] rounded-lg flex items-center justify-center border-2 border-[#C9A227]">
                  <value.icon className="text-[#C9A227]" size={36} />
                </div>
                <h3 className="text-xl font-semibold text-[#C9A227] mb-3" style={{ fontFamily: isRTL ? 'Tajawal, sans-serif' : 'Playfair Display, serif' }}>
                  {t(value.titleKey)}
                </h3>
                <p className="text-[#DADED8] leading-relaxed">
                  {t(value.descKey)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Approach Section */}
      <section className="py-20 lg:py-32 bg-[#DADED8]">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#2C3424] mb-4" style={{ fontFamily: isRTL ? 'Tajawal, sans-serif' : 'Playfair Display, serif' }}>
              {language === 'ar' ? 'نهجنا' : 'Our Approach'}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {approach.map((item, index) => (
              <motion.div
                key={index}
                className="bg-white p-8 rounded-lg shadow-sm border-t-4 border-[#C9A227]"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-4xl font-bold text-[#C9A227] mb-4">
                  0{index + 1}
                </div>
                <h3 className="text-xl font-semibold text-[#2C3424] mb-4" style={{ fontFamily: isRTL ? 'Tajawal, sans-serif' : 'Playfair Display, serif' }}>
                  {item.title}
                </h3>
                <p className="text-[#4C583E] leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team Section */}
      <section className="py-20 lg:py-32 bg-[#F5F5F0]">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1E4D47] mb-4" style={{ fontFamily: isRTL ? "'Noto Kufi Arabic', sans-serif" : 'Playfair Display, serif' }}>
              {language === 'ar' ? 'فريق القيادة' : 'Leadership Team'}
            </h2>
            <p className="text-lg text-[#4C583E] max-w-3xl mx-auto">
              {language === 'ar'
                ? 'فريق متخصص من الخبراء في التمويل والحوكمة والتحول المؤسسي'
                : 'A specialized team of experts in finance, governance, and institutional transformation'
              }
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Maher - Founder & CEO */}
            <motion.div
              className="text-center group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative w-48 h-48 mx-auto mb-6">
                <div className="absolute inset-0 bg-[#D4A84B] rounded-full transform rotate-6 group-hover:rotate-12 transition-transform" />
                <img 
                  src="/images/team/IMG_5751.jpeg"
                  alt="Maher"
                  className="relative w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
                />
              </div>
              <h3 className="text-xl font-bold text-[#1E4D47] mb-1" style={{ fontFamily: isRTL ? "'Noto Kufi Arabic', sans-serif" : 'Playfair Display, serif' }}>
                {language === 'ar' ? 'ماهر' : 'Maher'}
              </h3>
              <p className="text-[#8B9A6D] text-sm mb-2">
                {language === 'ar' ? 'المؤسس والرئيس التنفيذي' : 'Founder & CEO'}
              </p>
              <p className="text-[#4C583E] text-xs px-4">
                {language === 'ar' 
                  ? 'خبير في التمويل الإسلامي والتحول المؤسسي'
                  : 'Expert in Islamic Finance & Institutional Transformation'
                }
              </p>
            </motion.div>

            {/* Team Member 2 */}
            <motion.div
              className="text-center group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="relative w-48 h-48 mx-auto mb-6">
                <div className="absolute inset-0 bg-[#8B9A6D] rounded-full transform rotate-6 group-hover:rotate-12 transition-transform" />
                <img 
                  src="/images/team/0fbb7567-574a-463c-b736-26fdcf9e26aa.jpeg"
                  alt="Team Member"
                  className="relative w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
                />
              </div>
              <h3 className="text-xl font-bold text-[#1E4D47] mb-1" style={{ fontFamily: isRTL ? "'Noto Kufi Arabic', sans-serif" : 'Playfair Display, serif' }}>
                {language === 'ar' ? 'أحمد' : 'Ahmed'}
              </h3>
              <p className="text-[#8B9A6D] text-sm mb-2">
                {language === 'ar' ? 'مدير العمليات' : 'Operations Director'}
              </p>
              <p className="text-[#4C583E] text-xs px-4">
                {language === 'ar' 
                  ? 'متخصص في إدارة المشاريع والعمليات المصرفية'
                  : 'Specialist in Project Management & Banking Operations'
                }
              </p>
            </motion.div>

            {/* Zakaria - YETO Coordinator */}
            <motion.div
              className="text-center group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative w-48 h-48 mx-auto mb-6">
                <div className="absolute inset-0 bg-[#1E4D47] rounded-full transform rotate-6 group-hover:rotate-12 transition-transform" />
                <img 
                  src="/images/team/IMG_3922.PNG"
                  alt="Zakaria"
                  className="relative w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
                />
              </div>
              <h3 className="text-xl font-bold text-[#1E4D47] mb-1" style={{ fontFamily: isRTL ? "'Noto Kufi Arabic', sans-serif" : 'Playfair Display, serif' }}>
                {language === 'ar' ? 'زكريا' : 'Zakaria'}
              </h3>
              <p className="text-[#8B9A6D] text-sm mb-2">
                {language === 'ar' ? 'المنسق العام للمرصد' : 'YETO General Coordinator'}
              </p>
              <p className="text-[#4C583E] text-xs px-4">
                {language === 'ar' 
                  ? 'مسؤول عن تنسيق منصة المرصد اليمني'
                  : 'Responsible for YETO Platform Coordination'
                }
              </p>
            </motion.div>

            {/* Sadiq - Quality Manager */}
            <motion.div
              className="text-center group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="relative w-48 h-48 mx-auto mb-6">
                <div className="absolute inset-0 bg-[#D4A84B] rounded-full transform rotate-6 group-hover:rotate-12 transition-transform" />
                <img 
                  src="/images/team/IMG_3924.PNG"
                  alt="Sadiq"
                  className="relative w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
                />
              </div>
              <h3 className="text-xl font-bold text-[#1E4D47] mb-1" style={{ fontFamily: isRTL ? "'Noto Kufi Arabic', sans-serif" : 'Playfair Display, serif' }}>
                {language === 'ar' ? 'صادق' : 'Sadiq'}
              </h3>
              <p className="text-[#8B9A6D] text-sm mb-2">
                {language === 'ar' ? 'مسؤول جودة المنصة' : 'Platform Quality Manager'}
              </p>
              <p className="text-[#4C583E] text-xs px-4">
                {language === 'ar' 
                  ? 'مسؤول عن ضمان جودة البيانات والمحتوى'
                  : 'Responsible for Data & Content Quality Assurance'
                }
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footprint Section */}
      <section className="py-20 lg:py-32 bg-[#2C3424]">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4" style={{ fontFamily: isRTL ? 'Tajawal, sans-serif' : 'Playfair Display, serif' }}>
              {language === 'ar' ? 'تواجدنا' : 'Our Footprint'}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Map Visualization */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img 
                src="/images/aden-cityscape.png" 
                alt="Aden, Yemen" 
                className="rounded-lg shadow-xl w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2C3424] to-transparent rounded-lg" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white text-lg font-semibold">
                  {language === 'ar' ? 'عدن، اليمن - المقر الرئيسي' : 'Aden, Yemen - Headquarters'}
                </p>
              </div>
            </motion.div>

            {/* Locations List */}
            <motion.div
              initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="space-y-6">
                {locations.map((location, index) => (
                  <div 
                    key={index}
                    className={`flex items-start gap-4 p-6 rounded-lg ${
                      location.status === 'active' ? 'bg-[#4C583E]' : 'bg-[#4C583E]/50'
                    }`}
                  >
                    <MapPin className="text-[#C9A227] flex-shrink-0 mt-1" size={24} />
                    <div>
                      <h4 className="text-xl font-semibold text-white" style={{ fontFamily: isRTL ? 'Tajawal, sans-serif' : 'Playfair Display, serif' }}>
                        {location.city}
                      </h4>
                      <p className={`${location.status === 'active' ? 'text-[#DADED8]' : 'text-[#959581]'}`}>
                        {location.type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact Info */}
              <div className="mt-8 p-6 bg-[#4C583E] rounded-lg">
                <div className="flex items-center gap-4 mb-4">
                  <Phone className="text-[#C9A227]" size={20} />
                  <a href="tel:+9672236655" className="text-[#DADED8] hover:text-[#C9A227] transition-colors">
                    +967 2 236655
                  </a>
                </div>
                <div className="flex items-center gap-4">
                  <Mail className="text-[#C9A227]" size={20} />
                  <a href="mailto:info@causewaygrp.com" className="text-[#DADED8] hover:text-[#C9A227] transition-colors">
                    info@causewaygrp.com
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
