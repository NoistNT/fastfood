import type { ToastActionElement } from '@/modules/core/ui/toast';

import { toast } from '@/modules/core/hooks/use-toast';

// Centralized toast notifications for consistent user feedback
export const toastNotifications = {
  // Success messages
  success: {
    // Authentication
    login: () =>
      toast({ title: 'Welcome back!', description: 'You have been logged in successfully.' }),
    logout: () =>
      toast({ title: 'Logged out', description: 'You have been logged out successfully.' }),
    register: () =>
      toast({
        title: 'Account created',
        description: 'Your account has been created successfully.',
      }),
    passwordReset: () =>
      toast({ title: 'Password reset', description: 'Your password has been reset successfully.' }),

    // Products
    productCreated: () =>
      toast({ title: 'Product added', description: 'The product has been added successfully.' }),
    productUpdated: () =>
      toast({
        title: 'Product updated',
        description: 'The product has been updated successfully.',
      }),
    productDeleted: () =>
      toast({
        title: 'Product deleted',
        description: 'The product has been deleted successfully.',
      }),

    // Orders
    orderPlaced: () =>
      toast({ title: 'Order placed', description: 'Your order has been placed successfully.' }),
    orderCancelled: () =>
      toast({ title: 'Order cancelled', description: 'The order has been cancelled.' }),

    // Inventory
    inventoryUpdated: () =>
      toast({
        title: 'Inventory updated',
        description: 'Inventory has been updated successfully.',
      }),
    stockAlertResolved: () =>
      toast({ title: 'Alert resolved', description: 'The stock alert has been resolved.' }),

    // Customers
    customerCreated: () =>
      toast({ title: 'Customer added', description: 'The customer has been added successfully.' }),
    customerUpdated: () =>
      toast({
        title: 'Customer updated',
        description: 'The customer information has been updated.',
      }),
    customerDeleted: () =>
      toast({ title: 'Customer deleted', description: 'The customer has been deleted.' }),
    roleUpdated: () =>
      toast({ title: 'Role updated', description: 'The customer role has been updated.' }),

    // Data export
    exportCompleted: () =>
      toast({
        title: 'Export completed',
        description: 'Your data has been exported successfully.',
      }),

    // General
    saved: () => toast({ title: 'Saved', description: 'Changes have been saved successfully.' }),
  },

  // Error messages
  error: {
    // Authentication
    loginFailed: () =>
      toast({
        title: 'Login failed',
        description: 'Please check your credentials and try again.',
        variant: 'destructive',
      }),
    registerFailed: () =>
      toast({
        title: 'Registration failed',
        description: 'Unable to create account. Please try again.',
        variant: 'destructive',
      }),
    passwordResetFailed: () =>
      toast({
        title: 'Password reset failed',
        description: 'Unable to reset password. Please try again.',
        variant: 'destructive',
      }),

    // Network/API errors
    networkError: () =>
      toast({
        title: 'Connection error',
        description: 'Please check your internet connection and try again.',
        variant: 'destructive',
      }),
    serverError: () =>
      toast({
        title: 'Server error',
        description: 'Something went wrong on our end. Please try again later.',
        variant: 'destructive',
      }),

    // Validation errors
    validationError: (message: string) =>
      toast({
        title: 'Validation error',
        description: message,
        variant: 'destructive',
      }),
    requiredField: (field: string) =>
      toast({
        title: 'Required field',
        description: `${field} is required.`,
        variant: 'destructive',
      }),

    // Permission errors
    unauthorized: () =>
      toast({
        title: 'Access denied',
        description: 'You do not have permission to perform this action.',
        variant: 'destructive',
      }),
    forbidden: () =>
      toast({
        title: 'Forbidden',
        description: 'This action is not allowed.',
        variant: 'destructive',
      }),

    // Business logic errors
    insufficientStock: () =>
      toast({
        title: 'Insufficient stock',
        description: 'Not enough stock available for this order.',
        variant: 'destructive',
      }),
    duplicateEntry: (item: string) =>
      toast({
        title: 'Duplicate entry',
        description: `${item} already exists.`,
        variant: 'destructive',
      }),

    // General
    genericError: (message?: string) =>
      toast({
        title: 'Error',
        description: message ?? 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      }),
  },

  // Info messages
  info: {
    loading: (message: string) =>
      toast({
        title: 'Loading...',
        description: message,
      }),
    processing: (message: string) =>
      toast({
        title: 'Processing...',
        description: message,
      }),
    syncStarted: () =>
      toast({
        title: 'Sync started',
        description: 'Your data is being synchronized.',
      }),
    syncCompleted: () =>
      toast({
        title: 'Sync completed',
        description: 'Your data has been synchronized successfully.',
      }),
  },

  // Warning messages
  warning: {
    unsavedChanges: () =>
      toast({
        title: 'Unsaved changes',
        description: 'You have unsaved changes. Are you sure you want to leave?',
        variant: 'destructive',
      }),
    sessionExpiring: () =>
      toast({
        title: 'Session expiring',
        description: 'Your session will expire soon. Please save your work.',
      }),
    lowStock: (item: string) =>
      toast({
        title: 'Low stock warning',
        description: `Stock level for ${item} is getting low.`,
      }),
    rateLimit: () =>
      toast({
        title: 'Rate limit exceeded',
        description: 'Too many requests. Please wait before trying again.',
        variant: 'destructive',
      }),
  },

  // Custom toast with full control
  custom: (props: {
    title: string;
    description?: string;
    variant?: 'default' | 'destructive';
    action?: ToastActionElement;
  }) => toast(props),
};

// Helper function to show toast based on operation result
export const showToastFromResult = (
  result: { success: boolean; error?: { message?: string } },
  successMessage?: string
) => {
  if (result.success) {
    if (successMessage) {
      toast({ title: 'Success', description: successMessage });
    }
  } else {
    toast({
      title: 'Error',
      description: result.error?.message ?? 'An unexpected error occurred.',
      variant: 'destructive',
    });
  }
};

// Helper for form submissions
export const showFormToast = (
  isSuccess: boolean,
  successMessage: string,
  errorMessage?: string
) => {
  if (isSuccess) {
    toast({ title: 'Success', description: successMessage });
  } else {
    toast({
      title: 'Error',
      description: errorMessage ?? 'Form submission failed. Please try again.',
      variant: 'destructive',
    });
  }
};
