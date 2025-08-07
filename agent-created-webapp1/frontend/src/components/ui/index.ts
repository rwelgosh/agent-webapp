/**
 * UI components index
 * Exports all UI components
 */

// Button components
export { default as Button, ButtonGroup } from './Button';
export type { ButtonProps, ButtonGroupProps, ButtonVariant, ButtonSize, ButtonType } from './Button';

// Modal components
export { default as Modal, ModalTrigger } from './Modal';
export type { ModalProps, ModalTriggerProps, ModalSize, ModalPosition } from './Modal';

// Re-export common components
export { FormField, LoadingSpinner, ErrorBoundary } from '../common';
export type { FormFieldProps, LoadingSpinnerProps, ErrorBoundaryProps } from '../common/types';
