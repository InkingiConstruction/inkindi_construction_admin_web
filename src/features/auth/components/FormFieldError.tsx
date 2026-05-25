/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : FormFieldError.tsx
 * WHAT THIS FILE DOES : Renders a reusable admin portal UI component
 * HOW IT DOES IT      : Uses focused TypeScript and React code for one responsibility
 * DATA SOURCE         : Local props, context, mock data, or user input as applicable
 * DATA DESTINATION    : Admin portal UI, context state, or exported helpers
 * PRINCIPLE APPLIED   : SOLID
 * ============================================================================
 */
import React from 'react';

interface Props {
  error?: string;
  touched?: boolean;
}

const FormFieldError: React.FC<Props> = ({
  error,
  touched,
}) => {
  if (!error || !touched) return null;

  return (
    <p className="text-sm text-red-500 font-medium mt-1">
      {error}
    </p>
  );
};

export default FormFieldError;
