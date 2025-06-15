
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (!password || password.length < 6) {
    return { valid: false, message: 'Senha deve ter pelo menos 6 caracteres' };
  }
  if (password.length > 128) {
    return { valid: false, message: 'Senha muito longa' };
  }
  return { valid: true };
};

export const validateUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const validateAmount = (amount: number): boolean => {
  return typeof amount === 'number' && amount >= 0 && amount <= 1000000 && !isNaN(amount);
};
