import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Input } from '@/modules/core/ui/input';

describe('Input', () => {
  it('renders with default props', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass(
      'h-9',
      'w-full',
      'rounded-md',
      'border',
      'bg-transparent',
      'px-3',
      'py-1'
    );
  });

  it('renders with custom className', () => {
    render(<Input className="custom-input" />);
    expect(screen.getByRole('textbox')).toHaveClass('custom-input');
  });

  it('renders with placeholder', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  it('renders with different input types', () => {
    const { rerender } = render(<Input type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" />);
    expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'password');

    rerender(<Input type="number" />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number');
  });

  it('handles value changes', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'test value' } });
    expect(input).toHaveValue('test value');
  });

  it('handles controlled input', () => {
    const ControlledInput = () => {
      const [value, setValue] = React.useState('');
      return (
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      );
    };

    render(<ControlledInput />);
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'test value' } });
    expect(input).toHaveValue('test value');
  });

  it('handles disabled state', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass(
      'disabled:pointer-events-none',
      'disabled:cursor-not-allowed',
      'disabled:opacity-50'
    );
  });

  it('handles readOnly state', () => {
    render(
      <Input
        readOnly
        value="readonly text"
      />
    );
    const input = screen.getByDisplayValue('readonly text');
    expect(input).toHaveAttribute('readonly');
  });

  it('handles required attribute', () => {
    render(<Input required />);
    expect(screen.getByRole('textbox')).toBeRequired();
  });

  it('handles invalid state with aria-invalid', () => {
    render(<Input aria-invalid="true" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveClass(
      'aria-invalid:ring-destructive/20',
      'aria-invalid:border-destructive'
    );
  });

  it('handles focus and blur events', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');

    input.focus();
    expect(input).toHaveFocus();

    input.blur();
    expect(input).not.toHaveFocus();
  });

  it('passes through additional props', () => {
    render(
      <Input
        data-testid="custom-input"
        name="test-input"
      />
    );
    const input = screen.getByTestId('custom-input');
    expect(input).toHaveAttribute('name', 'test-input');
  });

  it('renders with file input styling', () => {
    render(<Input type="file" />);
    const input = screen.getByDisplayValue('');
    expect(input).toHaveClass('file:text-foreground', 'file:inline-flex', 'file:h-7');
  });
});
