import { deleteSavedFilter, listSavedFilters } from "@/lib/opportunities.functions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/_authenticated/filters")({ component: FiltersPage });

function FiltersPage() {
  const fList = useServerFn(listSavedFilters);
  const fDel = useServerFn(deleteSavedFilter);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["filters"], queryFn: () => fList() });
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
        {(data ?? []).map((f) => (
          <li key={f.id} className="p-5 flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold">{f.name}</p>
              <p className="mt-1 text-xs text-muted-foreground font-medium">
                {formatPayload(f.payload)}
              </p>
            </div>
            <button onClick={() => del.mutate(f.id)} className="text-xs text-destructive hover:underline">Delete</button>
          </li>
        ))}
        {(data ?? []).length === 0 && (
          <li className="p-12 text-center text-sm text-muted-foreground">No saved filters yet. Save one from the dashboard.</li>
        )}
      </ul>
    </div>
  );
}
