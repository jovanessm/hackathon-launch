import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getOpportunities = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: opps }, { data: evidence }, { data: comps }, { data: logs }] = await Promise.all([
      supabase.from("opportunities").select("*").order("baseline_score", { ascending: false }).limit(10),
      supabase.from("opportunity_evidence").select("*, data_sources(key,label)"),
      supabase.from("competencies").select("*"),
      supabase.from("evaluation_log").select("*, documents(filename)").eq("user_id", userId),
    ]);
    return { opps: opps ?? [], evidence: evidence ?? [], comps: comps ?? [], logs: logs ?? [] };
  });

export const listDataSources = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("data_sources").select("*").order("category");
    return data ?? [];
  });

export const listCompetencies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("competencies").select("*");
    return data ?? [];
  });

export const saveFilter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    name: z.string().min(1).max(80),
    payload: z.record(z.string(), z.unknown()),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("saved_filters").insert({
      name: data.name,
      payload: data.payload as never,
      user_id: context.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listSavedFilters = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("saved_filters").select("*").order("created_at", { ascending: false });
    return data ?? [];
  });

export const deleteSavedFilter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("saved_filters").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
