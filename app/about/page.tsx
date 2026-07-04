'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DisclosureTrigger } from '../components/Disclosure';
import { LanguageSwitch } from '../components/LanguageSwitch';
import { useLanguage } from '../lib/i18n/LanguageContext';
import styles from './about.module.css';

const PRODUCT_KEYS = ['today', 'decisions', 'insights', 'create', 'memory'] as const;

type AboutFocus = 'about' | 'products' | null;

export default function AboutPage() {
  const { t } = useLanguage();
  const [focus, setFocus] = useState<AboutFocus>(null);

  useEffect(() => {
    document.documentElement.classList.add('about-route');
    return () => document.documentElement.classList.remove('about-route');
  }, []);

  return (
    <>
      <div className="about-topbar">
        <LanguageSwitch className="language-switch-topbar" />
      </div>
      <main className={styles.page}>
        <Link href="/" className={styles.back}>
          {t('about.back')}
        </Link>

        {focus === null && (
          <>
            <header className={styles.hero}>
              <h1 className={styles.title}>{t('about.title')}</h1>
              <p className={styles.subtitle}>{t('about.subtitle')}</p>
              <p className={styles.lead}>{t('about.description')}</p>
            </header>

            <div className={styles.actions}>
              <DisclosureTrigger label={t('disclosure.readAbout')} onClick={() => setFocus('about')} />
              <DisclosureTrigger label={t('disclosure.readProducts')} onClick={() => setFocus('products')} />
            </div>

            <footer className={styles.pageFooter}>
              <p>{t('about.version')}</p>
              <p>{t('about.tagline')}</p>
            </footer>
          </>
        )}

        {focus === 'about' && (
          <div className="reading-focus-view">
            <button type="button" className="reading-expand-close" onClick={() => setFocus(null)}>
              <span aria-hidden="true">←</span> {t('disclosure.closeReading')}
            </button>
            <section className={styles.section} aria-labelledby="about-section">
              <h2 id="about-section" className={styles.sectionLabel}>
                {t('about.aboutHeading')}
              </h2>
              <div className={styles.prose}>
                <p>{t('about.aboutBody1')}</p>
                <p>{t('about.aboutBody2')}</p>
              </div>
            </section>
          </div>
        )}

        {focus === 'products' && (
          <div className="reading-focus-view">
            <button type="button" className="reading-expand-close" onClick={() => setFocus(null)}>
              <span aria-hidden="true">←</span> {t('disclosure.closeReading')}
            </button>
            <section className={styles.section} aria-labelledby="product-section">
              <h2 id="product-section" className={styles.sectionLabel}>
                {t('about.productHeading')}
              </h2>
              <ul className={styles.productList}>
                {PRODUCT_KEYS.map(key => (
                  <li key={key} className={styles.productItem}>
                    <p className={styles.productName}>{t(`about.products.${key}.name`)}</p>
                    <p className={styles.productDesc}>{t(`about.products.${key}.desc`)}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </main>
    </>
  );
}
