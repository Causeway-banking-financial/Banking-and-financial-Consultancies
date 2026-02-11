'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export default function ContactPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('contact');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div>
      <section className="bg-gradient-to-br from-primary-800 to-primary-700 text-white">
        <div className="container-page py-16 lg:py-24">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">{t('title')}</h1>
          <p className="text-lg text-primary-200 max-w-2xl">{t('subtitle')}</p>
        </div>
      </section>

      <section className="bg-white">
        <div className="container-page py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Contact form */}
            <div className="lg:col-span-3">
              {submitted ? (
                <div className="card p-8 text-center">
                  <div className="text-4xl mb-4">✓</div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('form.success')}</h2>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.name')}</label>
                      <input type="text" required className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.email')}</label>
                      <input type="email" required className="input-field" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.phone')}</label>
                      <input type="tel" className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.subject')}</label>
                      <input type="text" required className="input-field" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.message')}</label>
                    <textarea required className="input-field" rows={6} />
                  </div>
                  <button type="submit" className="btn-primary">{t('form.submit')}</button>
                </form>
              )}
            </div>

            {/* Contact info */}
            <div className="lg:col-span-2 space-y-6">
              <InfoCard icon={MapPinIcon} title={t('info.address')} detail="Riyadh, Saudi Arabia" />
              <InfoCard icon={PhoneIcon} title={t('info.phone')} detail="+966 11 XXX XXXX" />
              <InfoCard icon={EnvelopeIcon} title={t('info.email')} detail="info@causewaygrp.com" />
              <InfoCard icon={ClockIcon} title={t('info.hours')} detail="Sun-Thu: 9:00 AM - 6:00 PM" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoCard({ icon: Icon, title, detail }: { icon: any; title: string; detail: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="p-3 bg-primary-50 rounded-xl shrink-0">
        <Icon className="w-5 h-5 text-primary-500" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500 mt-0.5">{detail}</p>
      </div>
    </div>
  );
}
