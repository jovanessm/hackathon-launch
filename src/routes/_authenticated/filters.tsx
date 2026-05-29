import { Button } from "@/components/ui/button";
import { deleteSavedFilter, listCompetencies, listDataSources, listSavedFilters } from "@/lib/opportunities.functions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/_authenticated/filters")({ component: FiltersPage });

function FiltersPage() {
  const fList = useServerFn(listSavedFilters);
  const fDel = useServerFn(deleteSavedFilter);
  const fSources = useServerFn(listDataSources);
  const fComps = useServerFn(listCompetencies);
  const qc = useQueryClient();

  const { data: filters } = useQuery({ queryKey: ["filters"], queryFn: () => fList() });
  const { data: sources } = useQuery({ queryKey: ["sources"], queryFn: () => fSources() });
  const { data: comps } = useQuery({ queryKey: ["comps"], queryFn: () => fComps() });

  const del = useMutation({
    mutationFn: (id: string) => fDel({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["filters"] }),
  });

  function formatPayload(payload: any): string {
    if (!payload) return "";

    const competencyRaw = payload.competency || "all";
    const competency = competencyRaw.charAt(0).toUpperCase() + competencyRaw.slice(1);

    const allSources = ["ctis", "espacenet", "clinicaltrials", "ema", "openfda", "google_patents"];

    const activeSources = allSources.filter((source) => {
      if (payload.enabled && payload.enabled[source] === false) {
        return false;
      }
      return true;
    });

    const dataSourcesList = activeSources.map((source) => {
      switch (source) {
        case "ctis": return "CTIS";
        case "ema": return "EMA";
        case "openfda": return "OpenFDA";
        case "clinicaltrials": return "ClinicalTrials";
        case "espacenet": return "Espacenet";
        case "google_patents": return "Google Patents";
        default: return source;
      }
    });

    const dataSources = dataSourcesList.length > 0
      ? dataSourcesList.join(", ")
      : "None";

    return `Competency: ${competency} | Data Sources: ${dataSources}`;
  }

  return (
    <div>
      <div className="mb-8">
        <p className="label-micro">Saved Filters</p>
        <h1 className="mt-1 text-4xl font-bold">My Filters</h1>
        <p className="mt-2 text-sm text-muted-foreground">Configurations saved from the dashboard search panel.</p>
      </div>
      <ul className="border border-border bg-card divide-y divide-border">
        {(filters ?? []).map((f) => {
          const payload = f.payload as { search?: string; competency?: string; enabled?: Record<string, boolean> };

          const searchVal = payload.search;
          const compVal = payload.competency;
          const compLabel = comps?.find(c => c.id === compVal)?.label || compVal;

          const disabledSources = Object.entries(payload.enabled || {})
            .filter(([_, isEnabled]) => !isEnabled)
            .map(([key]) => sources?.find(s => s.key === key)?.label || key);

          return (
            <li key={f.id} className="p-6 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <p className="text-lg font-bold text-primary">{f.name}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {searchVal && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded">
                      <span className="opacity-70">Keywords:</span> {searchVal}
                    </span>
                  )}
                  {compVal && compVal !== "all" && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-accent/10 text-accent rounded">
                      <span className="opacity-70">Competency:</span> {compLabel}
                    </span>
                  )}
                  {disabledSources.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-destructive/10 text-destructive rounded">
                      <span className="opacity-70">Excluded sources:</span> {disabledSources.join(", ")}
                    </span>
                  )}
                  {!searchVal && (!compVal || compVal === "all") && disabledSources.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">No specific filters applied</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => del.mutate(f.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  Delete
                </Button>
                <Link
                  to="/dashboard"
                  search={payload as any}
                  className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  Use Filter
                </Link>
              </div>
            </li>
          );
        })}
        {(filters ?? []).length === 0 && (
          <li className="p-12 text-center text-sm text-muted-foreground">No saved filters yet. Save one from the dashboard.</li>
        )}
      </ul>
    </div>
  );
}
