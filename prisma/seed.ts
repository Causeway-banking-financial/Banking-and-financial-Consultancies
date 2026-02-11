import { PrismaClient, UserRole, PublishStatus, ResourceType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@causewaygrp.com' },
    update: {},
    create: {
      email: 'admin@causewaygrp.com',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      active: true,
    },
  });
  console.log(`Admin user: ${admin.email}`);

  // Create editor user
  const editorPassword = await bcrypt.hash('editor123', 12);
  const editor = await prisma.user.upsert({
    where: { email: 'editor@causewaygrp.com' },
    update: {},
    create: {
      email: 'editor@causewaygrp.com',
      name: 'Editor User',
      passwordHash: editorPassword,
      role: UserRole.EDITOR,
      active: true,
    },
  });
  console.log(`Editor user: ${editor.email}`);

  // Create categories
  const categories = [
    { nameEn: 'Banking Regulations', nameAr: 'اللوائح المصرفية', slug: 'banking-regulations', color: '#1e40af', sortOrder: 1 },
    { nameEn: 'Fintech & Innovation', nameAr: 'التكنولوجيا المالية والابتكار', slug: 'fintech-innovation', color: '#7c3aed', sortOrder: 2 },
    { nameEn: 'Risk & Compliance', nameAr: 'المخاطر والامتثال', slug: 'risk-compliance', color: '#dc2626', sortOrder: 3 },
    { nameEn: 'ESG & Sustainability', nameAr: 'الاستدامة البيئية والاجتماعية', slug: 'esg-sustainability', color: '#16a34a', sortOrder: 4 },
    { nameEn: 'Digital Payments', nameAr: 'المدفوعات الرقمية', slug: 'digital-payments', color: '#ea580c', sortOrder: 5 },
    { nameEn: 'Corporate Governance', nameAr: 'حوكمة الشركات', slug: 'corporate-governance', color: '#0891b2', sortOrder: 6 },
  ];

  const createdCategories = [];
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { ...cat, enabled: true },
    });
    createdCategories.push(created);
  }
  console.log(`Created ${createdCategories.length} categories`);

  // Create sample resources
  const resources = [
    {
      slug: 'open-banking-gcc-2024',
      titleEn: 'The State of Open Banking in the GCC',
      titleAr: 'حالة الخدمات المصرفية المفتوحة في دول مجلس التعاون الخليجي',
      descriptionEn: 'A comprehensive analysis of open banking frameworks, regulatory developments, and adoption rates across Gulf Cooperation Council countries.',
      descriptionAr: 'تحليل شامل لأطر الخدمات المصرفية المفتوحة والتطورات التنظيمية ومعدلات التبني في دول مجلس التعاون الخليجي.',
      type: ResourceType.REPORT,
      status: PublishStatus.PUBLISHED,
      featured: true,
      priority: 10,
      publisher: 'CauseWay Research',
      year: 2024,
      tags: ['open-banking', 'gcc', 'regulation'],
      categoryId: createdCategories[0].id,
      metaTitleEn: 'Open Banking in GCC - CauseWay Report 2024',
      metaDescEn: 'Comprehensive report on open banking frameworks and adoption in GCC countries.',
      metaTitleAr: 'الخدمات المصرفية المفتوحة في الخليج - تقرير كوزواي 2024',
      metaDescAr: 'تقرير شامل عن أطر الخدمات المصرفية المفتوحة والتبني في دول الخليج.',
    },
    {
      slug: 'esg-financial-services-mena',
      titleEn: 'ESG Integration in MENA Financial Services',
      titleAr: 'دمج معايير ESG في الخدمات المالية بمنطقة الشرق الأوسط وشمال أفريقيا',
      descriptionEn: 'How financial institutions in the Middle East are incorporating environmental, social, and governance principles.',
      descriptionAr: 'كيف تدمج المؤسسات المالية في الشرق الأوسط المبادئ البيئية والاجتماعية والحوكمة.',
      type: ResourceType.WHITEPAPER,
      status: PublishStatus.PUBLISHED,
      featured: true,
      priority: 8,
      publisher: 'CauseWay Advisory',
      year: 2024,
      tags: ['esg', 'sustainability', 'mena'],
      categoryId: createdCategories[3].id,
    },
    {
      slug: 'digital-transformation-trends-2024',
      titleEn: 'Digital Transformation Trends for Financial Institutions 2024',
      titleAr: 'اتجاهات التحول الرقمي للمؤسسات المالية 2024',
      descriptionEn: 'Key technology trends shaping the financial services industry, including AI, blockchain, and cloud adoption.',
      descriptionAr: 'الاتجاهات التكنولوجية الرئيسية التي تشكل صناعة الخدمات المالية بما في ذلك الذكاء الاصطناعي وسلسلة الكتل والسحابة.',
      type: ResourceType.ARTICLE,
      status: PublishStatus.PUBLISHED,
      featured: false,
      priority: 5,
      publisher: 'CauseWay Insights',
      year: 2024,
      tags: ['digital-transformation', 'fintech', 'ai'],
      categoryId: createdCategories[1].id,
    },
    {
      slug: 'risk-management-framework-guide',
      titleEn: 'Risk Management Framework Guide for Banks',
      titleAr: 'دليل إطار إدارة المخاطر للبنوك',
      descriptionEn: 'A practical guide to establishing and maintaining a comprehensive risk management framework for banking institutions.',
      descriptionAr: 'دليل عملي لإنشاء وصيانة إطار شامل لإدارة المخاطر للمؤسسات المصرفية.',
      type: ResourceType.GUIDE,
      status: PublishStatus.PUBLISHED,
      featured: false,
      priority: 4,
      publisher: 'CauseWay Advisory',
      year: 2024,
      tags: ['risk-management', 'banking', 'compliance'],
      categoryId: createdCategories[2].id,
    },
    {
      slug: 'payment-innovations-saudi-vision-2030',
      titleEn: 'Payment Innovations Aligned with Saudi Vision 2030',
      titleAr: 'ابتكارات الدفع المتوافقة مع رؤية السعودية 2030',
      descriptionEn: 'An exploration of how payment technology is evolving in Saudi Arabia to support Vision 2030 goals.',
      descriptionAr: 'استكشاف كيفية تطور تكنولوجيا الدفع في المملكة العربية السعودية لدعم أهداف رؤية 2030.',
      type: ResourceType.PRESENTATION,
      status: PublishStatus.DRAFT,
      featured: false,
      priority: 3,
      publisher: 'CauseWay Research',
      year: 2024,
      tags: ['payments', 'saudi', 'vision-2030'],
      categoryId: createdCategories[4].id,
    },
    {
      slug: 'governance-best-practices-family-offices',
      titleEn: 'Corporate Governance Best Practices for Family Offices',
      titleAr: 'أفضل ممارسات حوكمة الشركات للمكاتب العائلية',
      descriptionEn: 'Guidelines and recommendations for establishing governance structures in family offices across the MENA region.',
      descriptionAr: 'إرشادات وتوصيات لإنشاء هياكل الحوكمة في المكاتب العائلية عبر منطقة الشرق الأوسط وشمال أفريقيا.',
      type: ResourceType.REPORT,
      status: PublishStatus.PUBLISHED,
      featured: false,
      priority: 6,
      publisher: 'CauseWay Governance',
      year: 2024,
      tags: ['governance', 'family-office', 'mena'],
      categoryId: createdCategories[5].id,
    },
  ];

  for (const resource of resources) {
    await prisma.resource.upsert({
      where: { slug: resource.slug },
      update: {},
      create: {
        ...resource,
        publishDate: new Date(),
        publishedAt: resource.status === PublishStatus.PUBLISHED ? new Date() : undefined,
        createdById: admin.id,
        updatedById: admin.id,
      },
    });
  }
  console.log(`Created ${resources.length} resources`);

  // Create sample pages
  const pages = [
    {
      slug: 'about',
      titleEn: 'About CauseWay',
      titleAr: 'عن كوزواي',
      status: PublishStatus.PUBLISHED,
      template: 'default',
      showInNav: true,
      sortOrder: 1,
      metaTitleEn: 'About CauseWay Financial Consulting',
      metaDescEn: 'Learn about CauseWay Financial Consulting - bridging financial expertise across the MENA region.',
      metaTitleAr: 'عن كوزواي للاستشارات المالية',
      metaDescAr: 'تعرف على كوزواي للاستشارات المالية - جسر الخبرة المالية عبر منطقة الشرق الأوسط وشمال أفريقيا.',
    },
    {
      slug: 'services',
      titleEn: 'Our Services',
      titleAr: 'خدماتنا',
      status: PublishStatus.PUBLISHED,
      template: 'default',
      showInNav: true,
      sortOrder: 2,
      metaTitleEn: 'Financial Consulting Services - CauseWay',
      metaDescEn: 'Comprehensive financial consulting solutions for banking and financial institutions.',
    },
  ];

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: {
        ...page,
        publishedAt: page.status === PublishStatus.PUBLISHED ? new Date() : undefined,
      },
    });
  }
  console.log(`Created ${pages.length} pages`);

  // Create site settings
  const settings = [
    { key: 'site_name', valueEn: 'CauseWay Financial Consulting', valueAr: 'كوزواي للاستشارات المالية', type: 'text' },
    { key: 'site_tagline', valueEn: 'Navigating Financial Futures', valueAr: 'نرسم مسار المستقبل المالي', type: 'text' },
    { key: 'contact_email', valueEn: 'info@causewaygrp.com', valueAr: 'info@causewaygrp.com', type: 'text' },
    { key: 'contact_phone', valueEn: '+966 11 XXX XXXX', valueAr: '+966 11 XXX XXXX', type: 'text' },
    { key: 'address', valueEn: 'Riyadh, Saudi Arabia', valueAr: 'الرياض، المملكة العربية السعودية', type: 'text' },
  ];

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log(`Created ${settings.length} site settings`);

  console.log('Seed complete!');
  console.log('---');
  console.log('Admin login: admin@causewaygrp.com / admin123');
  console.log('Editor login: editor@causewaygrp.com / editor123');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
