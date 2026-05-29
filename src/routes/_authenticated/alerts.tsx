import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listAlerts, markAlert } from "@/lib/alerts.functions";
import { PageHeader } from "@/components/ui/PageHeader";
import { ExportButtons } from "@/components/ui/ExportButtons";
import { AlertCard } from "@/components/alerts/AlertCard";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/alerts")({ component: AlertsPage });

function AlertsPage() {
  const fList = useServerFn(listAlerts);
  const fMark = useServerFn(markAlert);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["alerts"], queryFn: () => fList() });
  const mark = useMutation({
    mutationFn: (v: { alert_id: string; action: "read" | "dismiss" }) => fMark({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });

  const states = data?.states ?? [];
  const alerts = (data?.alerts ?? []).filter((a) => !states.find((s) => s.alert_id === a.id)?.dismissed_at);

  const [keywords, setKeywords] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  const handleAddKeyword = (e?: React.FormEvent) => {
    e?.preventDefault();
    const val = inputValue.trim().toLowerCase();
    if (val && !keywords.includes(val)) {
      setKeywords([...keywords, val]);
      setInputValue("");
    }
  };

  const handleRemoveKeyword = (kw: string) => {
    setKeywords(keywords.filter(k => k !== kw));
  };

  const filteredAlerts = alerts.filter(a => {
    if (keywords.length === 0) return true;
    const searchStr = `${a.title} ${a.body}`.toLowerCase();
    return keywords.some(kw => searchStr.includes(kw));
  });

  return (
    <div>
      <PageHeader
        eyebrow="Early Signal Detection"
        title="Signals"
        description="Anomalous spikes in patent filings, early-stage funding, and regulatory updates — weak signals before they become consensus."
      >
        <ExportButtons
          data={filteredAlerts}
          filename="viral-alerts"
          columns={[
            { header: "Title", accessor: (a) => a.title },
            { header: "Message", accessor: (a) => a.body },
            { header: "Severity", accessor: (a) => a.severity },
            { header: "Date", accessor: (a) => new Date(a.created_at).toLocaleDateString() }
          ]}
        />
      </PageHeader>

      <div className="mb-6 border border-border bg-card p-4 lg:p-5">
        <h3 className="text-sm font-bold tracking-tight mb-3">Filter by Keywords</h3>
        <form onSubmit={handleAddKeyword} className="flex gap-2">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g. 'FDA', 'Phase III', 'Glass'" 
            className="flex-1 border border-input bg-background px-3 py-1.5 text-sm"
          />
          <Button type="submit" variant="secondary" className="px-4">
            <Plus className="h-4 w-4 mr-2" /> Add Keyword
          </Button>
        </form>
        {keywords.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {keywords.map(kw => (
              <span key={kw} className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground text-xs font-semibold px-2 py-1">
                {kw}
                <button type="button" onClick={() => handleRemoveKeyword(kw)} className="hover:text-destructive opacity-70 hover:opacity-100 transition-opacity">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {filteredAlerts.map((a) => (
          <AlertCard
            key={a.id}
            alert={a}
            state={states.find((s) => s.alert_id === a.id)}
            onMarkRead={() => mark.mutate({ alert_id: a.id, action: "read" })}
            onDismiss={() => mark.mutate({ alert_id: a.id, action: "dismiss" })}
          />
        ))}
        {filteredAlerts.length === 0 && (
          <div className="border border-border bg-card p-12 text-center text-sm text-muted-foreground">
            {keywords.length > 0 
              ? "No alerts match your keywords. Try removing some to see more results."
              : "No active alerts. Anomalies will appear here as public signal velocity changes."}
          </div>
        )}
      </div>
    </div>
  );
}
