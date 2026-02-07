import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.observatory': 'Observatory',
    'nav.insights': 'Insights',
    'nav.contact': 'Contact',
    'nav.clientPortal': 'Client Portal',
    'nav.resources': 'Resources',
    'nav.faq': 'FAQ',
    
    // Hero Section
    'hero.headline': 'Where Finance Becomes Infrastructure',
    'hero.subheadline': 'Governance-safe solutions for banks, institutions, and development partners.',
    'hero.cta.primary': 'Explore Our Services',
    'hero.cta.secondary': 'Contact Us',
    
    // About
    'about.title': 'About CauseWay',
    'about.description': 'CauseWay is an independent advisory and product-engineering group that builds Sharia-grounded, governance-safe financial systems for banks, institutions, corporates and development partners, driving sustainable growth through principled innovation.',
    'about.values.title': 'Our Values',
    'about.values.amanah': 'Amanah (Trust)',
    'about.values.amanah.desc': 'We uphold the highest standards of integrity and trustworthiness in all our engagements.',
    'about.values.clarity': 'Clarity',
    'about.values.clarity.desc': 'We communicate with precision and transparency, ensuring all stakeholders understand our approach.',
    'about.values.accountability': 'Accountability',
    'about.values.accountability.desc': 'We take responsibility for our work and its outcomes, maintaining rigorous standards.',
    'about.values.practicality': 'Practicality',
    'about.values.practicality.desc': 'We deliver actionable solutions that work in real-world conditions.',
    
    // Services
    'services.title': 'Our Services',
    'services.subtitle': 'Comprehensive financial consulting, advisory, branding, and institutional transformation services',
    'services.islamicFinance.title': 'Islamic Finance Engineering',
    'services.islamicFinance.desc': 'Design and validate Sharia-compliant financial products and structures, working with Sharia boards and regulators to ensure full compliance.',
    'services.productDev.title': 'Financial Product Development',
    'services.productDev.desc': 'Develop funding lines across retail, SME, corporate and donor-funded contracts; price products; build risk/return models.',
    'services.wealth.title': 'Wealth & Investment Advisory',
    'services.wealth.desc': 'Formulate investment and treasury policies, set mandates and risk limits, and support portfolio governance.',
    'services.transformation.title': 'Institutional Transformation',
    'services.transformation.desc': 'Guide banks, MFIs and corporates through governance reform, operating model redesign, licensing transitions from microfinance to commercial banking, and comprehensive institutional capacity building.',
    'services.branding.title': 'Branding & Identity',
    'services.branding.desc': 'Create complete visual identities for banks and corporates, including logo design, brand guidelines, marketing materials, and digital presence that reflects institutional positioning and values.',
    'services.policies.title': 'Policies & Governance Frameworks',
    'services.policies.desc': 'Develop comprehensive internal policies, standard operating procedures, governance manuals, and regulatory compliance frameworks that form the backbone of institutional operations.',
    'services.risk.title': 'Risk, Compliance & Audit',
    'services.risk.desc': 'Assess and strengthen governance, risk management, internal controls and compliance programmes including AML/CFT frameworks.',
    'services.observatory.title': 'Observatory Suite',
    'services.observatory.desc': 'Analytics dashboards, briefs and intelligence products that enhance transparency and accountability.',
    'services.learnMore': 'Learn More',
    'services.requestConsultation': 'Request a Consultation',
    
    // Observatory / YETO
    'observatory.title': 'Observatory',
    'observatory.subtitle': 'Evidence-based insights for informed decision-making',
    'yeto.title': 'Yemen Economic Transparency Observatory',
    'yeto.subtitle': 'YETO — Coming Soon',
    'yeto.description': 'YETO will offer open data dashboards, research and analysis to enhance transparency and accountability in Yemen\'s economy.',
    'yeto.signup': 'Sign Up for Early Access',
    'yeto.preview': 'Preview screens — roadmap subject to refinement.',
    
    // Insights
    'insights.title': 'Insights',
    'insights.subtitle': 'Expert analysis and thought leadership',
    'insights.quote': '"Governance is not a constraint; it is the foundation of credibility."',
    'insights.quoteAuthor': '— CauseWay Leadership',
    'insights.readMore': 'Read More',
    'insights.readAnalysis': 'Read Analysis',
    'insights.subscribe': 'Subscribe to CauseWay Insights',
    'insights.subscribePlaceholder': 'Enter your email address',
    'insights.subscribeButton': 'Subscribe',
    
    // Contact
    'contact.title': 'Contact CauseWay',
    'contact.subtitle': 'Get in Touch',
    'contact.form.name': 'Name',
    'contact.form.organization': 'Organization',
    'contact.form.email': 'Email',
    'contact.form.message': 'Message',
    'contact.form.submit': 'Send Message',
    'contact.phone': 'Phone',
    'contact.email': 'Email',
    'contact.web': 'Web',
    'contact.locations.aden': 'Aden, Yemen (Headquarters)',
    'contact.locations.cairo': 'Cairo, Egypt (Regional Office)',
    'contact.locations.planned': 'Geneva & Tallinn (Planned 2026)',
    
    // Footer
    'footer.copyright': '© 2026 CauseWay. All rights reserved.',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Use',
    'footer.cookies': 'Cookie Notice',
    
    // Group Architecture
    'group.consulting': 'Consulting',
    'group.cfbc': 'CFBC',
    'group.wealth': 'Wealth & Investment',
    'group.observatory': 'Observatory',
    
    // Common
    'common.comingSoon': 'Coming Soon',
    'common.learnMore': 'Learn More',
    'common.explore': 'Explore',
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.about': 'من نحن',
    'nav.services': 'خدماتنا',
    'nav.observatory': 'المرصد',
    'nav.insights': 'رؤى',
    'nav.contact': 'اتصل بنا',
    'nav.clientPortal': 'بوابة العملاء',
    'nav.resources': 'موارد',
    'nav.faq': 'الأسئلة الشائعة',
    
    // Hero Section
    'hero.headline': 'حيث يصبح التمويل بنية تحتية',
    'hero.subheadline': 'حلول آمنة للحوكمة للبنوك والمؤسسات وشركاء التنمية',
    'hero.cta.primary': 'استكشف خدماتنا',
    'hero.cta.secondary': 'تواصل معنا',
    
    // About
    'about.title': 'عن كوزواي',
    'about.description': 'كوزواي هي مجموعة استشارية مستقلة وهندسة منتجات تبني أنظمة مالية قائمة على الشريعة وآمنة للحوكمة للبنوك والمؤسسات والشركات وشركاء التنمية، مما يدفع النمو المستدام من خلال الابتكار المبدئي.',
    'about.values.title': 'قيمنا',
    'about.values.amanah': 'الأمانة',
    'about.values.amanah.desc': 'نلتزم بأعلى معايير النزاهة والموثوقية في جميع ارتباطاتنا.',
    'about.values.clarity': 'الوضوح',
    'about.values.clarity.desc': 'نتواصل بدقة وشفافية، مما يضمن فهم جميع أصحاب المصلحة لنهجنا.',
    'about.values.accountability': 'المساءلة',
    'about.values.accountability.desc': 'نتحمل المسؤولية عن عملنا ونتائجه، مع الحفاظ على معايير صارمة.',
    'about.values.practicality': 'العملية',
    'about.values.practicality.desc': 'نقدم حلولاً قابلة للتنفيذ تعمل في ظروف العالم الحقيقي.',
    
    // Services
    'services.title': 'خدماتنا',
    'services.subtitle': 'خدمات استشارية مالية شاملة والهوية والعلامة التجارية والتحول المؤسسي',
    'services.islamicFinance.title': 'هندسة التمويل الإسلامي',
    'services.islamicFinance.desc': 'تصميم والتحقق من المنتجات والهياكل المالية المتوافقة مع الشريعة، والعمل مع هيئات الشريعة والجهات التنظيمية لضمان الامتثال الكامل.',
    'services.productDev.title': 'تطوير المنتجات المالية',
    'services.productDev.desc': 'تطوير خطوط التمويل عبر التجزئة والشركات الصغيرة والمتوسطة والشركات والعقود الممولة من المانحين.',
    'services.wealth.title': 'استشارات الثروة والاستثمار',
    'services.wealth.desc': 'صياغة سياسات الاستثمار والخزينة، وتحديد التفويضات وحدود المخاطر، ودعم حوكمة المحفظة.',
    'services.transformation.title': 'التحول المؤسسي',
    'services.transformation.desc': 'توجيه البنوك ومؤسسات التمويل الأصغر والشركات من خلال إصلاح الحوكمة وإعادة تصميم نموذج التشغيل والتحول من التمويل الأصغر إلى البنوك التجارية وبناء القدرات المؤسسية الشاملة.',
    'services.branding.title': 'الهوية والعلامة التجارية',
    'services.branding.desc': 'إنشاء هويات بصرية كاملة للبنوك والشركات، بما في ذلك تصميم الشعار وإرشادات العلامة التجارية والمواد التسويقية والحضور الرقمي الذي يعكس موقع المؤسسة وقيمها.',
    'services.policies.title': 'السياسات وأطر الحوكمة',
    'services.policies.desc': 'تطوير السياسات الداخلية الشاملة وإجراءات التشغيل القياسية وأدلة الحوكمة وأطر الامتثال التنظيمي التي تشكل العمود الفقري للعمليات المؤسسية.',
    'services.risk.title': 'المخاطر والامتثال والتدقيق',
    'services.risk.desc': 'تقييم وتعزيز الحوكمة وإدارة المخاطر والضوابط الداخلية وبرامج الامتثال بما في ذلك أطر مكافحة غسل الأموال وتمويل الإرهاب.',
    'services.observatory.title': 'مجموعة المرصد',
    'services.observatory.desc': 'لوحات تحليلية وموجزات ومنتجات استخباراتية تعزز الشفافية والمساءلة.',
    'services.learnMore': 'اعرف المزيد',
    'services.requestConsultation': 'اطلب استشارة',
    
    // Observatory / YETO
    'observatory.title': 'المرصد',
    'observatory.subtitle': 'رؤى قائمة على الأدلة لاتخاذ قرارات مستنيرة',
    'yeto.title': 'المرصد اليمني للشفافية الاقتصادية',
    'yeto.subtitle': 'قريباً',
    'yeto.description': 'سيقدم المرصد لوحات بيانات مفتوحة وأبحاث وتحليلات لتعزيز الشفافية والمساءلة في الاقتصاد اليمني.',
    'yeto.signup': 'سجل للوصول المبكر',
    'yeto.preview': 'شاشات المعاينة — خارطة الطريق قابلة للتحسين.',
    
    // Insights
    'insights.title': 'رؤى',
    'insights.subtitle': 'تحليل الخبراء والقيادة الفكرية',
    'insights.quote': '"الحوكمة ليست قيداً؛ إنها أساس المصداقية."',
    'insights.quoteAuthor': '— قيادة كوزواي',
    'insights.readMore': 'اقرأ المزيد',
    'insights.readAnalysis': 'اقرأ التحليل',
    'insights.subscribe': 'اشترك في رؤى كوزواي',
    'insights.subscribePlaceholder': 'أدخل بريدك الإلكتروني',
    'insights.subscribeButton': 'اشترك',
    
    // Contact
    'contact.title': 'تواصل مع كوزواي',
    'contact.subtitle': 'تواصل معنا',
    'contact.form.name': 'الاسم',
    'contact.form.organization': 'المؤسسة',
    'contact.form.email': 'البريد الإلكتروني',
    'contact.form.message': 'الرسالة',
    'contact.form.submit': 'إرسال الرسالة',
    'contact.phone': 'الهاتف',
    'contact.email': 'البريد الإلكتروني',
    'contact.web': 'الموقع',
    'contact.locations.aden': 'عدن، اليمن (المقر الرئيسي)',
    'contact.locations.cairo': 'القاهرة، مصر (المكتب الإقليمي)',
    'contact.locations.planned': 'جنيف وتالين (مخطط 2026)',
    
    // Footer
    'footer.copyright': '© 2026 كوزواي. جميع الحقوق محفوظة.',
    'footer.privacy': 'سياسة الخصوصية',
    'footer.terms': 'شروط الاستخدام',
    'footer.cookies': 'إشعار ملفات تعريف الارتباط',
    
    // Group Architecture
    'group.consulting': 'الاستشارات',
    'group.cfbc': 'CFBC',
    'group.wealth': 'الثروة والاستثمار',
    'group.observatory': 'المرصد',
    
    // Common
    'common.comingSoon': 'قريباً',
    'common.learnMore': 'اعرف المزيد',
    'common.explore': 'استكشف',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language') as Language;
      return saved || 'en';
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
