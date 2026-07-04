'use client';

import { useEffect } from 'react';
import { AppTopbar } from '../components/AppTopbar';
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
    <div className="app app-topnav about-app">
      <AppTopbar mode="link" />
      <main className={styles.page}>
        <div className={styles.pageInner}>
        <header className={styles.hero}>
          <h1 className={styles.title}>{t('about.title')}</h1>
          <p className={styles.subtitle}>{t('about.subtitle')}</p>
          <p className={styles.lead}>{t('about.description')}</p>
        </header>

        <section className={styles.block} aria-labelledby="about-heading">
          <h2 id="about-heading" className={styles.sectionLabel}>
            {t('about.aboutHeading')}
          </h2>
          <div className={styles.prose}>
            <p>{t('about.aboutBody1')}</p>
            <p>{t('about.aboutBody2')}</p>
            <p>{t('about.aboutBody3')}</p>
          </div>
        </section>

        <section className={styles.block} aria-labelledby="questions-heading">
          <h2 id="questions-heading" className={styles.sectionLabel}>
            {t('about.questionsHeading')}
          </h2>
          <ul className={styles.questionList}>
            {PRODUCT_KEYS.map(key => (
              <li key={key} className={styles.questionItem}>
                <p className={styles.questionName}>{t(`about.products.${key}.name`)}</p>
                <p className={styles.questionText}>{t(`about.products.${key}.question`)}</p>
              </li>
            ))}
          </ul>
        </section>

        <footer className={styles.pageFooter}>
          <p>{t('about.version')}</p>
          <p>{t('about.tagline')}</p>
        </footer>
        </div>
      </main>
    </div>
  );
}
