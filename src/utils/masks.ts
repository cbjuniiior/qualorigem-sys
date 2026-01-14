/**
 * Utilitários para máscaras e formatação de campos
 */

/**
 * Aplica máscara de telefone/celular: (00) 00000-0000
 */
export const maskPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 10) {
    // Telefone fixo: (00) 0000-0000
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  } else {
    // Celular: (00) 00000-0000
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  }
};

/**
 * Remove máscara de telefone
 */
export const unmaskPhone = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Aplica máscara de CEP: 00000-000
 */
export const maskCEP = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/(\d{5})(\d)/, '$1-$2');
};

/**
 * Remove máscara de CEP
 */
export const unmaskCEP = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Detecta e formata CPF ou CNPJ automaticamente
 */
export const maskCPFCNPJ = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 11) {
    // CPF: 000.000.000-00
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  } else {
    // CNPJ: 00.000.000/0000-00
    return numbers
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }
};

/**
 * Remove máscara de CPF/CNPJ
 */
export const unmaskCPFCNPJ = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Formata valor como moeda brasileira (R$)
 */
export const maskCurrency = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  
  if (!numbers) return '';
  
  // Converte para centavos e depois divide por 100
  const amount = Number(numbers) / 100;
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Remove formatação de moeda e retorna apenas números
 */
export const unmaskCurrency = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Converte valor formatado de moeda para número
 */
export const currencyToNumber = (value: string): number => {
  const numbers = unmaskCurrency(value);
  return numbers ? Number(numbers) / 100 : 0;
};

/**
 * Converte número para string formatada como moeda
 */
export const numberToCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
