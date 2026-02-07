import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Building2, Shield, TrendingUp, Users, BarChart3, Eye, CheckCircle, Palette, FileText, Briefcase, Scale } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { GeometricPattern } from '@/components/GeometricPattern';

/*
 * CauseWay Services Page
 * Design Philosophy: Neo-Islamic Geometric Minimalism
 * Enhanced to showcase branding/identity work and institutional transformation
 */

export default function Services() {
  const { t, isRTL, language } = useLanguage();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const services = [
    {
      id: 'islamic-finance',
      icon: Building2,
      titleKey: 'services.islamicFinance.title',
      descKey: 'services.islamicFinance.desc',
      color: '#C9A227',
      deliverables: language === 'ar' ? [
        'تصميم المنتجات المتوافقة مع الشريعة',
        'التعامل مع هيئات الشريعة',
        'وثائق الامتثال التنظيمي',
        'أطر إدارة المخاطر',
        'هيكلة الصكوك والتمويل الإسلامي',
      ] : [
        'Sharia-compliant product design',
        'Sharia board engagement',
        'Regulatory compliance documentation',
        'Risk management frameworks',
        'Sukuk and Islamic finance structuring',
      ],
    },
    {
      id: 'product-development',
      icon: TrendingUp,
      titleKey: 'services.productDev.title',
      descKey: 'services.productDev.desc',
      color: '#768064',
      deliverables: language === 'ar' ? [
        'تصميم المنتجات ونماذج التسعير',
        'تحليل المخاطر والعوائد',
        'وثائق الشروط والسياسات',
        'الإيداعات التنظيمية',
        'تطوير منتجات التجزئة والشركات',
      ] : [
        'Product ideation and pricing models',
        'Risk/return analysis',
        'Term sheets and policy documentation',
        'Regulatory filings',
        'Retail and corporate product development',
      ],
    },
    {
      id: 'wealth-advisory',
      icon: Shield,
      titleKey: 'services.wealth.title',
      descKey: 'services.wealth.desc',
      color: '#4C583E',
      deliverables: language === 'ar' ? [
        'صياغة سياسات الاستثمار',
        'تفويضات المخاطر وأطر توزيع الأصول',
        'حوكمة المحفظة',
        'تقارير مجلس الإدارة',
        'إدارة الخزينة والسيولة',
      ] : [
        'Investment policy drafting',
        'Risk mandates and asset allocation frameworks',
        'Portfolio governance',
        'Board reporting',
        'Treasury and liquidity management',
      ],
    },
    {
      id: 'transformation',
      icon: Users,
      titleKey: 'services.transformation.title',
      descKey: 'services.transformation.desc',
      color: '#C9A227',
      deliverables: language === 'ar' ? [
        'التحول من التمويل الأصغر إلى البنوك التجارية',
        'إصلاح الحوكمة المؤسسية',
        'إعادة تصميم نموذج التشغيل',
        'إصلاح محفظة المنتجات',
        'تطوير السياسات الداخلية والإجراءات',
        'بناء القدرات المؤسسية',
      ] : [
        'Microfinance to commercial bank transition',
        'Corporate governance reform',
        'Operating model redesign',
        'Product portfolio overhaul',
        'Internal policies and procedures development',
        'Institutional capacity building',
      ],
    },
    {
      id: 'branding-identity',
      icon: Palette,
      titleKey: 'services.branding.title',
      descKey: 'services.branding.desc',
      color: '#2C3424',
      deliverables: language === 'ar' ? [
        'تصميم الهوية البصرية الكاملة',
        'تطوير الشعار والعلامة التجارية',
        'دليل الهوية المؤسسية',
        'المواد التسويقية الداخلية والخارجية',
        'استراتيجية العلامة التجارية',
        'تصميم القرطاسية والمطبوعات',
        'الهوية الرقمية والمواقع الإلكترونية',
      ] : [
        'Complete visual identity design',
        'Logo and brand development',
        'Corporate identity guidelines',
        'Internal and external marketing materials',
        'Brand strategy development',
        'Stationery and print design',
        'Digital identity and website design',
      ],
    },
    {
      id: 'policies-governance',
      icon: FileText,
      titleKey: 'services.policies.title',
      descKey: 'services.policies.desc',
      color: '#768064',
      deliverables: language === 'ar' ? [
        'تطوير السياسات الداخلية الشاملة',
        'إجراءات التشغيل القياسية',
        'أدلة الحوكمة المؤسسية',
        'سياسات الموارد البشرية',
        'سياسات إدارة المخاطر',
        'سياسات الامتثال التنظيمي',
        'أطر الرقابة الداخلية',
      ] : [
        'Comprehensive internal policy development',
        'Standard operating procedures',
        'Corporate governance manuals',
        'Human resources policies',
        'Risk management policies',
        'Regulatory compliance policies',
        'Internal control frameworks',
      ],
    },
    {
      id: 'risk-compliance',
      icon: Scale,
      titleKey: 'services.risk.title',
      descKey: 'services.risk.desc',
      color: '#4C583E',
      deliverables: language === 'ar' ? [
        'تقييمات الحوكمة',
        'تدقيق الضوابط الداخلية',
        'أطر مكافحة غسل الأموال وتمويل الإرهاب',
        'تحليلات الفجوات التنظيمية',
        'إعداد التقارير التنظيمية',
        'تقييم المخاطر التشغيلية',
      ] : [
        'Governance assessments',
        'Internal control audits',
        'AML/CFT frameworks',
        'Regulatory gap analyses',
        'Regulatory reporting preparation',
        'Operational risk assessment',
      ],
    },
    {
      id: 'observatory',
      icon: Eye,
      titleKey: 'services.observatory.title',
      descKey: 'services.observatory.desc',
      color: '#C9A227',
      deliverables: language === 'ar' ? [
        'لوحات التحليلات',
        'الموجزات والتقارير',
        'أدوات المراقبة',
        'مكتبة الأبحاث',
        'منتجات الاستخبارات الاقتصادية',
      ] : [
        'Analytics dashboards',
        'Briefs and reports',
        'Monitoring tools',
        'Research library',
        'Economic intelligence products',
      ],
    },
  ];

  return (
    <div className="min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-[#2C3424] overflow-hidden">
        <GeometricPattern variant="corner" className="top-20 right-4 lg:right-8 rotate-90" />
        <GeometricPattern variant="side" className="left-0 top-1/2 -translate-y-1/2 opacity-30" />
        
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div 
            className="max-w-4xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6" style={{ fontFamily: isRTL ? 'Tajawal, sans-serif' : 'Playfair Display, serif' }}>
              {t('services.title')}
            </h1>
            <p className="text-xl text-[#DADED8] leading-relaxed">
              {t('services.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 lg:py-32 bg-[#DADED8]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="space-y-16">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                {/* Content */}
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div 
                    className="w-16 h-16 rounded-lg flex items-center justify-center mb-6"
                    style={{ backgroundColor: service.color }}
                  >
                    <service.icon className="text-white" size={32} />
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-[#2C3424] mb-4" style={{ fontFamily: isRTL ? 'Tajawal, sans-serif' : 'Playfair Display, serif' }}>
                    {t(service.titleKey)}
                  </h2>
                  
                  <p className="text-lg text-[#4C583E] mb-8 leading-relaxed">
                    {t(service.descKey)}
                  </p>

                  <div className="mb-8">
                    <h4 className="text-sm font-semibold text-[#959581] uppercase tracking-wider mb-4">
                      {language === 'ar' ? 'ما نقدمه' : 'What We Deliver'}
                    </h4>
                    <ul className="space-y-3">
                      {service.deliverables.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle className="text-[#C9A227] flex-shrink-0 mt-0.5" size={20} />
                          <span className="text-[#4C583E]">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link 
                    href={`/services/${service.id}`}
                    className="btn-gold inline-flex items-center gap-2"
                  >
                    {t('services.learnMore')}
                    <Arrow size={18} />
                  </Link>
                </div>

                {/* Visual */}
                <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div 
                    className="relative rounded-lg overflow-hidden shadow-xl aspect-[4/3]"
                    style={{ backgroundColor: service.color }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <service.icon className="text-white/20" size={200} />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/30" />
                    
                    {/* Decorative elements */}
                    <div className="absolute top-4 left-4 w-12 h-12 border-2 border-white/30 rounded" />
                    <div className="absolute bottom-4 right-4 w-8 h-8 bg-white/20 rounded transform rotate-45" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Transformation Highlight Section */}
      <section className="py-20 bg-[#4C583E]">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6" style={{ fontFamily: isRTL ? 'Tajawal, sans-serif' : 'Playfair Display, serif' }}>
              {language === 'ar' ? 'التحول المؤسسي الشامل' : 'End-to-End Institutional Transformation'}
            </h2>
            <p className="text-lg text-[#DADED8] max-w-3xl mx-auto">
              {language === 'ar' 
                ? 'نرافق المؤسسات المالية في رحلتها من التمويل الأصغر إلى البنوك التجارية المرخصة، مع تقديم الدعم الكامل في الحوكمة والهوية والسياسات.'
                : 'We accompany financial institutions on their journey from microfinance to licensed commercial banks, providing comprehensive support in governance, identity, and policies.'
              }
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Briefcase,
                title: language === 'ar' ? 'الترخيص والتحول' : 'Licensing & Transformation',
                desc: language === 'ar' 
                  ? 'دعم كامل للحصول على الترخيص المصرفي والتحول من مؤسسة تمويل أصغر إلى بنك تجاري'
                  : 'Full support for obtaining banking license and transitioning from MFI to commercial bank',
              },
              {
                icon: Palette,
                title: language === 'ar' ? 'الهوية والعلامة التجارية' : 'Identity & Branding',
                desc: language === 'ar'
                  ? 'تصميم هوية بصرية متكاملة تعكس المكانة الجديدة للمؤسسة في السوق'
                  : 'Complete visual identity design reflecting the institution\'s new market position',
              },
              {
                icon: FileText,
                title: language === 'ar' ? 'السياسات والإجراءات' : 'Policies & Procedures',
                desc: language === 'ar'
                  ? 'تطوير جميع السياسات الداخلية والإجراءات التشغيلية المطلوبة للامتثال التنظيمي'
                  : 'Development of all internal policies and operational procedures required for regulatory compliance',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="w-16 h-16 rounded-full bg-[#C9A227] flex items-center justify-center mx-auto mb-6">
                  <item.icon className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: isRTL ? 'Tajawal, sans-serif' : 'Playfair Display, serif' }}>
                  {item.title}
                </h3>
                <p className="text-[#DADED8]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#2C3424]">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6" style={{ fontFamily: isRTL ? 'Tajawal, sans-serif' : 'Playfair Display, serif' }}>
              {language === 'ar' ? 'هل أنت مستعد للبدء؟' : 'Ready to Get Started?'}
            </h2>
            <p className="text-lg text-[#DADED8] mb-8 max-w-2xl mx-auto">
              {language === 'ar' 
                ? 'تواصل معنا لمناقشة كيف يمكننا مساعدة مؤسستك في تحقيق أهدافها.'
                : 'Contact us to discuss how we can help your organization achieve its goals.'
              }
            </p>
            <Link href="/contact" className="btn-gold inline-flex items-center gap-2 text-lg">
              {t('services.requestConsultation')}
              <Arrow size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
