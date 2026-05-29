import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";

interface DataSource { id: string; key: string; label: string; category: string }
interface Competency { id: string; label: string }

export interface SavedFilter {
  id: string;
  name: string;
  payload: any;
}

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  sources: DataSource[];
  isOn: (key: string) => boolean;
  onToggleSource: (key: string) => void;
  competencies: Competency[];
  competency: string;
  onCompetencyChange: (v: string) => void;
  onSaveFilter: (name: string) => void;
  isSaving: boolean;
  savedFilters: SavedFilter[];
  onDeleteSavedFilter: (id: string) => void;
  isDeletingFilter: boolean;
}

export function FiltersSidebar(p: Props) {
  const [filterName, setFilterName] = useState("");

  const handleSave = () => {
    p.onSaveFilter(filterName);
    setFilterName("");
  };

  return (
    <aside className="col-span-12 lg:col-span-3 space-y-8">
      <div>
        <p className="label-micro">Search</p>
        <input value={p.search} onChange={(e) => p.onSearchChange(e.target.value)}
          placeholder="Drug, modality, company…"
          className="mt-2 w-full border border-input px-3 py-2 text-sm focus:outline-none focus:border-accent" />
      </div>
      <div>
        <p className="label-micro mb-3">Data Sources</p>
        <div className="space-y-2">
          {p.sources.map((s) => (
            <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={p.isOn(s.key)} onChange={() => p.onToggleSource(s.key)} className="accent-[color:var(--color-accent)]" />
              <span>{s.label}</span>
              <span className="label-micro ml-auto">{s.category}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <p className="label-micro mb-3">SCHOTT Competency</p>
        <select value={p.competency} onChange={(e) => p.onCompetencyChange(e.target.value)}
          className="w-full border border-input px-3 py-2 text-sm focus:outline-none focus:border-accent bg-background">
          <option value="all">All competencies</option>
          {p.competencies.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>
      <div className="border-t border-border pt-6">
        <p className="label-micro mb-3">Save Filter</p>
        <input value={filterName} onChange={(e) => setFilterName(e.target.value)} placeholder="My filter"
          className="w-full border border-input px-3 py-2 text-sm mb-2 focus:outline-none focus:border-accent" />
        <button disabled={!filterName || p.isSaving} onClick={handleSave}
          className="w-full bg-primary text-primary-foreground py-2 text-xs uppercase tracking-wider font-semibold hover:opacity-90 disabled:opacity-40">
          Save
        </button>
      </div>
      
      {p.savedFilters.length > 0 && (
        <div className="border-t border-border pt-6">
          <p className="label-micro mb-3">Saved Filters</p>
          <ul className="space-y-3">
            {p.savedFilters.map((f) => {
              const payload = f.payload || {};
              const searchVal = payload.search;
              const compVal = payload.competency;
              const compLabel = p.competencies.find(c => c.id === compVal)?.label || compVal;
              const disabledSources = Object.entries(payload.enabled || {})
                .filter(([_, isEnabled]) => !isEnabled)
                .map(([key]) => p.sources.find(s => s.key === key)?.label || key);

              return (
                <li key={f.id} className="flex flex-col gap-2 border border-border p-3 bg-card group">
                  <div className="flex items-start justify-between gap-2">
                    <Link 
                      to="/dashboard" 
                      search={f.payload as any}
                      className="flex-1 text-sm font-bold hover:text-primary transition-colors text-left leading-tight"
                      title="Apply this filter"
                    >
                      {f.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => p.onDeleteSavedFilter(f.id)}
                      disabled={p.isDeletingFilter}
                      className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      title="Delete filter"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {searchVal && (
                      <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-secondary text-secondary-foreground rounded">
                        <span className="opacity-70 mr-1">Search:</span> {searchVal}
                      </span>
                    )}
                    {compVal && compVal !== "all" && (
                      <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-accent/10 text-accent rounded">
                        <span className="opacity-70 mr-1">Comp:</span> {compLabel}
                      </span>
                    )}
                    {disabledSources.length > 0 && (
                      <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-destructive/10 text-destructive rounded">
                        <span className="opacity-70 mr-1">Excl:</span> {disabledSources.join(", ")}
                      </span>
                    )}
                    {!searchVal && (!compVal || compVal === "all") && disabledSources.length === 0 && (
                      <span className="text-[10px] text-muted-foreground italic">No filters applied</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </aside>
  );
}
