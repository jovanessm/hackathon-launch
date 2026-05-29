import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// In-memory mock data for hackathon mode
let mockAlerts = [
  {
    id: "m1",
    kind: "clinical_update",
    title: "Surge in GLP-1 Phase III Trials",
    body: "A 40% increase in GLP-1 related Phase III trials over the last quarter indicates an upcoming supply bottleneck for prefillable syringes. High probability of increased packaging demand.",
    severity: "critical",
    signal_strength: 0.95,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    data_sources: { key: "clinical_trials", label: "ClinicalTrials.gov" }
  },
  {
    id: "m2",
    kind: "regulatory_shift",
    title: "FDA Draft Guidance on Extractables",
    body: "New FDA draft guidance suggests tighter limits on extractables and leachables for biologics. Premium glass packaging solutions with ultra-low leachables will be required.",
    severity: "high",
    signal_strength: 0.88,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    data_sources: { key: "fda", label: "FDA.gov" }
  },
  {
    id: "m3",
    kind: "patent_activity",
    title: "Patent Cliff: Auto-Injectors",
    body: "Key patents for several major auto-injector mechanisms are expiring within 18 months, leading to a projected spike in biosimilar development and cartridge demand.",
    severity: "medium",
    signal_strength: 0.72,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    data_sources: { key: "uspto", label: "USPTO" }
  },
  {
    id: "m4",
    kind: "market_event",
    title: "Competitor Expansion in APAC",
    body: "Major competitors have announced capacity expansions in the APAC region for sterile vials. Regional pricing pressure expected.",
    severity: "medium",
    signal_strength: 0.65,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    data_sources: { key: "news", label: "Industry News" }
  },
  {
    id: "m5",
    kind: "clinical_update",
    title: "Breakthrough Therapy Designation: MRNA Oncology",
    body: "Three different MRNA-based oncology therapies received Breakthrough Therapy Designation this month. Cold-chain compatible vials will be critical.",
    severity: "high",
    signal_strength: 0.82,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    data_sources: { key: "fda", label: "FDA.gov" }
  }
];

let mockStates: any[] = [];

export const listAlerts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    return { alerts: mockAlerts, states: mockStates };
  });

export const markAlert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    alert_id: z.string(),
    action: z.enum(["read", "dismiss"]),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const existing = mockStates.find(s => s.alert_id === data.alert_id && s.user_id === context.userId);
    
    if (existing) {
      if (data.action === "read") existing.read_at = new Date().toISOString();
      if (data.action === "dismiss") existing.dismissed_at = new Date().toISOString();
    } else {
      mockStates.push({
        id: "s" + Date.now(),
        user_id: context.userId,
        alert_id: data.alert_id,
        read_at: data.action === "read" ? new Date().toISOString() : null,
        dismissed_at: data.action === "dismiss" ? new Date().toISOString() : null
      });
    }
    
    return { ok: true };
  });
