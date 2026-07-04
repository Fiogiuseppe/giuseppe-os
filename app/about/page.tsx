'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { LanguageSwitch } from '../components/LanguageSwitch';
import { useLanguage } from '../lib/i18n/LanguageContext';
import styles from './about.module.css';

const PRODUCT_KEYS = ['today', 'decisions', 'insights', 'create', 'memory'] as const;

export default function AboutPage() {
  const { t } = useLanguage();

  useEffect(() => {
    document.documentElement.classList.add('about-route');
    return () => document.documentElement.classList.remove('about-route');
  }, []);

  return (
    <>
      <main className={styles.page}>
        <Link href="/" className={styles.back}>
          {t('about.back')}
        </Link>

        <header className={styles.hero}>
          <h1 className={styles.title}>{t('about.title')}</h1>
          <p className={styles.subtitle}>{t('about.subtitle')}</p>
          <p className={styles.lead}>{t('about.description')}</p>
        </header>

        <section className={styles.section} aria-labelledby="about-section">
          <h2 id="about-section" className={styles.sectionLabel}>
            {t('about.aboutHeading')}
          </h2>
          <div className={styles.prose}>
            <p>{t('about.aboutBody1')}</p>
            <p>{t('about.aboutBody2')}</p>
          </div>
        </section>

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

        <footer className={styles.pageFooter}>
          <p>{t('about.version')}</p>
          <p>{t('about.tagline')}</p>
        </footer>
      </main>
      <LanguageSwitch />
    </>
  );
}
