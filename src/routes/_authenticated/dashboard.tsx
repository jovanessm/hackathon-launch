import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOpportunities, listDataSources, saveFilter } from "@/lib/opportunities.functions";
import { useOpportunityFilters } from "@/hooks/useOpportunityFilters";
import { FiltersSidebar } from "@/components/dashboard/FiltersSidebar";
import { OpportunityList } from "@/components/dashboard/OpportunityList";
import { PageHeader } from "@/components/ui/PageHeader";

export const Route = createFileRoute("/_authenticated/dashboard")({ component: Dashboard });

function Dashboard() {
  const fetchOpps = useServerFn(getOpportunities);
  const fetchSources = useServerFn(listDataSources);
  const fetchSave = useServerFn(saveFilter);
  const qc = useQueryClient();

  const { data: oppData, isLoading } = useQuery({ queryKey: ["opps"], queryFn: () => fetchOpps() });
  const { data: sources } = useQuery({ queryKey: ["sources"], queryFn: () => fetchSources() });

  const opps = oppData?.opps ?? [];
  const evidence = oppData?.evidence ?? [];
  const comps = oppData?.comps ?? [];
  const logs = oppData?.logs ?? [];

  const filters = useOpportunityFilters(opps);

  const saveMut = useMutation({
    mutationFn: (name: string) => fetchSave({ data: { name, payload: filters.payload } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["filters"] }),
  });

  return (
    <div className="grid grid-cols-12 gap-8">
      <FiltersSidebar
        search={filters.search}
        onSearchChange={filters.setSearch}
        sources={sources ?? []}
        isOn={filters.isOn}
        onToggleSource={filters.toggleSource}
        competencies={comps}
        competency={filters.competency}
        onCompetencyChange={filters.setCompetency}
        onSaveFilter={(name) => saveMut.mutate(name)}
        isSaving={saveMut.isPending}
      />
      <section className="col-span-12 lg:col-span-9">
        <PageHeader
          eyebrow="Strategic Intelligence"
            title="Top Ranked Opportunities"
            description="Concrete bets for SCHOTT's pharmaceutical glass unit, scored from public signals across clinical, regulatory, and patent sources."
        />
        <OpportunityList
          opportunities={filters.filtered}
          evidence={evidence}
          logs={logs}
          competencies={comps}
          isLoading={isLoading}
        />
      </section>
    </div>
  );
}
