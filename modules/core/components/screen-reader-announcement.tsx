'use client';

import { useEffect, useRef } from 'react';

interface ScreenReaderAnnouncementProps {
  message: string;
  priority?: 'polite' | 'assertive';
  delay?: number;
}

export function ScreenReaderAnnouncement({
  message,
  priority = 'polite',
  delay = 100,
}: ScreenReaderAnnouncementProps) {
  const announcementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!message || !announcementRef.current) return;

    const timer = setTimeout(() => {
      if (announcementRef.current) {
        announcementRef.current.textContent = message;
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [message, delay]);

  return (
    <div
      ref={announcementRef}
      aria-live={priority}
      aria-atomic="true"
      className="sr-live-region"
    />
  );
}

// Hook for announcing dynamic content changes
export function useScreenReaderAnnouncement() {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // Create a temporary element for announcement
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-live-region';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  return { announce };
}
