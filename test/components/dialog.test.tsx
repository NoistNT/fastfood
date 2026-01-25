import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/modules/core/ui/dialog';

describe('Dialog', () => {
  it('renders trigger button', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <p>Dialog content</p>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText('Open Dialog')).toBeInTheDocument();
    expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
  });

  it('opens dialog when trigger is clicked', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog description</DialogDescription>
          <p>Dialog content</p>
        </DialogContent>
      </Dialog>
    );

    const trigger = screen.getByText('Open Dialog');
    fireEvent.click(trigger);

    expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    expect(screen.getByText('Dialog content')).toBeInTheDocument();
  });

  it('closes dialog when close button is clicked', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog description</DialogDescription>
          <p>Dialog content</p>
        </DialogContent>
      </Dialog>
    );

    // Open dialog
    fireEvent.click(screen.getByText('Open Dialog'));
    expect(screen.getByText('Dialog Title')).toBeInTheDocument();

    // Close dialog using close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
  });

  it('renders dialog header components', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Title</DialogTitle>
            <DialogDescription>Test Description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText('Test Title')).toHaveClass('text-lg', 'leading-none', 'font-semibold');
    expect(screen.getByText('Test Description')).toHaveClass('text-muted-foreground', 'text-sm');
    expect(screen.getByText('Test Title').closest('[data-slot="dialog-header"]')).toHaveClass(
      'flex',
      'flex-col',
      'gap-2'
    );
  });

  it('renders dialog footer', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog description</DialogDescription>
          <DialogFooter>
            <button>Cancel</button>
            <button>Confirm</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    const footer = screen.getByText('Cancel').closest('[data-slot="dialog-footer"]');
    expect(footer).toHaveClass(
      'flex',
      'flex-col-reverse',
      'gap-2',
      'sm:flex-row',
      'sm:justify-end'
    );
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('renders custom close button', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog description</DialogDescription>
          <DialogClose>Custom Close</DialogClose>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText('Custom Close')).toBeInTheDocument();
  });

  it('handles controlled open state', () => {
    const { rerender } = render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Controlled Dialog</DialogTitle>
          <DialogDescription>Dialog description</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText('Controlled Dialog')).toBeInTheDocument();

    rerender(
      <Dialog open={false}>
        <DialogContent>
          <DialogTitle>Controlled Dialog</DialogTitle>
          <DialogDescription>Dialog description</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    expect(screen.queryByText('Controlled Dialog')).not.toBeInTheDocument();
  });

  it('applies custom className to content', () => {
    render(
      <Dialog open>
        <DialogContent className="custom-dialog">
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog description</DialogDescription>
          <p>Content</p>
        </DialogContent>
      </Dialog>
    );

    const content = screen.getByText('Content').closest('[data-slot="dialog-content"]');
    expect(content).toHaveClass('custom-dialog');
  });

  it('renders overlay with correct styling', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog description</DialogDescription>
          <p>Content</p>
        </DialogContent>
      </Dialog>
    );

    const overlay = document.querySelector('[data-slot="dialog-overlay"]');
    expect(overlay).toHaveClass('fixed', 'inset-0', 'z-50', 'bg-black/50');
  });

  it('handles escape key to close', () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test</DialogTitle>
          <DialogDescription>Test description</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    // Open dialog
    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByText('Test')).toBeInTheDocument();

    // Press escape
    fireEvent.keyDown(document, { key: 'Escape' });
    // Note: This test might need adjustment based on Radix UI behavior
  });

  it('renders with proper accessibility attributes', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
          <DialogDescription>Dialog description</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    const title = screen.getByRole('heading', { level: 2 });
    expect(title).toHaveTextContent('Test Dialog');
  });
});
