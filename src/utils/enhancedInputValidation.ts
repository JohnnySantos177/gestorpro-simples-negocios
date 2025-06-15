
// Enhanced input validation with more comprehensive checks
export const enhancedValidation = {
  sanitizeInput: (input: string): string => {
    if (!input || typeof input !== 'string') return '';
    
    // Remove potentially dangerous characters and scripts
    return input
      .trim()
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .replace(/data:text\/html/gi, '')
      .slice(0, 10000); // Limit length to prevent DoS
  },

  validateEmail: (email: string): { valid: boolean; message?: string } => {
    if (!email) return { valid: false, message: 'Email é obrigatório' };
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(email)) {
      return { valid: false, message: 'Formato de email inválido' };
    }
    
    if (email.length > 254) {
      return { valid: false, message: 'Email muito longo' };
    }
    
    return { valid: true };
  },

  validatePassword: (password: string): { valid: boolean; message?: string } => {
    if (!password) return { valid: false, message: 'Senha é obrigatória' };

    // Apenas tamanho mínimo de 6 caracteres, sem outras exigências!
    if (password.length < 6) {
      return { valid: false, message: "Senha deve ter pelo menos 6 caracteres" };
    }
    if (password.length > 128) {
      return { valid: false, message: 'Senha muito longa' };
    }

    return { valid: true };
  },

  validateUUID: (uuid: string): boolean => {
    if (!uuid) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  validateAmount: (amount: number): { valid: boolean; message?: string } => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return { valid: false, message: 'Valor deve ser um número válido' };
    }
    
    if (amount < 0) {
      return { valid: false, message: 'Valor não pode ser negativo' };
    }
    
    if (amount > 1000000) {
      return { valid: false, message: 'Valor muito alto' };
    }
    
    return { valid: true };
  },

  sanitizeFileName: (fileName: string): string => {
    if (!fileName) return '';
    
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/\.{2,}/g, '.')
      .slice(0, 255);
  },

  validateFileUpload: (file: File): { valid: boolean; message?: string } => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (file.size > maxSize) {
      return { valid: false, message: 'Arquivo muito grande (máximo 5MB)' };
    }
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, message: 'Tipo de arquivo não permitido' };
    }
    
    return { valid: true };
  }
};

