import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Home, ArrowRight, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { GeometricPattern } from '@/components/GeometricPattern';

/*
 * CauseWay 404 Not Found Page
 * Design Philosophy: Neo-Islamic Geometric Minimalism
 */

export default function NotFound() {
  const { isRTL, language } = useLanguage();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      
      <section className="relative min-h-screen bg-[#2C3424] flex items-center justify-center overflow-hidden">
        <GeometricPattern variant="corner" className="top-20 left-4 lg:left-8" />
        <GeometricPattern variant="corner" className="bottom-20 right-4 lg:right-8 rotate-180" />
        
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-8xl md:text-9xl font-bold text-[#C9A227] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              404
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4" style={{ fontFamily: isRTL ? 'Tajawal, sans-serif' : 'Playfair Display, serif' }}>
              {language === 'ar' ? 'الصفحة غير موجودة' : 'Page Not Found'}
            </h2>
            <p className="text-lg text-[#DADED8] mb-8 max-w-md mx-auto">
              {language === 'ar' 
                ? 'عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.'
                : 'Sorry, the page you are looking for does not exist or has been moved.'
              }
            </p>
            <Link href="/" className="btn-gold inline-flex items-center gap-2">
              <Home size={20} />
              {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
              <Arrow size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
