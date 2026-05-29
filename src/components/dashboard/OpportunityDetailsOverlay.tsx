import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Building2, ExternalLink, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { addCustomer } from "@/lib/customers.functions";
import { toast } from "sonner";
import type { Opportunity } from "./OpportunityCard";

interface Props {
  opportunity: Opportunity | null;
  competencyLabel?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OpportunityDetailsOverlay({ opportunity, competencyLabel, isOpen, onOpenChange }: Props) {
  const fAdd = useServerFn(addCustomer);
  const qc = useQueryClient();

  const addMut = useMutation({
    mutationFn: (company: any) => fAdd({ data: company }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Potential customer added!");
    },
    onError: () => {
      toast.error("Failed to add customer");
    }
  });

  if (!opportunity) return null;

  // Mock generator for potential customers based on opportunity details
  const mockCustomers = [
    {
      opportunity_id: opportunity.id,
      name: `Acme ${competencyLabel?.split(" ")[0] || "Pharma"} Solutions`,
      products_interested: ["Opportunity Scoring"],
      description: `A fast-growing biotech company heavily invested in ${opportunity.therapeutic_modality || "new therapies"}.`,
      contact_email: `partnerships@acmepharma.example.com`,
      contact_phone: "+1 (555) 019-8234",
      contact_website: "https://acmepharma.example.com",
      ai_summary: `Direct match for ${competencyLabel}. Exploring ${opportunity.title}.`,
      competencies: [competencyLabel || "Unknown"],
      citations: [{ label: "Recent Phase II filing", href: "https://clinicaltrials.gov" }]
    },
    {
      opportunity_id: opportunity.id,
      name: `Nexus ${opportunity.therapeutic_modality?.split(" ")[0] || "Bio"} Therapeutics`,
      products_interested: ["Watchlist Tracking", "Alerts"],
      description: "Early-stage startup building targeted delivery platforms.",
      contact_email: `contact@nexusbio.example.com`,
      contact_phone: "+1 (555) 982-1122",
      contact_website: "https://nexusbio.example.com",
      ai_summary: `Strong signal around ${opportunity.phase || "early phase"} development.`,
      competencies: [competencyLabel || "Unknown"],
      citations: [{ label: "Series A funding announcement", href: "https://crunchbase.com" }]
    }
  ];

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 animate-in fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] border border-border bg-card p-0 shadow-lg sm:rounded-lg animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
          
          <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/50">
            <div>
              <Dialog.Title className="text-xl font-bold">{opportunity.title}</Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground mt-1">
                {competencyLabel} • {opportunity.therapeutic_modality} • {opportunity.phase}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Opportunity Details</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Rationale</h4>
                  <p className="text-sm text-foreground mt-1 leading-relaxed">{opportunity.rationale}</p>
                </div>
                <div>
                  <h4 className="font-medium">Why Now?</h4>
                  <p className="text-sm text-foreground mt-1 leading-relaxed">{opportunity.why_now}</p>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Potential Interest</h3>
                <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded font-medium">AI Mapped</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockCustomers.map((customer, idx) => (
                  <div key={idx} className="border border-border rounded-lg p-4 flex flex-col bg-background">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        <h4 className="font-semibold">{customer.name}</h4>
                      </div>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => addMut.mutate(customer)}
                        disabled={addMut.isPending}
                        className="h-7 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add to List
                      </Button>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {customer.description}
                    </p>
                    
                    <div className="mt-4 pt-4 border-t border-border flex-1">
                      <p className="text-xs font-medium mb-1">AI Match Summary</p>
                      <p className="text-xs text-muted-foreground">{customer.ai_summary}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {customer.products_interested.map(p => (
                        <span key={p} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
