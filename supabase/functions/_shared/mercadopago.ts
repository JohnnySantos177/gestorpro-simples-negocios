
export const getMercadoPagoToken = () => {
  const token = Deno.env.get("MERCADO_PAGO_PRODUCTION_ACCESS_TOKEN");
  
  if (!token) {
    throw new Error("Mercado Pago production access token not configured");
  }
  
  return token;
};

export const createMercadoPagoRequest = (url: string, options: RequestInit = {}) => {
  const token = getMercadoPagoToken();
  
  return fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};

export const calculateSubscriptionEndDate = (planType: string, startDate = new Date()) => {
  const endDate = new Date(startDate);
  
  switch (planType) {
    case 'quarterly':
      endDate.setMonth(endDate.getMonth() + 3);
      break;
    case 'semiannual':
      endDate.setMonth(endDate.getMonth() + 6);
      break;
    default: // monthly
      endDate.setMonth(endDate.getMonth() + 1);
      break;
  }
  
  return endDate;
};
