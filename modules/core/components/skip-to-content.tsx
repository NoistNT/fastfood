'use client';

export function SkipToContent() {
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
      Skip to main content
    </a>
  );
}
