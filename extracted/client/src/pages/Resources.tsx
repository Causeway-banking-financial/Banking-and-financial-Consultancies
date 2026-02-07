import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { ExternalLink, FileText, Building2, Scale, Globe, TrendingUp, Shield, BookOpen, Landmark, Users } from 'lucide-react';

/*
 * DESIGN: Neo-Islamic Geometric Minimalism
 * Colors: Teal #1E4D47, Olive #8B9A6D, Gold #D4A84B, Cream #F5F3EE
 * This page showcases CauseWay's expertise through curated international standards,
 * Yemen economic programs, and best practices with proper citations.
 */

interface ResourceCategory {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  icon: React.ReactNode;
  resources: Resource[];
}

interface Resource {
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  sourceEn: string;
  sourceAr: string;
  url: string;
  type: 'standard' | 'report' | 'program' | 'guide';
}

const resourceCategories: ResourceCategory[] = [
  {
    id: 'islamic-finance',
    titleEn: 'Islamic Finance Standards',
    titleAr: 'معايير التمويل الإسلامي',
    descriptionEn: 'AAOIFI standards, Sharia governance frameworks, and sukuk guidelines for Islamic financial institutions.',
    descriptionAr: 'معايير أيوفي، أطر الحوكمة الشرعية، وإرشادات الصكوك للمؤسسات المالية الإسلامية.',
    icon: <BookOpen className="w-6 h-6" />,
    resources: [
      {
        titleEn: 'AAOIFI Sharia Standards (1-61)',
        titleAr: 'معايير أيوفي الشرعية (1-61)',
        descriptionEn: 'Comprehensive set of 61 Sharia standards covering Islamic finance products, governance, and compliance. The 2026 draft English translation is open for public consultation until June 30, 2026.',
        descriptionAr: 'مجموعة شاملة من 61 معياراً شرعياً تغطي منتجات التمويل الإسلامي والحوكمة والامتثال. مسودة الترجمة الإنجليزية لعام 2026 مفتوحة للتشاور العام حتى 30 يونيو 2026.',
        sourceEn: 'AAOIFI - Accounting and Auditing Organization for Islamic Financial Institutions',
        sourceAr: 'أيوفي - هيئة المحاسبة والمراجعة للمؤسسات المالية الإسلامية',
        url: 'https://aaoifi.com/?lang=en',
        type: 'standard'
      },
      {
        titleEn: 'Sukuk Standard (SS 62) - Forthcoming',
        titleAr: 'معيار الصكوك (SS 62) - قادم',
        descriptionEn: 'Landmark new standard expected to harmonize the global sukuk market with clear guidelines on Sharia-compliant structures and asset backing. Expected approval in 2025 with 1-3 year implementation period.',
        descriptionAr: 'معيار جديد بارز من المتوقع أن يوحد سوق الصكوك العالمي بإرشادات واضحة حول الهياكل المتوافقة مع الشريعة ودعم الأصول. من المتوقع الموافقة عليه في 2025 مع فترة تنفيذ من 1-3 سنوات.',
        sourceEn: 'S&P Global Ratings Analysis',
        sourceAr: 'تحليل ستاندرد آند بورز جلوبال',
        url: 'https://www.spglobal.com/ratings/en/regulatory/article/250205-sukuk-brief-more-time-to-adopt-aaoifi-standard-62-s13405446',
        type: 'standard'
      },
      {
        titleEn: 'Sharia Governance Framework',
        titleAr: 'إطار الحوكمة الشرعية',
        descriptionEn: 'COMCEC presentation on AAOIFI\'s robust Sharia governance framework including mandatory Sharia Supervisory Boards, internal Sharia audit functions, and compliance departments.',
        descriptionAr: 'عرض كومسيك حول إطار الحوكمة الشرعية القوي لأيوفي بما في ذلك هيئات الرقابة الشرعية الإلزامية ووظائف التدقيق الشرعي الداخلي وأقسام الامتثال.',
        sourceEn: 'COMCEC Financial Cooperation Working Group',
        sourceAr: 'مجموعة العمل للتعاون المالي - كومسيك',
        url: 'https://www.comcec.org/wp-content/uploads/2021/07/4-A.pdf',
        type: 'guide'
      }
    ]
  },
  {
    id: 'banking-standards',
    titleEn: 'Banking Supervision Standards',
    titleAr: 'معايير الرقابة المصرفية',
    descriptionEn: 'Basel III/IV frameworks, capital adequacy requirements, and liquidity standards for emerging market banks.',
    descriptionAr: 'أطر بازل III/IV، متطلبات كفاية رأس المال، ومعايير السيولة للبنوك في الأسواق الناشئة.',
    icon: <Building2 className="w-6 h-6" />,
    resources: [
      {
        titleEn: 'Basel Core Principles for Effective Banking Supervision',
        titleAr: 'مبادئ بازل الأساسية للرقابة المصرفية الفعالة',
        descriptionEn: 'The de facto global minimum standards for prudential regulation and supervision of banks. Full Basel III implementation scheduled for completion by January 1, 2027.',
        descriptionAr: 'المعايير الدنيا العالمية الفعلية للتنظيم والرقابة الاحترازية على البنوك. من المقرر استكمال التنفيذ الكامل لبازل III بحلول 1 يناير 2027.',
        sourceEn: 'Basel Committee on Banking Supervision (BCBS)',
        sourceAr: 'لجنة بازل للرقابة المصرفية',
        url: 'https://www.bis.org/bcbs/publ/d573.htm',
        type: 'standard'
      },
      {
        titleEn: 'Corporate Governance Principles for Banks',
        titleAr: 'مبادئ حوكمة الشركات للبنوك',
        descriptionEn: 'Comprehensive BIS guidelines on corporate governance frameworks for banks, including board composition, risk management, and internal controls.',
        descriptionAr: 'إرشادات بنك التسويات الدولية الشاملة حول أطر حوكمة الشركات للبنوك، بما في ذلك تكوين مجلس الإدارة وإدارة المخاطر والضوابط الداخلية.',
        sourceEn: 'Bank for International Settlements (BIS)',
        sourceAr: 'بنك التسويات الدولية',
        url: 'https://www.bis.org/bcbs/publ/d328.pdf',
        type: 'guide'
      }
    ]
  },
  {
    id: 'aml-cft',
    titleEn: 'AML/CFT Compliance',
    titleAr: 'الامتثال لمكافحة غسل الأموال وتمويل الإرهاب',
    descriptionEn: 'FATF standards, mutual evaluation reports, and compliance frameworks for financial institutions.',
    descriptionAr: 'معايير مجموعة العمل المالي، تقارير التقييم المتبادل، وأطر الامتثال للمؤسسات المالية.',
    icon: <Shield className="w-6 h-6" />,
    resources: [
      {
        titleEn: 'FATF Recommendations',
        titleAr: 'توصيات مجموعة العمل المالي',
        descriptionEn: 'The core international standards for combating money laundering and terrorist financing. Essential framework for all financial institutions.',
        descriptionAr: 'المعايير الدولية الأساسية لمكافحة غسل الأموال وتمويل الإرهاب. إطار أساسي لجميع المؤسسات المالية.',
        sourceEn: 'Financial Action Task Force (FATF)',
        sourceAr: 'مجموعة العمل المالي (فاتف)',
        url: 'https://www.fatf-gafi.org/en/topics/fatf-recommendations.html',
        type: 'standard'
      },
      {
        titleEn: 'Yemen Mutual Evaluation Report',
        titleAr: 'تقرير التقييم المتبادل لليمن',
        descriptionEn: 'MENAFATF comprehensive assessment of Yemen\'s AML/CFT regime. Yemen has been on the FATF grey list since 2010, highlighting the need for continued reform.',
        descriptionAr: 'تقييم مينافاتف الشامل لنظام مكافحة غسل الأموال وتمويل الإرهاب في اليمن. اليمن على القائمة الرمادية لفاتف منذ 2010، مما يبرز الحاجة إلى إصلاحات مستمرة.',
        sourceEn: 'MENAFATF - Middle East and North Africa Financial Action Task Force',
        sourceAr: 'مينافاتف - مجموعة العمل المالي للشرق الأوسط وشمال أفريقيا',
        url: 'https://www.menafatf.org/sites/default/files/MER_Republic_of_Yemen.pdf',
        type: 'report'
      },
      {
        titleEn: 'Jurisdictions under Increased Monitoring (October 2025)',
        titleAr: 'الولايات القضائية الخاضعة للمراقبة المعززة (أكتوبر 2025)',
        descriptionEn: 'Latest FATF statement on Yemen\'s grey list status and progress on AML/CFT reforms.',
        descriptionAr: 'أحدث بيان لفاتف حول وضع اليمن في القائمة الرمادية والتقدم في إصلاحات مكافحة غسل الأموال وتمويل الإرهاب.',
        sourceEn: 'FATF',
        sourceAr: 'فاتف',
        url: 'https://www.fatf-gafi.org/en/publications/High-risk-and-other-monitored-jurisdictions/increased-monitoring-october-2025.html',
        type: 'report'
      }
    ]
  },
  {
    id: 'yemen-programs',
    titleEn: 'Yemen Economic Programs',
    titleAr: 'برامج اليمن الاقتصادية',
    descriptionEn: 'World Bank and IMF programs supporting Yemen\'s economic recovery, financial sector development, and institutional strengthening.',
    descriptionAr: 'برامج البنك الدولي وصندوق النقد الدولي لدعم التعافي الاقتصادي لليمن وتطوير القطاع المالي وتعزيز المؤسسات.',
    icon: <Globe className="w-6 h-6" />,
    resources: [
      {
        titleEn: 'The Yemen Fund (2022-2032)',
        titleAr: 'صندوق اليمن (2022-2032)',
        descriptionEn: 'Multi-donor trust fund serving as a strategic partnership platform focusing on inclusive service delivery, economic opportunities, green reconstruction, and transition enablers.',
        descriptionAr: 'صندوق استئماني متعدد المانحين يعمل كمنصة شراكة استراتيجية تركز على تقديم الخدمات الشاملة والفرص الاقتصادية وإعادة الإعمار الأخضر ومحفزات التحول.',
        sourceEn: 'World Bank',
        sourceAr: 'البنك الدولي',
        url: 'https://www.worldbank.org/en/programs/the-yemen-fund',
        type: 'program'
      },
      {
        titleEn: 'Yemen Financial Market Infrastructure and Inclusion Project (US$20M)',
        titleAr: 'مشروع البنية التحتية للسوق المالي والشمول المالي في اليمن (20 مليون دولار)',
        descriptionEn: 'June 2025 grant to establish digital payment ecosystem including Fast Payment System and Real-Time Gross Settlement System, enhancing AML compliance and expanding digital financial services.',
        descriptionAr: 'منحة يونيو 2025 لإنشاء نظام بيئي للمدفوعات الرقمية يشمل نظام الدفع السريع ونظام التسوية الإجمالية في الوقت الفعلي، وتعزيز الامتثال لمكافحة غسل الأموال وتوسيع الخدمات المالية الرقمية.',
        sourceEn: 'World Bank Press Release',
        sourceAr: 'بيان صحفي للبنك الدولي',
        url: 'https://www.worldbank.org/en/news/press-release/2025/06/17/world-bank-approves-us-30-million-to-support-financial-inclusion-and-education-in-yemen',
        type: 'program'
      },
      {
        titleEn: 'Yemen Economic Monitor (Spring 2024)',
        titleAr: 'مرصد الاقتصاد اليمني (ربيع 2024)',
        descriptionEn: 'Comprehensive analysis showing 2.0% GDP contraction in 2023, 54% decline in real GDP per capita since 2015, and the impact of oil export blockade on the economy.',
        descriptionAr: 'تحليل شامل يظهر انكماش الناتج المحلي الإجمالي بنسبة 2.0% في 2023، وانخفاض بنسبة 54% في نصيب الفرد من الناتج المحلي الإجمالي الحقيقي منذ 2015، وتأثير حصار صادرات النفط على الاقتصاد.',
        sourceEn: 'World Bank',
        sourceAr: 'البنك الدولي',
        url: 'https://documents1.worldbank.org/curated/en/099926206242412700/pdf/IDU1dc601b321062b148fc1b59414e6cd5c70a66.pdf',
        type: 'report'
      },
      {
        titleEn: 'IMF Article IV Consultation (2025)',
        titleAr: 'مشاورات المادة الرابعة لصندوق النقد الدولي (2025)',
        descriptionEn: 'First IMF engagement with Yemen in 11 years. Covers fiscal reform, currency stabilization, and macroeconomic framework recommendations. Projects moderate recovery with GDP growth reaching 2.5% by 2030.',
        descriptionAr: 'أول مشاركة لصندوق النقد الدولي مع اليمن منذ 11 عاماً. يغطي الإصلاح المالي واستقرار العملة وتوصيات الإطار الاقتصادي الكلي. يتوقع تعافياً معتدلاً مع نمو الناتج المحلي الإجمالي بنسبة 2.5% بحلول 2030.',
        sourceEn: 'International Monetary Fund',
        sourceAr: 'صندوق النقد الدولي',
        url: 'https://www.imf.org/en/news/articles/2025/10/09/imf-cs-yemen-2025-imf-article-iv-mission',
        type: 'report'
      },
      {
        titleEn: 'IMF Technical Assistance: Emergency Revenue Plan',
        titleAr: 'المساعدة الفنية لصندوق النقد الدولي: خطة الإيرادات الطارئة',
        descriptionEn: 'Short-term emergency revenue plan to help restore revenue integrity and improve tax and customs collections in Yemen.',
        descriptionAr: 'خطة إيرادات طارئة قصيرة المدى للمساعدة في استعادة سلامة الإيرادات وتحسين تحصيل الضرائب والجمارك في اليمن.',
        sourceEn: 'IMF',
        sourceAr: 'صندوق النقد الدولي',
        url: 'https://www.elibrary.imf.org/view/journals/029/2025/041/029.2025.issue-041-en.xml',
        type: 'guide'
      }
    ]
  },
  {
    id: 'governance',
    titleEn: 'Corporate Governance',
    titleAr: 'حوكمة الشركات',
    descriptionEn: 'OECD principles, IFC frameworks, and best practices for board composition and institutional governance.',
    descriptionAr: 'مبادئ منظمة التعاون الاقتصادي والتنمية، أطر مؤسسة التمويل الدولية، وأفضل الممارسات لتكوين مجلس الإدارة والحوكمة المؤسسية.',
    icon: <Users className="w-6 h-6" />,
    resources: [
      {
        titleEn: 'G20/OECD Principles of Corporate Governance (2023)',
        titleAr: 'مبادئ حوكمة الشركات لمجموعة العشرين/منظمة التعاون الاقتصادي والتنمية (2023)',
        descriptionEn: 'Primary international benchmark including new chapter on "Sustainability and Resilience" emphasizing ESG risk management and long-term value creation.',
        descriptionAr: 'المعيار الدولي الأساسي يتضمن فصلاً جديداً حول "الاستدامة والمرونة" يؤكد على إدارة مخاطر الحوكمة البيئية والاجتماعية وخلق القيمة طويلة المدى.',
        sourceEn: 'OECD',
        sourceAr: 'منظمة التعاون الاقتصادي والتنمية',
        url: 'https://www.oecd.org/content/dam/oecd/en/publications/reports/2023/09/g20-oecd-principles-of-corporate-governance-2023_60836fcb/ed750b30-en.pdf',
        type: 'standard'
      },
      {
        titleEn: 'IFC Corporate Governance Development Framework',
        titleAr: 'إطار تطوير حوكمة الشركات لمؤسسة التمويل الدولية',
        descriptionEn: 'Practical framework for assessing and improving corporate governance with a progressive approach from basic compliance to best practices.',
        descriptionAr: 'إطار عملي لتقييم وتحسين حوكمة الشركات بنهج تدريجي من الامتثال الأساسي إلى أفضل الممارسات.',
        sourceEn: 'International Finance Corporation (IFC)',
        sourceAr: 'مؤسسة التمويل الدولية',
        url: 'https://www.ifc.org/en/what-we-do/sector-expertise/corporate-governance/cg-development-framework',
        type: 'guide'
      },
      {
        titleEn: 'DFI Corporate Governance Progression Matrix',
        titleAr: 'مصفوفة تقدم حوكمة الشركات لمؤسسات تمويل التنمية',
        descriptionEn: 'Practical tool breaking down corporate governance into five key areas with clear roadmap across four levels from "Basic" to "Best".',
        descriptionAr: 'أداة عملية تقسم حوكمة الشركات إلى خمسة مجالات رئيسية مع خارطة طريق واضحة عبر أربعة مستويات من "الأساسي" إلى "الأفضل".',
        sourceEn: 'Development Finance Institutions',
        sourceAr: 'مؤسسات تمويل التنمية',
        url: 'https://cgdevelopmentframework.com/wp-content/uploads/2024/12/DFI-CG-Progression-Matrix-Final-Formatted-Dec-2024.pdf',
        type: 'guide'
      }
    ]
  },
  {
    id: 'mfi-transformation',
    titleEn: 'MFI Transformation',
    titleAr: 'تحول مؤسسات التمويل الأصغر',
    descriptionEn: 'Case studies and best practices for microfinance institution transformation to commercial banks.',
    descriptionAr: 'دراسات حالة وأفضل الممارسات لتحول مؤسسات التمويل الأصغر إلى بنوك تجارية.',
    icon: <TrendingUp className="w-6 h-6" />,
    resources: [
      {
        titleEn: 'Transforming Microfinance Institutions in the Arab World',
        titleAr: 'تحويل مؤسسات التمويل الأصغر في العالم العربي',
        descriptionEn: 'World Bank comprehensive study on MFI transformation drivers, challenges, and enabling regulatory frameworks in the MENA region.',
        descriptionAr: 'دراسة شاملة للبنك الدولي حول محركات تحول مؤسسات التمويل الأصغر والتحديات والأطر التنظيمية الممكنة في منطقة الشرق الأوسط وشمال أفريقيا.',
        sourceEn: 'World Bank',
        sourceAr: 'البنك الدولي',
        url: 'https://documents1.worldbank.org/curated/en/174101532542008689/pdf/128854-WP-MNA-Transforming-Microfinance-22-5-2018-PUBLIC.pdf',
        type: 'report'
      },
      {
        titleEn: 'Roadmap to Transformation: A Practical Guide (Afghanistan)',
        titleAr: 'خارطة طريق التحول: دليل عملي (أفغانستان)',
        descriptionEn: 'Practical guide for transformation to Depository Microfinance Institution with staged approach applicable to fragile state contexts.',
        descriptionAr: 'دليل عملي للتحول إلى مؤسسة تمويل أصغر إيداعية بنهج مرحلي قابل للتطبيق في سياقات الدول الهشة.',
        sourceEn: 'FinDev Gateway',
        sourceAr: 'بوابة فين ديف',
        url: 'https://www.findevgateway.org/paper/2009/07/roadmap-transformation-practical-guide-transformation-depository-microfinance',
        type: 'guide'
      },
      {
        titleEn: 'Somalia: Licensing Regulations for Non-Deposit Taking MFIs (2025)',
        titleAr: 'الصومال: لوائح ترخيص مؤسسات التمويل الأصغر غير المتلقية للودائع (2025)',
        descriptionEn: 'Recent regulatory framework establishing two-tiered system with different capital requirements and operational scopes.',
        descriptionAr: 'إطار تنظيمي حديث يؤسس نظاماً من مستويين بمتطلبات رأس مال ونطاقات تشغيلية مختلفة.',
        sourceEn: 'Central Bank of Somalia',
        sourceAr: 'البنك المركزي الصومالي',
        url: 'https://centralbank.gov.so/wp-content/uploads/2025/07/Licensing-Regulations-for-Non-Deposit-Taking-MFIs.pdf',
        type: 'standard'
      }
    ]
  },
  {
    id: 'central-bank',
    titleEn: 'Central Bank Governance',
    titleAr: 'حوكمة البنك المركزي',
    descriptionEn: 'International standards for central bank independence, monetary policy, and institutional strengthening in fragile states.',
    descriptionAr: 'المعايير الدولية لاستقلالية البنك المركزي والسياسة النقدية وتعزيز المؤسسات في الدول الهشة.',
    icon: <Landmark className="w-6 h-6" />,
    resources: [
      {
        titleEn: 'The Three Pillars of Central Bank Governance',
        titleAr: 'الركائز الثلاث لحوكمة البنك المركزي',
        descriptionEn: 'IMF foundational document on independence, accountability, and transparency as cornerstones of effective central banking.',
        descriptionAr: 'وثيقة صندوق النقد الدولي التأسيسية حول الاستقلالية والمساءلة والشفافية كأركان أساسية للعمل المصرفي المركزي الفعال.',
        sourceEn: 'IMF',
        sourceAr: 'صندوق النقد الدولي',
        url: 'https://www.elibrary.imf.org/downloadpdf/book/9781589065079/ch006.pdf',
        type: 'guide'
      },
      {
        titleEn: 'Financial Reforms in Fragile States',
        titleAr: 'الإصلاحات المالية في الدول الهشة',
        descriptionEn: 'World Bank lessons learned on supporting financial sector reforms in fragile and conflict-affected states with tailored, context-specific approaches.',
        descriptionAr: 'دروس البنك الدولي المستفادة حول دعم إصلاحات القطاع المالي في الدول الهشة والمتأثرة بالنزاعات بنهج مخصص ومحدد السياق.',
        sourceEn: 'World Bank',
        sourceAr: 'البنك الدولي',
        url: 'https://blogs.worldbank.org/en/psd/power-of-financial-reforms-in-fragile-states',
        type: 'report'
      },
      {
        titleEn: 'Customized Support for Fragile States',
        titleAr: 'الدعم المخصص للدول الهشة',
        descriptionEn: 'IMF\'s tailored approach to institutional strengthening with intensive, on-the-ground support for capacity building.',
        descriptionAr: 'نهج صندوق النقد الدولي المخصص لتعزيز المؤسسات بدعم مكثف على أرض الواقع لبناء القدرات.',
        sourceEn: 'IMF',
        sourceAr: 'صندوق النقد الدولي',
        url: 'https://www.imf.org/en/blogs/articles/2023/09/21/fragile-states-need-customized-support-to-strengthen-institutions',
        type: 'report'
      }
    ]
  }
];

const typeColors = {
  standard: 'bg-[#1E4D47] text-white',
  report: 'bg-[#8B9A6D] text-white',
  program: 'bg-[#D4A84B] text-[#1E4D47]',
  guide: 'bg-[#F5F3EE] text-[#1E4D47] border border-[#1E4D47]'
};

const typeLabels = {
  standard: { en: 'Standard', ar: 'معيار' },
  report: { en: 'Report', ar: 'تقرير' },
  program: { en: 'Program', ar: 'برنامج' },
  guide: { en: 'Guide', ar: 'دليل' }
};

export default function Resources() {
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <div className={`min-h-screen bg-[#F5F3EE] ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-[#1E4D47] to-[#2D5A52]">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <span className="text-[#D4A84B] text-sm font-medium tracking-wider uppercase mb-4 block">
              {isRTL ? 'مكتبة الموارد' : 'Resource Library'}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-6">
              {isRTL ? 'المعايير الدولية وأفضل الممارسات' : 'International Standards & Best Practices'}
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              {isRTL 
                ? 'مجموعة منسقة من الأطر التنظيمية والمعايير الدولية والموارد الأساسية للمؤسسات المالية العاملة في الأسواق الناشئة والدول الهشة.'
                : 'A curated collection of regulatory frameworks, international standards, and essential resources for financial institutions operating in emerging markets and fragile states.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-8 bg-white border-b border-[#1E4D47]/10">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '60+', labelEn: 'Standards & Guidelines', labelAr: 'معيار وإرشاد' },
              { value: '$50M+', labelEn: 'Yemen Programs Tracked', labelAr: 'برامج اليمن المتتبعة' },
              { value: '7', labelEn: 'Key Focus Areas', labelAr: 'مجالات تركيز رئيسية' },
              { value: '2026', labelEn: 'Latest Updates', labelAr: 'آخر التحديثات' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-serif text-[#1E4D47] mb-1">{stat.value}</div>
                <div className="text-sm text-[#1E4D47]/60">{isRTL ? stat.labelAr : stat.labelEn}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="py-16">
        <div className="container">
          {resourceCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              className="mb-16 last:mb-0"
            >
              {/* Category Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-lg bg-[#1E4D47] text-white flex items-center justify-center">
                  {category.icon}
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-serif text-[#1E4D47]">
                    {isRTL ? category.titleAr : category.titleEn}
                  </h2>
                  <p className="text-[#1E4D47]/60 mt-1">
                    {isRTL ? category.descriptionAr : category.descriptionEn}
                  </p>
                </div>
              </div>

              {/* Resources Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.resources.map((resource, resourceIndex) => (
                  <motion.a
                    key={resourceIndex}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: resourceIndex * 0.1 }}
                    className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-[#1E4D47]/5 hover:border-[#D4A84B]/30"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeColors[resource.type]}`}>
                        {isRTL ? typeLabels[resource.type].ar : typeLabels[resource.type].en}
                      </span>
                      <ExternalLink className="w-4 h-4 text-[#1E4D47]/30 group-hover:text-[#D4A84B] transition-colors" />
                    </div>
                    
                    <h3 className="text-lg font-semibold text-[#1E4D47] mb-3 group-hover:text-[#D4A84B] transition-colors line-clamp-2">
                      {isRTL ? resource.titleAr : resource.titleEn}
                    </h3>
                    
                    <p className="text-sm text-[#1E4D47]/70 mb-4 line-clamp-3">
                      {isRTL ? resource.descriptionAr : resource.descriptionEn}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs text-[#8B9A6D]">
                      <FileText className="w-3 h-3" />
                      <span className="line-clamp-1">{isRTL ? resource.sourceAr : resource.sourceEn}</span>
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CauseWay Analysis CTA */}
      <section className="py-16 bg-[#1E4D47]">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Scale className="w-12 h-12 text-[#D4A84B] mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-serif text-white mb-6">
              {isRTL ? 'تحليل كوزواي المخصص' : 'CauseWay Custom Analysis'}
            </h2>
            <p className="text-white/80 text-lg mb-8">
              {isRTL 
                ? 'هل تحتاج إلى تحليل مخصص لكيفية تطبيق هذه المعايير على مؤسستك؟ يقدم فريقنا تقييمات شاملة وخرائط طريق للتنفيذ.'
                : 'Need a customized analysis of how these standards apply to your institution? Our team provides comprehensive assessments and implementation roadmaps.'}
            </p>
            <a 
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#D4A84B] text-[#1E4D47] px-8 py-4 rounded-lg font-semibold hover:bg-[#D4A84B]/90 transition-colors"
            >
              {isRTL ? 'طلب استشارة' : 'Request Consultation'}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 bg-[#F5F3EE] border-t border-[#1E4D47]/10">
        <div className="container">
          <p className="text-xs text-[#1E4D47]/50 text-center max-w-4xl mx-auto">
            {isRTL 
              ? 'إخلاء المسؤولية: الموارد المدرجة هنا مقدمة لأغراض إعلامية فقط. كوزواي ليست تابعة لأي من المنظمات المذكورة ما لم يُذكر خلاف ذلك. يرجى الرجوع إلى المصادر الرسمية للحصول على أحدث الإصدارات والإرشادات.'
              : 'Disclaimer: Resources listed here are provided for informational purposes only. CauseWay is not affiliated with any of the organizations mentioned unless otherwise stated. Please refer to official sources for the latest versions and guidance.'}
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
