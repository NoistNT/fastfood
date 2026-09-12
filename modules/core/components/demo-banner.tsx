import { getTranslations } from 'next-intl/server';

/**
 * Thin demo-environment strip. Rendered only when NEXT_PUBLIC_DEMO_MODE is
 * set (showcase deployments); forks without the flag render nothing — no
 * client JavaScript involved. Text comes from locale keys so it follows the
 * visitor's language.
 */
export async function DemoBanner() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') return null;

  const t = await getTranslations('Components');
  return (
    <div
      role="note"
      aria-label={t('demoBanner.title')}
      className="border-b border-warning/40 bg-warning/10 px-4 py-1.5 text-center"
    >
      <p className="text-xs font-medium text-warning">
        {t('demoBanner.title')} · {t('demoBanner.description')}
      </p>
    </div>
  );
}
