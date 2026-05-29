import { useState } from "react";
import { Button } from "@/components/ui/button";
import { computeFinalScore, sumModifiers } from "@/lib/scoring";
import { BookmarkCheck, BookmarkPlus, ThumbsDown, ThumbsUp, Eye } from "lucide-react";
import { OpportunityModifiers, type ModifierEntry } from "./OpportunityModifiers";
import { OpportunityDetailsOverlay } from "./OpportunityDetailsOverlay";

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
  risk_level?: "low" | "medium" | "high";
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
  onRemoveFromWatchlist?: () => void;
  isRemovingFromWatchlist?: boolean;
  isFavorited?: boolean;
}

export function OpportunityCard({ index, opportunity: o, competencyLabel, evidence, modifiers, isExpanded, onToggleExpand, onAddToWatchlist, isAddingToWatchlist, onRemoveFromWatchlist, isRemovingFromWatchlist, isFavorited }: Props) {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
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
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{o.title}</h2>
              <Button variant="outline" size="icon" onClick={() => setIsOverlayOpen(true)} className="h-8 w-8 text-muted-foreground hover:text-primary" title="View Details">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
            {(onAddToWatchlist || onRemoveFromWatchlist) && (
              <button
                onClick={isFavorited ? onRemoveFromWatchlist : onAddToWatchlist}
                disabled={(isFavorited ? isRemovingFromWatchlist : isAddingToWatchlist)}
                className={`transition-colors ${isFavorited ? 'text-primary hover:text-destructive' : 'text-muted-foreground hover:text-primary'} disabled:opacity-50`}
                title={isFavorited ? "Remove from Watchlist" : "Add to Watchlist"}
              >
                {isFavorited ? <BookmarkCheck className="h-5 w-5" /> : <BookmarkPlus className="h-5 w-5" />}
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
            {o.risk_level && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="label-micro text-muted-foreground">Risk Level</p>
                <div className={`mt-2 inline-block px-3 py-1 rounded text-sm font-semibold ${o.risk_level === "low" ? "bg-green-100 text-green-900" :
                    o.risk_level === "medium" ? "bg-yellow-100 text-yellow-900" :
                      "bg-red-100 text-red-900"
                  }`}>
                  {o.risk_level.charAt(0).toUpperCase() + o.risk_level.slice(1)}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end gap-2 items-center">
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
      
      <OpportunityDetailsOverlay 
        opportunity={o} 
        competencyLabel={competencyLabel} 
        isOpen={isOverlayOpen} 
        onOpenChange={setIsOverlayOpen} 
      />
    </li>
  );
}
