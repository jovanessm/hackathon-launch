export interface EvaluationLogEntry {
  id: string;
  modifier_value: number | string;
  snippet: string | null;
  opportunities?: { title?: string } | null;
}

export function EvaluationLogList({ logs }: { logs: EvaluationLogEntry[] }) {
  return (
    <div>
      <p className="label-micro mb-3">Evaluation Log</p>
      <ul className="border border-border bg-card divide-y divide-border max-h-[600px] overflow-y-auto">
        {logs.map((l) => {
          const val = Number(l.modifier_value);
          const tone = val === 0 ? "text-muted-foreground" : val > 0 ? "text-accent" : "text-destructive";
          return (
            <li key={l.id} className="p-4">
              <div className="flex justify-between">
                <span className="text-sm font-semibold">{l.opportunities?.title ?? "—"}</span>
                <span className={`text-xs font-bold ${tone}`}>
                  {val === 0 ? "NULL" : `${val > 0 ? "+" : ""}${(val * 100).toFixed(0)}%`}
                </span>
              </div>
              {l.snippet ? (
                <p className="mt-1 text-xs text-muted-foreground italic">"{l.snippet}"</p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">Document had null impact on this opportunity.</p>
              )}
            </li>
          );
        })}
        {logs.length === 0 && <li className="p-8 text-center text-sm text-muted-foreground">No evaluations yet.</li>}
      </ul>
    </div>
  );
}
