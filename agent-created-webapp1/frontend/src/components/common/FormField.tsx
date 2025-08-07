/**
 * Reusable form field component
 * Uses validation utilities and types
 */
import React from 'react';
import { FormField as FormFieldType, ValidationError } from '../../utils/types';
import { validateField } from '../../utils/validation';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'password' | 'email' | 'textarea';
  value: string;
  onChange: (name: string, value: string) => void;
  onBlur?: (name: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  required = false,
  placeholder,
  disabled = false,
  className = ''
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(name, newValue);
  };

  const handleBlur = () => {
    if (onBlur) {
      onBlur(name);
    }
  };

  const fieldId = `field-${name}`;
  const hasError = !!error;

  return (
    <div className={`form-field ${className} ${hasError ? 'has-error' : ''}`}>
      <label htmlFor={fieldId} className="form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          id={fieldId}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`form-control ${hasError ? 'error' : ''}`}
          rows={4}
        />
      ) : (
        <input
          id={fieldId}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`form-control ${hasError ? 'error' : ''}`}
        />
      )}
      
      {hasError && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default FormField;
