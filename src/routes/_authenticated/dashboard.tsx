import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOpportunities, listDataSources, saveFilter } from "@/lib/opportunities.functions";
import { useOpportunityFilters } from "@/hooks/useOpportunityFilters";
import { FiltersSidebar } from "@/components/dashboard/FiltersSidebar";
import { OpportunityList } from "@/components/dashboard/OpportunityList";
import { PageHeader } from "@/components/ui/PageHeader";
import { ExportButtons } from "@/components/ui/ExportButtons";

import { z } from "zod";

const dashboardSearchSchema = z.object({
  search: z.string().optional(),
  competency: z.string().optional(),
  enabled: z.record(z.string(), z.boolean()).optional()
});

export const Route = createFileRoute("/_authenticated/dashboard")({ 
  component: Dashboard,
  validateSearch: dashboardSearchSchema,
});

function Dashboard() {
  const fetchOpps = useServerFn(getOpportunities);
  const fetchSources = useServerFn(listDataSources);
  const fetchSave = useServerFn(saveFilter);
  const qc = useQueryClient();
  const searchParams = Route.useSearch();

  const { data: oppData, isLoading } = useQuery({ queryKey: ["opps"], queryFn: () => fetchOpps() });
  const { data: sources } = useQuery({ queryKey: ["sources"], queryFn: () => fetchSources() });

  const opps = oppData?.opps ?? [];
  const evidence = oppData?.evidence ?? [];
  const comps = oppData?.comps ?? [];
  const logs = oppData?.logs ?? [];

  const filters = useOpportunityFilters(opps, evidence, logs, searchParams);

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
        >
          <ExportButtons 
            data={filters.filtered} 
            filename="dashboard-opportunities" 
            columns={[
              { header: "Opportunity", accessor: (o) => o.title },
              { header: "Phase", accessor: (o) => o.phase },
              { header: "Modality", accessor: (o) => o.therapeutic_modality },
              { header: "Competency", accessor: (o) => comps.find(c => c.id === o.competency_id)?.label },
              { header: "Score", accessor: (o) => Number(o.__finalScore).toFixed(1) },
              { header: "Rationale", accessor: (o) => o.rationale }
            ]} 
          />
        </PageHeader>
        <OpportunityList
          opportunities={filters.filtered}
          evidence={evidence}
          logs={logs}
          competencies={comps}
          generatedModifiers={filters.generatedModifiers}
          isOn={filters.isOn}
          isLoading={isLoading}
        />
      </section>
    </div>
  );
}
