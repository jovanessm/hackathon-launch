import React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ExportButtons } from "@/components/ui/ExportButtons";
import { createFileRoute } from "@tanstack/react-router";

import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listCustomers, deleteCustomer, type Company } from "@/lib/customers.functions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/potential-customers")({ component: PotentialCustomersPage });

function PotentialCustomersPage() {
  const fList = useServerFn(listCustomers);
  const fDel = useServerFn(deleteCustomer);
  const qc = useQueryClient();

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: () => fList()
  });

  const delMut = useMutation({
    mutationFn: (id: string) => fDel({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer removed");
    }
  });

  if (isLoading) {
    return <div className="p-6 lg:p-8"><p className="label-micro">Loading customers...</p></div>;
  }

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        eyebrow="Potential Customers"
        title="Potential Customers"
        description="Saved potential customers mapped to our opportunities."
      >
        <ExportButtons
          data={companies}
          filename="potential-customers"
          columns={[
            { header: "Company Name", accessor: (c) => c.name },
            { header: "Description", accessor: (c) => c.description },
            { header: "Email", accessor: (c) => c.contact_email },
            { header: "Phone", accessor: (c) => c.contact_phone },
            { header: "Products", accessor: (c) => c.products_interested?.join(", ") },
            { header: "Competencies", accessor: (c) => c.competencies?.join(", ") },
            { header: "AI Summary", accessor: (c) => c.ai_summary }
          ]}
        />
      </PageHeader>

      <div className="grid gap-4">
        {companies.map((c) => (
          <section
            key={c.id}
            className="overflow-hidden border border-border bg-card grid grid-cols-1 lg:grid-cols-[1.5fr_1.25fr] relative"
          >
            <div className="absolute bottom-4 right-4 z-10 print:hidden">
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => delMut.mutate(c.id)}
                disabled={delMut.isPending}
              >
                Remove
              </Button>
            </div>
            <div className="p-4 lg:p-5">
              <h2 className="m-0 text-lg font-semibold text-foreground pr-20">{c.name}</h2>
              <p className="my-1.5 text-sm text-muted-foreground">
                <strong>Products:</strong> {c.products_interested?.join(", ")}
              </p>
              <p className="my-1.5 text-sm text-muted-foreground">
                <strong>Competencies:</strong> {c.competencies?.join(", ")}
              </p>
              <p className="my-1.5 text-sm text-foreground">
                <strong>Description:</strong> {c.description}
              </p>
              <p className="my-1.5 text-sm text-foreground">
                <strong>Contact:</strong>
                <span className="mt-1 block text-muted-foreground">
                  <a className="block text-accent hover:underline" href={`mailto:${c.contact_email}`}>
                    {c.contact_email}
                  </a>
                  <span className="block">{c.contact_phone}</span>
                  <a className="block text-accent hover:underline" href={c.contact_website} target="_blank" rel="noreferrer">
                    {c.contact_website}
                  </a>
                </span>
              </p>
            </div>

            <div className="border-t border-border bg-muted p-4 lg:border-l lg:border-t-0 lg:p-5">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                AI Summary
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                {c.ai_summary}
              </p>
              <div className="mt-4 border-t border-border pt-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Citations
                </p>
                <div className="mt-2 flex flex-col gap-2">
                  {c.citations?.map((citation: any) => (
                    <a
                      key={citation.href}
                      href={citation.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
                    >
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                      {citation.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ))}
        {companies.length === 0 && (
          <div className="p-12 text-center text-muted-foreground bg-card border border-border">
            No potential customers saved yet. Add them from the dashboard opportunities.
          </div>
        )}
      </div>
    </div>
  );
}
