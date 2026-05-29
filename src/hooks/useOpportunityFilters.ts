import { useMemo, useState } from "react";
import { computeFinalScore } from "@/lib/scoring";

export interface FilterableOpportunity {
  id: string;
  title: string;
  rationale: string;
  competency_id: string | null;
  baseline_score: number | string;
}

export function useOpportunityFilters<
  T extends FilterableOpportunity,
  E extends { opportunity_id: string; data_sources?: { key: string; label: string } | null },
  L extends { opportunity_id: string; modifier_value: number | string }
>(opps: T[], evidence: E[] = [], logs: L[] = []) {
  const [search, setSearch] = useState("");
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [competency, setCompetency] = useState<string>("all");

  const toggleSource = (key: string) => setEnabled((p) => ({ ...p, [key]: !(p[key] ?? true) }));
  const isOn = (key: string) => enabled[key] ?? true;

  const { filteredOpps, generatedModifiers } = useMemo(() => {
    let filtered = opps.filter((o) => {
      if (competency !== "all" && o.competency_id !== competency) return false;
      if (search && !`${o.title} ${o.rationale}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    const genMods: Record<string, { modifier_value: number; snippet: string }[]> = {};

    const scoredOpps = filtered.map((o) => {
      const oppEvidence = evidence.filter(e => e.opportunity_id === o.id);
      const totalEvidence = oppEvidence.length;
      let disabledCount = 0;
      const penaltyLabels: string[] = [];

      oppEvidence.forEach(e => {
        const key = e.data_sources?.key;
        if (key && !isOn(key)) {
          disabledCount++;
          if (e.data_sources?.label && !penaltyLabels.includes(e.data_sources.label)) {
            penaltyLabels.push(e.data_sources.label);
          }
        }
      });

      const userMods = logs.filter(l => l.opportunity_id === o.id);
      const activeSources = totalEvidence - disabledCount;

      // Hide completely if there are no active data sources and no user-uploaded documents
      if (activeSources === 0 && userMods.length === 0) {
        return null;
      }

      const oppMods: { modifier_value: number; snippet: string }[] = [];

      if (totalEvidence > 0 && disabledCount > 0) {
        // Apply up to a 50% penalty to the score if all evidence sources for this opp are disabled
        const penalty = -(disabledCount / totalEvidence) * 0.50; 
        oppMods.push({
          modifier_value: penalty,
          snippet: `Excluded sources: ${penaltyLabels.join(', ')}`
        });
      }

      genMods[o.id] = oppMods;
      
      const finalScore = computeFinalScore(o.baseline_score, [...userMods, ...oppMods]);
      return { ...o, __finalScore: finalScore };
    }).filter((o): o is NonNullable<typeof o> => o !== null);

    // Re-evaluate and sort the top ranked opportunities
    scoredOpps.sort((a, b) => b.__finalScore - a.__finalScore);

    return { filteredOpps: scoredOpps, generatedModifiers: genMods };
  }, [opps, evidence, logs, competency, search, enabled]);

  return {
    search, setSearch,
    enabled, isOn, toggleSource,
    competency, setCompetency,
    filtered: filteredOpps,
    generatedModifiers,
    payload: { search, enabled, competency },
  };
}
