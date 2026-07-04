'use client';

import { useEffect, useState } from 'react';
import LivingAvatar from './LivingAvatar';
import { useLanguage } from '../lib/i18n/LanguageContext';
import styles from './TodayAvatarNav.module.css';

export type AvatarNavView = 'decisions' | 'insights' | 'create' | 'memory';

const HINT_STORAGE_KEY = 'giuseppe-os-avatar-hint-seen';
const HINT_DELAY_MS = 4000;

type TodayAvatarNavProps = {
  onNavigate: (view: AvatarNavView) => void;
};

export default function TodayAvatarNav({ onNavigate }: TodayAvatarNavProps) {
  const { t } = useLanguage();
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || window.localStorage.getItem(HINT_STORAGE_KEY)) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShowHint(true);
    }, HINT_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showHint) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShowHint(false);
      window.localStorage.setItem(HINT_STORAGE_KEY, '1');
    }, 5500);

    return () => window.clearTimeout(timer);
  }, [showHint]);

  function dismissHint() {
    window.localStorage.setItem(HINT_STORAGE_KEY, '1');
    setShowHint(false);
  }

  function navigate(view: AvatarNavView) {
    dismissHint();
    onNavigate(view);
  }

  return (
    <div className={styles.shell} data-testid="today-avatar-nav">
      <LivingAvatar />
      <div className={styles.zones}>
        <button
          type="button"
          className={`${styles.zone} ${styles.zoneHead}`}
          aria-label={t('nav.memory')}
          onClick={() => navigate('memory')}
        />
        <button
          type="button"
          className={`${styles.zone} ${styles.zoneEyes}`}
          aria-label={t('nav.decisions')}
          onClick={() => navigate('decisions')}
        />
        <button
          type="button"
          className={`${styles.zone} ${styles.zoneEarLeft}`}
          aria-label={t('nav.insights')}
          onClick={() => navigate('insights')}
        />
        <button
          type="button"
          className={`${styles.zone} ${styles.zoneEarRight}`}
          aria-label={t('nav.insights')}
          onClick={() => navigate('insights')}
        />
        <button
          type="button"
          className={`${styles.zone} ${styles.zoneMouth}`}
          aria-label={t('nav.create')}
          onClick={() => navigate('create')}
        />
      </div>
      {showHint ? <p className={styles.hint}>{t('today.avatarHint')}</p> : null}
    </div>
  );
}
