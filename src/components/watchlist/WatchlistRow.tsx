import { useState } from "react";
import { PHASES, isRecentPhaseChange } from "@/lib/watchlist-helpers";
import { OpportunityDetailsOverlay } from "@/components/dashboard/OpportunityDetailsOverlay";
import type { Opportunity } from "@/components/dashboard/OpportunityCard";

export interface WatchlistItem {
  id: string;
  kind: string;
  value: string;
  current_phase: string | null;
  last_phase_change_at: string | null;
}

export interface PhaseEvent {
  id: string;
  watchlist_item_id: string;
  from_phase: string | null;
  to_phase: string;
  occurred_at: string;
}

interface Props {
  item: WatchlistItem;
  events: PhaseEvent[];
  onPhaseChange: (to_phase: string) => void;
  onRemove: () => void;
  opportunity?: Opportunity;
  competencyLabel?: string;
}

export function WatchlistRow({ item, events, onPhaseChange, onRemove, opportunity, competencyLabel }: Props) {
  const recent = isRecentPhaseChange(item.last_phase_change_at);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  return (
    <tr className="border-t border-border align-top">
      <td className="p-4 text-xs uppercase tracking-wider">{item.kind}</td>
      <td className="p-4 text-sm font-semibold">
        {item.kind === "opportunity" && opportunity ? (
          <>
            <button 
              onClick={() => setIsOverlayOpen(true)}
              className="text-primary hover:underline text-left"
            >
              {item.value}
            </button>
            <OpportunityDetailsOverlay
              opportunity={opportunity}
              competencyLabel={competencyLabel}
              isOpen={isOverlayOpen}
              onOpenChange={setIsOverlayOpen}
            />
          </>
        ) : (
          item.value
        )}
      </td>
      <td className="p-4 text-sm">
        {item.current_phase ?? "—"}
        {recent && <span className="ml-2 label-micro bg-accent text-accent-foreground px-2 py-0.5">Phase changed</span>}
      </td>
      <td className="p-4">
        <select defaultValue={item.current_phase ?? ""} onChange={(e) => onPhaseChange(e.target.value)}
          className="border border-input px-2 py-1 text-xs bg-background">
          {PHASES.map((p) => <option key={p}>{p}</option>)}
        </select>
      </td>
      <td className="p-4 text-xs text-muted-foreground">
        {events.length === 0 ? <span>No transitions yet</span> : (
          <ul className="space-y-1">
            {events.slice(0, 3).map((e) => (
              <li key={e.id}>{e.from_phase ?? "—"} → <strong>{e.to_phase}</strong> · {new Date(e.occurred_at).toLocaleDateString()}</li>
            ))}
          </ul>
        )}
      </td>
      <td className="p-4">
        <button onClick={onRemove} className="text-xs text-destructive hover:underline">Remove</button>
      </td>
    </tr>
  );
}
