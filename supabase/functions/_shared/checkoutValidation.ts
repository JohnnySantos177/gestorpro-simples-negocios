
interface CheckoutRequest {
  price: number;
  planType: 'monthly' | 'quarterly' | 'semiannual';
}

export const validateCheckoutRequest = (data: any): CheckoutRequest => {
  // Validate price
  const price = typeof data.price === 'number' ? data.price : parseInt(data.price);
  if (isNaN(price) || price < 100 || price > 100000000) {
    throw new Error('Preço deve estar entre R$ 1,00 e R$ 1.000.000,00');
  }

  // Validate plan type
  const validPlanTypes = ['monthly', 'quarterly', 'semiannual'];
  if (!validPlanTypes.includes(data.planType)) {
    throw new Error('Tipo de plano deve ser monthly, quarterly ou semiannual');
  }

  return {
    price,
    planType: data.planType
  };
};

export const sanitizeExternalReference = (reference: string): boolean => {
  // Validate external reference format: payment_{userId}_{planType}_{timestamp}
  const referencePattern = /^payment_[a-f0-9-]{36}_(?:monthly|quarterly|semiannual)_\d{13}$/;
  return referencePattern.test(reference);
};
