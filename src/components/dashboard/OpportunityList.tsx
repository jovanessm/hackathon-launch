import { useState } from "react";
import { OpportunityCard, type Opportunity, type OpportunityEvidence } from "./OpportunityCard";
import type { ModifierEntry } from "./OpportunityModifiers";

interface Competency { id: string; label: string }
interface LogEntry extends ModifierEntry { opportunity_id: string }

interface Props {
  opportunities: Opportunity[];
  evidence: (OpportunityEvidence)[];
  logs: LogEntry[];
  competencies: Competency[];
  isLoading: boolean;
}

export function OpportunityList({ opportunities, evidence, logs, competencies, isLoading }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (isLoading) return <p className="label-micro">Loading opportunities…</p>;

  if (opportunities.length === 0) {
    return (
      <ol className="space-y-4">
        <li className="border border-border bg-card p-12 text-center text-sm text-muted-foreground">
          No opportunities match the current filters.
        </li>
      </ol>
    );
  }

  return (
    <ol className="space-y-4">
      {opportunities.map((o, i) => (
        <OpportunityCard
          key={o.id}
          index={i}
          opportunity={o}
          competencyLabel={competencies.find((c) => c.id === o.competency_id)?.label}
          evidence={evidence.filter((e) => e.opportunity_id === o.id)}
          modifiers={logs.filter((l) => l.opportunity_id === o.id)}
          isExpanded={expanded === o.id}
          onToggleExpand={() => setExpanded(expanded === o.id ? null : o.id)}
        />
      ))}
    </ol>
  );
}
