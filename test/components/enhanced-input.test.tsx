import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EnhancedInput } from '@/modules/core/ui/enhanced-input';

describe('EnhancedInput', () => {
  it('renders basic input with label', () => {
    render(<EnhancedInput label="Test Label" />);

    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<EnhancedInput className="custom-class" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-class');
  });

  it('shows error state with message', () => {
    const error = { message: 'This field is required', type: 'required' };
    render(<EnhancedInput error={error} />);

    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('shows success state with checkmark', () => {
    render(<EnhancedInput success />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-green-500');

    // Check for success icon (rendered as SVG)
    const successIcon = document.querySelector('svg');
    expect(successIcon).toBeInTheDocument();
  });

  it('shows loading state with spinner', () => {
    render(<EnhancedInput loading />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('opacity-70', 'cursor-not-allowed');

    // Check for loading spinner
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('displays helper text when provided', () => {
    render(<EnhancedInput helperText="This is helpful information" />);

    expect(screen.getByText('This is helpful information')).toBeInTheDocument();
  });

  it('does not show helper text when error is present', () => {
    const error = { message: 'Error occurred', type: 'custom' };
    render(
      <EnhancedInput
        error={error}
        helperText="This should not show"
      />
    );

    expect(screen.queryByText('This should not show')).not.toBeInTheDocument();
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
  });

  it('generates correct input id from label', () => {
    render(<EnhancedInput label="Email Address" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id', 'email-address');
  });

  it('uses custom id when provided', () => {
    render(
      <EnhancedInput
        id="custom-id"
        label="Test Label"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id', 'custom-id');
  });

  it('passes through input props correctly', () => {
    render(
      <EnhancedInput
        type="email"
        placeholder="Enter email"
        required
        disabled
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('placeholder', 'Enter email');
    expect(input).toHaveAttribute('required');
    expect(input).toHaveAttribute('disabled');
  });

  it('handles keyboard navigation correctly', () => {
    render(<EnhancedInput label="Test Input" />);

    const input = screen.getByRole('textbox');
    input.focus();

    expect(document.activeElement).toBe(input);
  });

  it('applies correct ARIA attributes for accessibility', () => {
    const error = { message: 'Required field', type: 'required' };
    render(
      <EnhancedInput
        label="Required Field"
        error={error}
        helperText="Helper text"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'required-field-error');
  });
});
