
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
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const msgData = encoder.encode(signedPayload);
    
    return crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ).then(key => 
      crypto.subtle.sign('HMAC', key, msgData)
    ).then(signature => {
      const hashArray = Array.from(new Uint8Array(signature));
      const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Compare signatures using timing-safe comparison
      if (hash.length !== expectedSignature.length) {
        return false;
      }
      
      let result = 0;
      for (let i = 0; i < hash.length; i++) {
        result |= hash.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
      }
      
      return result === 0;
    }).catch(error => {
      console.error('Error validating signature:', error);
      return false;
    });

  } catch (error) {
    console.error('Error validating webhook signature:', error);
    return false;
  }
};

export const generateEventId = (paymentId: string, timestamp: number): string => {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${paymentId}_${timestamp}`);
  
  return crypto.subtle.digest('SHA-256', data).then(hashBuffer => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
  }).catch(() => {
    // Fallback to simple string hash if crypto.subtle fails
    const str = `${paymentId}_${timestamp}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).substring(0, 32);
  });
};
