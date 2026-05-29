import React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ExportButtons } from "@/components/ui/ExportButtons";
import { createFileRoute } from "@tanstack/react-router";

type Company = {
  id: string;
  name: string;
  productsInterested: string[];
  description: string;
  contact: { email: string; phone: string; website: string };
  aiSummary: string;
  competencies: string[];
  citations: { label: string; href: string }[];
};

const mockCompanies: Company[] = [
  {
    id: "c1",
    name: "GreenLeaf Logistics",
    productsInterested: ["Opportunity Scoring", "Document Insights"],
    description:
      "A regional freight and logistics operator optimizing last-mile deliveries.",
    contact: {
      email: "hello@greenleaflogistics.example",
      phone: "+1 (555) 210-4451",
      website: "https://greenleaflogistics.example",
    },
    competencies: ["manufacturing strengths", "logistics"],
    aiSummary:
      "Matches SCHOTT's `manufacturing strengths` — Opportunity Scoring highlights high-value shipping partners; Document Insights can extract supplier contracts and SLAs to validate partner fit.",
    citations: [
      { label: "DHL Last Mile Delivery Trends", href: "https://www.dhl.com/global-en/home/insights-and-innovation/insights/last-mile-delivery.html" },
      { label: "McKinsey on logistics resilience", href: "https://www.mckinsey.com/industries/travel-logistics-and-infrastructure/our-insights" },
    ],
  },
  {
    id: "c2",
    name: "Aperture Health",
    productsInterested: ["Report Builder", "Evaluation Log"],
    description:
      "A healthcare analytics startup building clinical trial matching tools.",
    contact: {
      email: "contact@aperturehealth.example",
      phone: "+1 (555) 332-9987",
      website: "https://aperturehealth.example",
    },
    competencies: ["pharmaceutical glass", "primary packaging"],
    aiSummary:
      "Report signals (Phase II→III transitions, regulatory filings) point to upcoming primary packaging demand — aligns directly with SCHOTT `pharmaceutical glass` competency.",
    citations: [
      { label: "ClinicalTrials.gov", href: "https://clinicaltrials.gov/" },
      { label: "FDA Drug Development Resources", href: "https://www.fda.gov/drugs/development-approval-process-drugs" },
    ],
  },
  {
    id: "c3",
    name: "Oak & Ember Retail",
    productsInterested: ["Opportunity Alerts", "Watchlist"],
    description:
      "A boutique retail chain focusing on curated home goods and seasonal collections.",
    contact: {
      email: "sales@oakandember.example",
      phone: "+1 (555) 987-4412",
      website: "https://oakandember.example",
    },
    competencies: ["display & cover glass"],
    aiSummary:
      "Competitor product movement and vendor deals in Opportunity reports indicate demand for strengthened `display & cover glass` for point-of-care devices and retail hardware.",
    citations: [
      { label: "NRF Retail insights", href: "https://nrf.com/research" },
      { label: "IDTechEx display materials research", href: "https://www.idtechex.com/en/research-report" },
    ],
  },
  {
    id: "c4",
    name: "Summit Fintech",
    productsInterested: ["Scoring Engine", "Document Insights", "Report Builder"],
    description: "A payments infrastructure provider for SMBs and marketplaces.",
    contact: {
      email: "partnerships@summitfintech.example",
      phone: "+1 (555) 101-2020",
      website: "https://summitfintech.example",
    },
    competencies: ["manufacturing strengths"],
    aiSummary:
      "Transaction and integration opportunity signals surface operational partners — while not a direct materials match, `manufacturing strengths` and ecosystem partnerships can enable new packaging workflows for SMB marketplaces.",
    citations: [
      { label: "Deloitte supply chain insights", href: "https://www2.deloitte.com/global/en/insights/industry/public-sector/supply-chain-and-operations.html" },
      { label: "World Economic Forum on supply networks", href: "https://www.weforum.org/topics/supply-chains-and-transport/" },
    ],
  },
  {
    id: "c5",
    name: "Blue Horizon Energy",
    productsInterested: ["Opportunity Scoring", "Evaluation Log"],
    description:
      "A renewable-energy project developer focused on small-scale solar and storage projects.",
    contact: {
      email: "team@bluehorizon.example",
      phone: "+1 (555) 404-1212",
      website: "https://bluehorizon.example",
    },
    competencies: ["specialty glass & glass-ceramics"],
    aiSummary:
      "Opportunity Scoring surfaces land parcels and partners for energy hardware; `specialty glass & glass-ceramics` competency maps to glass components used in energy sensors and optics.",
    citations: [
      { label: "IEA energy storage and solar outlook", href: "https://www.iea.org/topics/solar-pv" },
      { label: "NREL materials for clean energy", href: "https://www.nrel.gov/research/advanced-materials.html" },
    ],
  },
];

export const Route = createFileRoute("/_authenticated/potential-customers")({ component: PotentialCustomersPage });

function PotentialCustomersPage() {
  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        eyebrow="Potential Customers"
        title="Potential Customers"
        description="List of mock potential customers and why our products might interest them."
      >
        <ExportButtons
          data={mockCompanies}
          filename="potential-customers"
          columns={[
            { header: "Company Name", accessor: (c) => c.name },
            { header: "Description", accessor: (c) => c.description },
            { header: "Email", accessor: (c) => c.contact.email },
            { header: "Phone", accessor: (c) => c.contact.phone },
            { header: "Products", accessor: (c) => c.productsInterested.join(", ") },
            { header: "Competencies", accessor: (c) => c.competencies.join(", ") },
            { header: "AI Summary", accessor: (c) => c.aiSummary }
          ]}
        />
      </PageHeader>

      <div className="grid gap-4">
        {mockCompanies.map((c) => (
          <section
            key={c.id}
            className="overflow-hidden border border-border bg-card grid grid-cols-1 lg:grid-cols-[1.5fr_1.25fr]"
          >
            <div className="p-4 lg:p-5">
              <h2 className="m-0 text-lg font-semibold text-foreground">{c.name}</h2>
              <p className="my-1.5 text-sm text-muted-foreground">
                <strong>Products:</strong> {c.productsInterested.join(", ")}
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
                  <a className="block text-accent hover:underline" href={`mailto:${c.contact.email}`}>
                    {c.contact.email}
                  </a>
                  <span className="block">{c.contact.phone}</span>
                  <a className="block text-accent hover:underline" href={c.contact.website} target="_blank" rel="noreferrer">
                    {c.contact.website}
                  </a>
                </span>
              </p>
            </div>

            <div className="border-t border-border bg-muted p-4 lg:border-l lg:border-t-0 lg:p-5">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                AI Summary
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                {c.aiSummary}
              </p>
              <div className="mt-4 border-t border-border pt-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Citations
                </p>
                <div className="mt-2 flex flex-col gap-2">
                  {c.citations.map((citation) => (
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
      </div>
    </div>
  );
}
