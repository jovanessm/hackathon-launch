import { useState } from "react";
import { PHASES } from "@/lib/watchlist-helpers";

export type WatchlistKind = "drug" | "modality" | "company";

interface Props {
  onAdd: (v: { kind: WatchlistKind; value: string; current_phase: string }) => void;
  isPending: boolean;
}

export function AddItemForm({ onAdd, isPending }: Props) {
  const [kind, setKind] = useState<WatchlistKind>("drug");
  const [value, setValue] = useState("");
  const [phase, setPhase] = useState<string>("Phase II");

  const submit = () => {
    onAdd({ kind, value, current_phase: phase });
    setValue("");
  };

  return (
    <div className="border border-border bg-card p-6 mb-8 grid grid-cols-12 gap-4">
      <div className="col-span-12 md:col-span-2">
        <p className="label-micro mb-2">Kind</p>
        <select value={kind} onChange={(e) => setKind(e.target.value as WatchlistKind)}
          className="w-full border border-input px-3 py-2 text-sm bg-background">
          <option value="drug">Drug</option>
          <option value="modality">Modality</option>
          <option value="company">Company</option>
        </select>
      </div>
      <div className="col-span-12 md:col-span-5">
        <p className="label-micro mb-2">Value</p>
        <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. Tirzepatide, AAV gene therapy, Novo Nordisk"
          className="w-full border border-input px-3 py-2 text-sm focus:outline-none focus:border-accent" />
      </div>
      <div className="col-span-12 md:col-span-3">
        <p className="label-micro mb-2">Current phase</p>
        <select value={phase} onChange={(e) => setPhase(e.target.value)}
          className="w-full border border-input px-3 py-2 text-sm bg-background">
          {PHASES.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>
      <div className="col-span-12 md:col-span-2 flex items-end">
        <button disabled={!value || isPending} onClick={submit}
          className="w-full bg-primary text-primary-foreground py-2 text-xs uppercase tracking-wider font-semibold hover:opacity-90 disabled:opacity-40">
          Add
        </button>
      </div>
    </div>
  );
}
