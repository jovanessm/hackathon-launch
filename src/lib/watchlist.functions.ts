import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listWatchlist = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: items } = await context.supabase
      .from("watchlist_items").select("*").order("created_at", { ascending: false });
    const ids = (items ?? []).map((i) => i.id);
    const { data: events } = ids.length
      ? await context.supabase.from("phase_events").select("*").in("watchlist_item_id", ids).order("occurred_at", { ascending: false })
      : { data: [] as { id: string; watchlist_item_id: string; from_phase: string | null; to_phase: string; occurred_at: string; evidence_url: string | null }[] };
    return { items: items ?? [], events: events ?? [] };
  });

export const addWatchlistItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    kind: z.enum(["drug", "modality", "company"]),
    value: z.string().min(1).max(140),
    current_phase: z.string().max(40).optional().nullable(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase.from("watchlist_items").insert({
      kind: data.kind, value: data.value, current_phase: data.current_phase ?? null, user_id: context.userId,
    }).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateWatchlistPhase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    id: z.string().uuid(),
    to_phase: z.string().min(1).max(40),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: existing } = await context.supabase.from("watchlist_items").select("current_phase").eq("id", data.id).single();
    const from = existing?.current_phase ?? null;
    if (from === data.to_phase) return { changed: false };
    await context.supabase.from("watchlist_items").update({
      current_phase: data.to_phase, last_phase_change_at: new Date().toISOString(),
    }).eq("id", data.id);
    await context.supabase.from("phase_events").insert({
      watchlist_item_id: data.id, from_phase: from, to_phase: data.to_phase,
    });
    return { changed: true };
  });

export const deleteWatchlistItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("watchlist_items").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
