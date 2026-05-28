import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listAlerts, markAlert } from "@/lib/alerts.functions";
import { PageHeader } from "@/components/ui/PageHeader";
import { AlertCard } from "@/components/alerts/AlertCard";

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

  return (
    <div>
      <PageHeader
        eyebrow="Early Signal Detection"
        title="Viral Alerts"
        description="Anomalous spikes in patent filings, early-stage funding, and regulatory updates — weak signals before they become consensus."
      />
      <div className="space-y-3">
        {alerts.map((a) => (
          <AlertCard
            key={a.id}
            alert={a}
            state={states.find((s) => s.alert_id === a.id)}
            onMarkRead={() => mark.mutate({ alert_id: a.id, action: "read" })}
            onDismiss={() => mark.mutate({ alert_id: a.id, action: "dismiss" })}
          />
        ))}
        {alerts.length === 0 && (
          <div className="border border-border bg-card p-12 text-center text-sm text-muted-foreground">
            No active alerts. Anomalies will appear here as public signal velocity changes.
          </div>
        )}
      </div>
    </div>
  );
}
