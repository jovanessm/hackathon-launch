import { SignalMeter } from "./SignalMeter";

export interface AlertRecord {
  id: string;
  kind: string;
  title: string;
  body: string;
  signal_strength: number | string;
  created_at: string;
  data_sources?: { label?: string } | null;
}

export interface AlertState {
  alert_id: string;
  read_at: string | null;
  dismissed_at: string | null;
}

interface Props {
  alert: AlertRecord;
  state?: AlertState;
  onMarkRead: () => void;
  onDismiss: () => void;
}

export function AlertCard({ alert: a, state, onMarkRead, onDismiss }: Props) {
  const strength = Number(a.signal_strength);
  return (
    <div className={`border border-border bg-card p-6 grid grid-cols-12 gap-6 ${state?.read_at ? "opacity-70" : ""}`}>
      <div className="col-span-12 md:col-span-2">
        <p className="label-micro">{a.kind.replace("_", " ")}</p>
        <SignalMeter strength={strength} />
      </div>
      <div className="col-span-12 md:col-span-8">
        <h2 className="text-lg font-bold">{a.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{a.body}</p>
        <p className="mt-3 text-xs text-muted-foreground">
          Source: {a.data_sources?.label ?? "—"} · {new Date(a.created_at).toLocaleString()}
        </p>
      </div>
      <div className="col-span-12 md:col-span-2 flex flex-col gap-2 md:items-end">
        {!state?.read_at && (
          <button onClick={onMarkRead}
            className="text-xs uppercase tracking-wider border border-border px-3 py-1.5 hover:bg-secondary">Mark read</button>
        )}
        <button onClick={onDismiss}
          className="text-xs uppercase tracking-wider text-destructive hover:underline">Dismiss</button>
      </div>
    </div>
  );
}
