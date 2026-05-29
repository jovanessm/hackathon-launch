import { BookmarkPlus, ThumbsDown, ThumbsUp } from "lucide-react";
import { computeFinalScore, sumModifiers } from "@/lib/scoring";
import { Button } from "@/components/ui/button";
import { OpportunityModifiers, type ModifierEntry } from "./OpportunityModifiers";

export interface OpportunityEvidence {
  id: string;
  opportunity_id: string;
  url: string;
  title: string;
}

export interface Opportunity {
  id: string;
  title: string;
  rationale: string;
  why_now: string;
  baseline_score: number | string;
  phase: string | null;
  therapeutic_modality: string | null;
  competency_id: string | null;
}

interface Props {
  index: number;
  opportunity: Opportunity;
  competencyLabel?: string;
  evidence: OpportunityEvidence[];
  modifiers: ModifierEntry[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onAddToWatchlist?: () => void;
  isAddingToWatchlist?: boolean;
}

export function OpportunityCard({ index, opportunity: o, competencyLabel, evidence, modifiers, isExpanded, onToggleExpand, onAddToWatchlist, isAddingToWatchlist }: Props) {
  const totalMod = sumModifiers(modifiers);
  const finalScore = computeFinalScore(o.baseline_score, modifiers);

  return (
    <li className="border border-border bg-card">
      <div className="p-6 grid grid-cols-12 gap-6">
        <div className="col-span-1">
          <p className="text-5xl font-bold text-primary leading-none">{String(index + 1).padStart(2, "0")}</p>
        </div>
        <div className="col-span-8">
          <div className="flex items-center gap-3 mb-2">
            {competencyLabel && <span className="label-micro bg-secondary px-2 py-1">{competencyLabel}</span>}
            {o.phase && <span className="label-micro">{o.phase}</span>}
            {o.therapeutic_modality && <span className="label-micro">{o.therapeutic_modality}</span>}
          </div>
          <div className="flex items-start justify-between">
            <h2 className="text-xl font-bold">{o.title}</h2>
            {onAddToWatchlist && (
              <button 
                onClick={onAddToWatchlist}
                disabled={isAddingToWatchlist}
                className="text-muted-foreground hover:text-primary disabled:opacity-50 transition-colors"
                title="Add to Watchlist"
              >
                <BookmarkPlus className="h-5 w-5" />
              </button>
            )}
          </div>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{o.rationale}</p>
          <div className="mt-4 border-l-2 border-accent pl-4">
            <p className="label-micro text-accent">Why now</p>
            <p className="mt-1 text-sm">{o.why_now}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {evidence.map((e) => (
              <a key={e.id} href={e.url} target="_blank" rel="noreferrer"
                className="text-xs text-accent hover:underline inline-flex items-center gap-1">
                {e.title} <span>&rsaquo;</span>
              </a>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-between col-span-3 border-l border-border pl-6">
          <div>
            <p className="label-micro">Final score</p>
            <p className="text-3xl font-bold text-primary mt-1">{finalScore.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground mt-1">Baseline {Number(o.baseline_score).toFixed(1)}</p>
            {modifiers.length > 0 && (
              <button onClick={onToggleExpand}
                className={`mt-3 inline-block text-xs px-2 py-1 ${totalMod >= 0 ? "bg-accent text-accent-foreground" : "bg-destructive text-destructive-foreground"}`}>
                {totalMod >= 0 ? "+" : ""}{(totalMod * 100).toFixed(0)}% from docs
              </button>
            )}
          </div>
        
          <div className="mt-8 flex justify-end">
            <div className="inline-flex gap-2 rounded-sm border border-border bg-background p-1">
              <Button type="button" variant="ghost" size="icon" title="Thumbs up" aria-label="Thumbs up">
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" title="Thumbs down" aria-label="Thumbs down">
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      {isExpanded && modifiers.length > 0 && <OpportunityModifiers modifiers={modifiers} />}
    </li>
  );
}
