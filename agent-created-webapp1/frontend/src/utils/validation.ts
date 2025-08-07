/**
 * Validation utilities for forms and data
 * Uses types from types.ts
 */
import { FormField, FormState, ValidationError, LoginCredentials, RegisterCredentials, CreateItemRequest } from './types';

// Validation rules
export const VALIDATION_RULES = {
  username: {
    required: true,
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_]+$/
  },
  password: {
    required: true,
    minLength: 6,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/ // At least one lowercase, uppercase, and digit
  },
  email: {
    required: false,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  title: {
    required: true,
    maxLength: 100
  },
  content: {
    required: true,
    minLength: 1
  }
};

// Validation functions
export const validateField = (value: string, fieldName: keyof typeof VALIDATION_RULES): string | null => {
  const rules = VALIDATION_RULES[fieldName];
  
  if (rules.required && (!value || value.trim() === '')) {
    return `${fieldName} is required`;
  }
  
  if (value && rules.minLength && value.length < rules.minLength) {
    return `${fieldName} must be at least ${rules.minLength} characters`;
  }
  
  if (value && rules.maxLength && value.length > rules.maxLength) {
    return `${fieldName} cannot exceed ${rules.maxLength} characters`;
  }
  
  if (value && rules.pattern && !rules.pattern.test(value)) {
    return `${fieldName} format is invalid`;
  }
  
  return null;
};

export const validateLoginForm = (credentials: LoginCredentials): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  const usernameError = validateField(credentials.username, 'username');
  if (usernameError) {
    errors.push({ field: 'username', message: usernameError });
  }
  
  const passwordError = validateField(credentials.password, 'password');
  if (passwordError) {
    errors.push({ field: 'password', message: passwordError });
  }
  
  return errors;
};

export const validateRegisterForm = (credentials: RegisterCredentials): ValidationError[] => {
  const errors = validateLoginForm(credentials);
  
  if (credentials.password !== credentials.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
  }
  
  return errors;
};

export const validateItemForm = (item: CreateItemRequest): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  const titleError = validateField(item.title, 'title');
  if (titleError) {
    errors.push({ field: 'title', message: titleError });
  }
  
  const contentError = validateField(item.content, 'content');
  if (contentError) {
    errors.push({ field: 'content', message: contentError });
  }
  
  return errors;
};

// Form state management
export const createFormField = (value: string = '', required: boolean = false): FormField => ({
  value,
  error: undefined,
  touched: false,
  required
});

export const updateFormField = (
  formState: FormState,
  fieldName: string,
  value: string
): FormState => {
  const field = formState[fieldName];
  const error = validateField(value, fieldName as keyof typeof VALIDATION_RULES);
  
  return {
    ...formState,
    [fieldName]: {
      ...field,
      value,
      error: error || undefined,
      touched: true
    }
  };
};

export const validateFormState = (formState: FormState): boolean => {
  return Object.values(formState).every(field => !field.error);
};

export const getFormErrors = (formState: FormState): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  Object.entries(formState).forEach(([fieldName, field]) => {
    if (field.error) {
      errors.push({ field: fieldName, message: field.error });
    }
  });
  
  return errors;
};

// Utility functions
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const formatValidationErrors = (errors: ValidationError[]): string => {
  return errors.map(error => `${error.field}: ${error.message}`).join(', ');
};

export const isFormValid = (formState: FormState): boolean => {
  return Object.values(formState).every(field => 
    field.required ? field.value && !field.error : !field.error
  );
};

// Export validation utilities
export {
  validateField,
  validateLoginForm,
  validateRegisterForm,
  validateItemForm,
  createFormField,
  updateFormField,
  validateFormState,
  getFormErrors,
  sanitizeInput,
  formatValidationErrors,
  isFormValid
};
