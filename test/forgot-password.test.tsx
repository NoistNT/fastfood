import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock the toast hook
const mockToast = vi.fn();
vi.mock('@/modules/core/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'title': 'Forgot Password?',
      'description': "Enter your email address and we'll send you a link to reset your password.",
      'emailLabel': 'Email',
      'emailPlaceholder': 'your@email.com',
      'submitButton': 'Send Reset Link',
      'submittingButton': 'Sending...',
      'backToLogin': 'Back to Sign In',
      'toast.success.title': 'Reset Email Sent',
      'toast.success.description':
        'If your email is registered, you will receive a password reset link.',
      'toast.error.title': 'Error',
      'toast.error.description': 'An error occurred. Please try again.',
      'emailSent.title': 'Check Your Email',
      'emailSent.description': "We've sent a password reset link to",
      'emailSent.notReceived': "Didn't receive the email?",
      'emailSent.checkSpam': 'Check your spam folder',
      'emailSent.tryAgain': 'try again',
    };
    return translations[key] || key;
  },
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

import ForgotPasswordPage from '@/app/forgot-password/page';

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { message: 'Email sent' } }),
    } as Response);
  });

  it('renders the forgot password form', () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /forgot password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    render(<ForgotPasswordPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('submits the form successfully and shows email sent state', async () => {
    render(<ForgotPasswordPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/password-reset/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'test@example.com' }),
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      expect(screen.getByText(/test@example\.com/)).toBeInTheDocument();
    });
  });

  it('shows error message on API failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: { message: 'API Error' } }),
    } as Response);

    render(<ForgotPasswordPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'API Error',
        variant: 'destructive',
      });
    });
  });

  it('navigates back to login', () => {
    render(<ForgotPasswordPage />);

    const backButton = screen.getByRole('button', { name: /back to sign in/i });
    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledWith('/login');
  });
});
