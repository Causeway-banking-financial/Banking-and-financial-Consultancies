import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Globe, Send, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { GeometricPattern, GoldFrame } from '@/components/GeometricPattern';
import { toast } from 'sonner';

/*
 * CauseWay Contact Page
 * Design Philosophy: Neo-Islamic Geometric Minimalism
 */

export default function Contact() {
  const { t, isRTL, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success(
      language === 'ar' 
        ? 'تم إرسال رسالتك بنجاح. سنتواصل معك قريباً.'
        : 'Your message has been sent successfully. We will contact you soon.'
    );
    
    setFormData({ name: '', organization: '', email: '', message: '' });
    setIsSubmitting(false);
  };

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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6" style={{ fontFamily: isRTL ? 'Tajawal, sans-serif' : 'Playfair Display, serif' }}>
              {t('contact.title')}
            </h1>
            <p className="text-xl text-[#DADED8] leading-relaxed">
              {language === 'ar' 
                ? 'نحن هنا لمساعدتك. تواصل معنا لمناقشة احتياجاتك.'
                : 'We are here to help. Get in touch to discuss your needs.'
              }
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="py-20 lg:py-32 bg-[#DADED8]">
        <div className="container mx-auto px-4 lg:px-8">
          <GoldFrame className="bg-white p-8 lg:p-12 rounded-lg shadow-lg">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Map & Locations */}
              <motion.div
                initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                {/* Logo */}
                <div className="flex items-center gap-3 mb-8">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="4" width="24" height="24" rx="2" stroke="#4C583E" strokeWidth="3" fill="none"/>
                    <rect x="12" y="12" width="16" height="16" rx="2" fill="#768064"/>
                    <rect x="28" y="8" width="12" height="12" rx="2" fill="#C9A227"/>
                    <rect x="32" y="28" width="8" height="8" rx="1" fill="#4C583E"/>
                  </svg>
                  <div className="flex flex-col">
                    <span className="text-[#2C3424] text-xl font-semibold tracking-wide" style={{ fontFamily: 'Playfair Display, serif' }}>
                      CauseWay
                    </span>
                    <span className="text-[#768064] text-sm font-arabic" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                      كوزواي
                    </span>
                  </div>
                </div>

                {/* World Map Visualization */}
                <div className="relative bg-[#F5F5F0] rounded-lg p-6 mb-8">
                  <svg viewBox="0 0 800 400" className="w-full h-auto opacity-30">
                    {/* Simplified world map outline */}
                    <path 
                      d="M150,120 Q200,100 250,110 T350,100 T450,120 T550,110 T650,130 M100,200 Q200,180 300,190 T500,180 T700,200 M150,280 Q250,260 350,270 T550,260 T650,280"
                      stroke="#4C583E"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                  
                  {/* Location Markers */}
                  <div className="absolute" style={{ top: '55%', left: '55%' }}>
                    <div className="relative">
                      <div className="w-4 h-4 bg-[#C9A227] rounded-full animate-ping absolute" />
                      <div className="w-4 h-4 bg-[#C9A227] rounded-full relative z-10" />
                      <span className="absolute top-5 left-1/2 -translate-x-1/2 text-xs text-[#2C3424] whitespace-nowrap font-semibold">
                        Aden, Yemen
                      </span>
                    </div>
                  </div>
                  
                  <div className="absolute" style={{ top: '45%', left: '52%' }}>
                    <div className="w-3 h-3 bg-[#768064] rounded-full" />
                    <span className="absolute top-4 left-1/2 -translate-x-1/2 text-xs text-[#4C583E] whitespace-nowrap">
                      Cairo, Egypt
                    </span>
                  </div>
                  
                  <div className="absolute" style={{ top: '30%', left: '48%' }}>
                    <div className="w-2 h-2 bg-[#959581] rounded-full opacity-60" />
                    <span className="absolute top-3 left-1/2 -translate-x-1/2 text-xs text-[#959581] whitespace-nowrap">
                      Geneva
                    </span>
                  </div>
                  
                  <div className="absolute" style={{ top: '25%', left: '53%' }}>
                    <div className="w-2 h-2 bg-[#959581] rounded-full opacity-60" />
                    <span className="absolute top-3 left-1/2 -translate-x-1/2 text-xs text-[#959581] whitespace-nowrap">
                      Tallinn
                    </span>
                  </div>
                </div>

                {/* Locations List */}
                <div className="space-y-4">
                  {locations.map((location, index) => (
                    <div 
                      key={index}
                      className={`flex items-start gap-3 ${location.status === 'planned' ? 'opacity-60' : ''}`}
                    >
                      <MapPin className="text-[#C9A227] flex-shrink-0 mt-1" size={20} />
                      <div>
                        <p className="font-semibold text-[#2C3424]">{location.city}</p>
                        <p className="text-sm text-[#4C583E]">{location.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-[#2C3424] mb-6" style={{ fontFamily: isRTL ? 'Tajawal, sans-serif' : 'Playfair Display, serif' }}>
                  {t('contact.subtitle')}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <input
                      type="text"
                      placeholder={t('contact.form.name')}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-[#DADED8] rounded focus:outline-none focus:border-[#C9A227] bg-white text-[#2C3424] placeholder-[#959581]"
                    />
                  </div>
                  
                  <div>
                    <input
                      type="text"
                      placeholder={t('contact.form.organization')}
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      className="w-full px-4 py-3 border border-[#DADED8] rounded focus:outline-none focus:border-[#C9A227] bg-white text-[#2C3424] placeholder-[#959581]"
                    />
                  </div>
                  
                  <div>
                    <input
                      type="email"
                      placeholder={t('contact.form.email')}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-[#DADED8] rounded focus:outline-none focus:border-[#C9A227] bg-white text-[#2C3424] placeholder-[#959581]"
                    />
                  </div>
                  
                  <div>
                    <textarea
                      placeholder={t('contact.form.message')}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={5}
                      className="w-full px-4 py-3 border border-[#DADED8] rounded focus:outline-none focus:border-[#C9A227] bg-white text-[#2C3424] placeholder-[#959581] resize-none"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-gold w-full flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-[#2C3424] border-t-transparent rounded-full animate-spin" />
                        {language === 'ar' ? 'جاري الإرسال...' : 'Sending...'}
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        {t('contact.form.submit')}
                      </>
                    )}
                  </button>
                </form>

                {/* Contact Info */}
                <div className="mt-8 pt-8 border-t border-[#DADED8]">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Phone className="text-[#C9A227]" size={20} />
                      <a href="tel:+9672236655" className="text-[#4C583E] hover:text-[#C9A227] transition-colors">
                        +967 2 236655
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="text-[#C9A227]" size={20} />
                      <a href="mailto:info@causewaygrp.com" className="text-[#4C583E] hover:text-[#C9A227] transition-colors">
                        info@causewaygrp.com
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="text-[#C9A227]" size={20} />
                      <a href="https://finance.causewaygrp.com" target="_blank" rel="noopener noreferrer" className="text-[#4C583E] hover:text-[#C9A227] transition-colors">
                        finance.causewaygrp.com
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </GoldFrame>
        </div>
      </section>

      <Footer />
    </div>
  );
}
