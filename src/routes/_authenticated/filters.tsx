import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listSavedFilters, deleteSavedFilter } from "@/lib/opportunities.functions";

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
              <pre className="mt-2 text-xs text-muted-foreground bg-secondary p-3 max-w-xl overflow-x-auto">{JSON.stringify(f.payload, null, 2)}</pre>
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
