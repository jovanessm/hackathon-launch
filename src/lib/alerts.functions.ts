import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listAlerts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: alerts } = await context.supabase
      .from("alerts").select("*, data_sources(key,label)").order("signal_strength", { ascending: false });
    const { data: states } = await context.supabase.from("user_alert_state").select("*");
    return { alerts: alerts ?? [], states: states ?? [] };
  });

export const markAlert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    alert_id: z.string().uuid(),
    action: z.enum(["read", "dismiss"]),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const update = data.action === "read"
      ? { read_at: new Date().toISOString() }
      : { dismissed_at: new Date().toISOString() };
    const { error } = await context.supabase.from("user_alert_state").upsert({
      user_id: context.userId, alert_id: data.alert_id, ...update,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
