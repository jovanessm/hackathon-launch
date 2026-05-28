import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Very simple text-based evaluator. PDF parsing is out-of-scope for V1;
// users upload CSV or plain text snippets and the engine matches keywords against
// each opportunity's title + rationale + modality. Modifier is bounded [-0.5, +0.5].
function scoreSnippet(text: string, target: string): { score: number; snippet: string | null } {
  const t = text.toLowerCase();
  const tokens = target.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3);
  let hits = 0;
  let firstIdx = -1;
  for (const tok of tokens) {
    const idx = t.indexOf(tok);
    if (idx >= 0) { hits++; if (firstIdx < 0) firstIdx = idx; }
  }
  if (hits === 0) return { score: 0, snippet: null };
  // negative cues
  const neg = /(decline|cancell|terminat|withdraw|risk|delay|shortage of demand)/i.test(text);
  const pos = /(scal|expand|partnership|approv|capacity|growth|launch|invest)/i.test(text);
  const raw = (hits / tokens.length) * (pos ? 0.5 : 0.25) * (neg ? -1 : 1);
  const score = Math.max(-0.5, Math.min(0.5, Number(raw.toFixed(2))));
  const start = Math.max(0, firstIdx - 60);
  const snippet = text.slice(start, Math.min(text.length, firstIdx + 140)).trim();
  return { score, snippet };
}

export const listDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: docs } = await context.supabase
      .from("documents").select("*").order("uploaded_at", { ascending: false });
    const { data: logs } = await context.supabase
      .from("evaluation_log").select("*, opportunities(title)").order("created_at", { ascending: false });
    return { docs: docs ?? [], logs: logs ?? [] };
  });

export const uploadAndEvaluate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    filename: z.string().min(1).max(255),
    mime: z.string().max(120).optional(),
    storage_path: z.string().min(1).max(500),
    text_content: z.string().min(1).max(200000),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: doc, error: docErr } = await context.supabase.from("documents").insert({
      user_id: context.userId,
      filename: data.filename,
      mime: data.mime ?? "text/plain",
      storage_path: data.storage_path,
    }).select().single();
    if (docErr || !doc) throw new Error(docErr?.message || "Failed to record document");

    const { data: opps } = await context.supabase.from("opportunities")
      .select("id, title, rationale, therapeutic_modality");

    const rows: { opportunity_id: string; document_id: string; user_id: string; modifier_value: number; snippet: string | null }[] = [];
    for (const o of opps ?? []) {
      const target = [o.title, o.rationale, o.therapeutic_modality].filter(Boolean).join(" ");
      const { score, snippet } = scoreSnippet(data.text_content, target);
      rows.push({
        opportunity_id: o.id, document_id: doc.id, user_id: context.userId,
        modifier_value: score, snippet,
      });
    }
    if (rows.length) {
      const { error: insErr } = await context.supabase.from("evaluation_log").insert(rows);
      if (insErr) throw new Error(insErr.message);
    }
    return { document: doc, evaluated: rows.length };
  });

export const deleteDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), storage_path: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    await context.supabase.storage.from("user-documents").remove([data.storage_path]);
    const { error } = await context.supabase.from("documents").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
