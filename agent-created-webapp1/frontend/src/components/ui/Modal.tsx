/**
 * Modal component with backdrop and focus management
 * Uses types from types.ts
 */
import React, { useEffect, useRef, useCallback } from 'react';
import { BaseComponentProps, AppError } from '../../utils/types';
import { getErrorMessage } from '../../utils/helpers';

// Modal sizes
export type ModalSize = 'small' | 'medium' | 'large' | 'full';

// Modal positions
export type ModalPosition = 'center' | 'top' | 'bottom';

// Modal interface
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  position?: ModalPosition;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  loading?: boolean;
  error?: AppError | null;
  footer?: React.ReactNode;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'medium',
  position = 'center',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  loading = false,
  error = null,
  footer,
  children,
  className = '',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle escape key
  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && closeOnEscape) {
      onClose();
    }
  }, [onClose, closeOnEscape]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && closeOnBackdrop) {
      onClose();
    }
  }, [onClose, closeOnBackdrop]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Focus the modal
      if (modalRef.current) {
        modalRef.current.focus();
      }
      
      // Add event listeners
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
        document.body.style.overflow = '';
        
        // Restore focus
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen, handleEscapeKey]);

  // Get modal classes
  const getModalClasses = (): string => {
    const baseClass = 'modal';
    const sizeClass = `modal-${size}`;
    const positionClass = `modal-${position}`;
    const stateClass = isOpen ? 'modal-open' : 'modal-closed';
    
    return [baseClass, sizeClass, positionClass, stateClass, className]
      .filter(Boolean)
      .join(' ');
  };

  // Get content classes
  const getContentClasses = (): string => {
    const baseClass = 'modal-content';
    const loadingClass = loading ? 'modal-loading' : '';
    const errorClass = error ? 'modal-error' : '';
    
    return [baseClass, loadingClass, errorClass].filter(Boolean).join(' ');
  };

  // Render close button
  const renderCloseButton = (): React.ReactNode => {
    if (!showCloseButton) return null;
    
    return (
      <button
        type="button"
        className="modal-close"
        onClick={onClose}
        aria-label="Close modal"
      >
        <span className="modal-close-icon">×</span>
      </button>
    );
  };

  // Render header
  const renderHeader = (): React.ReactNode => {
    if (!title && !showCloseButton) return null;
    
    return (
      <div className="modal-header">
        {title && (
          <h2 className="modal-title">
            {title}
          </h2>
        )}
        {renderCloseButton()}
      </div>
    );
  };

  // Render body
  const renderBody = (): React.ReactNode => {
    return (
      <div className="modal-body">
        {loading && (
          <div className="modal-loading-overlay">
            <div className="spinner"></div>
            <span>Loading...</span>
          </div>
        )}
        
        {error && (
          <div className="modal-error-message">
            <span className="error-icon">⚠️</span>
            <span>{getErrorMessage(error)}</span>
          </div>
        )}
        
        {children}
      </div>
    );
  };

  // Render footer
  const renderFooter = (): React.ReactNode => {
    if (!footer) return null;
    
    return (
      <div className="modal-footer">
        {footer}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel || title}
      aria-describedby={ariaDescribedBy}
    >
      <div
        ref={modalRef}
        className={getModalClasses()}
        tabIndex={-1}
        role="document"
        {...props}
      >
        <div className={getContentClasses()}>
          {renderHeader()}
          {renderBody()}
          {renderFooter()}
        </div>
      </div>
    </div>
  );
};

// Modal trigger component
export interface ModalTriggerProps extends BaseComponentProps {
  modal: React.ReactElement<ModalProps>;
  children: React.ReactElement;
}

export const ModalTrigger: React.FC<ModalTriggerProps> = ({
  modal,
  children,
  ...props
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      {React.cloneElement(children, {
        onClick: handleOpen,
        ...props
      })}
      {React.cloneElement(modal, {
        isOpen,
        onClose: handleClose
      })}
    </>
  );
};

// Export modal and modal trigger
export default Modal;
export { ModalTrigger };
