import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listWatchlist, addWatchlistItem, updateWatchlistPhase, deleteWatchlistItem } from "@/lib/watchlist.functions";
import { getOpportunities } from "@/lib/opportunities.functions";
import { PageHeader } from "@/components/ui/PageHeader";
import { ExportButtons } from "@/components/ui/ExportButtons";
import { AddItemForm } from "@/components/watchlist/AddItemForm";
import { WatchlistTable } from "@/components/watchlist/WatchlistTable";

export const Route = createFileRoute("/_authenticated/watchlist")({ component: WatchlistPage });

function WatchlistPage() {
  const fList = useServerFn(listWatchlist);
  const fAdd = useServerFn(addWatchlistItem);
  const fPhase = useServerFn(updateWatchlistPhase);
  const fDel = useServerFn(deleteWatchlistItem);
  const fOpps = useServerFn(getOpportunities);
  const qc = useQueryClient();

  const { data } = useQuery({ queryKey: ["watchlist"], queryFn: () => fList() });
  const { data: oppData } = useQuery({ queryKey: ["opps"], queryFn: () => fOpps() });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["watchlist"] });

  const addMut = useMutation({
    mutationFn: (v: { kind: "drug" | "modality" | "company"; value: string; current_phase: string }) => fAdd({ data: v }),
    onSuccess: invalidate,
  });
  const phaseMut = useMutation({
    mutationFn: (v: { id: string; to_phase: string }) => fPhase({ data: v }),
    onSuccess: invalidate,
  });
  const delMut = useMutation({
    mutationFn: (id: string) => fDel({ data: { id } }),
    onSuccess: invalidate,
  });

  return (
    <div>
      <PageHeader
        eyebrow="Monitoring"
        title="Watchlist"
        description="Track pipelines, modalities, and companies. The system records phase transitions to gauge when primary packaging demand matures."
      >
        <ExportButtons
          data={data?.items ?? []}
          filename="watchlist"
          columns={[
            { header: "Type", accessor: (i) => i.kind },
            { header: "Name", accessor: (i) => i.value },
            { header: "Current Phase", accessor: (i) => i.current_phase },
            { header: "Last Phase Change", accessor: (i) => i.last_phase_change_at ? new Date(i.last_phase_change_at).toLocaleDateString() : "-" }
          ]}
        />
      </PageHeader>
      <AddItemForm onAdd={(v) => addMut.mutate(v)} isPending={addMut.isPending} />
      <WatchlistTable
        items={data?.items ?? []}
        events={data?.events ?? []}
        opportunities={oppData?.opps ?? []}
        competencies={oppData?.comps ?? []}
        onPhaseChange={(id, to_phase) => phaseMut.mutate({ id, to_phase })}
        onRemove={(id) => delMut.mutate(id)}
      />
    </div>
  );
}
