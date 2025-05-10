
/**
 * Formata um valor para o formato de moeda brasileira
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Formata uma data ISO para o formato brasileiro
 */
export const formatDate = (isoDate: string): string => {
  if (!isoDate) return '';
  try {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  } catch (error) {
    return isoDate;
  }
};

/**
 * Formata um número para ter um número específico de casas decimais
 */
export const formatNumber = (value: number, decimalPlaces = 2): string => {
  return value.toFixed(decimalPlaces);
};

/**
 * Formata um CPF/CNPJ
 */
export const formatCpfCnpj = (value: string): string => {
  if (!value) return '';
  
  // Remove caracteres não numéricos
  const numericValue = value.replace(/\D/g, '');
  
  // CPF: 000.000.000-00
  if (numericValue.length <= 11) {
    return numericValue
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  
  // CNPJ: 00.000.000/0000-00
  return numericValue
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
};

/**
 * Formata um telefone (XX) XXXXX-XXXX
 */
export const formatPhone = (value: string): string => {
  if (!value) return '';
  
  // Remove caracteres não numéricos
  const numericValue = value.replace(/\D/g, '');
  
  if (numericValue.length <= 10) {
    return numericValue
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  
  return numericValue
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
};

/**
 * Formata um CEP
 */
export const formatCep = (value: string): string => {
  if (!value) return '';
  
  // Remove caracteres não numéricos
  const numericValue = value.replace(/\D/g, '');
  
  return numericValue.replace(/^(\d{5})(\d)/, '$1-$2');
};
