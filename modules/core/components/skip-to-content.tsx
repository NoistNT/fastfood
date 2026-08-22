'use client';

import { useTranslations } from 'next-intl';

export function SkipToContent() {
  const t = useTranslations('Components');

  return (
    <a
      href="#main-content"
      className="skip-to-content"
      onKeyDown={(e) => {
        // Allow escape to close the skip link
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
      }}
    >
      {t('skipToContent')}
    </a>
  );
}
