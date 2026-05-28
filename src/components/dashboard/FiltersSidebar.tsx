import { useState } from "react";

interface DataSource { id: string; key: string; label: string; category: string }
interface Competency { id: string; label: string }

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
    </aside>
  );
}
