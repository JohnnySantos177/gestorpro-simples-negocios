
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export const handleCors = (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
};

export const createResponse = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
};

export const createErrorResponse = (error: string, status = 500) => {
  return new Response(JSON.stringify({ error }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
};
