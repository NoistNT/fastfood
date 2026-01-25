'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function KeyboardShortcuts() {
  const router = useRouter();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ctrl+K or Cmd+K for search/command palette
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();

        // Focus search input if it exists, otherwise navigate to products
        const searchInput = document.querySelector(
          'input[type="search"], input[placeholder*="search" i]'
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        } else {
          // Navigate to products page for ordering
          router.push('/products');
        }
      }

      // Alt+H for home
      if (event.altKey && event.key === 'h') {
        event.preventDefault();
        router.push('/');
      }

      // Alt+O for order
      if (event.altKey && event.key === 'o') {
        event.preventDefault();
        router.push('/order');
      }

      // Alt+D for dashboard
      if (event.altKey && event.key === 'd') {
        event.preventDefault();
        router.push('/dashboard');
      }

      // Alt+P for profile
      if (event.altKey && event.key === 'p') {
        event.preventDefault();
        router.push('/profile');
      }

      // Escape key handling for modals and overlays
      if (event.key === 'Escape') {
        // Close any open dialogs
        const openDialog = document.querySelector(
          '[role="dialog"][aria-hidden="false"], [data-radix-dialog-content]'
        );
        if (openDialog) {
          const closeButton = openDialog.querySelector(
            '[data-radix-dialog-close], button[aria-label*="close" i]'
          ) as HTMLElement;
          if (closeButton) {
            closeButton.click();
          }
        }

        // Close dropdown menus
        const openDropdown = document.querySelector(
          '[data-radix-collection-item][data-state="open"]'
        );
        if (openDropdown) {
          const trigger = document.querySelector(
            '[data-radix-collection-item][aria-expanded="true"]'
          ) as HTMLElement;
          if (trigger) {
            trigger.click();
          }
        }
      }

      // Tab navigation improvements
      if (event.key === 'Tab') {
        // Ensure focus stays within modal when open
        const activeModal = document.querySelector('[role="dialog"][aria-hidden="false"]');
        if (activeModal) {
          const focusableElements = activeModal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (event.shiftKey) {
            // Shift+Tab
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus();
            }
          } else {
            // Tab
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement.focus();
            }
          }
        }
      }
    },
    [router]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return null; // This component doesn't render anything
}

// Keyboard shortcuts help component
export function KeyboardShortcutsHelp() {
  return (
    <div
      className="sr-only"
      id="keyboard-shortcuts-help"
    >
      <h3>Keyboard Shortcuts</h3>
      <ul>
        <li>Ctrl+K or Cmd+K: Open search or navigate to products</li>
        <li>Alt+H: Go to home page</li>
        <li>Alt+O: Go to order page</li>
        <li>Alt+D: Go to dashboard</li>
        <li>Alt+P: Go to profile page</li>
        <li>Escape: Close modals and dropdowns</li>
        <li>Tab: Navigate through focusable elements</li>
        <li>Shift+Tab: Navigate backwards through focusable elements</li>
      </ul>
    </div>
  );
}
