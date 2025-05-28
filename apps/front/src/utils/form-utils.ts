import { z } from 'zod';

/**
 * Validates a phone number in Brazilian format
 * @param phone Phone number to validate
 * @returns True if valid, false otherwise
 */
export const validatePhoneNumber = (phone: string): boolean => {
  return /^\(\d{2}\) \d{5}-\d{4}$/.test(phone);
};

/**
 * Validates an email address
 * @param email Email to validate
 * @returns True if valid, false otherwise
 */
export const validateEmail = (email: string): boolean => {
  return /\S+@\S+\.\S+/.test(email);
};

/**
 * Validates if a string is a number
 * @param value String to validate
 * @returns True if valid, false otherwise
 */
export const isNumeric = (value: string): boolean => {
  return !isNaN(Number(value));
};

/**
 * Creates a string field validator with minimum length
 * @param fieldName Name of the field for the error message
 * @param minLength Minimum length required
 * @returns Zod string schema with validation
 */
export const createRequiredStringField = (fieldName: string, minLength = 1) => {
  return z.string().min(minLength, { message: `${fieldName} é obrigatório` });
};

/**
 * Creates an email field validator
 * @returns Zod string schema with email validation
 */
export const createEmailField = () => {
  return z
    .string()
    .min(1, { message: 'E-mail é obrigatório' })
    .email({ message: 'E-mail inválido' });
};

/**
 * Creates a phone field validator
 * @returns Zod string schema with phone validation
 */
export const createPhoneField = () => {
  return z
    .string()
    .optional()
    .refine((val) => !val || validatePhoneNumber(val), {
      message: 'Telefone inválido (formato: (99) 99999-9999)',
    })
    .transform(val => val || ''); // Transform undefined to empty string
};

/**
 * Creates a numeric field validator
 * @param fieldName Name of the field for the error message
 * @returns Zod string schema with numeric validation
 */
export const createNumericField = (fieldName: string) => {
  return z.string().refine((val) => !val || isNumeric(val), {
    message: `${fieldName} deve ser um número`,
  });
};

/**
 * Creates an optional string field that transforms undefined to empty string
 * @returns Zod string schema with transformation
 */
export const createOptionalStringField = () => {
  return z.string().optional().transform(val => val || '');
}; 