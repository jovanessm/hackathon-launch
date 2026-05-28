export interface ModifierEntry {
  id: string;
  modifier_value: number | string;
  snippet: string | null;
  documents?: { filename?: string } | null;
}

export function OpportunityModifiers({ modifiers }: { modifiers: ModifierEntry[] }) {
  return (
    <div className="border-t border-border bg-secondary p-6">
      <p className="label-micro mb-3">Document Modifiers</p>
      <ul className="space-y-3">
        {modifiers.map((m) => {
          const val = Number(m.modifier_value);
          const tone = val === 0 ? "text-muted-foreground" : val > 0 ? "text-accent" : "text-destructive";
          return (
            <li key={m.id} className="text-sm border-l-2 border-accent pl-3">
              <div className="flex justify-between">
                <span className="font-semibold">{m.documents?.filename ?? "document"}</span>
                <span className={tone}>
                  {val === 0 ? "Null impact" : `${val > 0 ? "+" : ""}${(val * 100).toFixed(0)}%`}
                </span>
              </div>
              {m.snippet ? (
                <p className="mt-1 text-xs text-muted-foreground italic">"{m.snippet}"</p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">Document had null impact on this opportunity.</p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
