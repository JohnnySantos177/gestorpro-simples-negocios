
import { enhancedValidation } from './enhancedInputValidation';

// Re-export enhanced validation functions for backward compatibility
export const sanitizeInput = enhancedValidation.sanitizeInput;
export const validateEmail = (email: string): boolean => enhancedValidation.validateEmail(email).valid;
export const validatePassword = (password: string): { valid: boolean; message?: string } => enhancedValidation.validatePassword(password);
export const validateUUID = enhancedValidation.validateUUID;
export const validateAmount = (amount: number): boolean => enhancedValidation.validateAmount(amount).valid;

// Additional enhanced validation exports
export { enhancedValidation };
