import { useMemo, useState } from "react";

export interface FilterableOpportunity {
  title: string;
  rationale: string;
  competency_id: string | null;
}

export function useOpportunityFilters<T extends FilterableOpportunity>(opps: T[]) {
  const [search, setSearch] = useState("");
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [competency, setCompetency] = useState<string>("all");

  const toggleSource = (key: string) => setEnabled((p) => ({ ...p, [key]: !(p[key] ?? true) }));
  const isOn = (key: string) => enabled[key] ?? true;

  const filtered = useMemo(() => opps.filter((o) => {
    if (competency !== "all" && o.competency_id !== competency) return false;
    if (search && !`${o.title} ${o.rationale}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [opps, competency, search]);

  return {
    search, setSearch,
    enabled, isOn, toggleSource,
    competency, setCompetency,
    filtered,
    payload: { search, enabled, competency },
  };
}
