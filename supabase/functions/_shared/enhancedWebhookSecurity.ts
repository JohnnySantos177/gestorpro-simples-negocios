
import { createServiceClient } from './auth.ts';

export interface EnhancedWebhookValidationOptions {
  signature: string;
  body: string;
  secret: string;
  eventId?: string;
  timestamp?: number;
}

export const enhancedWebhookSecurity = {
  validateSignature: async ({ signature, body, secret }: EnhancedWebhookValidationOptions): Promise<boolean> => {
    try {
      // Parse the signature header - format: "ts=timestamp,v1=hash"
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
        console.error('Webhook timestamp too old:', { current: currentTime, webhook: webhookTime });
        return false;
      }

      // Create the signed payload
      const signedPayload = `${timestamp}.${body}`;
      
      // Calculate expected signature using Web Crypto API
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secret);
      const msgData = encoder.encode(signedPayload);
      
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      const signature_buffer = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
      const hashArray = Array.from(new Uint8Array(signature_buffer));
      const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Timing-safe comparison
      if (hash.length !== expectedSignature.length) {
        return false;
      }
      
      let result = 0;
      for (let i = 0; i < hash.length; i++) {
        result |= hash.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
      }
      
      return result === 0;
    } catch (error) {
      console.error('Error validating webhook signature:', error);
      return false;
    }
  },

  checkReplayAttack: async (eventId: string, paymentId: string): Promise<boolean> => {
    const supabase = createServiceClient();
    
    try {
      // Check if this event was already processed
      const { data: existingEvent } = await supabase
        .from('webhook_events')
        .select('id')
        .eq('event_id', eventId)
        .single();

      return existingEvent !== null;
    } catch (error) {
      console.error('Error checking replay attack:', error);
      return false;
    }
  },

  recordWebhookEvent: async (eventId: string, eventType: string, paymentId?: string, signatureHash?: string): Promise<void> => {
    const supabase = createServiceClient();
    
    try {
      await supabase
        .from('webhook_events')
        .insert({
          event_id: eventId,
          event_type: eventType,
          payment_id: paymentId,
          signature_hash: signatureHash
        });
    } catch (error) {
      console.error('Error recording webhook event:', error);
      throw error;
    }
  },

  generateSecureEventId: async (paymentId: string, timestamp: number): Promise<string> => {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(`${paymentId}_${timestamp}_${crypto.randomUUID()}`);
      
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
    } catch (error) {
      console.error('Error generating secure event ID:', error);
      // Fallback to simple hash
      const str = `${paymentId}_${timestamp}_${Math.random()}`;
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(16).substring(0, 32);
    }
  }
};
