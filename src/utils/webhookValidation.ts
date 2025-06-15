
import crypto from 'crypto';

export interface WebhookValidationOptions {
  signature: string;
  body: string;
  secret: string;
}

export const validateWebhookSignature = ({ signature, body, secret }: WebhookValidationOptions): boolean => {
  try {
    // Parse the signature header - Mercado Pago format: "ts=timestamp,v1=hash"
    const sigParts = signature.split(',');
    const timestamp = sigParts.find(part => part.startsWith('ts='))?.split('=')[1];
    const hash = sigParts.find(part => part.startsWith('v1='))?.split('=')[1];

    if (!timestamp || !hash) {
      console.error('Invalid signature format');
      return false;
    }

    // Check timestamp (prevent replay attacks beyond 5 minutes)
    const currentTime = Math.floor(Date.now() / 1000);
    const webhookTime = parseInt(timestamp);
    
    if (Math.abs(currentTime - webhookTime) > 300) { // 5 minutes
      console.error('Webhook timestamp too old');
      return false;
    }

    // Create the signed payload
    const signedPayload = `id:${timestamp};request-id:${body}`;
    
    // Calculate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload, 'utf8')
      .digest('hex');

    // Compare signatures
    return crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('Error validating webhook signature:', error);
    return false;
  }
};

export const generateEventId = (paymentId: string, timestamp: number): string => {
  return crypto
    .createHash('sha256')
    .update(`${paymentId}_${timestamp}`)
    .digest('hex')
    .substring(0, 32);
};
