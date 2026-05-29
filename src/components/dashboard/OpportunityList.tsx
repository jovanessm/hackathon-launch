import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addWatchlistItem } from "@/lib/watchlist.functions";
import { OpportunityCard, type Opportunity, type OpportunityEvidence } from "./OpportunityCard";
import type { ModifierEntry } from "./OpportunityModifiers";

interface Competency { id: string; label: string }
interface LogEntry extends ModifierEntry { opportunity_id: string }

interface Props {
  opportunities: Opportunity[];
  evidence: (OpportunityEvidence)[];
  logs: LogEntry[];
  competencies: Competency[];
  generatedModifiers?: Record<string, { modifier_value: number; snippet: string }[]>;
  isOn: (key: string) => boolean;
  isLoading: boolean;
}

export function OpportunityList({ opportunities, evidence, logs, competencies, generatedModifiers, isOn, isLoading }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  
  const fAdd = useServerFn(addWatchlistItem);
  const qc = useQueryClient();
  
  const addMut = useMutation({
    mutationFn: (v: { kind: "opportunity"; value: string; current_phase: string }) => fAdd({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["watchlist"] });
      toast.success("Opportunity added to watchlist");
    },
    onError: () => {
      toast.error("Failed to add opportunity");
    }
  });

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
          evidence={evidence.filter((e) => e.opportunity_id === o.id && (e.data_sources?.key ? isOn(e.data_sources.key) : true))}
          modifiers={[...logs.filter((l) => l.opportunity_id === o.id), ...(generatedModifiers?.[o.id] || [])]}
          isExpanded={expanded === o.id}
          onToggleExpand={() => setExpanded(expanded === o.id ? null : o.id)}
          onAddToWatchlist={() => addMut.mutate({ kind: "opportunity", value: o.title, current_phase: o.phase ?? "Phase II" })}
          isAddingToWatchlist={addMut.isPending}
        />
      ))}
    </ol>
  );
}
