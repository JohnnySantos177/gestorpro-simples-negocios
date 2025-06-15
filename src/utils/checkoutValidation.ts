
import { z } from 'zod';

export const checkoutRequestSchema = z.object({
  price: z.number()
    .int('Preço deve ser um número inteiro')
    .min(100, 'Preço mínimo é R$ 1,00')
    .max(100000000, 'Preço máximo é R$ 1.000.000,00'),
  planType: z.enum(['monthly', 'quarterly', 'semiannual'], {
    errorMap: () => ({ message: 'Tipo de plano deve ser monthly, quarterly ou semiannual' })
  })
});

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

export const validateCheckoutRequest = (data: unknown): CheckoutRequest => {
  return checkoutRequestSchema.parse(data);
};

export const sanitizeExternalReference = (reference: string): boolean => {
  // Validate external reference format: payment_{userId}_{planType}_{timestamp}
  const referencePattern = /^payment_[a-f0-9-]{36}_(?:monthly|quarterly|semiannual)_\d{13}$/;
  return referencePattern.test(reference);
};
