import type { Opportunity } from "@/components/dashboard/OpportunityCard";
import { WatchlistRow, type WatchlistItem, type PhaseEvent } from "./WatchlistRow";

interface Competency { id: string; label: string; }

interface Props {
  items: WatchlistItem[];
  events: PhaseEvent[];
  opportunities?: Opportunity[];
  competencies?: Competency[];
  onPhaseChange: (id: string, to_phase: string) => void;
  onRemove: (id: string) => void;
}

export function WatchlistTable({ items, events, opportunities = [], competencies = [], onPhaseChange, onRemove }: Props) {
  return (
    <table className="w-full border border-border bg-card">
      <thead className="bg-secondary">
        <tr className="text-left">
          <th className="label-micro p-4">Kind</th>
          <th className="label-micro p-4">Value</th>
          <th className="label-micro p-4">Current phase</th>
          <th className="label-micro p-4">Transition</th>
          <th className="label-micro p-4">History</th>
          <th className="label-micro p-4"></th>
        </tr>
      </thead>
      <tbody>
        {items.map((i) => {
          const opp = i.kind === "opportunity" ? opportunities.find(o => o.title === i.value) : undefined;
          const compLabel = opp ? competencies.find(c => c.id === opp.competency_id)?.label : undefined;
          return (
            <WatchlistRow
              key={i.id}
              item={i}
              events={events.filter((e) => e.watchlist_item_id === i.id)}
              opportunity={opp}
              competencyLabel={compLabel}
              onPhaseChange={(to) => onPhaseChange(i.id, to)}
              onRemove={() => onRemove(i.id)}
            />
          );
        })}
        {items.length === 0 && (
          <tr><td colSpan={6} className="p-12 text-center text-sm text-muted-foreground">No items tracked. Add a drug, modality, or company above.</td></tr>
        )}
      </tbody>
    </table>
  );
}
