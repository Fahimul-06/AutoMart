import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function formatPhone(val: string): string {
  const digits = val.replace(/\D/g, "");
  if (digits.startsWith("0")) return "+88" + digits;
  if (digits.startsWith("880")) return "+" + digits;
  return digits;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();
    if (!phone) {
      return new Response(JSON.stringify({ error: "Phone number is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedPhone = formatPhone(phone);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Invalidate previous unused OTPs for this phone
    await supabase
      .from("otp_codes")
      .update({ used: true })
      .eq("phone", normalizedPhone)
      .eq("used", false);

    const { error: insertError } = await supabase
      .from("otp_codes")
      .insert({ phone: normalizedPhone, code, expires_at: expires });

    if (insertError) {
      return new Response(JSON.stringify({ error: "Failed to store OTP" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send SMS via Postgres pg_net (routes through project IP, not edge function IPs)
    const smsPhone = normalizedPhone.replace("+", "");
    const message = `Your AutoMart verification code is: ${code}. Valid for 10 minutes. Do not share with anyone.`;

    const { data: smsResult, error: rpcError } = await supabase.rpc("send_sms", {
      p_phone: smsPhone,
      p_message: message,
    });

    if (rpcError) {
      console.error("SMS RPC error:", rpcError);
    } else {
      console.log("SMS result:", JSON.stringify(smsResult));
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
