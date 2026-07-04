'use client';

import LivingAvatar from './LivingAvatar';
import { useLanguage } from '../lib/i18n/LanguageContext';
import styles from './TodayAvatarNav.module.css';

export type AvatarNavView = 'decisions' | 'insights' | 'create' | 'memory';

type TodayAvatarNavProps = {
  onNavigate: (view: AvatarNavView) => void;
};

export default function TodayAvatarNav({ onNavigate }: TodayAvatarNavProps) {
  const { t } = useLanguage();

  function navigate(view: AvatarNavView) {
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
    </div>
  );
}
